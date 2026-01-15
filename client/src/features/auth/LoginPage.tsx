import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/Auth/login', formData);

            login(response.data.token);

            navigate('/');
        } catch (err) {
            console.error("Login failed:", err);
            setError('Невірний логін або пароль');
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-sm shadow-2xl"
            >
                <h2 className="text-2xl font-bold text-emerald-400 mb-6 text-center">
                    Вхід в систему
                </h2>

                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm mb-4 text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase">
                            Логін
                        </label>
                        <input
                            className="w-full bg-slate-950 p-3 rounded-lg text-white border border-slate-700 focus:border-emerald-500 outline-none transition placeholder-slate-600"
                            placeholder="Ваш username"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase">
                            Пароль
                        </label>
                        <input
                            type="password"
                            className="w-full bg-slate-950 p-3 rounded-lg text-white border border-slate-700 focus:border-emerald-500 outline-none transition placeholder-slate-600"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3 rounded-lg font-bold text-white shadow-lg transition transform active:scale-95"
                >
                    Увійти
                </button>

                <div className="mt-4 text-center text-xs text-slate-500">
                    Немає акаунту? <span className="text-emerald-500 cursor-pointer hover:underline" onClick={() => navigate('/register')}>Зареєструватися</span>
                </div>
                <div className="text-right mb-6">
                <span
                     onClick={() => navigate('/forgot-password')}
                    className="text-xs text-slate-400 hover:text-emerald-400 cursor-pointer transition">
                    Забули пароль?
                </span>
            </div>
            </form>
        </div>
    );
};