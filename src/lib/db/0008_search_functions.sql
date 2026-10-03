-- Search infrastructure: trigram support, maintained `search_vector` columns and the
-- indexes that back `src/lib/search`. Additive only - no existing column is dropped.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
-- Shared builder so every trigger ranks the same way:
--   A = title, B = body/description, C = metadata (author, language, status, slug), D = tags
CREATE OR REPLACE FUNCTION quaslation_tsvector(
  p_title text,
  p_body text,
  p_meta text,
  p_tags text
) RETURNS tsvector
LANGUAGE sql IMMUTABLE AS $$
  SELECT
    setweight(to_tsvector('english', coalesce(p_title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(p_body, '')), 'B') ||
    setweight(to_tsvector('english', trim(coalesce(p_meta, ''))), 'C') ||
    setweight(to_tsvector('english', coalesce(p_tags, '')), 'D');
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION quaslation_novel_tags(p_novel_id integer)
RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT coalesce(string_agg(t."name", ' ' ORDER BY t."name" COLLATE "C"), '')
  FROM "NovelTag" nt
  JOIN "Tag" t ON t."id" = nt."tagId"
  WHERE nt."novelId" = p_novel_id;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION quaslation_richtext_body(p_rich_text_id integer)
RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT rt."text" FROM "RichText" rt WHERE rt."id" = p_rich_text_id;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION novel_search_vector_trigger()
RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_body text;
BEGIN
  v_body := quaslation_richtext_body(NEW."richTextId");
  NEW."search_vector" := quaslation_tsvector(
    NEW."title",
    v_body,
    concat_ws(' ', NEW."author", NEW."language", NEW."status"::text),
    quaslation_novel_tags(NEW."id")
  );
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION chapter_search_vector_trigger()
RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_body text;
  v_novel_title text;
  v_novel_slug text;
BEGIN
  v_body := quaslation_richtext_body(NEW."richTextId");
  SELECT n."title", n."slug" INTO v_novel_title, v_novel_slug
  FROM "Novel" n
  WHERE n."id" = NEW."novelId";

  NEW."search_vector" := quaslation_tsvector(
    NEW."title",
    v_body,
    concat_ws(' ', v_novel_title, v_novel_slug, NEW."slug"),
    NULL
  );
  RETURN NEW;
END;
$$;
--> statement-breakpoint
-- A generated column cannot reference "RichText", so text changes are pushed back into
-- the owning rows and the BEFORE UPDATE triggers above rebuild their vectors.
CREATE OR REPLACE FUNCTION richtext_search_vector_trigger()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RETURN NULL;
  END IF;

  UPDATE "Novel" SET "title" = "title" WHERE "richTextId" = NEW."id";
  UPDATE "Chapter" SET "title" = "title" WHERE "richTextId" = NEW."id";
  RETURN NULL;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION novel_tag_search_vector_trigger()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE "Novel" SET "title" = "title" WHERE "id" = OLD."novelId";
  ELSE
    UPDATE "Novel" SET "title" = "title" WHERE "id" = NEW."novelId";
  END IF;
  RETURN NULL;
END;
$$;
--> statement-breakpoint
-- Word count is a plain-text word count (not the raw character count) so it is
-- comparable across translations.
CREATE OR REPLACE FUNCTION richtext_word_count_trigger()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW."wordCount" := (
    SELECT count(*)::integer
    FROM unnest(regexp_split_to_array(coalesce(NEW."text", ''), '\s+')) AS w(word)
    WHERE btrim(w.word) <> ''
  );
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "Novel_search_vector_trigger"
  BEFORE INSERT OR UPDATE ON "Novel"
  FOR EACH ROW EXECUTE FUNCTION novel_search_vector_trigger();
--> statement-breakpoint
CREATE TRIGGER "Chapter_search_vector_trigger"
  BEFORE INSERT OR UPDATE ON "Chapter"
  FOR EACH ROW EXECUTE FUNCTION chapter_search_vector_trigger();
--> statement-breakpoint
CREATE TRIGGER "RichText_search_vector_trigger"
  AFTER INSERT OR UPDATE ON "RichText"
  FOR EACH ROW EXECUTE FUNCTION richtext_search_vector_trigger();
--> statement-breakpoint
CREATE TRIGGER "NovelTag_search_vector_trigger"
  AFTER INSERT OR UPDATE OR DELETE ON "NovelTag"
  FOR EACH ROW EXECUTE FUNCTION novel_tag_search_vector_trigger();
--> statement-breakpoint
CREATE TRIGGER "RichText_word_count_trigger"
  BEFORE INSERT OR UPDATE ON "RichText"
  FOR EACH ROW EXECUTE FUNCTION richtext_word_count_trigger();
--> statement-breakpoint
CREATE INDEX "Novel_search_vector_gin_idx" ON "Novel" USING GIN ("search_vector");
--> statement-breakpoint
CREATE INDEX "Chapter_search_vector_gin_idx" ON "Chapter" USING GIN ("search_vector");
--> statement-breakpoint
-- The public discovery path only ever reads published chapters.
CREATE INDEX "Chapter_search_vector_gin_published_idx" ON "Chapter" USING GIN ("search_vector") WHERE "publishedAt" IS NOT NULL;
--> statement-breakpoint
-- Trigram indexes power typo tolerant LIKE/ILIKE matching, the word_similarity typo
-- fallback in the search query, and the autocomplete prefix scan.
CREATE INDEX "Novel_title_trgm_idx" ON "Novel" USING GIN ("title" gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX "Chapter_title_trgm_idx" ON "Chapter" USING GIN ("title" gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX "Novel_author_trgm_idx" ON "Novel" USING GIN ("author" gin_trgm_ops);
--> statement-breakpoint
-- Backfill: no-op writes re-fire the BEFORE triggers for every existing row.
UPDATE "RichText" SET "text" = "text";
--> statement-breakpoint
UPDATE "Novel" SET "title" = "title";
--> statement-breakpoint
UPDATE "Chapter" SET "title" = "title";
