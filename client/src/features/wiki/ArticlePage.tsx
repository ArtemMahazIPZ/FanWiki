import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import type {Article} from '../../types/article';
import { useAuth } from '../../context/AuthContext';

export const ArticlePage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [article, setArticle] = useState<Article | null>(null);

    useEffect(() => {
        api.get<Article>(`/Wiki/${slug}`).then(res => setArticle(res.data));
    }, [slug]);

    if (!article) return <div className="p-10 text-center text-white">Завантаження...</div>;

    return (
        <div className="max-w-6xl mx-auto mt-8 px-4 pb-10">
            <div className="flex justify-between items-end mb-6 border-b border-slate-700 pb-4">
                <div>
                    <h1 className="text-5xl font-extrabold text-slate-100 tracking-tight">{article.title}</h1>
                    <p className="text-emerald-400 mt-2 text-sm uppercase tracking-widest font-semibold">
                        From the Chronicles of FanWiki
                    </p>
                </div>

                {user?.role === 'Admin' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/admin/edit/${article.id}`)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm font-bold text-white transition"
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 prose prose-invert prose-lg max-w-none">
                    <div className="bg-slate-800/50 p-6 rounded-lg border-l-4 border-emerald-500 mb-8 italic text-slate-300">
                        "Цитата персонажа або короткий опис..."
                    </div>
                    <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                        {article.content}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl sticky top-24">
                        <div className="bg-emerald-900/40 p-3 text-center font-bold text-emerald-100 border-b border-slate-700">
                            {article.title}
                        </div>
                        <div className="p-2 bg-slate-950">
                            {article.imageUrl ? (
                                <img
                                    src={`http://localhost:5122${article.imageUrl}`}
                                    alt={article.title}
                                    className="w-full rounded border border-slate-800"
                                />
                            ) : (
                                <div className="h-64 bg-slate-800 flex items-center justify-center text-slate-500 text-sm">No Portrait</div>
                            )}
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-800 pb-1">
                                <span className="font-bold text-slate-400">Category</span>
                                <span className="text-emerald-300">{article.category}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-1">
                                <span className="font-bold text-slate-400">Status</span>
                                <span className="text-emerald-300">Alive</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-1">
                                <span className="font-bold text-slate-400">Gender</span>
                                <span className="text-emerald-300">Unknown</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};