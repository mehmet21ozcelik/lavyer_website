import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
    try {
        const faqs = await prisma.fAQ.findMany({
            orderBy: { order: 'asc' },
            include: { practiceArea: true }
        });
        return NextResponse.json(faqs);
    } catch (error) {
        console.error('FAQ GET error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache/tags';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { question, answer, order, practiceAreaId } = body;

        if (!question || !answer) {
            return NextResponse.json({ error: 'Soru ve cevap alanları zorunludur' }, { status: 400 });
        }

        const newFaq = await prisma.fAQ.create({
            data: {
                question,
                answer,
                order: order ? parseInt(order.toString(), 10) : 0,
                practiceAreaId: practiceAreaId || null
            }
        });

        revalidateTag(CACHE_TAGS.faqs);

        return NextResponse.json(newFaq, { status: 201 });
    } catch (error) {
        console.error('FAQ POST error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
