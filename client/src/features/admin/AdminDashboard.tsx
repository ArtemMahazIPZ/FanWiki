import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import type { Article } from '../../types/article';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AdminDashboard = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await api.get<Article[]>('/Wiki');
                setArticles(res.data);
            } catch (err) {
                console.error("Failed to fetch articles", err);
            }
        };

        fetchArticles();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('admin.delete_confirm'))) return;
        try {
            await api.delete(`/Wiki/${id}`);
            setArticles(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error(error);
            alert(t('admin.delete_error'));
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-100">{t('admin.dashboard_title')}</h1>
                <button
                    onClick={() => navigate('/admin/create')}
                    className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded font-bold text-white transition"
                >
                    {t('admin.new_article')}
                </button>
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold">
                    <tr>
                        <th className="p-4">{t('admin.table_title')}</th>
                        <th className="p-4">{t('admin.table_slug')}</th>
                        <th className="p-4">{t('admin.table_category')}</th>
                        <th className="p-4 text-right">{t('admin.table_actions')}</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                    {articles.map(article => (
                        <tr key={article.id} className="hover:bg-slate-800/50 transition">
                            <td className="p-4 font-bold text-white">{article.title}</td>
                            <td className="p-4 text-emerald-400">{article.slug}</td>
                            <td className="p-4">
                                    <span className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">
                                        {t(`categories.${article.category}`)}
                                    </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                                <button
                                    onClick={() => navigate(`/admin/edit/${article.id}`)}
                                    className="text-blue-400 hover:text-blue-300 text-sm font-bold"
                                >
                                    {t('admin.edit')}
                                </button>
                                <button
                                    onClick={() => article.id && handleDelete(article.id)}
                                    className="text-red-500 hover:text-red-400 text-sm font-bold"
                                >
                                    {t('admin.delete')}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
