export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-12345');
