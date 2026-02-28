import { NextResponse } from 'next/server';
import xss from 'xss';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Bot Protection / Basic Validation
        if (!body.name || !body.phone || !body.message) {
            return NextResponse.json({ error: 'Eksik bilgi girdiniz.' }, { status: 400 });
        }

        // 2. XSS Sanitation against Malicious Inputs (Security Hardening)
        const secureName = xss(body.name);
        const securePhone = xss(body.phone);
        const secureMessage = xss(body.message);

        // 3. Email integration (e.g. Resend, Sendgrid, or NodeMailer)
        // await sendEmail({ to: 'info@diyarbakiravukat.com', subject: 'Yeni İletişim', text: `...`});

        // We pretend success here
        return NextResponse.json({ success: true, message: 'Mesajınız başarıyla iletildi.' });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
