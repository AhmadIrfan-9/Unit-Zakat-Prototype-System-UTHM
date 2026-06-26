-- Migration SQL: 2-role → 3-role system
-- Langkah 1: Tambah nilai enum baru (PostgreSQL membenarkan ADD VALUE walaupun ada data)
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ZAKAT_OFFICER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
