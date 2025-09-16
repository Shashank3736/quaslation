CREATE TABLE "Comment" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"isHidden" boolean DEFAULT false NOT NULL,
	"isEdited" boolean DEFAULT false NOT NULL,
	"novelId" integer NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "public"."Novel"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("clerkId") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "Comment_novelId_idx" ON "Comment" USING btree ("novelId");--> statement-breakpoint
CREATE INDEX "Comment_userId_idx" ON "Comment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Comment_createdAt_idx" ON "Comment" USING btree ("createdAt" DESC NULLS LAST);