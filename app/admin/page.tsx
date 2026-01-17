"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Users, School, Link as LinkIcon, Check, Copy, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/components/TranslationContext';
import './admin.css';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const user = session?.user as any;
    const [usersList, setUsersList] = useState<any[]>([]);
    const [showMsgModal, setShowMsgModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [msgContent, setMsgContent] = useState('');
    const [schools, setSchools] = useState<any[]>([]);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [invitationLink, setInvitationLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (status === 'loading') return;

            if (!session || !user) {
                router.push('/');
                return;
            }

            // First check session role
            if (user.role === 'admin') {
                setIsAuthorized(true);
                fetchSchools();
                fetchUsers();
                return;
            }

            // Fallback: Check Supabase directly
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('email', user.email)
                .single();

            if (data?.role === 'admin') {
                setIsAuthorized(true);
                fetchSchools();
                fetchUsers();
            } else {
                router.push('/dashboard');
            }
        };

        checkAuth();
    }, [session, status, user]);

    const fetchSchools = async () => {
        const { data } = await supabase.from('schools').select('*, profiles(full_name)');
        if (data) setSchools(data);
    };

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*, schools(name)')
            .order('created_at', { ascending: false });
        if (data) {
            // Ensure all users are shown, including admin
            setUsersList(data);
        }
    };

    const createSchool = async () => {
        if (!newSchoolName) return;
        const { data, error } = await supabase
            .from('schools')
            .insert({ name: newSchoolName })
            .select()
            .single();

        if (data) {
            setNewSchoolName('');
            fetchSchools();
        }
    };

    const generateInvite = (schoolId: string, role: string) => {
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/invite?schoolId=${schoolId}&role=${role}`;
        setInvitationLink(inviteUrl);
        setCopied(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(invitationLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openMsgModal = (targetUser: any) => {
        setSelectedUser(targetUser);
        setShowMsgModal(true);
    };

    const sendPrivateMessage = async () => {
        if (!msgContent || !selectedUser || !user) return;

        const { error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: selectedUser.id,
            content: msgContent,
            is_private: true,
            school_id: selectedUser.school_id // Optional: link to user's school context
        });

        if (!error) {
            alert('Mensagem enviada com sucesso!');
            setShowMsgModal(false);
            setMsgContent('');
            setSelectedUser(null);
        } else {
            alert('Erro ao enviar mensagem.');
        }
    };

    if (status === 'loading' || !isAuthorized) {
        return <div className="flex items-center justify-center h-screen text-white">Loading admin panel...</div>;
    }

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>{t('admin_panel')}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{t('admin_panel_desc')}</p>
            </header>

            <div className="admin-grid">
                <section className="glass-card admin-section">
                    <h2 className="admin-section-title">
                        <Plus size={24} /> {t('create_new_school')}
                    </h2>
                    <div className="admin-input-group">
                        <input
                            type="text"
                            placeholder={t('school_name_placeholder')}
                            value={newSchoolName}
                            onChange={(e) => setNewSchoolName(e.target.value)}
                            className="admin-input"
                        />
                        <button className="btn-primary" onClick={createSchool}>{t('create')}</button>
                    </div>
                </section>

                <section className="glass-card admin-section">
                    <h2 className="admin-section-title">
                        <LinkIcon size={24} /> {t('generate_invite')}
                    </h2>
                    {invitationLink ? (
                        <div className="invite-link-container">
                            <div className="invite-link-box">
                                <span className="invite-link-text">{invitationLink}</span>
                                <button onClick={copyToClipboard} className="copy-button" style={{ color: copied ? '#3effa2' : 'white' }}>
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid #444' }} onClick={() => setInvitationLink('')}>{t('generate_another')}</button>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('invite_desc')}</p>
                    )}
                </section>

                <section className="glass-card admin-section">
                    <h2 className="admin-section-title">
                        <Trophy size={24} /> Acesso Rápido
                    </h2>
                    <div className="admin-actions-grid">
                        <button className="btn-primary" onClick={() => router.push('/rankings')}>
                            Ver Ranking Global
                        </button>
                    </div>
                </section>
            </div>

            <section className="glass-card admin-section" style={{ marginTop: '2rem' }}>
                <h2 className="admin-section-title">
                    <School size={24} /> {t('registered_schools')}
                </h2>
                <div className="school-list">
                    {schools.map(school => (
                        <div key={school.id} className="school-item">
                            <div className="school-info">
                                <h3>{school.name}</h3>
                                <p>{t('director')}: {school.profiles?.full_name || t('not_assigned')}</p>
                            </div>
                            <div className="school-actions">
                                <button className="btn-primary btn-director" onClick={() => generateInvite(school.id, 'director')}>{t('invite_director')}</button>
                                <button className="btn-primary btn-teacher" onClick={() => generateInvite(school.id, 'teacher')}>{t('invite_teacher')}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-card admin-section" style={{ marginTop: '2rem' }}>
                <h2 className="admin-section-title">
                    <Users size={24} /> Gerenciamento de Usuários
                </h2>
                <div className="users-list-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>Email</th>
                                <th>Escola</th>
                                <th>Nível</th>
                                <th>Função</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            {u.avatar_url && <img src={u.avatar_url} className="w-6 h-6 rounded-full" />}
                                            {u.username || u.full_name || 'Sem nome'}
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{u.schools?.name || '-'}</td>
                                    <td><span className="level-badge">{u.level || 'N5'}</span></td>
                                    <td><span className={`role-tag role-${u.role}`}>{u.role}</span></td>
                                    <td>
                                        <button
                                            className="btn-icon"
                                            title="Enviar Mensagem Privada"
                                            onClick={() => openMsgModal(u)}
                                        >
                                            <Users size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {showMsgModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <h3>Enviar Mensagem para {selectedUser?.username || selectedUser?.email}</h3>
                        <textarea
                            value={msgContent}
                            onChange={(e) => setMsgContent(e.target.value)}
                            placeholder="Digite sua mensagem privada..."
                            className="modal-textarea"
                            rows={5}
                        />
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowMsgModal(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={sendPrivateMessage}>Enviar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
