"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Medal, Crown, User, Swords } from 'lucide-react';
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

interface Tournament {
    id: string;
    title: string;
    end_date: string;
}

interface TournamentEntry {
    score: number;
    user: Profile;
}

export default function RankingsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { t } = useTranslation();
    
    // State
    const [activeTab, setActiveTab] = useState<'global' | 'tournament'>('tournament');
    const [profiles, setProfiles] = useState<Profile[]>([]); // Global
    const [tournamententries, setTournamentEntries] = useState<TournamentEntry[]>([]); // Tournament
    const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'global') {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, xp, level')
                    .order('xp', { ascending: false })
                    .limit(50);
                setProfiles(data || []);
            } else {
                // Fetch Active Tournament
                const { data: tourneys } = await supabase
                    .from('tournaments')
                    .select('*')
                    .eq('is_active', true)
                    .gt('end_date', new Date().toISOString())
                    .limit(1);
                
                const tournament = tourneys?.[0];
                setActiveTournament(tournament || null);

                if (tournament) {
                    const { data: entries } = await supabase
                        .from('tournament_entries')
                        .select(`
                            score,
                            user:profiles (id, username, full_name, avatar_url, level)
                        `)
                        .eq('tournament_id', tournament.id)
                        .order('score', { ascending: false })
                        .limit(50);
                    
                    // Transform structure to flat profile for display
                    setTournamentEntries(entries as any || []);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderList = (items: any[], isTournament: boolean) => {
        // ... (Logic to render list, reused)
        const top3 = items.slice(0, 3);
        const rest = items.slice(3);

        return (
            <>
                {/* Podium */}
                <div className="podium-container">
                    {top3[1] && <PodiumItem item={top3[1]} rank={2} isTournament={isTournament} />}
                    {top3[0] && <PodiumItem item={top3[0]} rank={1} isTournament={isTournament} />}
                    {top3[2] && <PodiumItem item={top3[2]} rank={3} isTournament={isTournament} />}
                </div>
                {/* List */}
                <div className="rankings-list">
                    {rest.map((item, idx) => (
                        <RankingItem 
                            key={idx} 
                            item={item} 
                            rank={idx + 4} 
                            isTournament={isTournament} 
                            currentUserId={(session?.user as any)?.id} 
                        />
                    ))}
                    {rest.length === 0 && top3.length === 0 && (
                        <p className="text-center text-gray-500 mt-10">Nenhum participante ainda.</p>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className="rankings-page">
            <header className="rankings-header">
                <button className="icon-button" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="gradient-text">Ranking</h1>
                    <div className="flex gap-4 mt-4">
                        <button 
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'tournament' ? 'bg-accent-primary text-black' : 'bg-white/10 text-gray-400'}`}
                            onClick={() => setActiveTab('tournament')}
                        >
                            <div className="flex items-center gap-2">
                                <Swords size={16} /> Torneio Semanal
                            </div>
                        </button>
                        <button 
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'global' ? 'bg-accent-secondary text-black' : 'bg-white/10 text-gray-400'}`}
                            onClick={() => setActiveTab('global')}
                        >
                            <div className="flex items-center gap-2">
                                <Trophy size={16} /> Global
                            </div>
                        </button>
                    </div>
                </div>
                <div className="header-spacer"></div>
            </header>

            <main className="rankings-container">
                {loading ? (
                    <div className="loading-spinner">Carregando...</div>
                ) : activeTab === 'tournament' ? (
                    activeTournament ? (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-white">{activeTournament.title}</h2>
                                <p className="text-sm text-gray-400">Termina em {new Date(activeTournament.end_date).toLocaleDateString()}</p>
                            </div>
                            {renderList(tournamententries.map(e => ({ ...e.user, xp: e.score })), true)}
                        </>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <Swords size={64} className="mx-auto mb-4 opacity-50" />
                            <p>Nenhum torneio ativo no momento.</p>
                        </div>
                    )
                ) : (
                    renderList(profiles, false)
                )}
            </main>
        </div>
    );
}

// Helper Components
const PodiumItem = ({ item, rank, isTournament }: any) => (
    <div className={`podium-item ${rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze'}`}>
        {rank === 1 && <div className="crown-icon"><Crown size={40} color="#FFD700" /></div>}
        <div className="avatar-wrapper">
            {item.avatar_url ? (
                <img src={item.avatar_url} alt={item.username} />
            ) : (
                <div className="avatar-placeholder">{item.username?.[0] || 'U'}</div>
            )}
            <div className={`medal-badge ${rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze'}`}>{rank}</div>
        </div>
        <div className="podium-info">
            <span className="username">{item.username || 'Usuário'}</span>
            <span className="xp">{item.xp} {isTournament ? 'Pts' : 'XP'}</span>
        </div>
    </div>
);

const RankingItem = ({ item, rank, isTournament, currentUserId }: any) => (
    <div className={`ranking-item ${item.id === currentUserId ? 'current-user' : ''}`}>
        <div className="rank-position">{rank}</div>
        <div className="user-info">
            <div className="avatar-small">
                {item.avatar_url ? (
                    <img src={item.avatar_url} alt={item.username} />
                ) : (
                    <User size={20} />
                )}
            </div>
            <div className="user-details">
                <span className="username">{item.username || 'Usuário'}</span>
                <span className="level-badge">{item.level || 'N5'}</span>
            </div>
        </div>
        <div className="user-xp">
            {item.xp} <span className="xp-label">{isTournament ? 'Pts' : 'XP'}</span>
        </div>
    </div>
);
