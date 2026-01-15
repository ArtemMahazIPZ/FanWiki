import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ArticlePage } from './features/wiki/ArticlePage';
import { HomePage } from './features/wiki/HomePage';
import { RegisterPage } from './features/auth/RegisterPage';
import { LoginPage } from './features/auth/LoginPage';
import { Header } from './components/Header';
import {ForgotPasswordPage} from "./features/auth/ForgotPasswordPage.tsx";
import {ResetPasswordPage} from "./features/auth/ResetPasswordPage.tsx";
import {AdminDashboard} from "./features/admin/AdminDashboard.tsx";
import {ArticleEditor} from "./features/admin/ArticleEditor.tsx";

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">

                <Header />

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/wiki/:slug" element={<ArticlePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/create" element={<ArticleEditor />} />
                    <Route path="/admin/edit/:id" element={<ArticleEditor />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;