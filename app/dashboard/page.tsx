"use client";

import { Trophy, Star, Flame, BookOpen, User, LogOut } from 'lucide-react';
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
        rank: 42,
        streak: user?.streak || 0
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="user-profile">
                    {user?.image ? (
                        <img src={user.image} alt="Avatar" className="user-avatar-img" />
                    ) : (
                        <div className="glass-card user-avatar-placeholder">
                            <User size={32} />
                        </div>
                    )}
                    <div className="user-info">
                        <h1 className="gradient-text">{t('welcome')}, {user?.name || 'Estudante'}!</h1>
                        <p>
                            {t('level')}: {userStats.level}
                            {user?.schoolName && ` • ${user.schoolName}`}
                            {user?.role === 'admin' && ` • Admin`}
                        </p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="glass-card stat-badge">
                        <Flame color="var(--accent-primary)" size={20} />
                        <span>{userStats.streak} {t('days')}</span>
                    </div>
                    <div className="glass-card stat-badge">
                        <Star color="var(--accent-secondary)" size={20} />
                        <span>{userStats.xp} XP</span>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="logout-button"
                    >
                        <LogOut size={20} /> {t('logout')}
                    </button>
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="main-column">
                    <section className="glass-card next-lesson-section">
                        <h2 className="next-lesson-title">
                            <BookOpen size={24} /> {t('next_lesson')}: {t('level_hiragana_title')}
                        </h2>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: '65%' }} />
                        </div>
                        <p className="progress-text">65% do nível {userStats.level} concluído</p>
                        <button
                            className="btn-primary continue-button"
                            onClick={() => router.push('/lessons')}
                        >
                            {t('continue_studying')}
                        </button>
                    </section>

                    <PCHandwritingView />
                </div>

                <aside className="side-column">
                    <section className="glass-card ranking-section">
                        <h3 className="ranking-title">
                            <Trophy size={20} color="var(--accent-secondary)" /> {t('global_ranking')}
                        </h3>
                        <div className="ranking-list">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={`ranking-item ${i === 3 ? 'active' : ''}`}>
                                    <span className={`rank-number ${i <= 3 ? 'top' : 'other'}`}>#{i}</span>
                                    <span>{t('student')} {i}</span>
                                    <span className="rank-score">{5000 - i * 500}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="glass-card level-section">
                        <h3>{t('level')}: {userStats.level}</h3>
                        <p className="xp-needed-text">
                            {t('xp_needed').replace('{xp}', '750').replace('{next}', 'N4')}
                        </p>
                        <button
                            className="btn-primary achievements-button"
                            onClick={() => router.push('/lessons')}
                        >
                            {t('achievements')}
                        </button>
                    </section>
                </aside>
            </div>

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
