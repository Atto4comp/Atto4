const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Setting up database...');

    const schema = fs.readFileSync(
      path.join(__dirname, '../lib/db/schema.sql'),
      'utf8'
    );

    await pool.query(schema);

    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
