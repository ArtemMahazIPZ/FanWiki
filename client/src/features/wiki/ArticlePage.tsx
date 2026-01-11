import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/axios';
import type {Article} from '../../types/article';

export const ArticlePage = () => {
    const { slug } = useParams<{ slug: string }>(); // Беремо slug з URL
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await api.get<Article>(`/Wiki/${slug}?lang=uk`);
                setArticle(response.data);
            } catch (err) {
                console.error(err);
                setError('Статтю не знайдено або сталася помилка.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchArticle();
    }, [slug]);

    if (loading) return <div className="p-10 text-center">Завантаження...</div>;
    if (error) return <div className="p-10 text-red-500 text-center">{error}</div>;
    if (!article) return null;

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
            <h1 className="text-4xl font-bold mb-4 text-emerald-400">{article.title}</h1>
            <div className="text-sm text-slate-400 mb-6">
                Мова: {article.languageCode.toUpperCase()} • {new Date(article.createdAt).toLocaleDateString()}
            </div>
            <div className="prose prose-invert lg:prose-xl">
                <p>{article.content}</p>
            </div>
        </div>
    );
};