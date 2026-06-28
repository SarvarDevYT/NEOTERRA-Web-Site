const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const firstUser = await prisma.auth.findFirst();
    
    console.log('--- Auth Table Sample ---');
    if (firstUser) {
      console.log('Nickname:', firstUser.nickname);
      console.log('Lowercase Nickname:', firstUser.lowerCaseNickname);
      console.log('Hash length:', firstUser.hash?.length);
      console.log('Hash snippet:', firstUser.hash?.substring(0, 10) + '...');
    } else {
      console.log('No users found in AUTH table.');
    }

    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log('--- Real MySQL Tables ---');
    console.log(tables);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
