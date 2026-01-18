"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Users, School, Link as LinkIcon, Check, Copy, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/components/TranslationContext';
import './admin.css';

interface User {
    id: string;
    email: string;
    role: string;
    schools: { name: string } | null;
    full_name?: string;
    level?: string;
    phone?: string;
    address?: string;
    is_favorite?: boolean;
    created_at?: string;
}

interface School {
    id: string;
    name: string;
    director_id?: string;
    profiles?: { full_name: string };
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const user = session?.user as any;
    const [usersList, setUsersList] = useState<User[]>([]);
    const [showMsgModal, setShowMsgModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [msgContent, setMsgContent] = useState('');
    const [schools, setSchools] = useState<School[]>([]);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [invitationLink, setInvitationLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [debugError, setDebugError] = useState<string | null>(null);

    // New State for Filters and Sorting
    const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'staff' | 'student'>('all');
    const [sortOption, setSortOption] = useState<'date' | 'name'>('date');

    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        console.log('Admin Dashboard vDebug loaded');
    }, []);

    const toggleFavorite = async (userId: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_favorite: !currentStatus } : u));

            const response = await fetch('/api/admin/users/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, is_favorite: !currentStatus })
            });

            if (!response.ok) throw new Error('Failed to update favorite');
        } catch (error) {
            console.error('Error updating favorite:', error);
            // Revert on error
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_favorite: currentStatus } : u));
        }
    };

    const filteredAndSortedUsers = usersList
        .filter(user => {
            if (activeTab === 'all') return true;
            if (activeTab === 'admin') return user.role === 'admin';
            if (activeTab === 'staff') return user.role === 'director' || user.role === 'teacher';
            if (activeTab === 'student') return user.role === 'student';
            return true;
        })
        .sort((a, b) => {
            // Favorites always on top
            if (a.is_favorite && !b.is_favorite) return -1;
            if (!a.is_favorite && b.is_favorite) return 1;

            // Then sort by selected option
            if (sortOption === 'name') {
                return (a.full_name || a.email).localeCompare(b.full_name || b.email);
            } else {
                // Date (Newest first)
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            }
        });

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
        try {
            const response = await fetch('/api/admin/schools');
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                const errMsg = `Schools API Error ${response.status}: ${JSON.stringify(err)}`;
                console.error(errMsg);
                setDebugError(prev => prev ? prev + '\n' + errMsg : errMsg);
                throw new Error('Failed to fetch schools');
            }
            const data = await response.json();
            setSchools(data);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                const errMsg = `Users API Error ${response.status}: ${JSON.stringify(err)}`;
                console.error(errMsg);
                setDebugError(prev => prev ? prev + '\n' + errMsg : errMsg);
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            console.log('Fetched users:', data);
            setUsersList(data);
        } catch (error) {
            console.error('Error fetching users:', error);
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

    const generateDirectorInvite = async () => {
        try {
            const response = await fetch('/api/admin/generate-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'director' })
            });

            const data = await response.json();

            if (data.success) {
                setInvitationLink(data.invitationUrl);
                setCopied(false);
            } else {
                alert('Erro ao gerar convite: ' + data.error);
            }
        } catch (error) {
            console.error('Error generating invite:', error);
            alert('Erro ao gerar convite');
        }
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        if (!confirm(`Tem certeza que deseja alterar a função deste usuário para "${newRole}"?`)) {
            return;
        }

        try {
            const response = await fetch('/api/admin/update-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newRole })
            });

            const data = await response.json();

            if (data.success) {
                alert('Função atualizada com sucesso!');
                fetchUsers(); // Refresh user list
            } else {
                alert('Erro ao atualizar função: ' + data.error);
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Erro ao atualizar função');
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
                        <>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{t('invite_desc')}</p>
                            <button
                                className="btn-primary"
                                onClick={generateDirectorInvite}
                                style={{ width: '100%', marginBottom: '0.5rem' }}
                            >
                                Gerar Convite para Diretor
                            </button>
                        </>
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
                    {schools.map((school: any) => (
                        <div key={school.id} className="school-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            <div className="flex justify-between items-center mb-4">
                                <div className="school-info">
                                    <h3>{school.name}</h3>
                                    <p>{t('director')}: {school.directorName}</p>
                                </div>
                                <div className="school-actions">
                                    <button className="btn-primary btn-director" onClick={() => generateInvite(school.id, 'director')}>{t('invite_director')}</button>
                                    <button className="btn-primary btn-teacher" onClick={() => generateInvite(school.id, 'teacher')}>{t('invite_teacher')}</button>
                                </div>
                            </div>

                            <div className="school-stats">
                                <div className="school-stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-label">Professores</div>
                                        <div className="stat-value">{school.teacherCount || 0}</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-label">Alunos</div>
                                        <div className="stat-value">{school.studentCount || 0}</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-label">XP Total</div>
                                        <div className="stat-value text-accent-primary">{(school.totalXp || 0).toLocaleString()}</div>
                                    </div>
                                </div>

                                {school.topStudent && (
                                    <div className="top-students">
                                        <div className="text-sm text-muted-foreground mb-2">Melhor Aluno (Geral)</div>
                                        <div className="top-student-item">
                                            <span className="top-student-name">{school.topStudent.full_name || 'Sem nome'}</span>
                                            <span className="top-student-xp">{school.topStudent.xp?.toLocaleString()} XP</span>
                                        </div>
                                    </div>
                                )}

                                <div className="top-students">
                                    <div className="text-sm text-muted-foreground mb-2">Melhores por Nível</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
                                            school.bestPerLevel && school.bestPerLevel[level] ? (
                                                <div key={level} className="top-student-item text-xs">
                                                    <span className="font-bold mr-2 text-accent-secondary">{level}</span>
                                                    <span className="truncate flex-1">{school.bestPerLevel[level].full_name}</span>
                                                    <span className="ml-2 text-accent-primary">{school.bestPerLevel[level].xp} XP</span>
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-card admin-section" style={{ marginTop: '2rem' }}>
                <div className="admin-section">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2><i className="fas fa-users"></i> {t('user_management')}</h2>

                        <div className="controls" style={{ display: 'flex', gap: '1rem' }}>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value as 'date' | 'name')}
                                style={{ padding: '0.5rem', borderRadius: '4px', background: '#333', color: '#fff', border: '1px solid #555' }}
                            >
                                <option value="date">📅 Data de Criação</option>
                                <option value="name">🔤 Ordem Alfabética</option>
                            </select>
                        </div>
                    </div>

                    <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                        {['all', 'admin', 'staff', 'student'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: activeTab === tab ? '#ff4d4d' : '#888',
                                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    padding: '0.5rem 1rem',
                                    borderBottom: activeTab === tab ? '2px solid #ff4d4d' : 'none'
                                }}
                            >
                                {tab === 'all' ? 'Todos' : tab === 'staff' ? 'Diretores/Professores' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Fav</th>
                                    <th>{t('user')}</th>
                                    <th>{t('email')}</th>
                                    <th>{t('school')}</th>
                                    <th>Nível</th>
                                    <th>Telefone</th>
                                    <th>Endereço</th>
                                    <th>{t('role')}</th>
                                    <th>Data</th>
                                    <th>Ações</th> {/* Added Ações column */}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedUsers.map((user) => (
                                    <tr key={user.id} style={{ background: user.is_favorite ? '#ff4d4d10' : 'transparent' }}>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={user.is_favorite || false}
                                                    onChange={() => toggleFavorite(user.id, user.is_favorite || false)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        width: '18px',
                                                        height: '18px',
                                                        accentColor: '#ffd700'
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                                                </div>
                                                <span>{user.full_name || 'Sem nome'}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.schools?.name || '-'}</td>
                                        <td>
                                            <select
                                                value={user.level || 'N5'}
                                                onChange={(e) => updateUserLevel(user.id, e.target.value)}
                                                className="role-select"
                                                style={{ width: '70px' }}
                                            >
                                                <option value="N5">N5</option>
                                                <option value="N4">N4</option>
                                                <option value="N3">N3</option>
                                                <option value="N2">N2</option>
                                                <option value="N1">N1</option>
                                            </select>
                                        </td>
                                        <td>{user.phone || '-'}</td>
                                        <td>{user.phone || '-'}</td>
                                        <td>{user.address || '-'}</td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                className="role-select"
                                            >
                                                <option value="student">student</option>
                                                <option value="teacher">teacher</option>
                                                <option value="director">director</option>
                                                <option value="admin">admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon"
                                                title="Enviar Mensagem Privada"
                                                onClick={() => openMsgModal(user)}
                                            >
                                                <Users size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
