'use client';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AdminPageHeaderProps {
    title: string;
    backPath?: string;
    actions?: ReactNode;
}

export default function AdminPageHeader({ title, backPath, actions }: AdminPageHeaderProps) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {backPath && (
                    <Link
                        href={backPath}
                        style={{
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        &larr;
                    </Link>
                )}
                <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700 }}>{title}</h1>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {actions}
            </div>
        </div>
    );
}
