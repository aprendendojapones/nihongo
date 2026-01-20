"use client";

import { Trophy, Star, Flame, BookOpen, User, LogOut, Settings, Users, ArrowRight, Check } from 'lucide-react';
import PCHandwritingView from '@/components/PCHandwritingView';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/TranslationContext';
import './dashboard.css';

export default function Dashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const user = session?.user as any;

    const userStats = {
        level: user?.level || 'N5',
        xp: user?.xp || 0,
        streak: user?.streak || 0
    };

    const xpNeededForNextLevel = 1000; // Mock value

    const loading = !session;

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="loader"></div></div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="user-profile">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="user-avatar-img" />
                    ) : (
                        <div className="user-avatar-placeholder glass-card">
                            <User size={32} />
                        </div>
                    )}
                    <div className="user-info">
                        <h1>{t('welcome')}, {user?.username || user?.full_name || 'Student'}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{t('keep_learning')}</p>
                    </div>
                </div>

                <div className="header-stats">
                    <div className="glass-card stat-badge">
                        <Flame color="var(--accent-primary)" size={20} />
                        <span style={{ fontWeight: 'bold' }}>{userStats.streak}</span>
                    </div>
                    <div className="glass-card stat-badge">
                        <Star color="var(--accent-secondary)" size={20} />
                        <span style={{ fontWeight: 'bold' }}>{userStats.xp} XP</span>
                    </div>
                    <button className="icon-button" onClick={() => router.push('/profile')} title={t('settings')}>
                        <Settings size={20} />
                    </button>
                    <button className="logout-button" onClick={() => signOut()}>
                        <LogOut size={20} /> {t('logout')}
                    </button>
                </div>
            </header>

            <main className="dashboard-grid">
                <section className="main-column">
                    {/* 1. Trilha de Aprendizado */}
                    <div className="glass-card dashboard-card" onClick={() => router.push('/lessons')}>
                        <div className="card-icon-wrapper">
                            <BookOpen size={32} color="var(--accent-primary)" />
                        </div>
                        <div className="card-content">
                            <h3>Trilha de Aprendizado</h3>
                            <p>Sua jornada do zero à fluência.</p>
                        </div>
                        <ArrowRight size={24} className="card-arrow" />
                    </div>

                    {/* 2. Níveis JLPT */}
                    <div className="glass-card dashboard-card" onClick={() => router.push('/lessons')}>
                        <div className="card-icon-wrapper">
                            <Star size={32} color="#FFD700" />
                        </div>
                        <div className="card-content">
                            <h3>Níveis JLPT</h3>
                            <p>Conteúdo estruturado do básico ao avançado.</p>
                        </div>
                        <ArrowRight size={24} className="card-arrow" />
                    </div>

                    {/* 3. Modo Game */}
                    <div className="glass-card dashboard-card" onClick={() => router.push('/game')}>
                        <div className="card-icon-wrapper">
                            <Trophy size={32} color="#FF4D4D" />
                        </div>
                        <div className="card-content">
                            <h3>Modo Game</h3>
                            <p>Aprenda brincando e suba no ranking.</p>
                        </div>
                        <ArrowRight size={24} className="card-arrow" />
                    </div>

                    {/* 4. Escreva pelo Celular (Handwriting) */}
                    <div className="glass-card dashboard-card" style={{ cursor: 'default' }}>
                        <div className="card-content-full">
                            <h3>Escreva pelo Celular</h3>
                            <p>Use seu celular como tablet ou use o mouse.</p>
                            <PCHandwritingView />
                        </div>
                    </div>

                    {/* 5. Prova de Avaliação de Nível */}
                    <div className="glass-card dashboard-card" onClick={() => router.push('/placement')}>
                        <div className="card-icon-wrapper">
                            <Check size={32} color="#4CAF50" />
                        </div>
                        <div className="card-content">
                            <h3>Prova de Avaliação de Nível</h3>
                            <p>Teste seus conhecimentos (10 questões/nível).</p>
                        </div>
                        <ArrowRight size={24} className="card-arrow" />
                    </div>
                </section>

                <aside className="side-column">
                    <section className="glass-card ranking-section">
                        <h3 className="ranking-title">
                            <Trophy size={20} color="var(--accent-secondary)" /> {t('global_ranking')}
                        </h3>
                        <div className="ranking-list">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="ranking-item">
                                    <div className="rank-position">#{i}</div>
                                    <div className="rank-user-info">
                                        <div className="rank-avatar-placeholder"><User size={16} /></div>
                                        <div className="rank-details">
                                            <span className="rank-username">User {i}</span>
                                            <span className="rank-school">School Name</span>
                                        </div>
                                    </div>
                                    <div className="rank-xp">{5000 - i * 100} XP</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="glass-card chat-section">
                        <h3 className="ranking-title">
                            <Users size={20} color="var(--accent-primary)" /> {t('school_chat')}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Conecte-se com sua escola.</p>
                        <button className="btn-primary" style={{ width: '100%' }} onClick={() => router.push('/chat')}>
                            {t('open_chat')}
                        </button>
                    </section>
                </aside>
            </main>

            {['director', 'teacher'].includes(user?.role) && (
                <div className="admin-actions">
                    <button
                        className="btn-primary btn-admin-panel"
                        onClick={() => router.push('/school')}
                    >
                        {t('school_panel')}
                    </button>
                </div>
            )}

            {user?.role === 'admin' && (
                <div className="admin-actions">
                    <button
                        className="btn-primary btn-admin-panel"
                        onClick={() => router.push('/admin')}
                    >
                        {t('admin_panel')}
                    </button>
                </div>
            )}
        </div>
    );
}
