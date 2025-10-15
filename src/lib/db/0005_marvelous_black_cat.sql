CREATE INDEX "Chapter_serial_idx" ON "Chapter" USING btree ("serial");--> statement-breakpoint
CREATE INDEX "Chapter_publishedAt_idx" ON "Chapter" USING btree ("publishedAt");