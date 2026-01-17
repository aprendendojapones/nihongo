"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowLeft, School, Globe, User } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext';
import './rankings.css';

type RankingUser = {
    id: string;
    username: string;
    xp: number;
    school_name?: string;
    avatar_url?: string;
};

export default function RankingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const user = session?.user as any;

    const [activeTab, setActiveTab] = useState<'global' | 'school'>('global');
    const [rankings, setRankings] = useState<RankingUser[]>([]);
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
        const fetchRankings = async () => {
            setLoading(true);
            let query = supabase
                .from('profiles')
                .select('id, username, xp, avatar_url, schools(name)')
                .order('xp', { ascending: false })
                .limit(50);

            if (activeTab === 'school') {
                if (!userSchoolId) {
                    setRankings([]);
                    setLoading(false);
                    return;
                }
                query = query.eq('school_id', userSchoolId);
            }

            const { data, error } = await query;

            if (data) {
                const formattedData: RankingUser[] = data.map((profile: any) => ({
                    id: profile.id,
                    username: profile.username || 'Estudante',
                    xp: profile.xp,
                    school_name: profile.schools?.name,
                    avatar_url: profile.avatar_url
                }));
                setRankings(formattedData);
            }
            setLoading(false);
        };

        fetchRankings();
    }, [activeTab, userSchoolId]);

    return (
        <div className="rankings-container">
            <header className="rankings-header">
                <button className="icon-button" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{t('rankings') || 'Rankings'}</h1>
            </header>

            <div className="rankings-tabs">
                <button
                    className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => setActiveTab('global')}
                >
                    <Globe size={18} /> {t('global_ranking') || 'Global'}
                </button>
                <button
                    className={`tab-button ${activeTab === 'school' ? 'active' : ''}`}
                    onClick={() => setActiveTab('school')}
                    disabled={!userSchoolId}
                    title={!userSchoolId ? "Você não está em uma escola" : ""}
                >
                    <School size={18} /> {t('school_ranking') || 'Escola'}
                </button>
            </div>

            <main className="glass-card rankings-list-container">
                {loading ? (
                    <div className="loading-state">{t('loading')}...</div>
                ) : rankings.length > 0 ? (
                    <div className="rankings-list">
                        {rankings.map((rankUser, index) => (
                            <div
                                key={rankUser.id}
                                className={`ranking-item ${rankUser.id === user?.id ? 'current-user' : ''}`}
                            >
                                <div className="rank-position">
                                    {index < 3 ? <Trophy size={20} className={`trophy-${index + 1}`} /> : `#${index + 1}`}
                                </div>
                                <div className="rank-user-info">
                                    {rankUser.avatar_url ? (
                                        <img src={rankUser.avatar_url} alt="Avatar" className="rank-avatar" />
                                    ) : (
                                        <div className="rank-avatar-placeholder"><User size={20} /></div>
                                    )}
                                    <div className="rank-details">
                                        <span className="rank-username">{rankUser.username}</span>
                                        {activeTab === 'global' && rankUser.school_name && (
                                            <span className="rank-school">{rankUser.school_name}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="rank-xp">
                                    {rankUser.xp} XP
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Trophy size={48} className="empty-icon" />
                        <p>{activeTab === 'school' ? 'Sua escola ainda não tem alunos no ranking.' : 'Nenhum ranking disponível.'}</p>
                    </div>
                )}
            </main>
        </div>
    );
}
