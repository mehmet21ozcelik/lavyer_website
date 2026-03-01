import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache/tags';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const faq = await prisma.fAQ.findUnique({
            where: { id: params.id }
        });

        if (!faq) {
            return NextResponse.json({ error: 'FAQ bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(faq);
    } catch (error) {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { question, answer, order, practiceAreaId } = body;

        if (!question || !answer) {
            return NextResponse.json({ error: 'Soru ve cevap alanları zorunludur' }, { status: 400 });
        }

        const updatedFaq = await prisma.fAQ.update({
            where: { id: params.id },
            data: {
                question,
                answer,
                order: order ? parseInt(order.toString(), 10) : 0,
                practiceAreaId: practiceAreaId || null
            }
        });

        revalidateTag(CACHE_TAGS.faqs);

        return NextResponse.json(updatedFaq);
    } catch (error) {
        return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.fAQ.delete({
            where: { id: params.id }
        });

        revalidateTag(CACHE_TAGS.faqs);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Silme hatası' }, { status: 500 });
    }
}
