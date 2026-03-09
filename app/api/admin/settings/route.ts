import { NextResponse } from 'next/server';
import { updateSettings, getSiteSettings } from '@/lib/services/settings.service';

export async function GET() {
    try {
        const settings = await getSiteSettings();
        return NextResponse.json(settings);
    } catch (err) {
        return NextResponse.json({ error: 'Data fetch failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const settings = await updateSettings(data);
        return NextResponse.json(settings);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
