import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import sanitizeHtml from 'sanitize-html';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get('cursor');
        const take = 20;

        const posts = await prisma.blogPost.findMany({
            take,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor }
            }),
            orderBy: { id: 'desc' },
            where: { deletedAt: null },
            include: { practiceArea: true }
        });

        const nextCursor = posts.length === take ? posts[take - 1].id : null;

        return NextResponse.json({ data: posts, nextCursor });
    } catch (err) {
        return NextResponse.json({ error: 'Data fetch failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // 1. Basic Validation
        if (!data.title || !data.slug || !data.content) {
            return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
        }

        // Checking if slug already exists
        const existing = await prisma.blogPost.findUnique({
            where: { slug: data.slug }
        });

        if (existing) {
            return NextResponse.json({ error: 'Bu URL adresi (slug) zaten kullanılıyor.' }, { status: 409 });
        }

        // 2. HTML Sanitization Filter (XSS Prevention)
        const secureContent = sanitizeHtml(data.content, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ['src', 'alt'],
            }
        });

        // 3. Atomic Transactions: Ensure complete consistency
        const result = await prisma.$transaction(async (tx) => {
            const newPost = await tx.blogPost.create({
                data: {
                    title: data.title,
                    slug: data.slug,
                    content: secureContent,
                    excerpt: data.excerpt,
                    status: data.status || 'DRAFT',
                    practiceAreaId: data.practiceAreaId || null,
                    seo: {
                        create: {
                            title: data.seo?.title || data.title,
                            description: data.seo?.description || data.excerpt || '',
                            canonicalUrl: data.seo?.canonicalUrl,
                            ogImage: data.seo?.ogImage,
                            noIndex: data.seo?.noIndex || false
                        }
                    }
                }
            });

            // 4. Record Initial Version
            await tx.blogPostVersion.create({
                data: {
                    blogPostId: newPost.id,
                    content: secureContent,
                    seo: JSON.stringify(data.seo || {}),
                    updatedBy: 'Admin' // Should be fetched from session
                }
            });

            // 5. Audit Log Push
            await tx.auditLog.create({
                data: {
                    action: 'CREATE',
                    entity: 'BlogPost',
                    entityId: newPost.id,
                    userId: 'Admin',
                    details: JSON.stringify({ title: newPost.title, status: newPost.status })
                }
            });

            return newPost;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
