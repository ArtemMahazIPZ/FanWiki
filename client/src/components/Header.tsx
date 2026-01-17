import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { api } from '../api/axios';

export const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [pendingReports, setPendingReports] = useState(0);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        if (user?.role === 'Admin') {
            const fetchReports = () => {
                api.get('/Reports/pending-count')
                    .then(res => setPendingReports(res.data))
                    .catch(console.error);
            };

            fetchReports();
            const interval = setInterval(fetchReports, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                <Link to="/" className="flex items-center gap-3 group">
                    <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2 rounded-lg group-hover:scale-110 transition duration-300 shadow-lg shadow-emerald-500/20">
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
                                <div className="flex items-center gap-2 mr-2 border-r border-slate-700 pr-4">

                                    <Link
                                        to="/admin/reports"
                                        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
                                        title="Центр скарг"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>

                                        {pendingReports > 0 && (
                                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-sm border border-slate-900">
                                                {pendingReports}
                                            </span>
                                        )}
                                    </Link>

                                    <Link to="/admin" className="hidden md:block px-3 py-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-600 hover:text-white text-xs font-bold uppercase tracking-wider transition">
                                        Admin Panel
                                    </Link>
                                </div>
                            )}

                            <div className="text-right hidden sm:block">
                                <span className="block text-xs text-slate-400 font-medium">{t('nav.hello')},</span>
                                <span className="block text-sm font-bold text-emerald-400">{user.nickname}</span>
                            </div>

                            <Link
                                to="/profile"
                                className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-500 font-bold overflow-hidden shadow-inner hover:ring-2 hover:ring-emerald-500 transition cursor-pointer"
                                title={t('nav.profile')}
                            >
                                {user.avatarUrl ? (
                                    <img src={`http://localhost:5122${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user.nickname[0].toUpperCase()}</span>
                                )}
                            </Link>

                            <button onClick={handleLogout} className="text-sm font-medium text-slate-400 hover:text-red-400 transition ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">{t('nav.login')}</Link>
                            <Link to="/register" className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg transition">{t('nav.register')}</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};