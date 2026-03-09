import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
    req: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const filePath = params.path.join('/');
    const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath);

    try {
        const fileBuffer = await fs.readFile(fullPath);

        // Determine content type
        const ext = path.extname(fullPath).toLowerCase();
        const contentTypeMap: { [key: string]: string } = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
        };

        const contentType = contentTypeMap[ext] || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        return new NextResponse('File not found', { status: 404 });
    }
}
