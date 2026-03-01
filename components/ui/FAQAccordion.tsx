'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

interface FAQAccordionProps {
    faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggle = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    if (!faqs || faqs.length === 0) {
        return <p style={{ color: 'var(--text-secondary)' }}>Şu anda herhangi bir soru bulunmuyor.</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            {faqs.map(faq => {
                const isOpen = openId === faq.id;

                return (
                    <div
                        key={faq.id}
                        style={{
                            borderBottom: '1px solid var(--border-color)',
                            paddingBottom: '1rem',
                            paddingTop: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <button
                            onClick={() => toggle(faq.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '1rem 0',
                                textAlign: 'left',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '1.125rem',
                                fontWeight: isOpen ? 600 : 500,
                                color: isOpen ? 'var(--secondary-color)' : 'var(--text-primary)',
                                transition: 'color 0.2s ease'
                            }}
                            aria-expanded={isOpen}
                        >
                            <span style={{ paddingRight: '1rem' }}>{faq.question}</span>
                            <div style={{
                                flexShrink: 0,
                                color: 'var(--secondary-color)',
                                transition: 'transform 0.3s ease',
                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}>
                                {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                            </div>
                        </button>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateRows: isOpen ? '1fr' : '0fr',
                                transition: 'grid-template-rows 0.3s ease'
                            }}
                        >
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{
                                    paddingTop: '0.5rem',
                                    paddingBottom: '1rem',
                                    margin: 0,
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.6
                                }}>
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
