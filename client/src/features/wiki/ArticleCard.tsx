import { Link } from 'react-router-dom';
import type {Article} from '../../types/article';

interface ArticleCardProps {
    article: Article;
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
    const imageUrl = article.imageUrl
        ? `http://localhost:5122${article.imageUrl}`
        : null;

    return (
        <Link to={`/wiki/${article.slug}`} className="group block h-full">
            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-emerald-500/50 hover:shadow-emerald-500/20 transition duration-300 h-full flex flex-col">

                <div className="h-48 bg-slate-900 relative overflow-hidden">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                            <span className="text-4xl">📷</span>
                        </div>
                    )}

                    <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-emerald-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider border border-slate-600">
                        {article.category}
                    </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-400 transition mb-2">
                        {article.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-1">
                        {article.content}
                    </p>
                    <div className="text-xs text-slate-500 border-t border-slate-700 pt-3 flex justify-between">
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                        <span className="uppercase text-emerald-600 font-semibold text-[10px]">Read More &rarr;</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};