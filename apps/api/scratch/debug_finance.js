"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- DEBUG: CASHBOX DATA ---');
    const boxes = await prisma.cashbox.findMany({
        include: { branch: true }
    });
    console.log('Total boxes found:', boxes.length);
    boxes.forEach(b => {
        console.log(`Box: ${b.name} | ID: ${b.id} | Branch: ${b.branch?.name} (${b.branch_id}) | Balance: ${b.balance} | Type: ${b.type}`);
    });
    console.log('--- DEBUG: RECENT PAYMENTS ---');
    const payments = await prisma.payment.findMany({
        take: 5,
        orderBy: { created_at: 'desc' }
    });
    payments.forEach(p => {
        console.log(`Payment: ${p.amount} | Branch: ${p.branch_id} | Cashbox: ${p.cashbox_id} | Date: ${p.created_at}`);
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=debug_finance.js.map