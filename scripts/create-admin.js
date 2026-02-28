const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@diyarbakiravukat.com';
    const password = 'admin123456'; // Change this and communicate to user

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        console.log('Admin user already exists.');
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: 'ADMIN'
        }
    });

    console.log('Admin user created successfully:');
    console.log('Email:', email);
    console.log('Password:', password);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
