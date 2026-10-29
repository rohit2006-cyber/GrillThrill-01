/**
 * ============================================================================
 * GRILL THRILL MYSQL DATABASE SETUP SCRIPT (database/setup.js)
 * Automatically connects to MySQL, creates 'grillthrill_db', executes
 * the schema.sql script, seeds initial menu, users & orders, and verifies.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const mysql = require('../backend/node_modules/mysql2/promise');
require('../backend/node_modules/dotenv').config({
  path: path.join(__dirname, '..', 'backend', '.env')
});

// Command line argument override: node setup.js [password] [user] [host] [port] [dbname]
const args = process.argv.slice(2);
const dbPassword = args[0] !== undefined ? args[0] : (process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '');
const dbUser = args[1] || process.env.DB_USER || 'root';
const dbHost = args[2] || process.env.DB_HOST || 'localhost';
const dbPort = Number(args[3] || process.env.DB_PORT || 3306);
const dbName = args[4] || process.env.DB_NAME || 'grillthrill_db';

async function runSetup() {
  console.log('============================================================');
  console.log('🔥 GRILL THRILL — MySQL Database Setup');
  console.log('============================================================');
  console.log(`Connecting to MySQL Server at ${dbHost}:${dbPort} as '${dbUser}'...`);

  let rootConn;
  try {
    rootConn = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true
    });
    console.log('✅ Connection to MySQL Server established successfully!');
  } catch (err) {
    console.error('\n❌ Could not connect to MySQL Server:');
    console.error(`   Error [${err.code || 'UNKNOWN'}]: ${err.message}`);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Ensure MySQL Server is running (e.g. MySQL80 service or XAMPP).');
    console.error('   2. Verify your MySQL root password.');
    console.error(`   3. Run setup with your password: node database/setup.js "YOUR_PASSWORD"`);
    console.error('   4. Or update DB_PASSWORD in backend/.env\n');
    process.exit(1);
  }

  try {
    console.log(`\n📦 Initializing database '${dbName}'...`);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.query(`USE \`${dbName}\`;`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Make sure USE statement uses our target dbName
    schemaSql = schemaSql.replace(/CREATE DATABASE IF NOT EXISTS\s+`?\w+`?/gi, `CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    schemaSql = schemaSql.replace(/USE\s+`?\w+`?;/gi, `USE \`${dbName}\`;`);

    console.log('🚀 Executing database/schema.sql (tables, indexes, seed data)...');
    await rootConn.query(schemaSql);

    // Verify row counts
    const tables = ['users', 'categories', 'menu_items', 'orders', 'order_items'];
    console.log('\n📊 Database Verification:');
    console.log('------------------------------------------------------------');
    for (const tbl of tables) {
      try {
        const [rows] = await rootConn.query(`SELECT COUNT(*) AS count FROM \`${tbl}\``);
        console.log(`   ✓ Table [${tbl}]: ${rows[0].count} record(s)`);
      } catch (e) {
        console.warn(`   ⚠️ Table [${tbl}]: check failed (${e.message})`);
      }
    }
    console.log('------------------------------------------------------------');

    // Create / Update backend/.env file with verified connection settings
    const envPath = path.join(__dirname, '..', 'backend', '.env');
    const envContent = `# Grill Thrill Food Ordering Platform Configuration
PORT=5000
NODE_ENV=development
SESSION_SECRET=grillthrill_flame_grilled_session_secret_2026

# MySQL Database Connection
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}
`;

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`\n✅ Generated/Updated backend/.env with working MySQL configuration.`);
    console.log(`\n🎉 MySQL Database setup complete! Grill Thrill is ready.`);
    console.log('   Start the server with:');
    console.log('   👉 cd backend && npm start\n');

  } catch (err) {
    console.error('\n❌ Error executing schema setup:');
    console.error(`   ${err.message}`);
    process.exit(1);
  } finally {
    if (rootConn) await rootConn.end();
  }
}

runSetup();
