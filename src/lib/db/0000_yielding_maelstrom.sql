-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
DO $$ BEGIN
 CREATE TYPE "public"."Role" AS ENUM('ADMIN', 'SUBSCRIBER', 'MEMBER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Volume" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"publishedAt" timestamp(3),
	"updatedAt" timestamp(3) NOT NULL,
	"number" double precision NOT NULL,
	"title" text,
	"novelId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"clerkId" text PRIMARY KEY NOT NULL,
	"role" "Role" DEFAULT 'MEMBER' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RichText" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"html" text NOT NULL,
	"markdown" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Novel" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"thumbnail" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"publishedAt" timestamp(3),
	"updatedAt" timestamp(3) NOT NULL,
	"richTextId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Chapter" (
	"id" serial PRIMARY KEY NOT NULL,
	"premium" boolean DEFAULT true NOT NULL,
	"slug" text NOT NULL,
	"novelId" integer NOT NULL,
	"volumeId" integer NOT NULL,
	"serial" integer NOT NULL,
	"number" double precision NOT NULL,
	"title" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"publishedAt" timestamp(3),
	"updatedAt" timestamp(3) NOT NULL,
	"richTextId" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Volume" ADD CONSTRAINT "Volume_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "public"."Novel"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Novel" ADD CONSTRAINT "Novel_richTextId_fkey" FOREIGN KEY ("richTextId") REFERENCES "public"."RichText"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "public"."Novel"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_richTextId_fkey" FOREIGN KEY ("richTextId") REFERENCES "public"."RichText"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "public"."Volume"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Volume_novelId_number_key" ON "Volume" USING btree ("novelId","number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Novel_richTextId_key" ON "Novel" USING btree ("richTextId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Novel_slug_key" ON "Novel" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Novel_title_key" ON "Novel" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Chapter_novelId_serial_key" ON "Chapter" USING btree ("novelId","serial");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Chapter_premium_idx" ON "Chapter" USING btree ("premium");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Chapter_richTextId_key" ON "Chapter" USING btree ("richTextId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Chapter_slug_key" ON "Chapter" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Chapter_volumeId_number_key" ON "Chapter" USING btree ("volumeId","number");