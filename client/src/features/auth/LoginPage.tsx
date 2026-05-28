import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { extractApiError } from '../../utils/apiError';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/Auth/login', {
                usernameOrEmail: formData.usernameOrEmail.trim(),
                password: formData.password,
            });
            login(response.data.token);
            navigate('/');
        } catch (err) {
            console.error("Login failed:", err);
            setError(extractApiError(err));
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-sm shadow-2xl"
            >
                <h2 className="text-2xl font-bold text-emerald-400 mb-6 text-center">
                    {t('auth.login_title')}
                </h2>

                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm mb-4 text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase">
                            {t('auth.username_or_email_label')}
                        </label>
                        <input
                            className="w-full bg-slate-950 p-3 rounded-lg text-white border border-slate-700 focus:border-emerald-500 outline-none transition placeholder-slate-600"
                            placeholder={t('auth.username_or_email_placeholder')}
                            value={formData.usernameOrEmail}
                            onChange={e => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase">
                            {t('auth.password_label')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full bg-slate-950 p-3 rounded-lg text-white border border-slate-700 focus:border-emerald-500 outline-none transition placeholder-slate-600 pr-10"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3 rounded-lg font-bold text-white shadow-lg transition transform active:scale-95"
                >
                    {t('auth.login_button')}
                </button>

                <div className="mt-4 text-center text-xs text-slate-500">
                    {t('auth.no_account')} <span className="text-emerald-500 cursor-pointer hover:underline" onClick={() => navigate('/register')}>{t('auth.register_link')}</span>
                </div>
                <div className="text-right mb-6">
                <span
                     onClick={() => navigate('/forgot-password')}
                    className="text-xs text-slate-400 hover:text-emerald-400 cursor-pointer transition">
                    {t('auth.forgot_password')}
                </span>
            </div>
            </form>
        </div>
    );
};
