import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { rateLimitMiddleware } from './lib/security/rateLimiter';
import { JWT_SECRET } from './lib/auth/jwtConfig';

export async function middleware(request: NextRequest) {

    // 1. Rate Limiting for public API routes (like contact form)
    // This helps prevent spam and DDOS attacks on API endpoints
    if (request.nextUrl.pathname.startsWith('/api/contact')) {
        const rateLimitResponse = await rateLimitMiddleware(request);
        if (rateLimitResponse.status === 429) return rateLimitResponse;
    }

    const token = request.cookies.get('auth_token')?.value;

    if (request.nextUrl.pathname === '/admin/login') {
        if (token) {
            try {
                await jwtVerify(token, JWT_SECRET);
                return NextResponse.redirect(new URL('/admin', request.url));
            } catch (e) {
                // Invalid token, allow visit login
            }
        }
        return NextResponse.next();
    }

    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (e) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Handle /admin redirection to /admin/login if hit
    // Wait, if it's hitting /admin itself we just protect as well (already handled above)
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/api/contact'],
};
