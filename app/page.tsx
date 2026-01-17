"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTranslation } from "@/components/TranslationContext";
import './landing.css';

export default function Home() {
    const router = useRouter();
    const { data: session } = useSession();
    const { t } = useTranslation();

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
                        onClick={() => router.push('/dashboard')}
                    >
                        <h3>{t('jlpt_levels')}</h3>
                        <p>{t('jlpt_levels_desc')}</p>
                    </div>

                    <div
                        className="glass-card landing-card"
                        onClick={() => router.push('/game')}
                    >
                        <h3>{t('game_mode')}</h3>
                        <p>{t('game_mode_desc')}</p>
                    </div>

                    <div
                        className="glass-card landing-card"
                        onClick={() => router.push('/dashboard')}
                    >
                        <h3>{t('realtime_writing')}</h3>
                        <p>{t('realtime_writing_desc')}</p>
                    </div>
                </div>

                <div className="landing-actions">
                    {session ? (
                        <>
                            <button
                                className="btn-primary btn-landing"
                                onClick={() => router.push('/dashboard')}
                            >
                                {t('go_to_dashboard')}
                            </button>
                            <button
                                className="btn-primary btn-landing btn-outline"
                                onClick={() => signOut()}
                            >
                                {t('logout')}
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn-primary btn-landing"
                            onClick={() => signIn('google')}
                        >
                            {t('login')}
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
