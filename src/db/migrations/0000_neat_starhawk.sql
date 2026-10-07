CREATE TYPE "public"."application_status" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'frozen', 'ranked', 'exported');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('photo', 'transcript', 'id_card');--> statement-breakpoint
CREATE TYPE "public"."subject_group" AS ENUM('math', 'science', 'english');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "application_status" DEFAULT 'draft' NOT NULL,
	"national_id" varchar(13) NOT NULL,
	"title" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"announcement_order" integer NOT NULL,
	"email" text,
	"phone" varchar(20),
	"guardian_phone" varchar(20),
	"address_no" text,
	"address_moo" text,
	"address_soi" text,
	"address_road" text,
	"address_subdistrict" text,
	"address_district" text,
	"address_province" text,
	"address_zipcode" varchar(5),
	"school_name" text,
	"school_province" text,
	"gpax" numeric(4, 2),
	"math_gpa" numeric(4, 2),
	"science_gpa" numeric(4, 2),
	"english_gpa" numeric(4, 2),
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"frozen_at" timestamp with time zone,
	"ranked_at" timestamp with time zone,
	"exported_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"document_type" "document_type" NOT NULL,
	"original_name" text NOT NULL,
	"stored_name" text NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_grades" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"subject_group" "subject_group" NOT NULL,
	"semester" integer NOT NULL,
	"course_code" varchar(20) NOT NULL,
	"course_name" text NOT NULL,
	"credit" numeric(3, 2) NOT NULL,
	"grade" numeric(3, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_id" varchar(50) NOT NULL,
	"announcement_order" integer NOT NULL,
	"math_score" numeric(6, 2) NOT NULL,
	"science_score" numeric(6, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_grades" ADD CONSTRAINT "course_grades_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "applications_national_id_unique" ON "applications" USING btree ("national_id");--> statement-breakpoint
CREATE UNIQUE INDEX "applications_announcement_order_unique" ON "applications" USING btree ("announcement_order");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_scores_exam_id_unique" ON "exam_scores" USING btree ("exam_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_scores_announcement_order_unique" ON "exam_scores" USING btree ("announcement_order");