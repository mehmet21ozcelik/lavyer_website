export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '../globals.css';
import React from 'react';

import { getSiteSettings } from '@/lib/services/settings.service';
import { buildMetadata } from '@/lib/seo/generateMetadata';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' });

export async function generateMetadata(): Promise<Metadata> {
  return await buildMetadata();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="tr">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <header>
          <div className="container">
            <a href="/" className="logo">
              {settings?.logoText || 'Hukuk'}{settings?.logoText ? '' : <span>Bürosu</span>}
            </a>
            <nav>
              <ul>
                <li><a href="/">Ana Sayfa</a></li>
                <li><a href="/hakkimizda">Hakkımızda</a></li>
                <li><a href="/hizmetler">Hizmetlerimiz</a></li>
                <li><a href="/blog">Hukuk Blogu</a></li>
                <li><a href="/sikca-sorulan-sorular">SSS</a></li>
                <li><a href="/iletisim">İletişim</a></li>
              </ul>
            </nav>
            <a href="/iletisim" className="btn btn-primary">Danışmanlık Alın</a>
          </div>
        </header>

        <main>{children}</main>

        <footer>
          <div className="container">
            <div className="footer-grid">
              <div>
                <h3>{settings?.logoText || 'Hukuk Bürosu'}</h3>
                <p>{settings?.description || "Diyarbakır'da öncü, dürüst ve güvenilir hukuki danışmanlık."}</p>
                {settings?.registrationNo && (
                  <p><strong>Diyarbakır Barosu Sicil No:</strong> {settings.registrationNo}</p>
                )}
              </div>
              <div>
                <h3>Hızlı Bağlantılar</h3>
                <ul>
                  <li><a href="/hakkimizda">Hakkımızda</a></li>
                  <li><a href="/hizmetler">Çalışma Alanlarımız</a></li>
                  <li><a href="/blog">Güncel Makaleler</a></li>
                  <li><a href="/sikca-sorulan-sorular">Sıkça Sorulan Sorular</a></li>
                  <li><a href="/iletisim">Bize Ulaşın</a></li>
                </ul>
              </div>
              <div>
                <h3>İletişim</h3>
                <p>Adres: {settings?.address || 'Yenişehir Mahallesi, Adliye Karşısı No:1, Yenişehir/Diyarbakır'}</p>
                <p>Email: {settings?.email || 'info@diyarbakiravukat.com'}</p>
                <p>Tel: {settings?.phone || '+90 555 123 4567'}</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} {settings?.logoText || 'Hukuk Bürosu'}. Tüm Hakları Saklıdır. | Diyarbakır Avukat</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
