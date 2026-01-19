import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgresql://dottorio:dottorio_dev_2024@localhost:5435/dottorio",
});

async function main() {
  const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'questions'
  `);
  console.log("Columns in questions table:");
  res.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type}`));
  
  // Check if isCanonical exists
  const hasIsCanonical = res.rows.some(r => r.column_name === 'is_canonical');
  console.log(`\nhas is_canonical column: ${hasIsCanonical}`);
  
  await pool.end();
}

main().catch(console.error);
