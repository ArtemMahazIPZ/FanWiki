import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import type {Article} from '../../types/article';
import { ArticleCard } from './ArticleCard';

export const HomePage = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Запит на отримання всіх статей
        api.get<Article[]>('/Wiki')
            .then((response) => {
                setArticles(response.data);
            })
            .catch((error) => {
                console.error("Помилка завантаження:", error);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-10 text-center text-slate-400 animate-pulse">Завантаження бібліотеки...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Герой-секція (Заголовок) */}
            <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4">
                    Wiki Hub
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Ласкаво просимо до бази знань. Досліджуйте персонажів, локації та артефакти нашого всесвіту.
                </p>
            </div>

            {/* Сітка статей (як в магазині) */}
            {articles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {articles.map((article) => (
                        <ArticleCard key={article.slug} article={article} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
                    <p className="text-slate-500 text-xl">Поки що тут пусто...</p>
                    <p className="text-slate-600 text-sm mt-2">Але адмін скоро щось додасть!</p>
                </div>
            )}
        </div>
    );
};