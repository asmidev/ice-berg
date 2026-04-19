const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_ukrT50xzjEWS@ep-long-fire-anjp2mlz-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  await client.connect();
  const branches = await client.query('SELECT * FROM "Branch"');

  // Kids branchini qidiramiz
  const kidsBranch = branches.rows.find(b => b.name.includes('Kids'));
  if (kidsBranch) {
      console.log('Found Kids Branch. ID:', kidsBranch.id, 'Tenant:', kidsBranch.tenant_id);
      
      const v4 = require('crypto').randomUUID;
      await client.query(`
         INSERT INTO "Cashbox" (id, tenant_id, branch_id, name, balance, balance_other, type)
         VALUES ($1, $2, $3, $4, 0, 0, 'PHYSICAL')
         ON CONFLICT DO NOTHING
      `, [v4(), kidsBranch.tenant_id, kidsBranch.id, 'Kids Kassa']);
      console.log('Created Kids Kassa!');
  } else {
      console.log('Kids branch not found!');
  }

  const res = await client.query('SELECT id, name, branch_id, tenant_id FROM "Cashbox"');
  console.log("Cashboxes now:", res.rows);
  await client.end();
}
run().catch(console.error);
