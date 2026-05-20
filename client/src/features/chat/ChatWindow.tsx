import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { X, Send, MessageCircle, ChevronLeft } from 'lucide-react';

interface Conversation {
    userId: string;
    nickname: string;
    avatarUrl?: string;
    lastMessage: string;
    lastAt: string;
    unreadCount: number;
}

interface User {
    id: string;
    nickname: string;
    avatarUrl?: string;
}

interface ChatMessage {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
    senderNickname?: string;
}

export const ChatWindow = ({ onClose }: { onClose: () => void }) => {
    const { user } = useAuth();
    const { messages, sendMessage, loadHistory } = useChat();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeUserId, setActiveUserId] = useState<string | null>(null);
    const [activeNickname, setActiveNickname] = useState('');
    const [input, setInput] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [showNewChat, setShowNewChat] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        api.get<Conversation[]>('/Messages/conversations').then(r => setConversations(r.data));
    }, []);

    const openConversation = async (userId: string, nickname: string) => {
        setActiveUserId(userId);
        setActiveNickname(nickname);
        await loadHistory(userId);
    };

    const handleNewChat = async () => {
        const res = await api.get<User[]>('/Messages/users');
        setUsers(res.data);
        setShowNewChat(true);
    };

    const handleSend = async () => {
        if (!activeUserId || !input.trim()) return;
        await sendMessage(activeUserId, input.trim());
        setInput('');
    };

    const activeMessages: ChatMessage[] = activeUserId ? (messages[activeUserId] || []) : [];

    const filteredUsers = users.filter(u => u.nickname?.toLowerCase().includes(userSearch.toLowerCase()));

    return (
        <div className="fixed bottom-20 right-6 z-50 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200" style={{ height: '500px' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-2">
                    {activeUserId && (
                        <button onClick={() => setActiveUserId(null)} className="text-slate-400 hover:text-white mr-1">
                            <ChevronLeft size={18} />
                        </button>
                    )}
                    <MessageCircle size={18} className="text-emerald-400" />
                    <span className="font-bold text-white text-sm">{activeUserId ? activeNickname : 'Messages'}</span>
                </div>
                <div className="flex items-center gap-2">
                    {!activeUserId && (
                        <button onClick={handleNewChat} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800 px-2 py-1 rounded">
                            + New
                        </button>
                    )}
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
                </div>
            </div>

            {/* New chat user picker */}
            {showNewChat && !activeUserId && (
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-3 border-b border-slate-800">
                        <input autoFocus placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                            className="w-full bg-slate-950 p-2 rounded border border-slate-700 text-white text-sm outline-none focus:border-emerald-500" />
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {filteredUsers.map(u => (
                            <button key={u.id} onClick={() => { setShowNewChat(false); openConversation(u.id, u.nickname || u.id); }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 transition text-left">
                                <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                                    {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" alt={u.nickname} /> : <span className="flex items-center justify-center h-full text-emerald-400 font-bold text-sm">{(u.nickname || '?')[0]}</span>}
                                </div>
                                <span className="text-white text-sm font-medium">{u.nickname}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Conversation list */}
            {!activeUserId && !showNewChat && (
                <div className="overflow-y-auto flex-1">
                    {conversations.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">No conversations yet.<br />Start a new chat above.</div>
                    )}
                    {conversations.map(c => (
                        <button key={c.userId} onClick={() => openConversation(c.userId, c.nickname)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 transition text-left border-b border-slate-800/50">
                            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                                {c.avatarUrl ? <img src={c.avatarUrl} className="w-full h-full object-cover" alt={c.nickname} /> : <span className="flex items-center justify-center h-full text-emerald-400 font-bold">{c.nickname[0]}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm font-bold truncate">{c.nickname}</span>
                                    {c.unreadCount > 0 && <span className="bg-emerald-500 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{c.unreadCount}</span>}
                                </div>
                                <p className="text-slate-500 text-xs truncate mt-0.5">{c.lastMessage}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Message thread */}
            {activeUserId && !showNewChat && (
                <>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {activeMessages.map((m, i) => {
                            const isMe = m.senderId === user?.id;
                            return (
                                <div key={m.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
                                        {m.content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-3 border-t border-slate-800 flex gap-2">
                        <input
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                            placeholder="Type a message..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        />
                        <button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-500 p-2 rounded-xl text-white transition">
                            <Send size={16} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
