const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Sizning akkountingizni tekshiramiz
    const sarvar = await prisma.auth.findFirst({
      where: { nickname: 'SarvarGamer_YT' }
    });
    
    console.log('--- SarvarGamer_YT Data ---');
    console.log(sarvar);

    // 2. Boshqa bir nechta o'yinchilarni tekshiramiz
    const others = await prisma.auth.findMany({
      take: 10,
      where: {
        NOT: { nickname: 'SarvarGamer_YT' }
      }
    });

    console.log('\n--- Other Players Data ---');
    others.forEach(u => {
      console.log(`Nick: ${u.nickname} | LowerNick: ${u.lowerCaseNickname}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
