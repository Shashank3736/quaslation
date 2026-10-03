CREATE TYPE "public"."NovelStatus" AS ENUM('ONGOING', 'COMPLETED', 'HIATUS');--> statement-breakpoint
CREATE TABLE "NovelTag" (
	"novelId" integer NOT NULL,
	"tagId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Novel" ADD COLUMN "author" text;--> statement-breakpoint
ALTER TABLE "Novel" ADD COLUMN "language" text;--> statement-breakpoint
ALTER TABLE "Novel" ADD COLUMN "status" "NovelStatus" DEFAULT 'ONGOING';--> statement-breakpoint
ALTER TABLE "RichText" ADD COLUMN "wordCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "NovelTag" ADD CONSTRAINT "NovelTag_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "public"."Novel"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "NovelTag" ADD CONSTRAINT "NovelTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "NovelTag_novelId_tagId_key" ON "NovelTag" USING btree ("novelId","tagId");--> statement-breakpoint
CREATE INDEX "NovelTag_tagId_idx" ON "NovelTag" USING btree ("tagId");--> statement-breakpoint
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag" USING btree ("name");--> statement-breakpoint
CREATE INDEX "Novel_status_idx" ON "Novel" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Novel_language_idx" ON "Novel" USING btree ("language");