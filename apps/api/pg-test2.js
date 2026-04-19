const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_ukrT50xzjEWS@ep-long-fire-anjp2mlz-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  await client.connect();
  const branches = await client.query('SELECT id, name, tenant_id FROM "Branch"');
  const cashboxes = await client.query('SELECT id, branch_id FROM "Cashbox"');

  const cashboxBranchIds = new Set(cashboxes.rows.map(c => c.branch_id));

  for (const branch of branches.rows) {
      if (!cashboxBranchIds.has(branch.id)) {
          const v4 = require('crypto').randomUUID;
          await client.query(`
             INSERT INTO "Cashbox" (id, tenant_id, branch_id, name, balance, balance_other, type)
             VALUES ($1, $2, $3, $4, 0, 0, 'PHYSICAL')
             ON CONFLICT DO NOTHING
          `, [v4(), branch.tenant_id, branch.id, branch.name]);
          console.log('Created Cashbox for:', branch.name);
      }
  }

  await client.end();
}
run().catch(console.error);
