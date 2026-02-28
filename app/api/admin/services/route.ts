import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import sanitizeHtml from 'sanitize-html';

export async function GET() {
    try {
        const services = await prisma.practiceArea.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { blogPosts: true, cities: true }
                }
            }
        });

        return NextResponse.json(services);
    } catch (err) {
        return NextResponse.json({ error: 'Data fetch failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        if (!data.name || !data.slug || !data.content) {
            return NextResponse.json({ error: 'Ad, slug ve içerik zorunludur' }, { status: 400 });
        }

        const existing = await prisma.practiceArea.findUnique({
            where: { slug: data.slug }
        });

        if (existing) {
            return NextResponse.json({ error: 'Bu slug zaten kullanılıyor' }, { status: 409 });
        }

        const secureContent = sanitizeHtml(data.content, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ['src', 'alt'],
            }
        });

        const result = await prisma.$transaction(async (tx) => {
            const service = await tx.practiceArea.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    content: secureContent,
                    seo: {
                        create: {
                            title: data.seo?.title || data.name,
                            description: data.seo?.description || '',
                            canonicalUrl: data.seo?.canonicalUrl,
                            ogImage: data.seo?.ogImage,
                            noIndex: data.seo?.noIndex || false
                        }
                    }
                }
            });

            await tx.auditLog.create({
                data: {
                    action: 'CREATE',
                    entity: 'PracticeArea',
                    entityId: service.id,
                    userId: 'Admin',
                    details: JSON.stringify({ name: service.name })
                }
            });

            return service;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
