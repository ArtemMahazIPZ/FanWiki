import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/axios';
import type { Article } from '../../types/article';
import { Search, X } from 'lucide-react';

interface ArticleLinkModalProps {
    onSelect: (slug: string, title: string) => void;
    onClose: () => void;
}

export const ArticleLinkModal = ({ onSelect, onClose }: ArticleLinkModalProps) => {
    const { t, i18n } = useTranslation();
    const [articles, setArticles] = useState<Article[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Article[]>(`/Wiki?lang=${i18n.language}`)
            .then(res => setArticles(res.data))
            .finally(() => setLoading(false));
    }, [i18n.language]);

    const filtered = articles.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-white">{t('editor.link_to_article')}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-slate-800">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            autoFocus
                            type="text"
                            placeholder={t('editor.search_articles')}
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-2">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500 animate-pulse">{t('editor.loading')}</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">{t('editor.no_articles')}</div>
                    ) : (
                        filtered.map(article => (
                            <button
                                key={article.id}
                                onClick={() => onSelect(article.slug, article.title)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition text-left group"
                            >
                                {article.imageUrl ? (
                                    <img
                                        src={`http://localhost:5122${article.imageUrl}`}
                                        alt=""
                                        className="w-10 h-10 rounded object-cover border border-slate-700 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600 flex-shrink-0 text-xs">
                                        ?
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="text-white font-medium text-sm truncate group-hover:text-emerald-400 transition">
                                        {article.title}
                                    </div>
                                    <div className="text-slate-500 text-xs truncate">
                                        /wiki/{article.slug}
                                        <span className="ml-2 text-slate-600">{t(`categories.${article.category}`)}</span>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
