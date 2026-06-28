const mysql = require('mysql2/promise');

async function main() {
  const config = {
    host: '65.108.106.30',
    port: 3306,
    user: 'u626_SMld4dDWlq',
    password: 'HOYiksOj3Rwag0av4C@Yjtnz',
    database: 's626_neoterra_anarchy'
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('--- Connected to Anarchy DB successfully! ---');
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables:', tables.map(r => Object.values(r)[0]));
    
    // LiteBans jadvallari bormi?
    const [litebans] = await connection.execute("SHOW TABLES LIKE 'litebans_%'");
    console.log('LiteBans Tables:', litebans.map(r => Object.values(r)[0]));

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
