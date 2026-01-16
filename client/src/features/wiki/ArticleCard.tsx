import { Link } from 'react-router-dom';
import type {Article} from '../../types/article';

interface ArticleCardProps {
    article: Article;
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const formattedDate = new Date(article.createdAt).toLocaleDateString('uk-UA');

    return (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 transition group flex flex-col h-full shadow-lg">
            <div className="h-48 overflow-hidden relative bg-slate-950">
                {article.imageUrl ? (
                    <img
                        src={`http://localhost:5122${article.imageUrl}`}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <svg className="w-12 h-12 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/></svg>
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-emerald-900/80 backdrop-blur-sm text-emerald-400 text-xs font-bold px-2 py-1 rounded border border-emerald-500/30 uppercase tracking-wider">
                    {article.category}
                </div>
            </div>

            <div className="p-5 flex flex-col grow">
                <Link to={`/wiki/${article.slug}`} className="block">
                    <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-emerald-400 transition line-clamp-1">
                        {article.title}
                    </h3>
                </Link>

                <p className="text-slate-400 text-sm mb-4 line-clamp-3 grow leading-relaxed">
                    {stripHtml(article.content)}
                </p>

                <div className="pt-4 mt-auto border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>{formattedDate}</span>
                    <Link to={`/wiki/${article.slug}`} className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition">
                        READ MORE
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};