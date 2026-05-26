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
        languageCode: i18n.language
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

    const [enData, setEnData] = useState({ title: '', content: '', quote: '' });
    const [isTranslating, setIsTranslating] = useState(false);
    const [translateError, setTranslateError] = useState<string | null>(null);

    const [existingImage, setExistingImage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            FontSize,
            CustomImage,
            TextAlign.configure({
                types: ['heading', 'paragraph', 'image'],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-emerald-400 underline hover:text-emerald-300 cursor-pointer',
                },
            }),
        ],
        content: formData.content,
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4 text-slate-300 leading-relaxed [&>img]:rounded-xl [&>img]:border [&>img]:border-slate-700 [&>img]:inline-block [&_figure]:my-4 [&_figure]:mx-auto [&_figure_img]:rounded-xl [&_figure_img]:border [&_figure_img]:border-slate-700 [&_figcaption]:text-sm [&_figcaption]:text-slate-400 [&_figcaption]:text-center [&_figcaption]:mt-2 [&_figcaption]:italic',
            },
        },
        onUpdate: ({ editor }) => {
            setFormData(prev => ({ ...prev, content: editor.getHTML() }));
        },
    });

    useEffect(() => {
        if (isEdit && id) {
            api.get<Article>(`/Wiki/${id}?lang=${i18n.language}`).then(res => {
                const data = res.data;
                setFormData({
                    title: data.title,
                    slug: data.slug,
                    quote: data.quote || '',
                    content: data.content,
                    category: data.category,
                    alignment: data.alignment || '',
                    gameName: data.gameName || '',
                    languageCode: i18n.language
                });
                setExistingImage(data.imageUrl || null);

                if (data.metadata) {
                    try {
                        const parsed = JSON.parse(data.metadata);
                        // Normalize family/allies/enemies to LinkedItem[]
                        const normalizeLinked = (arr: any[]): LinkedItem[] =>
                            (arr || []).map((x: any) =>
                                typeof x === 'string' ? { name: x } : x
                            );
                        setMetadata({
                            ...parsed,
                            family: normalizeLinked(parsed.family),
                            allies: normalizeLinked(parsed.allies),
                            enemies: normalizeLinked(parsed.enemies),
                            alsoKnownAs: parsed.alsoKnownAs || []
                        });
                    } catch { setMetadata({}); }
                }
                editor?.commands.setContent(data.content);
            });

            // Pre-load the English translation if one already exists
            api.get<Article>(`/Wiki/${id}?lang=en`).then(res => {
                if (res.data.languageCode === 'en') {
                    setEnData({
                        title: res.data.title,
                        content: res.data.content,
                        quote: res.data.quote || ''
                    });
                }
            }).catch(() => { /* no English translation yet */ });
        }
    }, [id, isEdit, editor, i18n.language]);

    const stripHtml = (html: string): string => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    const handleAutoTranslate = async () => {
        setTranslateError(null);
        setIsTranslating(true);
        try {
            const uaContent = stripHtml(editor?.getHTML() || formData.content);
            const res = await api.post<{ title: string; quote: string; content: string }>('/Translate/batch', {
                title: formData.title,
                quote: formData.quote,
                content: uaContent,
                sourceLang: 'UK',
                targetLang: 'EN'
            });
            setEnData({
                title: res.data.title,
                content: res.data.content,
                quote: res.data.quote
            });
        } catch (err) {
            console.error(err);
            alert('Translation failed');
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
            defaults = {
                status: 'Alive',
                gender: 'Unknown',
                family: [],
                allies: [],
                enemies: [],
                alsoKnownAs: []
            };
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
            const list = [...((metadata.alsoKnownAs as string[]) || [])];
            list.push('');
            setMetadata({ ...metadata, alsoKnownAs: list });
        } else {
            const list = [...((metadata[field] as LinkedItem[]) || [])];
            list.push({ name: '' });
            setMetadata({ ...metadata, [field]: list });
        }
    };

    const removeListItem = (field: ListField, index: number) => {
        if (field === 'alsoKnownAs') {
            const list = [...((metadata.alsoKnownAs as string[]) || [])];
            list.splice(index, 1);
            setMetadata({ ...metadata, alsoKnownAs: list });
        } else {
            const list = [...((metadata[field] as LinkedItem[]) || [])];
            list.splice(index, 1);
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
                    <button
                        type="button"
                        onClick={() => addListItem(field)}
                        className="text-emerald-400 hover:text-emerald-300 text-xs px-2 py-1 bg-emerald-900/30 rounded"
                    >
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
                                    value={nameVal}
                                    placeholder={`${label} #${index + 1}`}
                                    onChange={(e) => handleListChange(field, index, e.target.value)}
                                />
                                {isLinked && (
                                    <button
                                        type="button"
                                        title="Link to article"
                                        onClick={() => { setLinkingField(field); setLinkingIndex(index); }}
                                        className={`px-2 py-1 rounded text-xs border transition ${slugVal ? 'bg-emerald-900/40 border-emerald-700 text-emerald-400' : 'border-slate-600 text-slate-500 hover:border-emerald-600 hover:text-emerald-400'}`}
                                    >
                                        {slugVal ? '🔗' : '⛓'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeListItem(field, index)}
                                    className="text-red-400 hover:text-red-300 px-2"
                                >
                                    ✕
                                </button>
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

        if (formData.gameName) {
            data.append('GameName', formData.gameName);
        }

        if (formData.alignment) {
            data.append('Alignment', formData.alignment);
        }

        data.append('LanguageCode', formData.languageCode);

        const cleanMetadata = { ...metadata };
        if (cleanMetadata.family) cleanMetadata.family = (cleanMetadata.family as LinkedItem[]).filter(x => x.name.trim() !== '');
        if (cleanMetadata.allies) cleanMetadata.allies = (cleanMetadata.allies as LinkedItem[]).filter(x => x.name.trim() !== '');
        if (cleanMetadata.enemies) cleanMetadata.enemies = (cleanMetadata.enemies as LinkedItem[]).filter(x => x.name.trim() !== '');
        if (cleanMetadata.alsoKnownAs) cleanMetadata.alsoKnownAs = (cleanMetadata.alsoKnownAs as string[]).filter(x => x.trim() !== '');

        data.append('Metadata', JSON.stringify(cleanMetadata));
        if (file) data.append('Image', file);

        if (enData.title && enData.content && !formData.languageCode.startsWith('en')) {
            data.append('TitleEn', enData.title);
            data.append('ContentEn', enData.content);
            if (enData.quote) data.append('QuoteEn', enData.quote);
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
                            <select
                                className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.status || 'Alive'}
                                onChange={e => setMetadata({...metadata, status: e.target.value})}
                            >
                                <option value="Alive">{t('meta_values.Alive')}</option>
                                <option value="Deceased">{t('meta_values.Deceased')}</option>
                                <option value="Unknown">{t('meta_values.Unknown')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.gender')}</label>
                            <select
                                className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.gender || 'Unknown'}
                                onChange={e => setMetadata({...metadata, gender: e.target.value})}
                            >
                                <option value="Male">{t('meta_values.Male')}</option>
                                <option value="Female">{t('meta_values.Female')}</option>
                                <option value="Unknown">{t('meta_values.Unknown')}</option>
                            </select>
                        </div>

                        {metadata.status === 'Deceased' && (
                            <div className="col-span-1 md:col-span-2 animate-in slide-in-from-top-2">
                                <label className="text-xs text-red-400 uppercase font-bold">☠️ {t('article.cause_of_death')}</label>
                                <input
                                    placeholder={t('editor.cause_placeholder')}
                                    className="w-full bg-slate-950 p-2 rounded border border-red-900/50 mt-1 outline-none focus:border-red-500"
                                    value={metadata.causeOfDeath || ''}
                                    onChange={e => setMetadata({...metadata, causeOfDeath: e.target.value})}
                                />
                            </div>
                        )}

                        <div className="col-span-1 md:col-span-2">
                            <label className="text-xs text-slate-400 uppercase font-bold">🎙️ {t('editor.voice_actor_label')}</label>
                            <input
                                placeholder={t('editor.voice_actor_placeholder')}
                                className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.voiceActor || ''}
                                onChange={e => setMetadata({...metadata, voiceActor: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.birth_year')}</label>
                            <input type="number" placeholder="e.g. 1985"
                                className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.birthYear || ''} onChange={e => setMetadata({...metadata, birthYear: e.target.value})} />
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

                        {renderListInput(t('article.family'), 'family')}
                        {renderListInput(t('article.allies'), 'allies')}
                        {renderListInput(t('article.enemies'), 'enemies')}
                        {renderListInput(t('article.also_known_as'), 'alsoKnownAs')}
                    </div>
                );

            case 'Weapon':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-slate-800 p-4 rounded border border-slate-700 transition-all animate-in fade-in">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.damage')}</label>
                            <input placeholder="0" type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.damage || ''} onChange={e => setMetadata({...metadata, damage: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.year')}</label>
                            <input placeholder={t('article.year')} type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.year || ''} onChange={e => setMetadata({...metadata, year: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.ammo')}</label>
                            <input placeholder={t('article.ammo')} type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.ammo || ''} onChange={e => setMetadata({...metadata, ammo: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.fire_rate')}</label>
                            <input placeholder={t('editor.rate_of_fire')} type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.fireRate || ''} onChange={e => setMetadata({...metadata, fireRate: e.target.value})} />
                        </div>
                    </div>
                );
            case 'Location':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-slate-800 p-4 rounded border border-slate-700 transition-all animate-in fade-in">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.region')}</label>
                            <input placeholder={t('editor.region_placeholder')} className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.region || ''} onChange={e => setMetadata({...metadata, region: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.population')}</label>
                            <input placeholder="0" type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.population || ''} onChange={e => setMetadata({...metadata, population: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">{t('article.founded')}</label>
                            <input placeholder={t('article.year')} type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.founded || ''} onChange={e => setMetadata({...metadata, founded: e.target.value})} />
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 mt-4 pb-20">
            <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                {isEdit ? t('article.edit') : t('editor.create_article')}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg space-y-6">
                    <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">📕 {t('editor.info_section')} ({formData.languageCode.toUpperCase()})</h2>

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
                        <textarea
                            rows={2}
                            placeholder={t('editor.quote_placeholder')}
                            className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-emerald-200 italic focus:border-emerald-500 outline-none resize-none"
                            value={formData.quote}
                            onChange={e => setFormData({...formData, quote: e.target.value})}
                        />
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
                                <select
                                    className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white focus:border-emerald-500"
                                    value={formData.alignment}
                                    onChange={e => setFormData({...formData, alignment: e.target.value})}
                                >
                                    <option value="">{t('editor.alignment_none')}</option>
                                    <option value="Positive">😇 {t('editor.alignment_positive')}</option>
                                    <option value="Negative">😈 {t('editor.alignment_negative')}</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('article.game')}</label>
                        <input
                            placeholder={t('article.game_placeholder')}
                            className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white focus:border-emerald-500 outline-none"
                            value={formData.gameName}
                            onChange={e => setFormData({...formData, gameName: e.target.value})}
                        />
                    </div>

                    {renderMetadataInputs()}
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg">
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50 rounded-t-xl">
                        <label className="block text-xs font-bold text-slate-400 uppercase">{t('editor.label_content')}</label>
                    </div>
                    <EditorToolbar editor={editor} />
                    <EditorContent editor={editor} />
                </div>

                {/* ── English Translation Section ── */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                            🌐 {t('editor.translation_en_section')}
                        </h2>
                        <button
                            type="button"
                            onClick={handleAutoTranslate}
                            disabled={isTranslating || !formData.title || !(editor?.getText() || formData.content)}
                            className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-lg font-semibold text-white text-sm transition shadow-md shadow-cyan-900/30"
                        >
                            {isTranslating ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t('editor.translating')}
                                </>
                            ) : (
                                <>✨ {t('editor.auto_translate')}</>
                            )}
                        </button>
                    </div>

                    {translateError && (
                        <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 px-4 py-2 rounded">
                            {translateError}
                        </p>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                            {t('editor.label_title_en')}
                        </label>
                        <input
                            className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white font-bold text-lg focus:border-cyan-500 outline-none"
                            value={enData.title}
                            placeholder="English title..."
                            onChange={e => setEnData(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                            {t('editor.label_quote_en')}
                        </label>
                        <textarea
                            rows={2}
                            className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-cyan-200 italic focus:border-cyan-500 outline-none resize-none"
                            value={enData.quote}
                            placeholder="English quote..."
                            onChange={e => setEnData(prev => ({ ...prev, quote: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                            {t('editor.label_content_en')}
                        </label>
                        <textarea
                            rows={12}
                            className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-slate-300 leading-relaxed focus:border-cyan-500 outline-none resize-y font-mono text-sm"
                            value={enData.content}
                            placeholder="English content..."
                            onChange={e => setEnData(prev => ({ ...prev, content: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">🖼️ {t('editor.label_image')}</h2>
                    <div className="border-2 border-slate-700 border-dashed p-8 rounded-lg text-center hover:bg-slate-800/50 transition group cursor-pointer relative">
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-slate-300">{t('editor.click_to_upload')}</p>
                        </div>
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

            <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-4">
                <div className="max-w-5xl mx-auto flex justify-end">
                    <button
                        onClick={handleSubmit as any}
                        className="bg-emerald-600 hover:bg-emerald-500 px-10 py-3 rounded-xl font-bold text-white transition shadow-lg shadow-emerald-900/30"
                    >
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
