import { useState } from 'react';
import { api } from '../../api/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generatePassword } from '../../utils/passwordGenerator';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: searchParams.get('email') || '',
        token: '',
        newPassword: ''
    });

    const handleGenerate = () => {
        setFormData({ ...formData, newPassword: generatePassword() });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/Auth/reset-password', formData);
            alert("Пароль змінено! Увійдіть з новим паролем.");
            navigate('/login');
        } catch (error) {
            alert("Помилка! Перевірте код.");
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-emerald-400 mb-6 text-center">Новий пароль</h2>

                <input
                    type="email" placeholder="Email" required
                    className="w-full bg-slate-950 p-3 rounded-lg text-white border border-slate-700 mb-4"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />

                <textarea
                    placeholder="Вставте довгий код з консолі сюди" required
                    className="w-full bg-slate-950 p-3 rounded-lg text-white border border-slate-700 mb-4 text-xs h-24"
                    value={formData.token}
                    onChange={e => setFormData({...formData, token: e.target.value})}
                />

                <div className="flex gap-2 mb-6">
                    <input
                        type="text" placeholder="Новий пароль" required
                        className="w-full bg-slate-950 p-3 rounded-lg text-white border border-slate-700"
                        value={formData.newPassword}
                        onChange={e => setFormData({...formData, newPassword: e.target.value})}
                    />
                    <button type="button" onClick={handleGenerate} className="bg-slate-700 px-3 rounded text-emerald-300">🎲</button>
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold text-white transition">
                    Змінити пароль
                </button>
            </form>
        </div>
    );
};