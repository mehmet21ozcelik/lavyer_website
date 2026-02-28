import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import sanitizeHtml from 'sanitize-html';
import { revalidatePath } from 'next/cache';

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

        const currentPost = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { slug: true } });
        if (!currentPost) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update existing post
            const updatedPost = await tx.blogPost.update({
                where: { id: params.id },
                data: {
                    title: data.title,
                    content: secureContent,
                    excerpt: data.excerpt,
                    status: data.status,
                    practiceAreaId: data.practiceAreaId || null,
                    seo: {
                        upsert: {
                            create: Object.assign({}, data.seo, {
                                title: data.seo?.title || data.title,
                                description: data.seo?.description || data.excerpt || ''
                            }),
                            update: Object.assign({}, data.seo, {
                                title: data.seo?.title || data.title,
                                description: data.seo?.description || data.excerpt || ''
                            }),
                        }
                    }
                }
            });

            // 2. SEO Protection (Redirect if slug changed)
            if (data.slug && data.slug !== currentPost.slug) {
                // Auto-redirect mechanism
                await tx.redirect.create({
                    data: { oldSlug: currentPost.slug, newSlug: data.slug }
                });
                await tx.blogPost.update({ where: { id: params.id }, data: { slug: data.slug } });
            }

            // 3. Keep Version Snapshot
            await tx.blogPostVersion.create({
                data: {
                    blogPostId: params.id,
                    content: secureContent,
                    seo: JSON.stringify(data.seo || {}),
                    updatedBy: 'Admin'
                }
            });

            // 4. Record Audit Log
            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'BlogPost',
                    entityId: params.id,
                    userId: 'Admin',
                    details: JSON.stringify({ title: updatedPost.title, status: updatedPost.status })
                }
            });

            return updatedPost;
        });

        // Smart Revalidation caching rule integration
        revalidatePath('/blog');
        revalidatePath(`/blog/${result.slug}`);

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Update Failed' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Perform soft delete
            const post = await tx.blogPost.update({
                where: { id: params.id },
                data: { deletedAt: new Date() }
            });

            await tx.auditLog.create({
                data: {
                    action: 'SOFT_DELETE',
                    entity: 'BlogPost',
                    entityId: params.id,
                    userId: 'Admin',
                    details: JSON.stringify({ title: post.title })
                }
            });

            return post;
        });

        revalidatePath('/blog');

        return NextResponse.json({ success: true, result });
    } catch (e) {
        return NextResponse.json({ error: 'Delete Failed' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        if (body.action === 'RESTORE') {
            const post = await prisma.$transaction(async (tx) => {
                const restored = await tx.blogPost.update({
                    where: { id: params.id },
                    data: { deletedAt: null }
                });
                await tx.auditLog.create({
                    data: { action: 'RESTORE', entity: 'BlogPost', entityId: params.id, userId: 'Admin' }
                });
                return restored;
            });
            revalidatePath('/blog');
            return NextResponse.json(post);
        }
        return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: 'Patch Failed' }, { status: 500 });
    }
}
