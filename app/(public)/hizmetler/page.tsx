import { prisma } from '@/lib/db/prisma';

export const metadata = {
    title: 'Hizmetlerimiz | Diyarbakır Avukatlık Bürosu',
    description: 'Boşanma, ceza tayini, iş hukuku ve miras gibi alanlardaki uzmanlıklarımız.'
};

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
    let areas: any[] = [];
    try {
        areas = await prisma.practiceArea.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (e) { }

    return (
        <section className="section-padding" style={{ minHeight: '80vh', background: 'var(--background-color)' }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>Uzmanlık Alanlarımız</h1>
                <p style={{ maxWidth: '800px', margin: '0 auto 4rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    Hukuki sorunlarınıza profesyonel ve etkili çözümler sunuyoruz. Uzman ekibimizle sürecin her adımında yanınızdayız.
                </p>

                <div className="grid grid-3">
                    {areas.map((area: any) => (
                        <a href={`/${area.slug}`} key={area.id} className="card animate-fade-in" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'flex-start', textAlign: 'left' }}>
                            <div style={{ backgroundColor: 'var(--primary-color)', width: '40px', height: '4px', marginBottom: '1rem', borderRadius: '4px' }}></div>
                            <h3 style={{ marginBottom: '0.5rem', flex: 1 }}>{area.name}</h3>
                            <span style={{ color: 'var(--secondary-color)', fontWeight: 600, marginTop: '2rem' }}>Detaylı Bilgi &rarr;</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
