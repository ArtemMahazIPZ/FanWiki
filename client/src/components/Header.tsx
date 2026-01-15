import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-linear-to-tr from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-slate-900 group-hover:scale-110 transition duration-300">
                        FW
                    </div>
                    <span className="font-bold text-xl text-slate-100 tracking-tight group-hover:text-emerald-400 transition">
                        FanWiki
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            {user.role === 'Admin' && (
                                <Link
                                    to="/admin"
                                    className="hidden md:block px-3 py-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-600 hover:text-white text-xs font-bold uppercase tracking-wider transition"
                                >
                                    Admin Panel
                                </Link>
                            )}

                            <div className="text-right hidden sm:block">
                                <span className="block text-xs text-slate-400 font-medium">Привіт,</span>
                                <span className="block text-sm font-bold text-emerald-400">{user.nickname}</span>
                            </div>

                            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-500 font-bold overflow-hidden">
                                {user.nickname[0].toUpperCase()}
                            </div>

                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-slate-400 hover:text-red-400 transition ml-2"
                            >
                                Вийти
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">Вхід</Link>
                            <Link to="/register" className="px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-bold">Реєстрація</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};