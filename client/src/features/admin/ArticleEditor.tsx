import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { api } from '../../api/axios';
import type { Article } from '../../types/article';

type ApiErrorBody = {
    message?: string;
    title?: string;
};

export const ArticleEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id; // Якщо є ID, значить ми редагуємо

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        category: 'Character',
        languageCode: 'uk',
    });

    const [existingImage, setExistingImage] = useState<string | null>(null); // Для показу старого фото
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            api
                .get<Article>(`/Wiki/${id}`)
                .then((res) => {
                    const data = res.data;
                    setFormData({
                        title: data.title,
                        slug: data.slug,
                        content: data.content,
                        category: data.category,
                        languageCode: data.languageCode,
                    });
                    setExistingImage(data.imageUrl || null);
                })
                .catch((err) => {
                    console.error(err);
                    alert('Не вдалося завантажити статтю. Перевірте консоль.');
                });
        }
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append('Title', formData.title);
        data.append('Slug', formData.slug);
        data.append('Content', formData.content);
        data.append('Category', formData.category);
        data.append('LanguageCode', formData.languageCode);

        if (file) data.append('Image', file);

        try {
            if (isEdit) {
                await api.put(`/Wiki/${id}`, data);
                alert('Статтю оновлено успішно!');
            } else {
                await api.post('/Wiki', data);
                alert('Статтю створено успішно!');
            }
            navigate('/admin');
        } catch (error: unknown) {
            console.error('Помилка збереження:', error);

            let message = 'Невідома помилка';

            if (error instanceof AxiosError) {
                const body = error.response?.data as ApiErrorBody | undefined;
                message = body?.message || body?.title || error.message || message;
            }

            alert(`Не вдалося зберегти: ${message}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 mt-10">
            <h1 className="text-3xl font-bold mb-8 text-slate-100">
                {isEdit ? 'Редагувати Статтю' : 'Створити Статтю'}
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl"
            >
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Назва</label>
                        <input
                            required
                            className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white focus:border-emerald-500 outline-none"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Slug (URL)</label>
                        <input
                            required
                            className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-emerald-400 focus:border-emerald-500 outline-none"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Категорія</label>
                    <select
                        className="bg-slate-950 p-3 rounded border border-slate-700 w-full text-white"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="Character">Character</option>
                        <option value="Location">Location</option>
                        <option value="Weapon">Weapon</option>
                        <option value="Event">Event</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Вміст</label>
                    <textarea
                        required
                        className="bg-slate-950 p-4 rounded border border-slate-700 w-full h-64 font-mono text-sm text-slate-300 focus:border-emerald-500 outline-none leading-relaxed"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                </div>

                <div className="border-2 border-slate-800 border-dashed p-6 rounded-lg text-center hover:bg-slate-800/50 transition">
                    <label className="cursor-pointer block">
            <span className="text-emerald-400 font-bold hover:underline text-lg">
              {file ? 'Фото обрано' : 'Завантажити нове фото'}
            </span>
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </label>

                    {file ? (
                        <div className="text-sm text-slate-300 mt-2">Новий файл: {file.name}</div>
                    ) : (
                        existingImage && (
                            <div className="mt-4">
                                <p className="text-xs text-slate-500 mb-2">Поточне фото:</p>
                                <img
                                    src={`http://localhost:5122${existingImage}`}
                                    alt="Current"
                                    className="h-32 mx-auto rounded object-cover border border-slate-700"
                                />
                            </div>
                        )
                    )}
                </div>

                <button className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-4 rounded-lg font-bold text-white shadow-lg transition transform active:scale-[0.99]">
                    {isEdit ? 'Зберегти зміни' : 'Створити статтю'}
                </button>
            </form>
        </div>
    );
};
