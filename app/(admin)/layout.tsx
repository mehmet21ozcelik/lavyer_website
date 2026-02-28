import React from 'react';
import '../globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
    title: 'Yönetim Paneli',
    robots: { index: false, follow: false }
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr">
            <body className={inter.variable}>
                <Toaster position="top-right" richColors />
                {children}
            </body>
        </html>
    );
}
