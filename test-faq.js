const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const order = NaN;
        const f = await prisma.fAQ.create({
            data: {
                question: "Q1",
                answer: "A1",
                order: order ? parseInt(order.toString(), 10) : 0,
                practiceAreaId: null
            }
        });
        console.log("Success with null", f);
    } catch (e) { console.error("Error with null:", e.message); }
}
main().finally(() => prisma.$disconnect());
