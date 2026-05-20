import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

const TYPE_ICONS: Record<string, string> = {
    comment_deleted: '🗑️',
    info: 'ℹ️',
};

export const NotificationBell = () => {
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-900 animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between p-4 border-b border-slate-800">
                        <span className="font-bold text-white text-sm">{t('notifications.title')}</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-emerald-400 hover:text-emerald-300 transition">
                                {t('notifications.mark_all_read')}
                            </button>
                        )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                        {notifications.length === 0 && (
                            <div className="p-6 text-center text-slate-500 text-sm">{t('notifications.empty')}</div>
                        )}
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => !n.isRead && markRead(n.id)}
                                className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-800 transition ${!n.isRead ? 'bg-slate-800/50' : ''}`}
                            >
                                <span className="text-xl flex-shrink-0">{TYPE_ICONS[n.type] || 'ℹ️'}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-300 leading-snug">
                                        {n.type === 'comment_deleted'
                                            ? `${t('notifications.comment_deleted')}: ${n.message}`
                                            : n.message}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                                {!n.isRead && <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0 mt-1.5" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
