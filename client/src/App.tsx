import { BrowserRouter, Routes, Route } from 'react-router-dom'; // 1. Прибрали Navigate
import { ArticlePage } from './features/wiki/ArticlePage';
import { HomePage } from './features/wiki/HomePage'; // 2. Додали імпорт HomePage

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
                <nav className="sticky top-0 z-50 p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                        <span className="font-bold text-xl text-emerald-500 tracking-tight">FanWiki</span>
                        <a href="/" className="text-sm font-medium text-slate-300 hover:text-white transition">Головна</a>
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/wiki/:slug" element={<ArticlePage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;