// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Kata laluan default (boleh tukar selepas log masuk pertama) ──────────
  const defaultPassword     = "UthmAdmin@2026";   // SUPER_ADMIN / ZAKAT_OFFICER
  const staffPassword       = "UthmPass01";        // STAFF biasa
  const adminPasswordHash   = await bcrypt.hash(defaultPassword, 12);
  const staffPasswordHash   = await bcrypt.hash(staffPassword, 12);

  // ─── SUPER_ADMIN — Pentadbir Tertinggi ───────────────────────────────────
  await prisma.user.upsert({
    where: { noPekerja: "ADMIN001" },
    update: {
      name:         "Pentadbir Sistem UTHM",
      email:        "admin@uthm.edu.my",
      passwordHash: adminPasswordHash,
      role:         "SUPER_ADMIN",
      fakulti:      "FSKTM",
    },
    create: {
      name:         "Pentadbir Sistem UTHM",
      email:        "admin@uthm.edu.my",
      noPekerja:    "ADMIN001",
      noKP:         "800101015433",
      passwordHash: adminPasswordHash,
      umur:         46,
      alamatRumah:  "Pejabat Pentadbiran, UTHM, 86400 Parit Raja, Johor",
      gajiSemasa:   12000.00,
      role:         "SUPER_ADMIN",
      fakulti:      "FSKTM",
    },
  });
  console.log("✔ SUPER_ADMIN   → No. Pekerja: ADMIN001 | Kata Laluan: UthmAdmin@2026");

  // ─── ZAKAT_OFFICER — Pegawai Operasi Zakat ───────────────────────────────
  await prisma.user.upsert({
    where: { noPekerja: "ZKT001" },
    update: {
      name:         "Pegawai Zakat UTHM",
      email:        "zakat@uthm.edu.my",
      passwordHash: adminPasswordHash,
      role:         "ZAKAT_OFFICER",
      fakulti:      "FSKTM",
    },
    create: {
      name:         "Pegawai Zakat UTHM",
      email:        "zakat@uthm.edu.my",
      noPekerja:    "ZKT001",
      noKP:         "850615016789",
      passwordHash: adminPasswordHash,
      umur:         41,
      alamatRumah:  "Unit Zakat, Pejabat Hal Ehwal Agama Islam, UTHM",
      gajiSemasa:   6500.00,
      role:         "ZAKAT_OFFICER",
      fakulti:      "FSKTM",
    },
  });
  console.log("✔ ZAKAT_OFFICER → No. Pekerja: ZKT001  | Kata Laluan: UthmAdmin@2026");

  // ─── STAFF — Kakitangan Biasa ─────────────────────────────────────────────
  await prisma.user.upsert({
    where: { noPekerja: "STAFF001" },
    update: {
      name:         "Ahmad bin Abdullah",
      email:        "ahmad@uthm.edu.my",
      passwordHash: staffPasswordHash,
      role:         "STAFF",
      fakulti:      "FKEE",
    },
    create: {
      name:         "Ahmad bin Abdullah",
      email:        "ahmad@uthm.edu.my",
      noPekerja:    "STAFF001",
      noKP:         "890520015432",
      passwordHash: staffPasswordHash,
      umur:         37,
      alamatRumah:  "No. 12, Jalan Universiti, Taman Parit Raja, 86400 Johor",
      gajiSemasa:   4500.00,
      role:         "STAFF",
      fakulti:      "FKEE",
    },
  });
  console.log("✔ STAFF         → No. Pekerja: STAFF001 | Kata Laluan: UthmPass01");

  console.log("\n✅ Seeding selesai. 3 pengguna berjaya didaftarkan.");
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
