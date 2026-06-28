const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
    
    // Auth modeliga kirish
    const authModel = prisma.auth || prisma.Auth || prisma.AUTH;
    const socialModel = prisma.social || prisma.SOCIAL || prisma.sOCIAL;

    if (!authModel) {
      console.log('Auth model not found on prisma client');
      return;
    }

    const authCount = await authModel.count();
    const socialCount = socialModel ? await socialModel.count() : 0;
    
    const lastUsers = await authModel.findMany({
      take: 5,
      // regDate BigInt bo'lgani uchun orderBy ishlamasligi mumkin, shuning uchun shunchaki findMany
    });

    console.log('--- Database Check ---');
    console.log(`Total players in AUTH: ${authCount}`);
    console.log(`Total records in SOCIAL: ${socialCount}`);
    console.log('Last 5 registered users:', lastUsers.map(u => u.nickname));
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
