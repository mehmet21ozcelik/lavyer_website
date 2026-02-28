import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const city = await prisma.city.findUnique({
            where: { id: params.id }
        });

        if (!city) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(city);
    } catch (err) {
        return NextResponse.json({ error: 'Data fetch failed' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const data = await req.json();

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.city.update({
                where: { id: params.id },
                data: {
                    name: data.name,
                    slug: data.slug,
                    hasPhysicalOffice: data.hasPhysicalOffice,
                }
            });

            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'City',
                    entityId: updated.id,
                    userId: 'Admin',
                    details: JSON.stringify({ name: updated.name, physicalOffice: updated.hasPhysicalOffice })
                }
            });

            return updated;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.$transaction(async (tx) => {
            // Check if it has practice area associations
            const count = await tx.cityPracticeArea.count({ where: { cityId: params.id } });
            if (count > 0) throw new Error('HAS_ASSOCIATIONS');

            await tx.city.delete({
                where: { id: params.id }
            });

            await tx.auditLog.create({
                data: {
                    action: 'DELETE',
                    entity: 'City',
                    entityId: params.id,
                    userId: 'Admin'
                }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'HAS_ASSOCIATIONS') {
            return NextResponse.json({ error: 'Bu şehre bağlı uzmanlık alanları olduğu için silinemez. Önce bu şehre ait sayfaları silin.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
