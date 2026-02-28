import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
    try {
        const cities = await prisma.city.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { areas: true }
                }
            }
        });

        return NextResponse.json(cities);
    } catch (err) {
        return NextResponse.json({ error: 'Data fetch failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        if (!data.name || !data.slug) {
            return NextResponse.json({ error: 'Ad ve slug zorunludur' }, { status: 400 });
        }

        const existing = await prisma.city.findUnique({
            where: { slug: data.slug }
        });

        if (existing) {
            return NextResponse.json({ error: 'Bu slug zaten kullanılıyor' }, { status: 409 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const city = await tx.city.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    hasPhysicalOffice: data.hasPhysicalOffice || false,
                }
            });

            await tx.auditLog.create({
                data: {
                    action: 'CREATE',
                    entity: 'City',
                    entityId: city.id,
                    userId: 'Admin',
                    details: JSON.stringify({ name: city.name, physicalOffice: city.hasPhysicalOffice })
                }
            });

            return city;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
