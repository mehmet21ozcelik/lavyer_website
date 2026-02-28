import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const data = await req.formData();
        const file: File | null = data.get('file') as unknown as File;
        const altText = data.get('altText') as string;

        if (!file) {
            return NextResponse.json({ error: 'Dosya seçilmedi.' }, { status: 400 });
        }

        // 1. Validation limits: 2MB max
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'Dosya boyutu 2MB sınırını aşamaz.' }, { status: 413 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Sadece resim dosyaları kabul edilir.' }, { status: 415 });
        }

        // Alt text requirement (SEO Validation)
        if (!altText || altText.length < 5) {
            return NextResponse.json({ error: 'SEO için en az 5 karakterli ALT Metin girilmelidir.' }, { status: 400 });
        }

        // 3. Security (Rename file against path traversal and malicious executable uploads)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const extension = file.type.split('/')[1] || 'img';
        const filename = `${uniqueSuffix}.${extension}`;

        // Normally this goes to S3/Cloudinary. For local:
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        const filePath = join(uploadDir, filename);
        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${filename}`;

        // 4. Save to Database
        const media = await prisma.media.create({
            data: { url: publicUrl, altText }
        });

        // 5. Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'UPLOAD',
                entity: 'Media',
                entityId: media.id,
                userId: 'Admin',
                details: JSON.stringify({ filename, size: file.size })
            }
        });

        return NextResponse.json({ success: true, url: publicUrl, media });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Upload Failed' }, { status: 500 });
    }
}
