export interface Article {
    id: string;
    slug: string;
    title: string;
    content: string;
    languageCode: string;
    imageUrl?: string;
    category: string;
    createdAt: string;
}