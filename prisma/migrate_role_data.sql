-- Migration SQL: Kemaskini data sedia ada & alihkan kepada peranan baru
-- Langkah 2: Kemaskini rekod pengguna sedia ada
UPDATE "User" SET role = 'STAFF' WHERE role = 'USER_STAFF';
UPDATE "User" SET role = 'ZAKAT_OFFICER' WHERE role = 'MANAGEMENT_STAFF';

-- Langkah 3: Kemaskini default column kepada STAFF
ALTER TABLE "User" ALTER COLUMN role SET DEFAULT 'STAFF';
