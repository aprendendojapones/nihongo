"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Medal, Crown, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/components/TranslationContext';
import './rankings.css';

interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    xp: number;
    level: string;
}

export default function RankingsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { t } = useTranslation();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState<number | null>(null);

    useEffect(() => {
        fetchRankings();
    }, []);

    const fetchRankings = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, xp, level')
                .order('xp', { ascending: false })
                .limit(50);

            if (error) throw error;

            setProfiles(data || []);

            if (session?.user) {
                const rank = data?.findIndex(p => p.id === (session.user as any).id);
                if (rank !== undefined && rank !== -1) {
                    setUserRank(rank + 1);
                }
            }
        } catch (error) {
            console.error('Error fetching rankings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMedalIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown size={32} className="medal-gold animate-bounce" />;
            case 1: return <Medal size={28} className="medal-silver" />;
            case 2: return <Medal size={28} className="medal-bronze" />;
            default: return <span className="rank-number">{index + 1}</span>;
        }
    };

    return (
        <div className="rankings-page">
            <header className="rankings-header">
                <button
                    className="icon-button"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="gradient-text">Ranking Global</h1>
                <div className="header-spacer"></div>
            </header>

            <main className="rankings-container">
                {loading ? (
                    <div className="loading-spinner">Carregando...</div>
                ) : (
                    <>
                        {/* Top 3 Podium */}
                        <div className="podium-container">
                            {profiles[1] && (
                                <div className="podium-item silver">
                                    <div className="avatar-wrapper">
                                        {profiles[1].avatar_url ? (
                                            <img src={profiles[1].avatar_url} alt={profiles[1].username} />
                                        ) : (
                                            <div className="avatar-placeholder">{profiles[1].username?.[0] || 'U'}</div>
                                        )}
                                        <div className="medal-badge silver">2</div>
                                    </div>
                                    <div className="podium-info">
                                        <span className="username">{profiles[1].username || 'Usuário'}</span>
                                        <span className="xp">{profiles[1].xp} XP</span>
                                    </div>
                                </div>
                            )}

                            {profiles[0] && (
                                <div className="podium-item gold">
                                    <div className="crown-icon"><Crown size={40} color="#FFD700" /></div>
                                    <div className="avatar-wrapper">
                                        {profiles[0].avatar_url ? (
                                            <img src={profiles[0].avatar_url} alt={profiles[0].username} />
                                        ) : (
                                            <div className="avatar-placeholder">{profiles[0].username?.[0] || 'U'}</div>
                                        )}
                                        <div className="medal-badge gold">1</div>
                                    </div>
                                    <div className="podium-info">
                                        <span className="username">{profiles[0].username || 'Usuário'}</span>
                                        <span className="xp">{profiles[0].xp} XP</span>
                                    </div>
                                </div>
                            )}

                            {profiles[2] && (
                                <div className="podium-item bronze">
                                    <div className="avatar-wrapper">
                                        {profiles[2].avatar_url ? (
                                            <img src={profiles[2].avatar_url} alt={profiles[2].username} />
                                        ) : (
                                            <div className="avatar-placeholder">{profiles[2].username?.[0] || 'U'}</div>
                                        )}
                                        <div className="medal-badge bronze">3</div>
                                    </div>
                                    <div className="podium-info">
                                        <span className="username">{profiles[2].username || 'Usuário'}</span>
                                        <span className="xp">{profiles[2].xp} XP</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* List of others */}
                        <div className="rankings-list">
                            {profiles.slice(3).map((profile, index) => (
                                <div
                                    key={profile.id}
                                    className={`ranking-item ${profile.id === (session?.user as any)?.id ? 'current-user' : ''}`}
                                >
                                    <div className="rank-position">{index + 4}</div>
                                    <div className="user-info">
                                        <div className="avatar-small">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt={profile.username} />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </div>
                                        <div className="user-details">
                                            <span className="username">{profile.username || 'Usuário'}</span>
                                            <span className="level-badge">{profile.level || 'N5'}</span>
                                        </div>
                                    </div>
                                    <div className="user-xp">
                                        {profile.xp} <span className="xp-label">XP</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
