import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgresql://dottorio:dottorio_dev_2024@localhost:5435/dottorio",
});

async function main() {
  const res = await pool.query(`
    SELECT id, text, is_canonical, group_id, canonical_id, views
    FROM questions
    LIMIT 10
  `);
  console.log("Questions in database:");
  res.rows.forEach(r => {
    console.log("\n- ID:", r.id);
    console.log("  Text:", r.text ? r.text.substring(0, 50) + "..." : "null");
    console.log("  isCanonical:", r.is_canonical);
    console.log("  groupId:", r.group_id);
    console.log("  canonicalId:", r.canonical_id);
  });

  await pool.end();
}

main().catch(console.error);
