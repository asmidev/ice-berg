"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const payrolls = await prisma.payroll.findMany({
        include: {
            teacher: { include: { user: true } },
            staff: { include: { user: true } },
        }
    });
    console.log('Total Payrolls:', payrolls.length);
    payrolls.forEach((p, i) => {
        console.log(`[${i}] ID: ${p.id}, is_archived: ${p.is_archived}, teacher: ${!!p.teacher}, staff: ${!!p.staff}, name: ${p.teacher?.user?.first_name || p.staff?.user?.first_name}`);
    });
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check_db.js.map