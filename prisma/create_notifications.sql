-- Cipta jadual notifications dalam pangkalan data Supabase
CREATE TABLE IF NOT EXISTS "notifications" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id"    TEXT NOT NULL,
  "title"      TEXT NOT NULL,
  "message"    TEXT NOT NULL,
  "is_read"    BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Indeks untuk prestasi pertanyaan biasa
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at" DESC);
