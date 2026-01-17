"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Users, ShieldAlert, Lock } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext';
import './chat.css';

type Message = {
    id: string;
    content: string;
    sender_id: string;
    sender_name: string;
    sender_avatar?: string;
    is_private: boolean;
    created_at: string;
    is_admin: boolean;
};

export default function ChatPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const user = session?.user as any;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<'school' | 'admin'>('school');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userSchoolId, setUserSchoolId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserSchool = async () => {
            if (user?.id) {
                const { data } = await supabase
                    .from('profiles')
                    .select('school_id')
                    .eq('id', user.id)
                    .single();
                if (data?.school_id) {
                    setUserSchoolId(data.school_id);
                }
            }
        };
        fetchUserSchool();
    }, [user?.id]);

    useEffect(() => {
        if (!userSchoolId && activeTab === 'school') return;

        const fetchMessages = async () => {
            setLoading(true);
            let query = supabase
                .from('messages')
                .select(`
                    id,
                    content,
                    sender_id,
                    receiver_id,
                    is_private,
                    created_at,
                    sender:sender_id (username, avatar_url, role),
                    receiver:receiver_id (username, avatar_url)
                `)
                .order('created_at', { ascending: true });

            if (activeTab === 'school') {
                query = query
                    .eq('school_id', userSchoolId)
                    .eq('is_private', false);
            } else {
                query = query.or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`).eq('is_private', true);
            }

            const { data, error } = await query;

            if (data) {
                const formattedMessages: Message[] = data.map((msg: any) => {
                    const isMe = msg.sender_id === user.id;
                    const otherPartyName = isMe ? (msg.receiver?.username || 'Usuário') : (msg.sender?.username || 'Usuário');

                    return {
                        id: msg.id,
                        content: msg.content,
                        sender_id: msg.sender_id,
                        sender_name: isMe ? `Para: ${otherPartyName}` : msg.sender?.username || 'Usuário',
                        sender_avatar: msg.sender?.avatar_url,
                        is_private: msg.is_private,
                        created_at: msg.created_at,
                        is_admin: msg.sender?.role === 'admin' || msg.sender?.role === 'director'
                    };
                });
                setMessages(formattedMessages);
            }
            setLoading(false);
            scrollToBottom();
        };

        fetchMessages();

        // Real-time subscription
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                // Ideally we should fetch the profile of the sender here, but for now we might just reload or optimistically add
                // For simplicity, let's re-fetch to get profile data
                fetchMessages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeTab, userSchoolId, user?.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user?.id) return;

        if (activeTab === 'school' && !userSchoolId) {
            alert('Você precisa estar em uma escola para enviar mensagens.');
            return;
        }

        if (activeTab === 'admin' && user.role !== 'admin') {
            // Regular users cannot start a private conversation, only reply? 
            // The requirement says "somente eu como adiministrador poderei mandar mensagem privada".
            // This implies users can READ private messages but maybe not reply? 
            // Or maybe they can reply to the thread.
            // Let's assume for now users CANNOT send private messages at all, only Admins.
            // But if an admin sends a message, the user should probably be able to reply.
            // For now, let's block regular users from initiating, but maybe allow reply if we had thread logic.
            // Given the strict requirement "somente eu... poderei mandar", I will disable input for non-admins in Admin tab unless we implement a support ticket system.
            // However, usually "Admin PM" implies a 1-way announcement or a 2-way support channel.
            // Let's assume 2-way is better for "Chat".
            // But to stick to "strict privacy", maybe only Admin can send.
            // Let's allow sending if it's a reply context, but here we don't have threads.
            // I'll allow sending in 'admin' tab ONLY if user is Admin.
            // If user is Student, they can only read.
            if (user.role !== 'admin') {
                alert('Apenas administradores podem enviar mensagens privadas.');
                return;
            }
        }

        const messageData = {
            school_id: userSchoolId, // Optional for private?
            sender_id: user.id,
            content: newMessage,
            is_private: activeTab === 'admin',
            // For private messages, we need a receiver. In this simple chat view, we don't have a selected user.
            // This suggests the "Admin Tab" here is a list of ALL private messages?
            // Or maybe this page is just for "School Chat" and "My Notifications".
            // If I am Admin, I need a way to select a user to DM.
            // This UI is too simple for Admin to DM specific users.
            // Admin should DM from the "Users List" or "Admin Panel".
            // So this "Admin Tab" for a student is "Messages from Admin".
            // For an Admin, this tab might show "My sent messages" or be disabled here.
        };

        // If it's school chat
        if (activeTab === 'school') {
            const { error } = await supabase.from('messages').insert({
                school_id: userSchoolId,
                sender_id: user.id,
                content: newMessage,
                is_private: false
            });

            if (error) console.error(error);
            else setNewMessage('');
        }
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <button className="icon-button" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Chat da Escola</h1>
            </header>

            <div className="chat-tabs">
                <button
                    className={`tab-button ${activeTab === 'school' ? 'active' : ''}`}
                    onClick={() => setActiveTab('school')}
                >
                    <Users size={18} /> Chat Geral
                </button>
                <button
                    className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
                    onClick={() => setActiveTab('admin')}
                >
                    <ShieldAlert size={18} /> Avisos Admin
                </button>
            </div>

            <main className="glass-card chat-box">
                <div className="messages-list">
                    {loading ? (
                        <div className="loading-state">Carregando mensagens...</div>
                    ) : messages.length > 0 ? (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message-item ${msg.sender_id === user?.id ? 'my-message' : ''} ${msg.is_admin ? 'admin-message' : ''}`}
                            >
                                <div className="message-header">
                                    <span className="sender-name">
                                        {msg.is_admin && <ShieldAlert size={12} className="admin-icon" />}
                                        {msg.sender_name}
                                    </span>
                                    <span className="message-time">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="message-content">{msg.content}</p>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>Nenhuma mensagem ainda.</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {activeTab === 'school' && (
                    <form onSubmit={handleSendMessage} className="message-input-area">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="chat-input"
                        />
                        <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                            <Send size={20} />
                        </button>
                    </form>
                )}

                {activeTab === 'admin' && (
                    <div className="admin-notice-footer">
                        <Lock size={16} />
                        <span>Este canal é apenas para comunicados oficiais da administração.</span>
                    </div>
                )}
            </main>
        </div>
    );
}
