import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '../globals.css';
import React from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'Diyarbakır Avukatlık Bürosu | Profesyonel Hukuki Danışmanlık',
  description: 'Diyarbakır merkezli hukuk büromuz, boşanma, ceza, miras ve iş hukuku alanlarında profesyonel ve çözüm odaklı avukatlık hizmeti sunmaktadır.',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://www.diyarbakiravukat.com', // Placeholder domain
    siteName: 'Diyarbakır Avukatlık Bürosu',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <header>
          <div className="container">
            <a href="/" className="logo">
              Hukuk<span>Bürosu</span>
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
                <h3>Hukuk <span>Bürosu</span></h3>
                <p>Diyarbakır'da öncü, dürüst ve güvenilir hukuki danışmanlık.</p>
                <p><strong>Diyarbakır Barosu Sicil No:</strong> 12345</p>
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
                <p>Adres: Yenişehir Mahallesi, Adliye Karşısı No:1, Yenişehir/Diyarbakır</p>
                <p>Email: info@diyarbakiravukat.com</p>
                <p>Tel: +90 555 123 4567</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} Hukuk Bürosu. Tüm Hakları Saklıdır. | Diyarbakır Avukat</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
