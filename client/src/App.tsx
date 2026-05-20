import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './features/wiki/HomePage';
import { ArticlePage } from './features/wiki/ArticlePage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ArticleEditor } from './features/admin/ArticleEditor';
import { UserProfilePage } from './features/auth/UserProfilePage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { ReportsPage } from './features/admin/ReportsPage';
import { AdminDashboard } from "./features/admin/AdminDashboard.tsx";
import { CommunityRulesPage } from './features/wiki/CommunityRulesPage';
import { ChatWindow } from './features/chat/ChatWindow';
import { useAuth } from './context/AuthContext';
import { useChat } from './context/ChatContext';
import { MessageCircle } from 'lucide-react';

function App() {
    const { user } = useAuth();
    const { unreadCount } = useChat();
    const [showChat, setShowChat] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
            <Header />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/wiki/:slug" element={<ArticlePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/rules" element={<CommunityRulesPage />} />

                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/create" element={<ArticleEditor />} />
                <Route path="/admin/edit/:id" element={<ArticleEditor />} />
                <Route path="/admin/reports" element={<ReportsPage />} />
            </Routes>

            {user && (
                <>
                    <button
                        onClick={() => setShowChat(o => !o)}
                        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 p-3.5 rounded-full shadow-lg shadow-emerald-900/40 text-white transition relative"
                        title="Messages"
                    >
                        <MessageCircle size={22} />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-900 animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    {showChat && <ChatWindow onClose={() => setShowChat(false)} />}
                </>
            )}
        </div>
    );
}

export default App;
