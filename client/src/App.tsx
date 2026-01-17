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

function App() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
            <Header />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/wiki/:slug" element={<ArticlePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<UserProfilePage />} />

                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route path="/admin" element={<ArticleEditor />} />
                <Route path="/admin/create" element={<ArticleEditor />} />
                <Route path="/admin/edit/:id" element={<ArticleEditor />} />
            </Routes>
        </div>
    );
}

export default App;