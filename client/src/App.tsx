import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ArticlePage } from './features/wiki/ArticlePage';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-950 text-slate-200">
                <nav className="p-4 border-b border-slate-800 bg-slate-900 flex gap-4">
                    <span className="font-bold text-emerald-500">FanWiki</span>
                </nav>

                <Routes>
                    <Route path="/" element={<Navigate to="/wiki/test" replace />} />
                    <Route path="/wiki/:slug" element={<ArticlePage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;