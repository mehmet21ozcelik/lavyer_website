import React from 'react';

export function LegalServiceSchema({
    name,
    description,
    url,
    logo,
    telephone,
    address,
}: {
    name: string;
    description: string;
    url: string;
    logo: string;
    telephone: string;
    address: {
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        postalCode: string;
        addressCountry: string;
    };
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'LegalService',
        name,
        description,
        url,
        logo,
        telephone,
        address: {
            '@type': 'PostalAddress',
            ...address,
        },
        // We can add priceRange, openingHours etc as needed
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function ArticleSchema({
    title,
    description,
    image,
    datePublished,
    dateModified,
    authorName,
    url,
}: {
    title: string;
    description: string;
    image?: string;
    datePublished: string;
    dateModified: string;
    authorName: string;
    url: string;
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
        headline: title,
        description,
        image: image ? [image] : undefined,
        datePublished,
        dateModified,
        author: {
            '@type': 'Person',
            name: authorName,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Diyarbakır Avukatlık Bürosu',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function FAQSchema({
    faqs,
}: {
    faqs: { question: string; answer: string }[];
}) {
    if (!faqs || faqs.length === 0) return null;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
