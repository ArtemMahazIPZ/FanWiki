import { useState } from 'react';
import { api } from '../../api/axios';
import { generatePassword } from '../../utils/passwordGenerator';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [step, setStep] = useState<1 | 2>(1);

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        nickname: '',
        password: '',
        avatarUrl: ''
    });

    const [verificationCode, setVerificationCode] = useState('');

    const handleGenerate = () => {
        const newPass = generatePassword();
        setFormData({ ...formData, password: newPass });
        setShowPassword(true);
    };

    const handleSubmitRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/Auth/register', formData);
            setStep(2);
        } catch (error: any) {
            const msg = error.response?.data?.description || t('auth.register_error');
            alert(msg);
        }
    };

    const handleSubmitVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/Auth/verify-email', {
                email: formData.email,
                code: verificationCode
            });
            alert(t('auth.email_verified'));
            navigate('/login');
        } catch (error) {
            alert(t('auth.verify_error'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-md space-y-4">
                <h2 className="text-2xl font-bold text-emerald-400 text-center">
                    {step === 1 ? t('auth.register_title') : t('auth.verify_title')}
                </h2>

                {step === 1 ? (
                    <form onSubmit={handleSubmitRegister} className="space-y-4">
                        <input
                            className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700 focus:border-emerald-500 outline-none"
                            placeholder={t('auth.username_placeholder_reg')}
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            required
                        />

                        <input
                            className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700"
                            placeholder={t('auth.email_placeholder')} type="email"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                        />

                        <input
                            className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700"
                            placeholder={t('auth.nickname_placeholder')}
                            value={formData.nickname}
                            onChange={e => setFormData({...formData, nickname: e.target.value})}
                        />

                        <div className="flex gap-2 relative">
                            <div className="relative w-full">
                                <input
                                    className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700 pr-10"
                                    placeholder={t('auth.password_placeholder')}
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
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

                            <button
                                type="button"
                                onClick={handleGenerate}
                                className="bg-slate-700 hover:bg-slate-600 px-3 rounded text-sm font-bold text-emerald-300"
                                title={t('editor.generate_password')}
                            >
                                🎲
                            </button>
                        </div>

                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded font-bold text-white transition">
                            {t('auth.create_account')}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmitVerify} className="space-y-4">
                        <p className="text-slate-300 text-center text-sm">
                            {t('auth.verify_sent')} <b>{formData.email}</b>.
                            <br/> {t('auth.verify_hint')}
                        </p>

                        <input
                            className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700 text-center text-xl tracking-widest"
                            placeholder="123456"
                            maxLength={6}
                            value={verificationCode}
                            onChange={e => setVerificationCode(e.target.value)}
                            required
                        />

                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded font-bold text-white transition">
                            {t('auth.verify_button')}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-slate-500 text-sm hover:text-slate-300"
                        >
                            {t('auth.back_to_register')}
                        </button>
                    </form>
                )}

                {step === 1 && (
                    <div className="text-center text-sm text-slate-500 mt-4">
                        {t('auth.forgot_password')} <span className="text-emerald-500 cursor-pointer" onClick={() => navigate('/forgot-password')}>{t('auth.restore')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
