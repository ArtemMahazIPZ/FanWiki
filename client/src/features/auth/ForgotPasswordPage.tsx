import { useState } from 'react';
import { api } from '../../api/axios';
import { useNavigate } from 'react-router-dom';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/Auth/forgot-password', { email });
            setMessage('Код відновлення відправлено! Перевірте консоль сервера.');
            setTimeout(() => navigate(`/reset-password?email=${email}`), 2000);
        } catch (error) {
            setMessage('Сталася помилка.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-emerald-400 mb-4 text-center">Відновлення</h2>
                <p className="text-slate-400 text-sm mb-6 text-center">Введіть пошту, щоб отримати код.</p>

                {message && <div className="p-2 bg-emerald-900/30 text-emerald-200 text-sm mb-4 rounded">{message}</div>}

                <input
                    type="email"
                    required
                    placeholder="Email"
                    className="w-full bg-slate-950 p-3 rounded-lg text-white border border-slate-700 mb-4"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold text-white transition">
                    Надіслати код
                </button>
            </form>
        </div>
    );
};