-- Cipta jadual audit_logs dalam pangkalan data Supabase
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id"    TEXT,
  "user_email" TEXT,
  "action"     TEXT NOT NULL,
  "details"    JSONB,
  "ip_address" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Indeks untuk prestasi pertanyaan biasa
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx"     ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx"    ON "audit_logs"("user_id");
