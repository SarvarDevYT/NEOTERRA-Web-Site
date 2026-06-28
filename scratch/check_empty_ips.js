const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const emptyIpCount = await prisma.auth.count({
      where: {
        ip: ""
      }
    });

    const nullIpCount = await prisma.auth.count({
      where: {
        ip: null
      }
    });

    const totalCount = await prisma.auth.count();

    console.log(`Jami o'yinchilar: ${totalCount}`);
    console.log(`IP bo'sh string (""): ${emptyIpCount}`);
    console.log(`IP NULL: ${nullIpCount}`);

    const sampleEmpty = await prisma.auth.findFirst({
      where: {
        ip: ""
      }
    });

    if (sampleEmpty) {
      console.log(`IP bo'sh bo'lgan o'yinchi namunasi: ${sampleEmpty.nickname}`);
    }

  } catch (err) {
    console.error("Xatolik:", err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
