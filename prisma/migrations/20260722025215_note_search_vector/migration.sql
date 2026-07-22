-- Generated column, kept in sync atomically by PostgreSQL on every write.
ALTER TABLE "note"
  ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce("content", '')), 'B')
  ) STORED;

CREATE INDEX "note_search_vector_idx" ON "note" USING GIN ("search_vector");
