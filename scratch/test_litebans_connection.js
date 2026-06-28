const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');

async function testLiteBans() {
  const config = {
    host: '65.108.106.30',
    port: 3306,
    user: 'u626_SMld4dDWlq',
    password: 'HOYiksOj3Rwag0av4C@Yjtnz',
    database: 's626_neoterra_anarchy'
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('--- LiteBans Connection Successful! ---');
    
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables in LiteBans DB:', rows);
    
    // Banlar borligini tekshirish
    const [bans] = await connection.execute('SELECT COUNT(*) as count FROM litebans_bans');
    console.log('Total Bans:', bans[0].count);

    await connection.end();
  } catch (error) {
    console.error('FAILED to connect to LiteBans:', error);
  }
}

testLiteBans();
