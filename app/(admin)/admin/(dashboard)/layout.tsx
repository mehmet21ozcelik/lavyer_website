import React from 'react';
import Sidebar from '@/components/admin/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
