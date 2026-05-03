import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/axios';
import type {Article} from '../../types/article';
import { ArticleCard } from './ArticleCard';

export const HomePage = () => {
    const { t, i18n } = useTranslation();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    // Стейт для параметрів запиту (Серверна фільтрація)
    const [selectedCategory, setSelectedCategory] = useState<string>(''); // '' = All
    const [selectedAlignment, setSelectedAlignment] = useState<string>(''); // Positive / Negative
    const [sortOrder, setSortOrder] = useState<'az' | 'za'>('az');

    const [selectedGame, setSelectedGame] = useState<string>('');

    // Стейт для локального пошуку по назві (Клієнтська фільтрація результатів)
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setLoading(true);

        // Формуємо URL параметри для бекенду
        const params = new URLSearchParams();
        params.append('lang', i18n.language);
        params.append('sort', sortOrder);

        if (selectedCategory && selectedCategory !== 'All') {
            params.append('category', selectedCategory);
        }

        if (selectedAlignment) {
            params.append('alignment', selectedAlignment);
        }

        if (selectedGame) {
            params.append('game', selectedGame);
        }

        api.get<Article[]>(`/Wiki?${params.toString()}`)
            .then((response) => {
                setArticles(response.data);
            })
            .catch((error) => {
                console.error("Помилка завантаження:", error);
            })
            .finally(() => setLoading(false));
    }, [i18n.language, selectedCategory, selectedAlignment, sortOrder, selectedGame]);

    // Локальний пошук (фільтрує вже отримані від сервера статті)
    const displayArticles = useMemo(() => {
        if (!searchTerm) return articles;
        const lowerTerm = searchTerm.toLowerCase();
        return articles.filter(a =>
            a.title.toLowerCase().includes(lowerTerm) ||
            (a.content && a.content.toLowerCase().includes(lowerTerm))
        );
    }, [articles, searchTerm]);

    // Collect unique game names from all loaded articles for the dropdown
    const gameNames = useMemo(() => {
        const names = articles
            .map(a => a.gameName)
            .filter((g): g is string => !!g && g.trim() !== '');
        return [...new Set(names)].sort();
    }, [articles]);

    const handleFilterClick = (cat: string, align: string = '') => {
        setSelectedCategory(cat);
        setSelectedAlignment(align);
        // Скидаємо пошук при зміні фільтру для кращого UX
        // setSearchTerm('');
    };

    return (
        <div className="max-w-7xl mx-auto p-6 min-h-screen">
            {/* Герой-секція */}
            <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {t('home.title')}
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    {t('home.subtitle')}
                </p>
            </div>

            {/* --- ПАНЕЛЬ КЕРУВАННЯ (Фільтри, Пошук, Сортування) --- */}
            <div className="flex flex-col gap-6 mb-10">

                {/* Рядок 1: Кнопки категорій */}
                <div className="flex flex-wrap justify-center gap-3">
                    <button
                        onClick={() => handleFilterClick('')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition border ${
                            selectedCategory === ''
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                        }`}
                    >
                        {t('categories.All')}
                    </button>

                    <button
                        onClick={() => handleFilterClick('Character')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition border ${
                            selectedCategory === 'Character' && !selectedAlignment
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                        }`}
                    >
                        {t('categories.Character')}
                    </button>

                    {/* КНОПКИ ГЕРОЙ / ЛИХОДІЙ */}
                    <button
                        onClick={() => handleFilterClick('Character', 'Positive')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition border flex items-center gap-2 ${
                            selectedAlignment === 'Positive'
                                ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-500/20'
                                : 'bg-slate-900 text-green-400 border-slate-700 hover:border-green-500/50 hover:bg-green-900/10'
                        }`}
                    >
                        😇 {t('home.heroes')}
                    </button>

                    <button
                        onClick={() => handleFilterClick('Character', 'Negative')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition border flex items-center gap-2 ${
                            selectedAlignment === 'Negative'
                                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/20'
                                : 'bg-slate-900 text-red-400 border-slate-700 hover:border-red-500/50 hover:bg-red-900/10'
                        }`}
                    >
                        😈 {t('home.villains')}
                    </button>
                    {/* ------------------------- */}

                    <button
                        onClick={() => handleFilterClick('Weapon')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition border ${
                            selectedCategory === 'Weapon'
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                        }`}
                    >
                        {t('categories.Weapon')}
                    </button>

                    <button
                        onClick={() => handleFilterClick('Location')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition border ${
                            selectedCategory === 'Location'
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                        }`}
                    >
                        {t('categories.Location')}
                    </button>
                </div>

                {/* Рядок 2: Пошук та Сортування */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
                    {/* Пошук */}
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-lg leading-5 bg-slate-950 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition duration-200"
                            placeholder={t('home.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Game Filter */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <span className="text-slate-400 text-sm font-bold whitespace-nowrap">{t('home.game')}</span>
                        <select
                            value={selectedGame}
                            onChange={(e) => setSelectedGame(e.target.value)}
                            className="w-full md:w-48 appearance-none block pl-3 pr-8 py-2.5 border border-slate-700 rounded-lg leading-5 bg-slate-950 text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition duration-200 cursor-pointer hover:bg-slate-900"
                        >
                            <option value="">{t('home.all_games')}</option>
                            {gameNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Сортування */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <span className="text-slate-400 text-sm font-bold whitespace-nowrap">{t('home.sort')}</span>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'az' | 'za')}
                            className="w-full md:w-48 appearance-none block pl-3 pr-8 py-2.5 border border-slate-700 rounded-lg leading-5 bg-slate-950 text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition duration-200 cursor-pointer hover:bg-slate-900"
                        >
                            <option value="az">{t('home.sort_az')}</option>
                            <option value="za">{t('home.sort_za')}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mb-4 text-slate-500 text-sm font-medium pl-1">
                {t('home.found')} <span className="text-emerald-400">{displayArticles.length}</span>
            </div>

            {loading ? (
                <div className="p-20 text-center text-slate-400 animate-pulse">
                    {t('home.loading')}
                </div>
            ) : displayArticles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                    {displayArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900/30 rounded-lg border border-slate-800 border-dashed">
                    <p className="text-slate-500 text-xl">{t('home.no_results')}</p>
                    {(selectedCategory || selectedAlignment || selectedGame) && (
                        <button
                            onClick={() => { handleFilterClick(''); setSelectedGame(''); }}
                            className="mt-4 text-emerald-500 hover:text-emerald-400 underline"
                        >
                            {t('home.reset_filters')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};