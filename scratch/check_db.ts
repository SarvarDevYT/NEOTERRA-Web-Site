import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.auth.count()
  console.log(`Jami o'yinchilar soni: ${count}`)
  
  const sample = await prisma.auth.findFirst()
  if (sample) {
    console.log(`Namuna o'yinchi: ${sample.nickname}`)
    console.log(`Hash mavjud: ${!!sample.hash}`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
