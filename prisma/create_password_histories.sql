-- Cipta jadual password_histories dalam pangkalan data Supabase
CREATE TABLE IF NOT EXISTS "password_histories" (
  "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id"       TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "password_histories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "password_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Indeks untuk prestasi pertanyaan biasa
CREATE INDEX IF NOT EXISTS "password_histories_user_id_idx" ON "password_histories"("user_id");
CREATE INDEX IF NOT EXISTS "password_histories_created_at_idx" ON "password_histories"("created_at" DESC);
