import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import type {Article} from '../../types/article';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { CommentsSection } from './CommentsSection';

interface ArticleMetadata {
    status?: string;
    gender?: string;
    damage?: string | number;
    year?: string | number;
    ammo?: string | number;
    fireRate?: string | number;
    region?: string;
    population?: string | number;
    founded?: string | number;
    [key: string]: string | number | undefined;
}

const InfoRow = ({ label, value }: { label: string, value?: string | number }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between border-b border-slate-800 pb-1 last:border-0">
            <span className="font-bold text-slate-400">{label}</span>
            <span className="text-emerald-300 font-medium text-right">{value}</span>
        </div>
    );
};

export const ArticlePage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, i18n } = useTranslation(); // Хук

    const [article, setArticle] = useState<Article | null>(null);
    const [meta, setMeta] = useState<ArticleMetadata>({});

    const tv = (val?: string | number) => {
        if (!val) return undefined;
        return t(`meta_values.${val}`, { defaultValue: val });
    };

    useEffect(() => {
        api.get<Article>(`/Wiki/${slug}`).then(res => {
            setArticle(res.data);
            if (res.data.metadata) {
                try {
                    setMeta(JSON.parse(res.data.metadata));
                } catch { setMeta({}); }
            }
        });
    }, [slug, i18n.language]);

    if (!article) return <div className="p-10 text-center text-white">Loading...</div>;

    const renderSidePanelInfo = () => {
        switch (article.category) {
            case 'Character':
                return (
                    <>
                        <InfoRow label={t('article.status')} value={tv(meta.status)} />
                        <InfoRow label={t('article.gender')} value={tv(meta.gender)} />
                    </>
                );
            case 'Weapon':
                return (
                    <>
                        <InfoRow label={t('article.damage')} value={meta.damage} />
                        <InfoRow label={t('article.ammo')} value={meta.ammo} />
                        <InfoRow label="RPM" value={meta.fireRate ? `${meta.fireRate}` : undefined} />
                        <InfoRow label={t('article.year')} value={meta.year} />
                    </>
                );
            case 'Location':
                return (
                    <>
                        <InfoRow label={t('article.region')} value={meta.region} />
                        <InfoRow label={t('article.population')} value={meta.population} />
                        <InfoRow label={t('article.founded')} value={meta.founded} />
                    </>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto mt-8 px-4 pb-10">
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
                            {t('article.edit')}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 prose prose-invert prose-lg max-w-none">
                    {article.quote && (
                        <div className="bg-slate-800/50 p-6 rounded-lg border-l-4 border-emerald-500 mb-8 italic text-slate-300 shadow-sm relative">
                            <span className="absolute top-2 left-2 text-4xl text-emerald-500/20 font-serif">"</span>
                            <p className="relative z-10">{article.quote}</p>
                        </div>
                    )}

                    <div
                        className="text-slate-300 leading-relaxed [&>p]:mb-4 [&>h2]:text-emerald-400 [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:font-bold [&>h2]:text-2xl [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>blockquote]:border-l-4 [&>blockquote]:border-slate-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>img]:rounded-xl [&>img]:mx-auto [&>img]:my-6 [&>img]:border [&>img]:border-slate-700"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
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
                                    className="w-full rounded border border-slate-800 object-cover aspect-3/4"
                                />
                            ) : (
                                <div className="h-64 bg-slate-800 flex items-center justify-center text-slate-500 text-sm">No Portrait</div>
                            )}
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <InfoRow label={t('article.category')} value={t(`categories.${article.category}`)} />
                            {renderSidePanelInfo()}
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-4xl mx-auto">
                <CommentsSection articleId={article.id} />
            </div>
        </div>
    );
};