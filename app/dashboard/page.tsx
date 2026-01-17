"use client";

import { Trophy, Star, Flame, BookOpen, User, LogOut, Settings, Users, ArrowRight } from 'lucide-react';
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
                    <div className="glass-card next-lesson-section">
                        <div className="next-lesson-title">
                            <BookOpen size={24} color="var(--accent-primary)" />
                            <h2>{t('next_lesson')}</h2>
                        </div>
                        <h3>{t('katakana_basics')}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Master the basic characters</p>

                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: '45%' }}></div>
                        </div>
                        <div className="flex-between" style={{ color: 'var(--text-muted)' }}>
                            <span>45% {t('completed')}</span>
                            <span>5/12 {t('lessons')}</span>
                        </div>

                        <button className="btn-primary continue-button" onClick={() => router.push('/lessons')}>
                            {t('continue_learning')} <ArrowRight size={20} />
                        </button>
                    </div>

                    <div className="glass-card level-section">
                        <div className="flex-between">
                            <h3>{t('current_level')}</h3>
                            <span style={{ fontWeight: 'bold', color: 'var(--accent-secondary)' }}>{userStats.level}</span>
                        </div>
                        <div className="progress-bar-container" style={{ marginTop: '1rem' }}>
                            <div className="progress-bar-fill" style={{ width: `${(userStats.xp / xpNeededForNextLevel) * 100}%` }}></div>
                        </div>
                        <p className="xp-needed-text">{xpNeededForNextLevel - userStats.xp} XP {t('to_next_level')}</p>
                    </div>

                    <PCHandwritingView />
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
