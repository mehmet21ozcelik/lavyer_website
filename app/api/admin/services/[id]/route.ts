import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import sanitizeHtml from 'sanitize-html';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const service = await prisma.practiceArea.findUnique({
            where: { id: params.id },
            include: { seo: true }
        });

        if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(service);
    } catch (err) {
        return NextResponse.json({ error: 'Data fetch failed' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const data = await req.json();

        const secureContent = sanitizeHtml(data.content, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ['src', 'alt'],
            }
        });

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.practiceArea.update({
                where: { id: params.id },
                data: {
                    name: data.name,
                    slug: data.slug,
                    content: secureContent,
                    seo: {
                        upsert: {
                            create: {
                                title: data.seo?.title || data.name,
                                description: data.seo?.description || '',
                                canonicalUrl: data.seo?.canonicalUrl,
                                ogImage: data.seo?.ogImage,
                                noIndex: data.seo?.noIndex || false
                            },
                            update: {
                                title: data.seo?.title || data.name,
                                description: data.seo?.description || '',
                                canonicalUrl: data.seo?.canonicalUrl,
                                ogImage: data.seo?.ogImage,
                                noIndex: data.seo?.noIndex || false
                            }
                        }
                    }
                }
            });

            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'PracticeArea',
                    entityId: updated.id,
                    userId: 'Admin',
                    details: JSON.stringify({ name: updated.name })
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
            // Check if it has blog posts or city associations
            const count = await tx.blogPost.count({ where: { practiceAreaId: params.id } });
            if (count > 0) throw new Error('HAS_BLOG_POSTS');

            await tx.sEOFields.deleteMany({ where: { practiceAreaId: params.id } });
            await tx.practiceArea.delete({
                where: { id: params.id }
            });

            await tx.auditLog.create({
                data: {
                    action: 'DELETE',
                    entity: 'PracticeArea',
                    entityId: params.id,
                    userId: 'Admin'
                }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'HAS_BLOG_POSTS') {
            return NextResponse.json({ error: 'Bu alanda makaleler olduğu için silinemez. Önce makaleleri başka bir alana taşıyın.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
