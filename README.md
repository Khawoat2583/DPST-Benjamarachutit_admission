# DPST Admission System for Excellence (High School Level)
## Benjamarachutit School Center (DPST Admission Web System)
> - Original source code credit : by "Nonbangkok"
> - Operation & Administration : by "Khawoat2583"
---

An online registration and management system for the Promotion of Science and Technology Talents Project (DPST) Excellence Program at the High School Level, designated for the Benjamarachutit School Center. Built with modern web technologies focusing on correctness, data safety, and high stability.

---

## ✨ Key Features

- **Online Registration:** Intuitive applicant form submission and document uploads with a fully responsive layout.
- **Eligibility Checker:** Automated applicant eligibility validation based on first-round exam results and prerequisite criteria.
- **GPA Calculation & Verification:** Automated calculation and structured validation of 5-semester weighted GPA (GPAC).
- **Human-in-the-Loop Validation:** An admin verification workflow allowing coordinators to review and approve submitted documents to ensure 100% data integrity.
- **Dynamic Registration Countdown:** A real-time countdown timer reflecting the registration deadline on the applicant portal.
- **Excel Data Management:** Native import/export of first-round candidate scores and ranking data using ExcelJS.

---

## 🛠️ Tech Stack

- **Frontend & Backend Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling & UI Components:** [Shadcn UI](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) & CSS Modules (for custom layouts)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Local Docker container or hosted VPS instance)
- **Object-Relational Mapping (ORM):** [Drizzle ORM](https://orm.drizzle.team/)
- **Data Validation:** [Zod](https://zod.dev/) (for API payloads and form validation)
- **Testing Suite:** [Vitest](https://vitest.dev/) (Unit Tests) & [Playwright](https://playwright.dev/) (End-to-End Tests)
- **Excel Processing:** [ExcelJS](https://github.com/exceljs/exceljs)

---

## 🚀 Local Development

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [Docker](https://www.docker.com/) & Docker Compose (for running local database)

### 2. Database Configuration
Run a local PostgreSQL instance via Docker Compose:

```bash
docker-compose up -d
```

> [!IMPORTANT]
> Copy the `.env.example` file to `.env` and set up your database connection strings and secret keys.
> **Never commit your `.env` file or actual applicant data files to Git.**

### 3. Installation & Starting the Server
```bash
# Install dependencies
npm install

# Start the local development server (with hot reloading)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Database Migrations (Drizzle ORM)
If you make changes to the database schema, run the following commands to generate and apply migrations:

```bash
# Generate SQL migration file from current schemas
npm run db:generate

# Apply migrations to the database
npm run db:migrate
```

---

## 🧪 Testing

The repository contains tests covering both core grading logic and end-to-end user behaviors.

### 1. Unit Testing
Tests GPA formulas, rounding logic, and rank calculation constraints:
```bash
# Run all unit tests once
npm run test:run

# Run tests in watch mode
npm run test
```

### 2. End-to-End (E2E) Testing
Simulates candidate registration flows and coordinator verification steps:
```bash
# Run Playwright E2E tests
npm run test:e2e
```

---

## 📦 Production Build & Deployment

To build the application optimized for production deployment on VPS or container environments:

```bash
# Check code formatting and static analysis
npm run lint

# Generate the optimized production build
npm run build

# Start the application server in production mode
npm run start
```

---

## 🔒 Security Guidelines

- Private applicant files and spreadsheets are stored inside the `/data` folder. This directory is included in `.gitignore` to prevent any sensitive candidate data from being leaked to public repositories.
- All credentials, API tokens, and session keys must be loaded exclusively via environment variables using the `.env` file.
