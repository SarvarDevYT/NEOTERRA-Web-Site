const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const count = await prisma.auth.count()
    console.log(`Jami o'yinchilar soni: ${count}`)
    
    const sample = await prisma.auth.findFirst()
    if (sample) {
      console.log(`Namuna o'yinchi: ${sample.nickname}`)
      console.log(`Hash mavjud: ${!!sample.hash}`)
    } else {
      console.log("Ma'lumot topilmadi!")
    }
  } catch (err) {
    console.error("Xatolik:", err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
