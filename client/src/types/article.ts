export interface Article {
    id: string;
    slug: string;
    title: string;
    content: string;
    quote?: string;
    category: string;
    languageCode: string;
    imageUrl?: string;
    createdAt: string;
    metadata?: string;
}