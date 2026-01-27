"use client";

import { Trophy, Star, Flame, BookOpen, User, LogOut, Settings, Users, ArrowRight, Gamepad2, GraduationCap, Library, Smartphone } from 'lucide-react';
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

            <main className="landing-main" style={{ paddingTop: '2rem' }}>
                <div className="landing-grid">
                    {/* 1. Trilha de Aprendizado */}
                    <div
                        className="glass-card landing-card"
                        onClick={() => router.push('/lessons')}
                    >
                        <BookOpen size={48} color="var(--accent-primary)" />
                        <h3>{t('learning_path')}</h3>
                        <p>{t('learning_path_desc')}</p>
                    </div>

                    {/* 2. Níveis JLPT */}
                    <div
                        className="glass-card landing-card"
                        onClick={() => router.push('/lessons')}
                    >
                        <Library size={48} color="var(--accent-secondary)" />
                        <h3>{t('jlpt_levels')}</h3>
                        <p>{t('jlpt_levels_desc')}</p>
                    </div>

                    {/* 3. Modo Game */}
                    <div
                        className="glass-card landing-card"
                        onClick={() => router.push('/game')}
                    >
                        <Gamepad2 size={48} color="#4ade80" />
                        <h3>{t('game_mode')}</h3>
                        <p>{t('game_mode_desc')}</p>
                    </div>

                    {/* 4. Escrita Real-time */}
                    <div
                        className="glass-card landing-card"
                        onClick={() => router.push('/write')}
                    >
                        <Smartphone size={48} color="var(--accent-primary)" />
                        <h3>{t('realtime_writing')}</h3>
                        <p>{t('realtime_writing_desc')}</p>
                    </div>
                </div>

                <div className="landing-actions" style={{ marginTop: '2rem' }}>
                    <button
                        className="btn-primary btn-landing"
                        onClick={() => router.push('/dashboard')}
                    >
                        {t('view_full_dashboard')}
                    </button>
                </div>
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
