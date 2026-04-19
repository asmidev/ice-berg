"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Searching for existing branches...');
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: {
                name: 'EDUTIZIM Bosh Markaz',
                domain: 'main.edutizim.uz',
                plan: 'Enterprise'
            }
        });
    }
    let allBranches = await prisma.branch.findMany();
    if (allBranches.length === 0) {
        const fallbackBranch = await prisma.branch.create({
            data: {
                tenant_id: tenant.id,
                name: 'Chilonzor Filiali',
                address: 'Toshkent, Chilonzor 1-kvartal',
            }
        });
        allBranches = [fallbackBranch];
    }
    console.log(`Found ${allBranches.length} branches. Distributing data...`);
    for (const branch of allBranches) {
        const cashbox = await prisma.cashbox.findFirst({ where: { branch_id: branch.id } });
        if (!cashbox) {
            await prisma.cashbox.create({
                data: {
                    tenant_id: tenant.id,
                    branch_id: branch.id,
                    name: `Asosiy Kassa - ${branch.name}`,
                    balance: 0
                }
            });
        }
    }
    const roles = [
        { name: 'Super Admin', slug: 'super-admin', permissions: ['ALL'] },
        { name: 'Admin', slug: 'admin', permissions: ['DASHBOARD', 'REPORTS'] },
        { name: 'Manager', slug: 'manager', permissions: ['CRM', 'STUDENTS'] },
        { name: 'O\'qituvchi', slug: 'teacher', permissions: ['LMS'] },
        { name: 'Talaba', slug: 'student', permissions: ['PROFILE'] },
    ];
    for (const role of roles) {
        await prisma.role.upsert({
            where: { slug: role.slug },
            update: { name: role.name, permissions: role.permissions },
            create: { name: role.name, slug: role.slug, permissions: role.permissions }
        });
    }
    const superAdminRole = await prisma.role.findUnique({ where: { slug: 'super-admin' } });
    const stages = [
        { name: 'Yangi', color: '#3b82f6', order: 1 },
        { name: 'Lid', color: '#10b981', order: 2 },
        { name: 'Sinov darsida', color: '#f59e0b', order: 3 },
        { name: 'To\'lagan', color: '#8b5cf6', order: 4 },
        { name: 'Rad etilgan', color: '#ef4444', order: 5 },
    ];
    for (const stage of stages) {
        const exists = await prisma.leadStage.findFirst({ where: { name: stage.name, tenant_id: tenant.id } });
        if (!exists) {
            await prisma.leadStage.create({
                data: { ...stage, tenant_id: tenant.id }
            });
        }
    }
    const sources = [
        { name: 'Instagram', slug: 'instagram' },
        { name: 'Telegram', slug: 'telegram' },
        { name: 'Banner', slug: 'banner' },
        { name: 'Tavsiya', slug: 'referral' },
    ];
    for (const source of sources) {
        const exists = await prisma.leadSource.findFirst({ where: { name: source.name, tenant_id: tenant.id } });
        if (!exists) {
            await prisma.leadSource.create({
                data: { ...source, tenant_id: tenant.id }
            });
        }
    }
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { phone: '+998901234567' },
        update: {
            password_hash: passwordHash,
            role_id: superAdminRole.id,
            branches: { set: allBranches.map(b => ({ id: b.id })) }
        },
        create: {
            tenant_id: tenant.id,
            phone: '+998901234567',
            password_hash: passwordHash,
            role_id: superAdminRole.id,
            is_active: true,
            first_name: 'Bosh',
            last_name: 'Admin',
            branches: { connect: allBranches.map(b => ({ id: b.id })) }
        }
    });
    console.log('Seeding leads, students, and financial data across branches...');
    const leadStatuses = await prisma.leadStage.findMany({ where: { tenant_id: tenant.id } });
    const leadSources = await prisma.leadSource.findMany({ where: { tenant_id: tenant.id } });
    const leadNames = ['Alijon Valiyev', 'Zafar Toshev', 'Malika Karimova', 'Jasurbek Ortiqov', 'Nilufar Rahimova', 'Abror Sodiqov', 'Shahzod Umarov', 'Dildora Mirzayeva', 'Otabek Ganiyev', 'Sardor Ismoilov'];
    for (let i = 0; i < 40; i++) {
        const branch = allBranches[i % allBranches.length];
        const month = Math.floor(Math.random() * 4);
        await prisma.lead.create({
            data: {
                tenant_id: tenant.id,
                branch_id: branch.id,
                name: leadNames[i % leadNames.length] + ' ' + (i + 1),
                phone: '+9989' + Math.floor(Math.random() * 900000000 + 100000000),
                stage_id: leadStatuses[i % leadStatuses.length].id,
                source_id: leadSources[i % leadSources.length].id,
                created_at: new Date(2026, month, Math.floor(Math.random() * 28) + 1)
            }
        });
    }
    const studentStatuses = ['ACTIVE', 'TRIAL', 'FROZEN', 'DEBTOR'];
    const studentRoleId = (await prisma.role.findUnique({ where: { slug: 'student' } })).id;
    for (let i = 0; i < 100; i++) {
        const branch = allBranches[i % allBranches.length];
        const status = studentStatuses[i % studentStatuses.length];
        const month = Math.floor(Math.random() * 4);
        const studentUser = await prisma.user.create({
            data: {
                tenant_id: tenant.id,
                phone: '+998' + Math.floor(Math.random() * 10000000000 + Date.now()).toString().slice(-10),
                password_hash: passwordHash,
                role_id: studentRoleId,
                first_name: 'Talaba',
                last_name: `User ${i + 1}`,
                branches: { connect: { id: branch.id } }
            }
        });
        await prisma.student.create({
            data: {
                tenant_id: tenant.id,
                user_id: studentUser.id,
                branch_id: branch.id,
                status: status,
                joined_at: new Date(2026, month, Math.floor(Math.random() * 28) + 1),
                balance: status === 'DEBTOR' ? -500000 : 0
            }
        });
    }
    const allStudents = await prisma.student.findMany({ select: { id: true, branch_id: true } });
    for (const branch of allBranches) {
        const branchStudents = allStudents.filter(s => s.branch_id === branch.id);
        if (branchStudents.length === 0)
            continue;
        for (let month = 0; month < 4; month++) {
            const payCount = 5 + Math.floor(Math.random() * 10);
            for (let i = 0; i < payCount; i++) {
                await prisma.payment.create({
                    data: {
                        tenant_id: tenant.id,
                        branch_id: branch.id,
                        student_id: branchStudents[i % branchStudents.length].id,
                        amount: 1200000 + (Math.random() * 600000),
                        type: 'CASH',
                        created_at: new Date(2026, month, Math.floor(Math.random() * 28) + 1)
                    }
                });
            }
            const expCount = 2 + Math.floor(Math.random() * 4);
            for (let i = 0; i < expCount; i++) {
                await prisma.expense.create({
                    data: {
                        tenant_id: tenant.id,
                        branch_id: branch.id,
                        amount: 1500000 + (Math.random() * 1500000),
                        category: 'KOMMUNAL',
                        description: 'Oylik xarajatlar',
                        date: new Date(2026, month, Math.floor(Math.random() * 28) + 1)
                    }
                });
            }
            await prisma.payroll.create({
                data: {
                    tenant_id: tenant.id,
                    branch_id: branch.id,
                    amount: 5000000 + (Math.random() * 3000000),
                    period: `${month + 1}-2026`,
                    status: 'PAID',
                    created_at: new Date(2026, month, 25)
                }
            });
        }
    }
    console.log('Branching aware data seeded successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map