import { useState } from 'react';
import { api } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/Auth/forgot-password', { email });
        } catch {
            // Network or server error — still redirect so the user can enter a
            // token if they received one via server logs / a working SMTP setup.
        } finally {
            setLoading(false);
        }
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-emerald-400 mb-4 text-center">{t('auth.recovery_title')}</h2>
                <p className="text-slate-400 text-sm mb-6 text-center">{t('auth.recovery_subtitle')}</p>

                <input
                    type="email"
                    required
                    placeholder={t('auth.email_placeholder')}
                    className="w-full bg-slate-950 p-3 rounded-lg text-white border border-slate-700 mb-4"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 py-3 rounded-lg font-bold text-white transition"
                >
                    {loading ? '...' : t('auth.send_code')}
                </button>
            </form>
        </div>
    );
};
