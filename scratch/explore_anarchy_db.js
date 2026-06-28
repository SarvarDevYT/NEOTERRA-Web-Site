const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- Exploring Anarchy Database (s626_neoterra_anarchy) ---');
    
    // Barcha bazalarni ko'rish (ruxsat bo'lsa)
    const dbs = await prisma.$queryRawUnsafe('SHOW DATABASES');
    console.log('Available Databases:', dbs);

    // LiteBans bazasidagi jadvallarni ko'rish
    // Eslatma: Prisma ulanishi s624 da bo'lishi mumkin, shuning uchun bazani aniq ko'rsatamiz
    const tables = await prisma.$queryRawUnsafe('SHOW TABLES FROM s626_neoterra_anarchy');
    console.log('Tables in Anarchy DB:', tables);

  } catch (error) {
    console.error('Error exploring database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
