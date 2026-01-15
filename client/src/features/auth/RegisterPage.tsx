import { useState } from 'react';
import { api } from '../../api/axios';
import { generatePassword } from '../../utils/passwordGenerator';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        nickname: '',
        password: '',
        avatarUrl: ''
    });

    const handleGenerate = () => {
        const newPass = generatePassword();
        setFormData({ ...formData, password: newPass });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/Auth/register', formData);
            alert("Успішно! Тепер увійдіть.");
            navigate('/login');
        } catch (error) {
            alert("Помилка реєстрації");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-md space-y-4">
                <h2 className="text-2xl font-bold text-emerald-400 text-center">Приєднатися до FanWiki</h2>

                <input
                    className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700 focus:border-emerald-500 outline-none"
                    placeholder="Логін (Username)"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                />

                <input
                    className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700"
                    placeholder="Email" type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />

                <input
                    className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700"
                    placeholder="Нікнейм (відображається всім)"
                    value={formData.nickname}
                    onChange={e => setFormData({...formData, nickname: e.target.value})}
                />

                {/* Блок з паролем і генератором */}
                <div className="flex gap-2">
                    <input
                        className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    <button
                        type="button"
                        onClick={handleGenerate}
                        className="bg-slate-700 hover:bg-slate-600 px-3 rounded text-sm font-bold text-emerald-300"
                        title="Згенерувати пароль"
                    >
                        🎲
                    </button>
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded font-bold text-white transition">
                    Створити акаунт
                </button>

                <div className="text-center text-sm text-slate-500 mt-4">
                    Забули пароль? <span className="text-emerald-500 cursor-pointer">Відновити</span>
                </div>
            </form>
        </div>
    );
};