import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';

interface ChatMessage {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    senderNickname?: string;
    senderAvatar?: string;
}

interface ChatContextType {
    messages: Record<string, ChatMessage[]>; // keyed by other userId
    sendMessage: (recipientId: string, content: string) => Promise<void>;
    loadHistory: (userId: string) => Promise<void>;
    unreadCount: number;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
    const [unreadCount, setUnreadCount] = useState(0);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('token');
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_URL}/hubs/chat`, {
                accessTokenFactory: () => token || ''
            })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveMessage', (msg: ChatMessage) => {
            setMessages(prev => {
                const key = msg.senderId;
                return { ...prev, [key]: [...(prev[key] || []), msg] };
            });
            setUnreadCount(c => c + 1);
        });

        connection.on('MessageSent', (msg: ChatMessage) => {
            setMessages(prev => {
                const key = msg.recipientId;
                return { ...prev, [key]: [...(prev[key] || []), msg] };
            });
        });

        connection.start().catch(console.error);
        connectionRef.current = connection;

        return () => { connection.stop(); };
    }, [user]);

    const sendMessage = async (recipientId: string, content: string) => {
        await connectionRef.current?.invoke('SendMessage', recipientId, content);
    };

    const loadHistory = async (userId: string) => {
        const { api } = await import('../api/axios');
        const res = await api.get(`/Messages/${userId}`);
        setMessages(prev => ({ ...prev, [userId]: res.data }));
        setUnreadCount(0);
    };

    return (
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within ChatProvider');
    return ctx;
};
