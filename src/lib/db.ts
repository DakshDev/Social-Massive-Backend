import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// Ab User type wahi hai jo schema me define hai

(async function () {
  try {
    await db.$queryRaw`SELECT 1`;
    console.log("🟢 Database Working Properly");
  } catch (err) {
    console.error("🔴 Database Failed:", err);
    process.exit(1);
  }
})();

export default db;
