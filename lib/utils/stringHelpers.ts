import slugify from 'slugify';

export function createSlug(text: string): string {
    // Normalize Turkish characters first just in case
    const turkishChars: { [key: string]: string } = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ı': 'i', 'I': 'i', 'İ': 'i',
        'ö': 'o', 'Ö': 'o',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u',
    };

    const normalized = text.replace(/[çÇğĞıIİöÖşŞüÜ]/g, (match) => turkishChars[match] || match);

    return slugify(normalized, {
        replacement: '-',
        remove: /[*+~.()'"!:@]/g,
        lower: true,
        strict: true,
        locale: 'tr'
    });
}
