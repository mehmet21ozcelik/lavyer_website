import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
    try {
        // Check Database Connectivity
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            status: 'unhealthy',
            database: 'disconnected',
            error: String(error),
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
