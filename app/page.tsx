"use client";

import { Trophy, Star, Flame, BookOpen, User, LogOut, Settings, Users, ArrowRight, Gamepad2, GraduationCap, Library, Smartphone } from 'lucide-react';
import PCHandwritingView from '@/components/PCHandwritingView';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/TranslationContext';
import './landing.css';
import './dashboard/dashboard.css';

export default function Home() {
    const { data: session } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const user = session?.user as any;

    const userStats = {
        level: user?.level || 'N5',
        xp: user?.xp || 0,
        streak: user?.streak || 0
    };

    if (!session) {
        return (
            <main className="landing-main">
                <div className="landing-content animate-fade-in">
                    <h1 className="gradient-text landing-title">
                        日本語 Master
                    </h1>
                    <p className="landing-desc">
                        {t('hero_desc')}
                    </p>

                    <div className="landing-grid">
                        <div
                            className="glass-card landing-card"
                            onClick={() => signIn('google')}
                        >
                            <h3>{t('jlpt_levels')}</h3>
                            <p>{t('jlpt_levels_desc')}</p>
                        </div>

                        <div
                            className="glass-card landing-card"
                            onClick={() => signIn('google')}
                        >
                            <h3>{t('game_mode')}</h3>
                            <p>{t('game_mode_desc')}</p>
                        </div>

                        <div
                            className="glass-card landing-card"
                            onClick={() => signIn('google')}
                        >
                            <h3>{t('realtime_writing')}</h3>
                            <p>{t('realtime_writing_desc')}</p>
                        </div>
                    </div>

                    <div className="landing-actions">
                        <button
                            className="btn-primary btn-landing"
                            onClick={() => signIn('google')}
                        >
                            {t('login')}
                        </button>
                    </div>
                </div>
            </main>
        );
    }

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
                        <div className="card-icon-wrapper" style={{ background: 'rgba(255, 62, 62, 0.1)' }}>
                            <BookOpen size={32} color="var(--accent-primary)" />
                        </div>
                        <div className="card-content">
                            <h2>{t('learning_path')}</h2>
                            <p>{t('learning_path_desc')}</p>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: '45%' }}></div>
                            </div>
                            <span className="progress-text">45% {t('completed')}</span>
                        </div>
                        <ArrowRight size={24} className="card-arrow" />
                    </div>

                    <div className="dashboard-cards-grid">
                        {/* 2. Níveis JLPT */}
                        <div className="glass-card dashboard-card-small" onClick={() => router.push('/lessons')}>
                            <Library size={28} color="var(--accent-secondary)" />
                            <h3>{t('jlpt_levels')}</h3>
                            <p>{t('jlpt_levels_desc')}</p>
                        </div>

                        {/* 3. Modo Game */}
                        <div className="glass-card dashboard-card-small" onClick={() => router.push('/game')}>
                            <Gamepad2 size={28} color="#4ade80" />
                            <h3>{t('game_mode')}</h3>
                            <p>{t('game_mode_desc')}</p>
                        </div>
                    </div>

                    {/* 4. Escreva pelo Celular */}
                    <div className="glass-card handwriting-section">
                        <div className="section-header">
                            <Smartphone size={24} color="var(--accent-primary)" />
                            <h2>{t('realtime_writing')}</h2>
                        </div>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>{t('realtime_writing_desc')}</p>
                        <PCHandwritingView />
                    </div>

                    {/* 5. Prova de Avaliação de Nível */}
                    <div className="glass-card dashboard-card" onClick={() => router.push('/placement')} style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 0, 0, 0))' }}>
                        <div className="card-icon-wrapper" style={{ background: 'rgba(255, 215, 0, 0.2)' }}>
                            <GraduationCap size={32} color="#ffd700" />
                        </div>
                        <div className="card-content">
                            <h2>{t('placement_test')}</h2>
                            <p>{t('placement_test_desc')}</p>
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
