const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const username = "WinsUzz".toLowerCase();
  try {
    const user = await prisma.auth.findUnique({
      where: {
        lowerCaseNickname: username
      }
    });

    if (user) {
      // BigInt qiymatlarni JSON ga o'tkazish uchun string qilamiz
      const sanitizedUser = JSON.parse(JSON.stringify(user, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      console.log(JSON.stringify(sanitizedUser, null, 2));
    } else {
      console.log("Foydalanuvchi topilmadi!");
    }
  } catch (err) {
    console.error("Xatolik:", err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
