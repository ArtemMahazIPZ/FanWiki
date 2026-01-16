import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import ImageExtension from '@tiptap/extension-image';

import { api } from '../../api/axios';
import type { Article } from '../../types/article';
import { EditorToolbar } from './EditorToolbar';

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

export const ArticleEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        quote: '',
        content: '',
        category: 'Character',
        languageCode: 'uk'
    });

    const [metadata, setMetadata] = useState<ArticleMetadata>({
        status: 'Alive',
        gender: 'Unknown'
    });

    const [existingImage, setExistingImage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
            ImageExtension.configure({ inline: true }),
        ],
        content: formData.content,
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4 text-slate-300 leading-relaxed [&>img]:rounded-xl [&>img]:border [&>img]:border-slate-700',
            },
        },
        onUpdate: ({ editor }) => {
            setFormData(prev => ({ ...prev, content: editor.getHTML() }));
        },
    });

    useEffect(() => {
        if (isEdit && id) {
            api.get<Article>(`/Wiki/${id}`).then(res => {
                const data = res.data;
                setFormData({
                    title: data.title,
                    slug: data.slug,
                    quote: data.quote || '',
                    content: data.content,
                    category: data.category,
                    languageCode: data.languageCode
                });
                setExistingImage(data.imageUrl || null);
                if (data.metadata) {
                    try { setMetadata(JSON.parse(data.metadata)); } catch { setMetadata({}); }
                }
                editor?.commands.setContent(data.content);
            });
        }
    }, [id, isEdit, editor]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        setFormData({ ...formData, category: newCategory });

        let defaults: ArticleMetadata = {};
        if (newCategory === 'Character') {
            defaults = { status: 'Alive', gender: 'Unknown' };
        }
        setMetadata(defaults);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append('Title', formData.title);
        data.append('Slug', formData.slug);
        data.append('Quote', formData.quote);
        data.append('Content', editor?.getHTML() || formData.content);
        data.append('Category', formData.category);
        data.append('LanguageCode', formData.languageCode);
        data.append('Metadata', JSON.stringify(metadata));
        if (file) data.append('Image', file);

        try {
            if (isEdit) await api.put(`/Wiki/${id}`, data);
            else await api.post('/Wiki', data);
            navigate(`/wiki/${formData.slug}`);
        } catch (error: any) {
            const message = error.response?.data?.message || "Невідома помилка";
            alert(`Не вдалося зберегти: ${message}`);
        }
    };

    const renderMetadataInputs = () => {
        switch (formData.category) {
            case 'Character':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-slate-800 p-4 rounded border border-slate-700 animate-in fade-in">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Статус</label>
                            <select
                                className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.status || 'Alive'}
                                onChange={e => setMetadata({...metadata, status: e.target.value})}
                            >
                                <option value="Alive">Живий</option>
                                <option value="Deceased">Мертвий</option>
                                <option value="Unknown">Невідомо</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Стать</label>
                            <select
                                className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                value={metadata.gender || 'Unknown'}
                                onChange={e => setMetadata({...metadata, gender: e.target.value})}
                            >
                                <option value="Male">Чоловік</option>
                                <option value="Female">Жінка</option>
                                <option value="Unknown">Невідомо</option>
                            </select>
                        </div>
                    </div>
                );
            case 'Weapon':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-slate-800 p-4 rounded border border-slate-700 transition-all animate-in fade-in">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Урон</label>
                            <input placeholder="Damage" type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.damage || ''} onChange={e => setMetadata({...metadata, damage: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Рік</label>
                            <input placeholder="Year" type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.year || ''} onChange={e => setMetadata({...metadata, year: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Патрони</label>
                            <input placeholder="Ammo" type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.ammo || ''} onChange={e => setMetadata({...metadata, ammo: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">RPM</label>
                            <input placeholder="Fire Rate" type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.fireRate || ''} onChange={e => setMetadata({...metadata, fireRate: e.target.value})} />
                        </div>
                    </div>
                );
            case 'Location':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-slate-800 p-4 rounded border border-slate-700 transition-all animate-in fade-in">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Регіон</label>
                            <input placeholder="Region" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.region || ''} onChange={e => setMetadata({...metadata, region: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Населення</label>
                            <input placeholder="Population" type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.population || ''} onChange={e => setMetadata({...metadata, population: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Засновано</label>
                            <input placeholder="Founded Year" type="number" className="w-full bg-slate-950 p-2 rounded border border-slate-600 mt-1 outline-none focus:border-emerald-500"
                                   value={metadata.founded || ''} onChange={e => setMetadata({...metadata, founded: e.target.value})} />
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 mt-4 pb-20">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Блок Основне */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg space-y-6">
                    <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">📕 Основне</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Назва (Title)</label>
                            <input required className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white font-bold text-lg"
                                   value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Slug</label>
                            <input required className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-emerald-400 font-mono text-sm"
                                   value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Цитата / Короткий опис</label>
                        <textarea
                            rows={2}
                            placeholder="Введіть епічну цитату..."
                            className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-emerald-200 italic focus:border-emerald-500 outline-none resize-none"
                            value={formData.quote}
                            onChange={e => setFormData({...formData, quote: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Тип запису</label>
                        <select className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white mb-4"
                                value={formData.category} onChange={handleCategoryChange}>
                            <option value="Character">👤 Персонаж</option>
                            <option value="Weapon">⚔️ Зброя</option>
                            <option value="Location">🗺️ Локація</option>
                            <option value="Event">📜 Подія</option>
                        </select>
                        {renderMetadataInputs()}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                        <label className="block text-xs font-bold text-slate-400 uppercase">Вміст статті</label>
                    </div>
                    <EditorToolbar editor={editor} />
                    <EditorContent editor={editor} />
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">🖼️ Обкладинка</h2>
                    <div className="border-2 border-slate-700 border-dashed p-8 rounded-lg text-center hover:bg-slate-800/50 transition group cursor-pointer relative">
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-slate-300">Клікніть, щоб завантажити</p>
                        </div>
                    </div>

                    {(file || existingImage) && (
                        <div className="mt-6 p-4 bg-slate-950 rounded-lg border border-slate-800 flex gap-4 items-center animate-in fade-in">
                            {file ? (
                                <div className="w-20 h-20 bg-slate-800 rounded flex items-center justify-center text-slate-500 text-xs">New File</div>
                            ) : existingImage && (
                                <img src={`http://localhost:5122${existingImage}`} alt="Current" className="w-20 h-20 rounded object-cover border border-slate-700"/>
                            )}
                            <div>
                                <p className="font-bold text-slate-200">Обраний файл:</p>
                                <p className="text-sm text-emerald-400 break-all">{file ? file.name : existingImage}</p>
                            </div>
                        </div>
                    )}
                </div>

                <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-bold text-white transition">Зберегти</button>
            </form>
        </div>
    );
};