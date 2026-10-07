ALTER TABLE "applications" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "reset_pin" varchar(6);--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "reset_pin_expires_at" timestamp with time zone;