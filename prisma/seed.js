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
  const passwordHash = await bcrypt.hash("password123", 10);

  // Seed staff user
  await prisma.user.upsert({
    where: { noPekerja: "STAFF001" },
    update: {
      name: "Ahmad bin Abdullah",
      email: "ahmad@uthm.edu.my",
      noKP: "890520015432",
      passwordHash,
      umur: 37,
      alamatRumah: "No. 12, Jalan Universiti, Taman Parit Raja",
      gajiSemasa: 4500.00,
      role: "USER_STAFF",
    },
    create: {
      name: "Ahmad bin Abdullah",
      email: "ahmad@uthm.edu.my",
      noPekerja: "STAFF001",
      noKP: "890520015432",
      passwordHash,
      umur: 37,
      alamatRumah: "No. 12, Jalan Universiti, Taman Parit Raja",
      gajiSemasa: 4500.00,
      role: "USER_STAFF",
    },
  });

  // Seed manager user
  await prisma.user.upsert({
    where: { noPekerja: "MGR001" },
    update: {
      name: "Prof. Dr. Zainal bin Ibrahim",
      email: "zainal@uthm.edu.my",
      noKP: "750812015567",
      passwordHash,
      umur: 51,
      alamatRumah: "No. 5, Jalan Kempas, Taman Universiti, Parit Raja",
      gajiSemasa: 9800.00,
      role: "MANAGEMENT_STAFF",
    },
    create: {
      name: "Prof. Dr. Zainal bin Ibrahim",
      email: "zainal@uthm.edu.my",
      noPekerja: "MGR001",
      noKP: "750812015567",
      passwordHash,
      umur: 51,
      alamatRumah: "No. 5, Jalan Kempas, Taman Universiti, Parit Raja",
      gajiSemasa: 9800.00,
      role: "MANAGEMENT_STAFF",
    },
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
