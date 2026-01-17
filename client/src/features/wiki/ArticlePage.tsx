import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import type { Article } from '../../types/article';
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
    const { t, i18n } = useTranslation();

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

    const handleReport = async () => {
        if (!user) {
            const wantLogin = confirm("Щоб надіслати скаргу, потрібно увійти. Перейти на сторінку входу?");
            if (wantLogin) navigate('/login');
            return;
        }

        const reason = prompt("Опишіть проблему (помилка, нецензурна лексика, пропозиція):");

        if (reason && reason.trim().length > 0) {
            try {
                await api.post('/Reports', {
                    reason: reason,
                    targetUrl: window.location.href
                });
                alert("Дякуємо! Адміністратор отримав ваше повідомлення.");
            } catch (error) {
                console.error(error);
                alert("Не вдалося відправити скаргу.");
            }
        }
    };

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
        <div className="max-w-7xl mx-auto mt-8 px-4 pb-10 animate-in fade-in">
            <div className="flex justify-between items-end mb-8 border-b border-slate-700 pb-6">
                <div>
                    <h1 className="text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">{article.title}</h1>
                    <p className="text-emerald-400 mt-3 text-sm uppercase tracking-widest font-semibold">
                        From the Chronicles of FanWiki
                    </p>
                </div>

                {user?.role === 'Admin' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/admin/edit/${article.id}`)}
                            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold text-white transition shadow-lg border border-slate-700"
                        >
                            {t('article.edit')}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-3">
                    {article.quote && (
                        <div className="bg-slate-900/50 p-8 rounded-xl border-l-4 border-emerald-500 mb-10 italic text-slate-300 shadow-md relative overflow-hidden">
                            <span className="absolute top-2 left-4 text-6xl text-emerald-500/10 font-serif leading-none">"</span>
                            <p className="relative z-10 text-lg font-serif">{article.quote}</p>
                        </div>
                    )}

                    <div
                        className="
                            prose prose-invert prose-lg max-w-none
                            text-slate-300 leading-relaxed
                            [&>h2]:text-emerald-400 [&>h2]:mt-10 [&>h2]:mb-6 [&>h2]:font-bold [&>h2]:text-3xl [&>h2]:border-b [&>h2]:border-slate-800 [&>h2]:pb-2
                            [&>h3]:text-emerald-200 [&>h3]:mt-8 [&>h3]:font-bold [&>h3]:text-xl
                            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:text-slate-300
                            [&>ol]:list-decimal [&>ol]:pl-6
                            [&>blockquote]:border-l-4 [&>blockquote]:border-slate-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-400
                            [&>img]:rounded-xl [&>img]:my-8 [&>img]:border [&>img]:border-slate-700 [&>img]:shadow-2xl
                            [&>p]:text-justify
                        "
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    <div className="mt-12 pt-6 border-t border-slate-800/50 flex justify-end">
                        <button
                            onClick={handleReport}
                            className="text-slate-500 hover:text-red-400 text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition duration-200"
                            title="Повідомити про помилку або порушення"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            Повідомити про помилку
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl sticky top-24">
                        <div className="bg-gradient-to-r from-emerald-900/80 to-slate-900 p-4 text-center font-bold text-emerald-100 border-b border-slate-700 tracking-wide uppercase text-sm">
                            {article.title}
                        </div>
                        <div className="p-3 bg-slate-950">
                            {article.imageUrl ? (
                                <img
                                    src={`http://localhost:5122${article.imageUrl}`}
                                    alt={article.title}
                                    className="w-full rounded-lg border border-slate-800 object-cover aspect-[3/4] shadow-inner"
                                />
                            ) : (
                                <div className="h-64 bg-slate-800 flex items-center justify-center text-slate-500 text-sm italic">No Portrait</div>
                            )}
                        </div>
                        <div className="p-5 space-y-4 text-sm bg-slate-900/50">
                            <InfoRow label={t('article.category')} value={t(`categories.${article.category}`)} />
                            {renderSidePanelInfo()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-16">
                <CommentsSection articleId={article.id} />
            </div>
        </div>
    );
};