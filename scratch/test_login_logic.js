const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const testUsers = ["Xunter297", "BerryONE"];
  
  for (const name of testUsers) {
    console.log(`\n=== Testing for: ${name} ===`);
    
    // Test 1: EXACT match on nickname
    const userExact = await prisma.auth.findFirst({
      where: { nickname: { equals: name } }
    });
    console.log(`Search by exact nickname (${name}): ${userExact ? "FOUND" : "NOT FOUND"}`);

    // Test 2: LOWERCASE match on nickname
    const userLowerSearchNick = await prisma.auth.findFirst({
      where: { nickname: { equals: name.toLowerCase() } }
    });
    console.log(`Search by lowercase nickname (${name.toLowerCase()}): ${userLowerSearchNick ? "FOUND" : "NOT FOUND"}`);

    // Test 3: Search by lowerCaseNickname (the PK)
    const userByPK = await prisma.auth.findUnique({
      where: { lowerCaseNickname: name.toLowerCase() }
    });
    console.log(`Search by lowerCaseNickname PK: ${userByPK ? "FOUND" : "NOT FOUND"}`);

    if (userByPK) {
        console.log(`Database nickname: "${userByPK.nickname}"`);
        console.log(`Database hash: "${userByPK.hash}"`);
        console.log(`Hash length: ${userByPK.hash.length}`);
        
        // Check for hidden characters
        if (userByPK.hash.trim() !== userByPK.hash) {
            console.log("WARNING: Hash has leading/trailing whitespace!");
        }
        
        // If we knew a password, we'd test it here, but we don't.
        // However, we can check if it looks like a valid BCrypt hash.
        const isValidBcrypt = /^\$2[ayb]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(userByPK.hash);
        console.log(`Looks like valid BCrypt: ${isValidBcrypt}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
