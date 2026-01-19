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
    voiceActor?: string;
    causeOfDeath?: string;
    family?: string[];
    allies?: string[];
    enemies?: string[];

    damage?: string | number;
    year?: string | number;
    ammo?: string | number;
    fireRate?: string | number;
    region?: string;
    population?: string | number;
    founded?: string | number;

    [key: string]: string | number | string[] | undefined;
}

const InfoRow = ({ label, value, classNameColor = "text-emerald-300" }: { label: string, value?: string | number, classNameColor?: string }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center border-b border-slate-800 pb-1 last:border-0 mt-2">
            <span className="font-bold text-slate-400 text-xs uppercase">{label}</span>
            <span className={`${classNameColor} font-medium text-right text-sm`}>{value}</span>
        </div>
    );
};

const InfoList = ({ label, items, variant = 'success' }: { label: string, items?: string[], variant?: 'success' | 'danger' }) => {
    if (!items || items.length === 0) return null;

    const colorStyles = variant === 'danger'
        ? "text-red-400 bg-red-900/20 border-red-900/50"
        : "text-emerald-300 bg-emerald-900/20 border-emerald-900/50";

    return (
        <div className="border-b border-slate-800 pb-2 last:border-0 mt-3">
            <span className="block font-bold text-slate-400 text-xs uppercase mb-2">{label}</span>
            <ul className="flex flex-col gap-1 items-end">
                {items.map((item, idx) => (
                    <li key={idx} className={`${colorStyles} border text-xs px-2 py-1 rounded w-fit text-right`}>
                        {item}
                    </li>
                ))}
            </ul>
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
        return t(`meta_values.${val}`, { defaultValue: val.toString() });
    };

    useEffect(() => {
        api.get<Article>(`/Wiki/${slug}?lang=${i18n.language}`).then(res => {
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

        const reason = prompt("Опишіть проблему:");
        if (reason && reason.trim().length > 0) {
            try {
                await api.post('/Reports', { reason: reason, targetUrl: window.location.href });
                alert("Дякуємо! Адміністратор отримав ваше повідомлення.");
            } catch (error) {
                alert("Не вдалося відправити скаргу.");
            }
        }
    };

    if (!article) return <div className="p-10 text-center text-white">Loading...</div>;

    const getStatusColor = (status?: string) => {
        if (status === 'Deceased') return 'text-red-400 font-bold';
        if (status === 'Unknown') return 'text-amber-400';
        return 'text-emerald-300';
    };

    const renderSidePanelInfo = () => {
        switch (article.category) {
            case 'Character':
                return (
                    <>
                        <InfoRow
                            label={t('article.status')}
                            value={tv(meta.status)}
                            classNameColor={getStatusColor(meta.status)}
                        />

                        {meta.status === 'Deceased' && meta.causeOfDeath && (
                            <div className="flex justify-between items-center border-b border-red-900/30 pb-1 mt-2">
                                <span className="font-bold text-red-400 text-xs uppercase flex items-center gap-1">
                                    ☠️ {t('article.cause_of_death', { defaultValue: 'Причина' })}
                                </span>
                                <span className="text-red-200 font-medium text-right text-sm">{meta.causeOfDeath}</span>
                            </div>
                        )}

                        <InfoRow label={t('article.gender')} value={tv(meta.gender)} />

                        {meta.voiceActor && (
                            <InfoRow
                                label={`🎙️ ${t('article.voice_actor')}`}
                                value={meta.voiceActor}
                                classNameColor="text-indigo-300"
                            />
                        )}

                        <InfoList label={t('article.family', { defaultValue: "Сім'я" })} items={meta.family} variant="success" />
                        <InfoList label={t('article.allies', { defaultValue: "Союзники" })} items={meta.allies} variant="success" />

                        <InfoList label={t('article.enemies', { defaultValue: "Вороги" })} items={meta.enemies} variant="danger" />
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
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-700 pb-6 gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">{article.title}</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="text-emerald-400 text-sm uppercase tracking-widest font-semibold">
                            {t(`categories.${article.category}`)}
                        </span>
                        {article.alignment && (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                article.alignment === 'Positive' ? 'bg-green-900/30 text-green-400 border-green-800' :
                                    article.alignment === 'Negative' ? 'bg-red-900/30 text-red-400 border-red-800' :
                                        'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                                {article.alignment === 'Positive' ? '😇 HERO' : article.alignment === 'Negative' ? '😈 VILLAIN' : 'NEUTRAL'}
                            </span>
                        )}
                    </div>
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
                <div className="lg:col-span-3 order-2 lg:order-1">
                    {article.quote && (
                        <div className="bg-slate-900/50 p-8 rounded-xl border-l-4 border-emerald-500 mb-10 italic text-slate-300 shadow-md relative overflow-hidden">
                            <span className="absolute top-2 left-4 text-6xl text-emerald-500/10 font-serif leading-none">"</span>
                            <p className="relative z-10 text-lg font-serif">{article.quote}</p>
                        </div>
                    )}

                    <div
                        className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed [&>h2]:text-emerald-400 [&>h2]:mt-10 [&>h2]:border-b [&>h2]:border-slate-800 [&>h2]:pb-2 [&>img]:rounded-xl [&>img]:shadow-2xl"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    <div className="mt-12 pt-6 border-t border-slate-800/50 flex justify-end">
                        <button
                            onClick={handleReport}
                            className="text-slate-500 hover:text-red-400 text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            Повідомити про помилку
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1 order-1 lg:order-2">
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
                        <div className="p-5 space-y-1 text-sm bg-slate-900/50">
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