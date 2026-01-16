import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                <Link to="/" className="flex items-center gap-3 group">
                    <div className="bg-linear-to-tr from-emerald-500 to-cyan-500 p-2 rounded-lg group-hover:scale-110 transition duration-300 shadow-lg shadow-emerald-500/20">
                        <span className="font-black text-slate-900 text-xl tracking-tighter">FW</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-100 tracking-tight group-hover:text-white transition">
                        FanWiki
                    </span>
                </Link>

                <div className="flex items-center gap-6">

                    <LanguageSwitcher />

                    {user ? (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            {user.role === 'Admin' && (
                                <Link
                                    to="/admin"
                                    className="hidden md:block px-3 py-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-600 hover:text-white text-xs font-bold uppercase tracking-wider transition"
                                >
                                    {t('nav.admin')}
                                </Link>
                            )}

                            <div className="text-right hidden sm:block">
                                <span className="block text-xs text-slate-400 font-medium">{t('nav.hello')},</span>
                                <span className="block text-sm font-bold text-emerald-400">{user.nickname}</span>
                            </div>

                            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-500 font-bold overflow-hidden shadow-inner">
                                {user.nickname[0].toUpperCase()}
                            </div>

                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-slate-400 hover:text-red-400 transition ml-2"
                            >
                                {t('nav.logout')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
                                {t('nav.login')}
                            </Link>
                            <Link to="/register" className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/20 transition transform hover:-translate-y-0.5">
                                {t('nav.register')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};