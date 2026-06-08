import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { ArticleLinkModal } from './ArticleLinkModal';

import { api } from '../../api/axios';
import type { Article } from '../../types/article';
import { EditorToolbar } from './EditorToolbar';
import { FontSize } from '../../extensions/FontSize';
import { CustomImage } from '../../extensions/CustomImage';
import { extractApiError } from '../../utils/apiError';


type LinkedItem = { name: string; slug?: string };
type ListField = 'family' | 'allies' | 'enemies' | 'alsoKnownAs';

interface ArticleMetadata {
    status?: string;
    gender?: string;
    voiceActor?: string;
    causeOfDeath?: string;
    family?: LinkedItem[];
    allies?: LinkedItem[];
    enemies?: LinkedItem[];
    alsoKnownAs?: string[];
    birthDate?: string;
    birthYear?: string | number;
    birthPlace?: string;
    age?: string | number;

    damage?: string | number;
    year?: string | number;
    ammo?: string | number;
    fireRate?: string | number;
    region?: string;
    population?: string | number;
    founded?: string | number;

    [key: string]: string | number | string[] | LinkedItem[] | undefined;
}

interface EnData {
    title: string;
    quote: string;
    voiceActor: string;
    birthPlace: string;
    birthDate: string;
    causeOfDeath: string;
    familyNames: string[];
    alliesNames: string[];
    enemiesNames: string[];
    alsoKnownAs: string[];
}

const buildExtensions = () => [
    StarterKit,
    TextStyle,
    FontSize,
    CustomImage,
    TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
    Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-emerald-400 underline hover:text-emerald-300 cursor-pointer' },
    }),
];

const editorBaseClass =
    'prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4 text-slate-300 leading-relaxed ' +
    '[&>img]:rounded-xl [&>img]:border [&>img]:border-slate-700 [&>img]:inline-block ' +
    '[&_figure]:my-4 [&_figure]:mx-auto [&_figure_img]:rounded-xl [&_figure_img]:border [&_figure_img]:border-slate-700 ' +
    '[&_figcaption]:text-sm [&_figcaption]:text-slate-400 [&_figcaption]:text-center [&_figcaption]:mt-2 [&_figcaption]:italic';

export const ArticleEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const { t, i18n } = useTranslation();

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        quote: '',
        content: '',
        category: 'Character',
        alignment: '',
        gameName: '',
        languageCode: 'uk'
    });

    const [metadata, setMetadata] = useState<ArticleMetadata>({
        status: 'Alive',
        gender: 'Unknown',
        family: [],
        allies: [],
        enemies: [],
        alsoKnownAs: []
    });
    const [linkingField, setLinkingField] = useState<ListField | null>(null);
    const [linkingIndex, setLinkingIndex] = useState<number | null>(null);

    const [enData, setEnData] = useState<EnData>({
        title: '',
        quote: '',
        voiceActor: '',
        birthPlace: '',
        birthDate: '',
        causeOfDeath: '',
        familyNames: [],
        alliesNames: [],
        enemiesNames: [],
        alsoKnownAs: []
    });
    const [isTranslating, setIsTranslating] = useState(false);
    const [translateError, setTranslateError] = useState<string | null>(null);

    const [existingImage, setExistingImage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const editor = useEditor({
        extensions: buildExtensions(),
        content: '',
        editorProps: { attributes: { class: editorBaseClass } },
        onUpdate: ({ editor }) => {
            setFormData(prev => ({ ...prev, content: editor.getHTML() }));
        },
    });

    const enEditor = useEditor({
        extensions: buildExtensions(),
        content: '',
        editorProps: { attributes: { class: editorBaseClass + ' min-h-[200px]' } },
    });

    useEffect(() => {
        if (isEdit && id) {
            api.get<Article>(`/Wiki/${id}?lang=uk`).then(res => {
                const data = res.data;
                setFormData({
                    title: data.title,
                    slug: data.slug,
                    quote: data.quote || '',
                    content: data.content,
                    category: data.category,
                    alignment: data.alignment || '',
                    gameName: data.gameName || '',
                    languageCode: data.languageCode
                });
                setExistingImage(data.imageUrl || null);

                if (data.metadata) {
                    try {
                        const parsed = JSON.parse(data.metadata);
                        const normalizeLinked = (arr: any[]): LinkedItem[] =>
                            (arr || []).map((x: any) => typeof x === 'string' ? { name: x } : x);
                        setMetadata({
                            ...parsed,
                            birthDate: parsed.birthDate || (parsed.birthYear ? String(parsed.birthYear) : undefined),
                            family: normalizeLinked(parsed.family),
                            allies: normalizeLinked(parsed.allies),
                            enemies: normalizeLinked(parsed.enemies),
                            alsoKnownAs: parsed.alsoKnownAs || []
                        });
                    } catch { setMetadata({}); }
                }
                editor?.commands.setContent(data.content);
            });

            api.get<Article>(`/Wiki/${id}?lang=en`).then(res => {
                if (res.data.languageCode !== 'en') return;

                let enMeta: ArticleMetadata = {};
                if (res.data.metadata) {
                    try { enMeta = JSON.parse(res.data.metadata); } catch { /* ignore */ }
                }
                const normalizeLinked = (arr: any[]): LinkedItem[] =>
                    (arr || []).map((x: any) => typeof x === 'string' ? { name: x } : x);
                const enFamily  = normalizeLinked((enMeta.family  as any[]) || []);
                const enAllies  = normalizeLinked((enMeta.allies  as any[]) || []);
                const enEnemies = normalizeLinked((enMeta.enemies as any[]) || []);

                setEnData({
                    title:        res.data.title,
                    quote:        res.data.quote || '',
                    voiceActor:   (enMeta.voiceActor   as string) || '',
                    birthPlace:   (enMeta.birthPlace   as string) || '',
                    birthDate:    (enMeta.birthDate    as string) || '',
                    causeOfDeath: (enMeta.causeOfDeath as string) || '',
                    familyNames:  enFamily.map(x => x.name),
                    alliesNames:  enAllies.map(x => x.name),
                    enemiesNames: enEnemies.map(x => x.name),
                    alsoKnownAs:  (enMeta.alsoKnownAs as string[]) || []
                });
                enEditor?.commands.setContent(res.data.content);
            }).catch(() => { /* no English translation yet */ });
        }
    }, [id, isEdit, editor, enEditor, i18n.language]);

    const handleAutoTranslate = async () => {
        setTranslateError(null);
        setIsTranslating(true);
        try {
            const htmlContent  = editor?.getHTML() || formData.content;
            const familyNames  = ((metadata.family  as LinkedItem[]) || []).map(x => x.name).filter(Boolean);
            const alliesNames  = ((metadata.allies  as LinkedItem[]) || []).map(x => x.name).filter(Boolean);
            const enemiesNames = ((metadata.enemies as LinkedItem[]) || []).map(x => x.name).filter(Boolean);
            const alsoKnownAs  = ((metadata.alsoKnownAs as string[]) || []).filter(Boolean);

            const res = await api.post<{
                title:        string;
                quote:        string;
                content:      string;
                voiceActor:   string | null;
                birthPlace:   string | null;
                birthDate:    string | null;
                causeOfDeath: string | null;
                familyNames:  string[];
                alliesNames:  string[];
                enemiesNames: string[];
                alsoKnownAs:  string[];
            }>('/Translate/batch', {
                title:        formData.title,
                quote:        formData.quote,
                content:      htmlContent,
                voiceActor:   (metadata.voiceActor   as string) || null,
                birthPlace:   (metadata.birthPlace   as string) || null,
                birthDate:    (metadata.birthDate    as string) || null,
                causeOfDeath: (metadata.causeOfDeath as string) || null,
                familyNames:  familyNames.length  > 0 ? familyNames  : null,
                alliesNames:  alliesNames.length  > 0 ? alliesNames  : null,
                enemiesNames: enemiesNames.length > 0 ? enemiesNames : null,
                alsoKnownAs:  alsoKnownAs.length  > 0 ? alsoKnownAs  : null,
                sourceLang: 'uk',
                targetLang: 'en'
            });

            enEditor?.commands.setContent(res.data.content);

            setEnData({
                title:        res.data.title,
                quote:        res.data.quote,
                voiceActor:   res.data.voiceActor   || '',
                birthPlace:   res.data.birthPlace   || '',
                birthDate:    res.data.birthDate    || '',
                causeOfDeath: res.data.causeOfDeath || '',
                familyNames:  res.data.familyNames  || [],
                alliesNames:  res.data.alliesNames  || [],
                enemiesNames: res.data.enemiesNames || [],
                alsoKnownAs:  res.data.alsoKnownAs  || []
            });
        } catch (err: any) {
            console.error(err);
            const status = err?.response?.status;
            if (status === 429) {
                alert('The translation service is currently rate-limited. Please wait a few seconds and try again.');
            } else if (status === 503) {
                alert('The translation service is temporarily unavailable. Please try again later.');
            } else {
                alert('Translation failed. Please check your connection and try again.');
            }
            setTranslateError(t('editor.translate_error'));
        } finally {
            setIsTranslating(false);
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        setFormData({ ...formData, category: newCategory });

        let defaults: ArticleMetadata = {};
        if (newCategory === 'Character') {
            defaults = { status: 'Alive', gender: 'Unknown', family: [], allies: [], enemies: [], alsoKnownAs: [] };
        }
        setMetadata(defaults);
    };

    const handleListChange = (field: ListField, index: number, name: string, slug?: string) => {
        if (field === 'alsoKnownAs') {
            const list = [...((metadata.alsoKnownAs as string[]) || [])];
            list[index] = name;
            setMetadata({ ...metadata, alsoKnownAs: list });
        } else {
            const list = [...((metadata[field] as LinkedItem[]) || [])];
            list[index] = { name, slug: slug !== undefined ? slug : list[index]?.slug };
            setMetadata({ ...metadata, [field]: list });
        }
    };

    const addListItem = (field: ListField) => {
        if (field === 'alsoKnownAs') {
            const list = [...((metadata.alsoKnownAs as string[]) || [])]; list.push('');
            setMetadata({ ...metadata, alsoKnownAs: list });
        } else {
            const list = [...((metadata[field] as LinkedItem[]) || [])]; list.push({ name: '' });
            setMetadata({ ...metadata, [field]: list });
        }
    };

    const removeListItem = (field: ListField, index: number) => {
        if (field === 'alsoKnownAs') {
            const list = [...((metadata.alsoKnownAs as string[]) || [])]; list.splice(index, 1);
            setMetadata({ ...metadata, alsoKnownAs: list });
        } else {
            const list = [...((metadata[field] as LinkedItem[]) || [])]; list.splice(index, 1);
            setMetadata({ ...metadata, [field]: list });
        }
    };

    const renderListInput = (label: string, field: ListField) => {
        const isLinked = field !== 'alsoKnownAs';
        const rawItems = metadata[field] || [];
        return (
            <div className="col-span-1 md:col-span-2 bg-slate-950/50 p-3 rounded border border-slate-700">
                <label className="text-xs text-slate-400 uppercase font-bold flex justify-between items-center mb-2">
                    {label}
                    <button type="button" onClick={() => addListItem(field)}
                        className="text-emerald-400 hover:text-emerald-300 text-xs px-2 py-1 bg-emerald-900/30 rounded">
                        {t('editor.add')}
                    </button>
                </label>
                <div className="space-y-2">
                    {(rawItems as any[]).map((item, index) => {
                        const nameVal = isLinked ? (item as LinkedItem).name : (item as string);
                        const slugVal = isLinked ? (item as LinkedItem).slug : undefined;
                        return (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    className="flex-1 bg-slate-900 p-2 rounded border border-slate-600 text-sm focus:border-emerald-500 outline-none"
                                    value={nameVal} placeholder={`${label} #${index + 1}`}
                                    onChange={(e) => handleListChange(field, index, e.target.value)}
                                />
                                {isLinked && (
                                    <button type="button" title="Link to article"
                                        onClick={() => { setLinkingField(field); setLinkingIndex(index); }}
                                        className={`px-2 py-1 rounded text-xs border transition ${slugVal ? 'bg-emerald-900/40 border-emerald-700 text-emerald-400' : 'border-slate-600 text-slate-500 hover:border-emerald-600 hover:text-emerald-400'}`}>
                                        {slugVal ? '🔗' : '⛓'}
                                    </button>
                                )}
                                <button type="button" onClick={() => removeListItem(field, index)}
                                    className="text-red-400 hover:text-red-300 px-2">✕</button>
                            </div>
                        );
                    })}
                    {rawItems.length === 0 && <span className="text-slate-600 text-xs italic">{t('editor.list_empty')}</span>}
                </div>
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append('Title', formData.title);
        data.append('Slug', formData.slug);
        data.append('Quote', formData.quote);
        data.append('Content', editor?.getHTML() || formData.content);
        data.append('Category', formData.category);
        if (formData.gameName)  data.append('GameName', formData.gameName);
        if (formData.alignment) data.append('Alignment', formData.alignment);
        data.append('LanguageCode', formData.languageCode);

        const cleanMetadata = { ...metadata };
        if (cleanMetadata.family)     cleanMetadata.family     = (cleanMetadata.family     as LinkedItem[]).filter(x => x.name.trim() !== '');
        if (cleanMetadata.allies)     cleanMetadata.allies     = (cleanMetadata.allies     as LinkedItem[]).filter(x => x.name.trim() !== '');
        if (cleanMetadata.enemies)    cleanMetadata.enemies    = (cleanMetadata.enemies    as LinkedItem[]).filter(x => x.name.trim() !== '');
        if (cleanMetadata.alsoKnownAs) cleanMetadata.alsoKnownAs = (cleanMetadata.alsoKnownAs as string[]).filter(x => x.trim() !== '');
        delete cleanMetadata.birthYear;

        data.append('Metadata', JSON.stringify(cleanMetadata));
        if (file) data.append('Image', file);

        const enContent = enEditor?.getHTML() || '';
        const hasEnContent = enData.title.trim() !== '' && enContent.replace(/<[^>]*>/g, '').trim() !== '';

        if (hasEnContent) {
            data.append('TitleEn', enData.title);
            data.append('ContentEn', enContent);
            if (enData.quote) data.append('QuoteEn', enData.quote);

            const enMetadata = { ...cleanMetadata };
            delete enMetadata.causeOfDeath;
            if (enData.voiceActor)   enMetadata.voiceActor   = enData.voiceActor;
            if (enData.birthPlace)   enMetadata.birthPlace   = enData.birthPlace;
            if (enData.birthDate)    enMetadata.birthDate    = enData.birthDate;
            if (enData.causeOfDeath) enMetadata.causeOfDeath = enData.causeOfDeath;
            if (enData.familyNames.length > 0) {
                const src = (cleanMetadata.family as LinkedItem[]) || [];
                enMetadata.family = enData.familyNames.map((name, i) => ({ name, slug: src[i]?.slug }));
            }
            if (enData.alliesNames.length > 0) {
                const src = (cleanMetadata.allies as LinkedItem[]) || [];
                enMetadata.allies = enData.alliesNames.map((name, i) => ({ name, slug: src[i]?.slug }));
            }
            if (enData.enemiesNames.length > 0) {
                const src = (cleanMetadata.enemies as LinkedItem[]) || [];
                enMetadata.enemies = enData.enemiesNames.map((name, i) => ({ name, slug: src[i]?.slug }));
            }
            if (enData.alsoKnownAs.length > 0) enMetadata.alsoKnownAs = enData.alsoKnownAs;

            data.append('MetadataEn', JSON.stringify(enMetadata));
        }

        try {
            if (isEdit) await api.put(`/Wiki/${id}`, data);
            else await api.post('/Wiki', data);
            navigate(`/wiki/${formData.slug}`);
        } catch (error: unknown) {
            console.error(error);
            alert(`${t('editor.save_error')}: ${extractApiError(error)}`);
        }
    };

    const renderMetadataInputs = () => {
        switch (formData.category) {
            case 'Character':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800 p-4 rounded border border-slate-700 animate-in fade-in">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.status')}</label>
                            <select className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.status || 'Alive'} onChange={e => setMetadata({...metadata, status: e.target.value})}>
                                <option value="Alive">{t('meta_values.Alive')}</option>
                                <option value="Deceased">{t('meta_values.Deceased')}</option>
                                <option value="Unknown">{t('meta_values.Unknown')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.gender')}</label>
                            <select className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.gender || 'Unknown'} onChange={e => setMetadata({...metadata, gender: e.target.value})}>
                                <option value="Male">{t('meta_values.Male')}</option>
                                <option value="Female">{t('meta_values.Female')}</option>
                                <option value="Unknown">{t('meta_values.Unknown')}</option>
                            </select>
                        </div>
                        {metadata.status === 'Deceased' && (
                            <div className="col-span-1 md:col-span-2 animate-in slide-in-from-top-2">
                                <label className="text-xs text-red-400 uppercase font-bold">☠️ {t('article.cause_of_death')}</label>
                                <input placeholder={t('editor.cause_placeholder')}
                                    className="w-full bg-slate-950 p-2 rounded border border-red-900/50 mt-1 outline-none focus:border-red-500"
                                    value={metadata.causeOfDeath || ''} onChange={e => setMetadata({...metadata, causeOfDeath: e.target.value})} />
                            </div>
                        )}
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-xs text-slate-400 uppercase font-bold">🎙️ {t('editor.voice_actor_label')}</label>
                            <input placeholder={t('editor.voice_actor_placeholder')}
                                className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.voiceActor || ''} onChange={e => setMetadata({...metadata, voiceActor: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.birth_date')}</label>
                            <input placeholder={t('editor.birth_date_placeholder')}
                                className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.birthDate || ''} onChange={e => setMetadata({...metadata, birthDate: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.age')}</label>
                            <input type="number" placeholder="e.g. 35"
                                className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.age || ''} onChange={e => setMetadata({...metadata, age: e.target.value})} />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.birth_place')}</label>
                            <input placeholder={t('article.birth_place')}
                                className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.birthPlace || ''} onChange={e => setMetadata({...metadata, birthPlace: e.target.value})} />
                        </div>
                        {renderListInput(t('article.family'),        'family')}
                        {renderListInput(t('article.allies'),        'allies')}
                        {renderListInput(t('article.enemies'),       'enemies')}
                        {renderListInput(t('article.also_known_as'), 'alsoKnownAs')}
                    </div>
                );
            case 'Weapon':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-slate-800 p-4 rounded border border-slate-700 animate-in fade-in">
                        <div><label className="text-xs text-slate-400 uppercase font-bold">{t('article.damage')}</label>
                            <input placeholder="0" type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.damage || ''} onChange={e => setMetadata({...metadata, damage: e.target.value})} /></div>
                        <div><label className="text-xs text-slate-400 uppercase font-bold">{t('article.year')}</label>
                            <input placeholder={t('article.year')} type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.year || ''} onChange={e => setMetadata({...metadata, year: e.target.value})} /></div>
                        <div><label className="text-xs text-slate-400 uppercase font-bold">{t('article.ammo')}</label>
                            <input placeholder={t('article.ammo')} type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.ammo || ''} onChange={e => setMetadata({...metadata, ammo: e.target.value})} /></div>
                        <div><label className="text-xs text-slate-400 uppercase font-bold">{t('article.fire_rate')}</label>
                            <input placeholder={t('editor.rate_of_fire')} type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.fireRate || ''} onChange={e => setMetadata({...metadata, fireRate: e.target.value})} /></div>
                    </div>
                );
            case 'Location':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-slate-800 p-4 rounded border border-slate-700 animate-in fade-in">
                        <div><label className="text-xs text-slate-400 uppercase font-bold">{t('article.region')}</label>
                            <input placeholder={t('editor.region_placeholder')} className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.region || ''} onChange={e => setMetadata({...metadata, region: e.target.value})} /></div>
                        <div><label className="text-xs text-slate-400 uppercase font-bold">{t('article.population')}</label>
                            <input placeholder="0" type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.population || ''} onChange={e => setMetadata({...metadata, population: e.target.value})} /></div>
                        <div><label className="text-xs text-slate-400 uppercase font-bold">{t('article.founded')}</label>
                            <input placeholder={t('article.year')} type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.founded || ''} onChange={e => setMetadata({...metadata, founded: e.target.value})} /></div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 mt-4 pb-20">
            <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-500">
                {isEdit ? t('article.edit') : t('editor.create_article')}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ── Primary language section ── */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg space-y-6">
                    <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                        📕 {t('editor.info_section')} ({formData.languageCode.toUpperCase()})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('editor.label_title')}</label>
                            <input required className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white font-bold text-lg"
                                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('editor.label_slug')}</label>
                            <input required className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-emerald-400 font-mono text-sm"
                                value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('editor.label_quote')}</label>
                        <textarea rows={2} placeholder={t('editor.quote_placeholder')}
                            className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-emerald-200 italic focus:border-emerald-500 outline-none resize-none"
                            value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('article.category')}</label>
                            <select className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white"
                                value={formData.category} onChange={handleCategoryChange}>
                                <option value="Character">{t('categories.Character')}</option>
                                <option value="Weapon">{t('categories.Weapon')}</option>
                                <option value="Location">{t('categories.Location')}</option>
                                <option value="Event">{t('categories.Event')}</option>
                            </select>
                        </div>
                        {formData.category === 'Character' && (
                            <div className="animate-in fade-in slide-in-from-left-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('editor.label_alignment')}</label>
                                <select className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white focus:border-emerald-500"
                                    value={formData.alignment} onChange={e => setFormData({...formData, alignment: e.target.value})}>
                                    <option value="">{t('editor.alignment_none')}</option>
                                    <option value="Positive">😇 {t('editor.alignment_positive')}</option>
                                    <option value="Negative">😈 {t('editor.alignment_negative')}</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('article.game')}</label>
                        <input placeholder={t('article.game_placeholder')}
                            className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white focus:border-emerald-500 outline-none"
                            value={formData.gameName} onChange={e => setFormData({...formData, gameName: e.target.value})} />
                    </div>

                    {renderMetadataInputs()}
                </div>

                {/* ── Ukrainian content editor ── */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg">
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50 rounded-t-xl">
                        <label className="block text-xs font-bold text-slate-400 uppercase">{t('editor.label_content')}</label>
                    </div>
                    <EditorToolbar editor={editor} />
                    <EditorContent editor={editor} />
                </div>

                {/* ── English Translation Section ── */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg space-y-5">
                    {/* Sticky header with Auto-Translate button */}
                    <div className="sticky top-4 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-between py-2 -mx-1 px-1 rounded-lg">
                        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                            🌐 {t('editor.translation_en_section')}
                        </h2>
                        <button type="button" onClick={handleAutoTranslate}
                            disabled={isTranslating || !formData.title || !(editor?.getText() || formData.content)}
                            className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-lg font-semibold text-white text-sm transition shadow-md shadow-cyan-900/30">
                            {isTranslating ? (
                                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('editor.translating')}</>
                            ) : (
                                <>✨ {t('editor.auto_translate')}</>
                            )}
                        </button>
                    </div>

                    {translateError && (
                        <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 px-4 py-2 rounded">{translateError}</p>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('editor.label_title_en')}</label>
                        <input className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white font-bold text-lg focus:border-cyan-500 outline-none"
                            value={enData.title} placeholder="English title..."
                            onChange={e => setEnData(prev => ({ ...prev, title: e.target.value }))} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('editor.label_quote_en')}</label>
                        <textarea rows={2}
                            className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-cyan-200 italic focus:border-cyan-500 outline-none resize-none"
                            value={enData.quote} placeholder="English quote..."
                            onChange={e => setEnData(prev => ({ ...prev, quote: e.target.value }))} />
                    </div>

                    {/* Character metadata for English */}
                    {formData.category === 'Character' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded border border-slate-700">
                            <p className="col-span-full text-xs font-bold text-slate-400 uppercase">Character Fields (EN)</p>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold">🎙️ {t('editor.voice_actor_label')} (EN)</label>
                                <input className="w-full bg-slate-900 p-2 rounded border border-slate-600 mt-1 text-sm focus:border-cyan-500 outline-none"
                                    value={enData.voiceActor} placeholder="English voice actor..."
                                    onChange={e => setEnData(prev => ({ ...prev, voiceActor: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold">{t('article.birth_date')} (EN)</label>
                                <input className="w-full bg-slate-900 p-2 rounded border border-slate-600 mt-1 text-sm focus:border-cyan-500 outline-none"
                                    value={enData.birthDate} placeholder="e.g. June 25, 1885"
                                    onChange={e => setEnData(prev => ({ ...prev, birthDate: e.target.value }))} />
                            </div>
                            <div className="col-span-full">
                                <label className="text-xs text-slate-400 uppercase font-bold">{t('article.birth_place')} (EN)</label>
                                <input className="w-full bg-slate-900 p-2 rounded border border-slate-600 mt-1 text-sm focus:border-cyan-500 outline-none"
                                    value={enData.birthPlace} placeholder="English birth place..."
                                    onChange={e => setEnData(prev => ({ ...prev, birthPlace: e.target.value }))} />
                            </div>
                            {metadata.status === 'Deceased' && (
                                <div className="col-span-full">
                                    <label className="text-xs text-red-400 uppercase font-bold">☠️ {t('article.cause_of_death')} (EN)</label>
                                    <input className="w-full bg-slate-900 p-2 rounded border border-slate-600 mt-1 text-sm focus:border-cyan-500 outline-none"
                                        value={enData.causeOfDeath} placeholder="English cause of death..."
                                        onChange={e => setEnData(prev => ({ ...prev, causeOfDeath: e.target.value }))} />
                                </div>
                            )}
                            {enData.familyNames.length > 0 && (
                                <div className="col-span-full">
                                    <label className="text-xs text-slate-400 uppercase font-bold">{t('article.family')} (EN)</label>
                                    <div className="space-y-1 mt-1">
                                        {enData.familyNames.map((name, i) => (
                                            <input key={i} className="w-full bg-slate-900 p-2 rounded border border-slate-600 text-sm focus:border-cyan-500 outline-none"
                                                value={name} onChange={e => { const u = [...enData.familyNames]; u[i] = e.target.value; setEnData(prev => ({ ...prev, familyNames: u })); }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {enData.alliesNames.length > 0 && (
                                <div className="col-span-full">
                                    <label className="text-xs text-slate-400 uppercase font-bold">{t('article.allies')} (EN)</label>
                                    <div className="space-y-1 mt-1">
                                        {enData.alliesNames.map((name, i) => (
                                            <input key={i} className="w-full bg-slate-900 p-2 rounded border border-slate-600 text-sm focus:border-cyan-500 outline-none"
                                                value={name} onChange={e => { const u = [...enData.alliesNames]; u[i] = e.target.value; setEnData(prev => ({ ...prev, alliesNames: u })); }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {enData.enemiesNames.length > 0 && (
                                <div className="col-span-full">
                                    <label className="text-xs text-slate-400 uppercase font-bold">{t('article.enemies')} (EN)</label>
                                    <div className="space-y-1 mt-1">
                                        {enData.enemiesNames.map((name, i) => (
                                            <input key={i} className="w-full bg-slate-900 p-2 rounded border border-slate-600 text-sm focus:border-cyan-500 outline-none"
                                                value={name} onChange={e => { const u = [...enData.enemiesNames]; u[i] = e.target.value; setEnData(prev => ({ ...prev, enemiesNames: u })); }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {enData.alsoKnownAs.length > 0 && (
                                <div className="col-span-full">
                                    <label className="text-xs text-slate-400 uppercase font-bold">{t('article.also_known_as')} (EN)</label>
                                    <div className="space-y-1 mt-1">
                                        {enData.alsoKnownAs.map((name, i) => (
                                            <input key={i} className="w-full bg-slate-900 p-2 rounded border border-slate-600 text-sm focus:border-cyan-500 outline-none"
                                                value={name} onChange={e => { const u = [...enData.alsoKnownAs]; u[i] = e.target.value; setEnData(prev => ({ ...prev, alsoKnownAs: u })); }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── English WYSIWYG content editor ── */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('editor.label_content_en')}</label>
                        <div className="bg-slate-900 rounded-xl border border-cyan-900/50 shadow-lg overflow-hidden">
                            <EditorToolbar
                                editor={enEditor}
                                className="border-b border-slate-700 p-2 flex flex-wrap gap-1 bg-slate-950/80 items-center"
                            />
                            <EditorContent editor={enEditor} />
                        </div>
                    </div>
                </div>

                {/* ── Image ── */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">🖼️ {t('editor.label_image')}</h2>
                    <div className="border-2 border-slate-700 border-dashed p-8 rounded-lg text-center hover:bg-slate-800/50 transition cursor-pointer relative">
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={e => setFile(e.target.files?.[0] || null)} />
                        <p className="text-lg font-medium text-slate-300">{t('editor.click_to_upload')}</p>
                    </div>
                    {(file || existingImage) && (
                        <div className="mt-6 p-4 bg-slate-950 rounded-lg border border-slate-800 flex gap-4 items-center animate-in fade-in">
                            {file ? (
                                <div className="w-20 h-20 bg-slate-800 rounded flex items-center justify-center text-slate-500 text-xs">{t('editor.new_file')}</div>
                            ) : existingImage && (
                                <img src={existingImage} alt="Current" className="w-20 h-20 rounded object-cover border border-slate-700"/>
                            )}
                            <div>
                                <p className="font-bold text-slate-200">{t('editor.selected')}</p>
                                <p className="text-sm text-emerald-400 break-all">{file ? file.name : existingImage}</p>
                            </div>
                        </div>
                    )}
                </div>
            </form>

            {/* ── Sticky save bar ── */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-4">
                <div className="max-w-5xl mx-auto flex justify-end">
                    <button onClick={handleSubmit as any}
                        className="bg-emerald-600 hover:bg-emerald-500 px-10 py-3 rounded-xl font-bold text-white transition shadow-lg shadow-emerald-900/30">
                        {t('editor.save')} ({formData.languageCode.toUpperCase()})
                    </button>
                </div>
            </div>

            {linkingField && linkingIndex !== null && (
                <ArticleLinkModal
                    onSelect={(slug, title) => {
                        handleListChange(linkingField, linkingIndex, title, slug);
                        setLinkingField(null);
                        setLinkingIndex(null);
                    }}
                    onClose={() => { setLinkingField(null); setLinkingIndex(null); }}
                />
            )}
        </div>
    );
};
