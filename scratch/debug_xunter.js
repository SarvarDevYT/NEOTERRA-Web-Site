const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const name = "Xunter297";
  try {
    console.log(`Searching for: ${name}`);
    
    const userByNick = await prisma.auth.findFirst({
      where: { nickname: name }
    });
    console.log("By nickname:", userByNick ? userByNick.nickname : "NOT FOUND");

    const userByLower = await prisma.auth.findUnique({
      where: { lowerCaseNickname: name.toLowerCase() }
    });
    console.log("By lowerCaseNickname:", userByLower ? userByLower.nickname : "NOT FOUND");

    if (userByLower) {
        console.log("Details:", JSON.stringify(userByLower, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
    }

  } catch (err) {
    console.error("Xatolik:", err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
