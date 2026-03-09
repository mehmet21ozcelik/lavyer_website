import { prisma } from '@/lib/db/prisma';
import { unstable_cache, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { SiteSettings } from '@prisma/client';

export const getSiteSettings = unstable_cache(
    async () => {
        try {
            const settings = await prisma.siteSettings.findUnique({
                where: { id: 'settings' }
            });

            // Default settings if not found
            if (!settings) {
                return {
                    id: 'settings',
                    title: 'Diyarbakır Avukatlık Bürosu | Profesyonel Hukuki Danışmanlık',
                    description: 'Diyarbakır merkezli hukuk büromuz, boşanma, ceza, miras ve iş hukuku alanlarında profesyonel ve çözüm odaklı avukatlık hizmeti sunmaktadır.',
                    logoText: 'HukukBürosu',
                    email: 'info@diyarbakiravukat.com',
                    phone: '+90 555 123 4567',
                    address: 'Yenişehir Mahallesi, Adliye Karşısı No:1, Yenişehir/Diyarbakır',
                    whatsappNumber: '905551234567',
                    registrationNo: '12345',
                    officeHours: 'Pazartesi - Cuma: 09:00 - 18:00',
                    facebookUrl: null,
                    instagramUrl: null,
                    linkedinUrl: null,
                    twitterUrl: null,
                    googleMapsUrl: null,
                    updatedAt: new Date(),
                } as SiteSettings;
            }

            return settings;
        } catch (error) {
            console.error('getSiteSettings error:', error);
            // Fallback object to prevent crashes
            return {
                id: 'settings',
                title: 'Diyarbakır Avukatlık Bürosu',
                description: 'Hukuki danışmanlık hizmetleri.',
                email: 'info@diyarbakiravukat.com',
                phone: '+90 555 123 4567',
            } as any;
        }
    },
    ['site_settings'],
    {
        tags: [CACHE_TAGS.settings],
    }
);

export async function updateSettings(data: Partial<SiteSettings>) {
    return await prisma.$transaction(async (tx) => {
        const settings = await tx.siteSettings.upsert({
            where: { id: 'settings' },
            update: data,
            create: {
                id: 'settings',
                title: data.title || 'Diyarbakır Avukatlık Bürosu',
                description: data.description || 'Diyarbakır merkezli profesyonel hukuki danışmanlık hizmeti.',
                ...data as any
            },
        });

        revalidateTag(CACHE_TAGS.settings);
        return settings;
    });
}
