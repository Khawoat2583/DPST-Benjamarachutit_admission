CREATE TYPE "public"."news_type" AS ENUM('กิจกรรม', 'การศึกษาต่อ', 'ผลงานนักเรียน', 'รับนักเรียน', 'อื่น ๆ');--> statement-breakpoint
ALTER TABLE "news_posts" ADD COLUMN "news_type" "news_type" DEFAULT 'อื่น ๆ' NOT NULL;--> statement-breakpoint
ALTER TABLE "news_posts" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "news_posts" ADD COLUMN "published_at" timestamp with time zone DEFAULT now() NOT NULL;