const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.auth.findFirst();
    if (user) {
      console.log('--- Auth Table Columns ---');
      console.log(Object.keys(user));
    } else {
      console.log('No users found in Auth table.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
