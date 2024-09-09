ALTER TABLE "Volume" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Novel" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Chapter" ALTER COLUMN "updatedAt" SET DEFAULT now();