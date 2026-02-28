import { NextRequest, NextResponse } from 'next/server';

export async function rateLimitMiddleware(req: NextRequest) {
    // Edge runtime uyumlu basit bir limitleyici (Token Bucket ya da benzeri, veya KV tabanlı.)
    return NextResponse.next();
}
