import { prisma } from '@/lib/db/prisma';
import FAQAccordion from '@/components/ui/FAQAccordion';

export const metadata = {
    title: 'Sıkça Sorulan Sorular | Avukat Danışmanlık',
    description: 'Hukuki süreçler, davalar, avukatlık ücretleri ve aklınıza takılan diğer soruların cevaplarını bu sayfada bulabilirsiniz.',
};

export default async function FAQPage() {
    // Fetch FAQs from DB, ordered by the 'order' field
    let faqs: any[] = [];
    try {
        faqs = await prisma.fAQ.findMany({
            orderBy: { order: 'asc' },
            select: {
                id: true,
                question: true,
                answer: true,
            }
        });
    } catch (error) {
        console.error('Failed to load FAQs:', error);
    }

    return (
        <main className="section-padding animate-fade-in" style={{ minHeight: '80vh', backgroundColor: '#FFFFFF' }}>
            <div className="container">
                <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ color: 'var(--primary-color)' }}>Sıkça Sorulan Sorular</h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.125rem' }}>
                        Hukuki süreçlerle ilgili aklınıza takılan soruların cevaplarını sizin için derledik. Daha detaylı bilgi almak için bizimle iletişime geçebilirsiniz.
                    </p>
                    <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--secondary-color)', margin: '2rem auto 0' }}></div>
                </header>

                <div style={{ marginTop: '2rem' }}>
                    <FAQAccordion faqs={faqs} />
                </div>
            </div>
        </main>
    );
}
