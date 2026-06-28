const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const usernames = ["BerryGo", "BerryONE"];
  
  try {
    for (const name of usernames) {
      console.log(`--- ${name} ---`);
      const user = await prisma.auth.findUnique({
        where: {
          lowerCaseNickname: name.toLowerCase()
        }
      });

      if (user) {
        const sanitizedUser = JSON.parse(JSON.stringify(user, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        ));
        console.log(JSON.stringify(sanitizedUser, null, 2));
      } else {
        console.log("Foydalanuvchi topilmadi!");
      }
      console.log("\n");
    }
  } catch (err) {
    console.error("Xatolik:", err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
