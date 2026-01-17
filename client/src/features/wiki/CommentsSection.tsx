import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ThumbsUp, ThumbsDown, CornerDownRight, Trash2, Ban } from 'lucide-react';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    isDeleted: boolean;
    user: { id: string; nickname: string; avatarUrl?: string };
    likes: number;
    dislikes: number;
    replies: Comment[];
}

export const CommentsSection = ({ articleId }: { articleId: string }) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);

    const loadComments = () => {
        api.get(`/Comments/article/${articleId}`).then(res => setComments(res.data));
    };

    useEffect(() => { loadComments(); }, [articleId]);

    const handleSubmit = async (parentId?: string) => {
        if (!newComment.trim()) return;
        try {
            await api.post('/Comments', { articleId, content: newComment, parentId });
            setNewComment('');
            setReplyTo(null);
            loadComments();
        } catch (error: any) {
            if (error.response?.status === 403 && error.response?.data?.expiresAt) {
                const utcDate = error.response.data.expiresAt;
                const localDate = new Date(utcDate).toLocaleString();

                alert(`${t('comments.user_banned')}. Розбан: ${localDate}`);
            } else {
                const msg = error.response?.data?.message || error.response?.data || "Error posting comment";
                alert(msg);
            }
        }
    };

    const handleReact = async (id: string, isLike: boolean) => {
        if (!user) return alert(t('comments.login_to_react'));
        await api.post(`/Comments/${id}/react?isLike=${isLike}`);
        loadComments();
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('comments.delete_confirm'))) return;
        await api.delete(`/Comments/${id}`);
        loadComments();
    };

    const handleBan = async (userId: string) => {
        const min = prompt(t('comments.ban_prompt'), "60");
        if (!min) return;
        await api.post(`/Comments/ban/${userId}?minutes=${min}`);
        alert(t('comments.user_banned'));
    };

    const renderComment = (c: Comment, isReply = false) => (
        <div key={c.id} className={`flex gap-4 mb-6 ${isReply ? 'ml-12 border-l-2 border-slate-800 pl-4' : 'border-b border-slate-800/50 pb-6 last:border-0'}`}>
            <div className="flex-shrink-0">
                <img src={c.user.avatarUrl ? `http://localhost:5122${c.user.avatarUrl}` : "https://via.placeholder.com/40"}
                     className="w-10 h-10 rounded-full object-cover border-2 border-slate-800 shadow-sm"
                     alt={c.user.nickname}
                />
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`font-bold text-base ${c.isDeleted ? 'text-slate-500' : 'text-emerald-400'}`}>
                        {c.user.nickname}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                        {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <div className={`text-slate-300 text-sm leading-relaxed mb-3 ${c.isDeleted && 'italic opacity-60 py-2'}`}>
                    {c.isDeleted ? t('comments.deleted_message') : c.content}
                </div>

                {!c.isDeleted && (
                    <div className="flex items-center gap-5 text-xs font-medium text-slate-400 transition-colors">
                        <button onClick={() => handleReact(c.id, true)} className="flex items-center gap-1.5 hover:text-emerald-400 transition group">
                            <ThumbsUp size={14} className="group-hover:scale-110 transition-transform" /> {c.likes}
                        </button>
                        <button onClick={() => handleReact(c.id, false)} className="flex items-center gap-1.5 hover:text-red-400 transition group">
                            <ThumbsDown size={14} className="group-hover:scale-110 transition-transform" /> {c.dislikes}
                        </button>

                        {user && (
                            <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className={`flex items-center gap-1.5 transition hover:text-white ${replyTo === c.id ? 'text-emerald-400' : ''}`}>
                                <CornerDownRight size={14} /> {t('comments.reply')}
                            </button>
                        )}

                        {(user?.role === 'Admin' || user?.id === c.user.id) && (
                            <button onClick={() => handleDelete(c.id)} className="text-slate-500 hover:text-red-500 transition ml-auto">
                                <Trash2 size={14} />
                            </button>
                        )}

                        {user?.role === 'Admin' && (
                            <button onClick={() => handleBan(c.user.id)} className="text-slate-500 hover:text-orange-500 transition flex items-center gap-1">
                                <Ban size={14} />
                            </button>
                        )}
                    </div>
                )}

                {replyTo === c.id && (
                    <div className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <textarea
                            autoFocus
                            rows={2}
                            className="flex-1 bg-slate-950/50 border border-slate-700/50 rounded-lg p-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition resize-none shadow-inner"
                            placeholder={t('comments.placeholder')}
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(c.id); } }}
                        />
                        <button onClick={() => handleSubmit(c.id)} className="self-end bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-white text-xs font-bold transition shadow-lg shadow-emerald-900/20 h-10">
                            {t('comments.send')}
                        </button>
                    </div>
                )}

                <div className="mt-4 space-y-4">
                    {c.replies?.map(r => renderComment(r, true))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="mt-16 pt-10 border-t border-slate-800/50">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                {t('comments.title')}
                <span className="text-lg text-slate-500 font-medium bg-slate-900 px-3 py-0.5 rounded-full">
                    {comments.length}
                </span>
            </h3>

            {user ? (
                <div className="mb-10 flex gap-4 bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50 shadow-xl backdrop-blur-sm">
                    <div className="flex-shrink-0">
                        <img
                            src={user.avatarUrl ? `http://localhost:5122${user.avatarUrl}` : "https://via.placeholder.com/40"}
                            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/30 shadow-sm"
                            alt={user.nickname}
                        />
                    </div>

                    <div className="flex-1">
                        <textarea
                            className="w-full bg-slate-950/80 border border-slate-700/50 rounded-xl p-4 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none transition-all duration-200 hover:bg-slate-950 shadow-inner"
                            rows={3}
                            placeholder={t('comments.placeholder')}
                            value={!replyTo ? newComment : ''}
                            onChange={e => { setReplyTo(null); setNewComment(e.target.value); }}
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                        />
                        <div className="flex justify-end mt-3">
                            <button onClick={() => handleSubmit()} className="bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-0.5 px-8 py-2.5 rounded-lg text-white font-bold transition-all shadow-lg shadow-emerald-900/30 active:translate-y-0 active:shadow-none">
                                {t('comments.post')}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-8 text-center text-slate-400 mb-10 backdrop-blur-md shadow-lg">
                    {t('comments.login_to_comment', {
                        login: <Link to="/login" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 font-bold transition">{t('comments.login_link')}</Link>
                    })}
                </div>
            )}

            <div className="space-y-2">
                {comments.map(c => renderComment(c))}
            </div>
        </div>
    );
};