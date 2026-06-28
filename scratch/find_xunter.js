const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Nik bo'yicha qidirish (katta-kichik harfga qaramasdan)
    const players = await prisma.auth.findMany({
      where: {
        OR: [
          { nickname: { contains: 'Xunter297' } },
          { lowerCaseNickname: { contains: 'xunter297' } }
        ]
      }
    });
    
    console.log('--- Search Results for Xunter297 ---');
    if (players.length > 0) {
      players.forEach(p => {
        console.log(`--- Detailed Analysis for ${p.nickname} ---`);
        console.log(`Nickname: "${p.nickname}" (Length: ${p.nickname.length})`);
        console.log(`Lowercase: "${p.lowerCaseNickname}" (Length: ${p.lowerCaseNickname.length})`);
        
        // Simvollar kodini tekshirish
        const charCodes = p.lowerCaseNickname.split('').map(c => c.charCodeAt(0));
        console.log(`Char codes: ${charCodes.join(', ')}`);
      });
    } else {
      console.log('Player Xunter297 NOT FOUND in MySQL database.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
