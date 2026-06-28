const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const testUsers = ["Xunter297", "BerryONE", "xunter297", "berryone", "  Xunter297  "];
  
  console.log("=== Yangilangan login mantig'ini tekshirish ===\n");
  
  for (const inputName of testUsers) {
    const trimmedName = inputName.trim();
    const lowerName = trimmedName.toLowerCase();
    
    console.log(`Kiritilgan nik: "${inputName}"`);
    console.log(`Tozalangan (trimmed): "${trimmedName}"`);
    
    const user = await prisma.auth.findUnique({
      where: {
        lowerCaseNickname: lowerName,
      },
    });

    if (user) {
      console.log(`NATIJA: O'yinchi topildi! (Bazadagi nik: ${user.nickname})\n`);
    } else {
      console.log(`NATIJA: O'yinchi TOPILMADI!\n`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
