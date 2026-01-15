import { useEffect, useState, useMemo } from 'react';
import { api } from '../../api/axios';
import type {Article} from '../../types/article';
import { ArticleCard } from './ArticleCard';

export const HomePage = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    useEffect(() => {
        api.get<Article[]>('/Wiki')
            .then((response) => {
                setArticles(response.data);
            })
            .catch((error) => {
                console.error("Помилка завантаження:", error);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = article.title.toLowerCase().includes(searchLower) ||
                article.content.toLowerCase().includes(searchLower);

            return matchesCategory && matchesSearch;
        });
    }, [articles, selectedCategory, searchTerm]);

    if (loading) {
        return <div className="p-10 text-center text-slate-400 animate-pulse">Завантаження бібліотеки...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6 min-h-screen">
            <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-500 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    Wiki Hub
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Досліджуйте персонажів, локації та артефакти нашого всесвіту.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm sticky top-20 z-40 shadow-xl">

                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-lg leading-5 bg-slate-950 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition duration-200"
                        placeholder="Пошук статей..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative w-full md:w-64">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="appearance-none block w-full pl-3 pr-10 py-2.5 border border-slate-700 rounded-lg leading-5 bg-slate-950 text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition duration-200 cursor-pointer hover:bg-slate-900"
                    >
                        <option value="All">Всі категорії</option>
                        <option value="Character">Персонажі (Character)</option>
                        <option value="Location">Локації (Location)</option>
                        <option value="Weapon">Зброя (Weapon)</option>
                        <option value="Event">Події (Event)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="mb-4 text-slate-500 text-sm font-medium pl-1">
                Знайдено статей: <span className="text-emerald-400">{filteredArticles.length}</span>
            </div>

            {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900/30 rounded-lg border border-slate-800 border-dashed animate-pulse">
                    <p className="text-slate-500 text-xl">Нічого не знайдено 🕵️‍♂️</p>
                    <p className="text-slate-600 text-sm mt-2">Спробуйте змінити запит або категорію</p>
                </div>
            )}
        </div>
    );
};