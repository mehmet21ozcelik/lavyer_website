import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    let blogsCount = 0, servicesCount = 0, citiesCount = 0;
    try {
        [blogsCount, servicesCount, citiesCount] = await Promise.all([
            prisma.blogPost.count(),
            prisma.practiceArea.count(),
            prisma.city.count(),
        ]);
    } catch (e) { }

    return (
        <div style={{ padding: '0 2rem' }}>
            <AdminPageHeader
                title="Yönetim Paneli"
            />
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', marginTop: '-1rem' }}>
                Sisteme hoşgeldiniz. Buradan içeriklerinizi yönetebilirsiniz.
            </p>

            <div className="grid grid-3">
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Blog Makaleleri</h2>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)', margin: '0.5rem 0' }}>{blogsCount}</p>
                    <Link href="/admin/blog" style={{ color: 'var(--secondary-color)', fontWeight: 600, textDecoration: 'none' }}>Yönet &rarr;</Link>
                </div>

                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Hizmet Alanları</h2>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)', margin: '0.5rem 0' }}>{servicesCount}</p>
                    <Link href="/admin/services" style={{ color: 'var(--secondary-color)', fontWeight: 600, textDecoration: 'none' }}>Yönet &rarr;</Link>
                </div>

                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Şehirler (Local SEO)</h2>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)', margin: '0.5rem 0' }}>{citiesCount}</p>
                    <Link href="/admin/cities" style={{ color: 'var(--secondary-color)', fontWeight: 600, textDecoration: 'none' }}>Yönet &rarr;</Link>
                </div>
            </div>
        </div>
    );
}
