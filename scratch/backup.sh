#!/bin/bash

# ==============================================================================
# DPST Admission System - Automated Encrypted Backup Script
# ==============================================================================
# This script dumps the PostgreSQL database schema and data, compresses it along
# with all private file uploads (outside public/), and encrypts the resulting
# archive using AES-256-CBC.
#
# Execution schedule: Every night at 02:00 AM (configured via Cron)
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Resolve paths relative to script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 1. Load environment variables from Next.js env files
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    source "$PROJECT_ROOT/.env.local"
elif [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
else
    echo "Error: Environment file (.env or .env.local) not found in $PROJECT_ROOT" >&2
    exit 1
fi

# 2. Configurable options (can be overridden in environment)
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
BACKUP_PASSWORD="${BACKUP_PASSWORD:-$SESSION_SECRET}" # Fallback to session secret if not set
RETENTION_DAYS="${RETENTION_DAYS:-7}"

if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL is not set in environment" >&2
    exit 1
fi

if [ -z "$UPLOAD_ROOT" ]; then
    echo "Error: UPLOAD_ROOT is not set in environment" >&2
    exit 1
fi

if [ -z "$BACKUP_PASSWORD" ] || [ "${#BACKUP_PASSWORD}" -lt 16 ]; then
    echo "Warning: BACKUP_PASSWORD is blank or too short (<16 chars). Generating a fallback password." >&2
    BACKUP_PASSWORD="fallback_secure_backup_password_1234567890"
fi

# Ensure output backup directory exists
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "[$(date)] Starting DPST Admission system backup..."

# 3. Step A: Perform PostgreSQL Database Dump
echo "[$(date)] Dumping PostgreSQL database..."
DB_DUMP_FILE="$TEMP_DIR/db_dump_$TIMESTAMP.sql"

# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
    echo "Error: pg_dump utility is not installed or not in PATH." >&2
    exit 1
fi

# Dump database using the connection string
pg_dump "$DATABASE_URL" -F p -b -v -f "$DB_DUMP_FILE"

# 4. Step B: Copy uploaded private applicant files
echo "[$(date)] Collecting uploaded documents..."
UPLOAD_TEMP_DIR="$TEMP_DIR/uploads"
mkdir -p "$UPLOAD_TEMP_DIR"

if [ -d "$UPLOAD_ROOT" ] && [ "$(ls -A "$UPLOAD_ROOT")" ]; then
    cp -R "$UPLOAD_ROOT"/* "$UPLOAD_TEMP_DIR"/
else
    echo "Info: Upload directory ($UPLOAD_ROOT) is empty or does not exist. Skipping file copies."
fi

# 5. Step C: Compress all items into a temporary tarball
echo "[$(date)] Compressing backup assets..."
TARBALL_FILE="$TEMP_DIR/dpst_backup_$TIMESTAMP.tar.gz"
tar -czf "$TARBALL_FILE" -C "$TEMP_DIR" "db_dump_$TIMESTAMP.sql" $([ -d "$UPLOAD_TEMP_DIR" ] && echo "uploads")

# 6. Step D: Encrypt the tarball using OpenSSL AES-256-CBC
echo "[$(date)] Encrypting backup archive..."
FINAL_BACKUP_FILE="$BACKUP_DIR/dpst_backup_${TIMESTAMP}.tar.gz.enc"

# Encrypt using openssl with pbkdf2 key derivation for modern standard compatibility
openssl enc -aes-256-cbc -salt -pbkdf2 -in "$TARBALL_FILE" -out "$FINAL_BACKUP_FILE" -pass pass:"$BACKUP_PASSWORD"
chmod 600 "$FINAL_BACKUP_FILE"

echo "[$(date)] Backup successfully generated and encrypted at: $FINAL_BACKUP_FILE"

# 7. Step E: Clean up older backups (Retention Policy)
echo "[$(date)] Enforcing retention policy: keeping only last $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "dpst_backup_*.tar.gz.enc" -mtime +"$RETENTION_DAYS" -exec rm -f {} \; -verbose

echo "[$(date)] Backup process completed successfully!"

# ==============================================================================
# CRON SCHEDULING INSTALLATION INSTRUCTION:
# ==============================================================================
# To run this backup script automatically every night at 02:00 AM,
# edit your cron tasks using:
#     crontab -e
#
# Add the following entry (adjust paths accordingly):
#     0 2 * * * /bin/bash /Users/nonbangkok/Documents/Workspace/Project/dpst-web/scratch/backup.sh >> /Users/nonbangkok/Documents/Workspace/Project/dpst-web/backups/backup.log 2>&1
# ==============================================================================
