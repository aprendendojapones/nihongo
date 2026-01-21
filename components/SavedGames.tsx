"use client";

import { useState, useEffect } from 'react';
import { Play, Trash2, Clock, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface GameSave {
    id: string;
    level_id: string;
    game_mode: string;
    progress_data: any;
    current_index: number;
    score: number;
    created_at: string;
    updated_at: string;
}

const MODE_NAMES: Record<string, string> = {
    quiz: 'Quiz',
    timed: 'Contra o Tempo',
    memory: 'Memória',
    matching: 'Combinação',
    study: 'Estudo',
    test: 'Teste'
};

export default function SavedGames() {
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user as any;
    const [savedGames, setSavedGames] = useState<GameSave[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchSavedGames();
        }
    }, [user]);

    const fetchSavedGames = async () => {
        const { data, error } = await supabase
            .from('game_saves')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(10);

        if (data) {
            setSavedGames(data);
        }
        setLoading(false);
    };

    const continueGame = (save: GameSave) => {
        // Store the save ID in sessionStorage to load it in the game page
        sessionStorage.setItem('loadGameSave', save.id);
        router.push(`/game?level=${save.level_id}&mode=${save.game_mode}`);
    };

    const deleteSave = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este jogo salvo?')) return;

        const { error } = await supabase
            .from('game_saves')
            .delete()
            .eq('id', id);

        if (!error) {
            setSavedGames(savedGames.filter(s => s.id !== id));
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return 'Agora mesmo';
        if (hours < 24) return `${hours}h atrás`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d atrás`;
        return date.toLocaleDateString('pt-BR');
    };

    if (loading) {
        return <div className="flex-center"><div className="loader"></div></div>;
    }

    if (savedGames.length === 0) {
        return (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <Trophy size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: 'var(--text-muted)' }}>Nenhum jogo salvo</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Seus jogos salvos aparecerão aqui
                </p>
            </div>
        );
    }

    return (
        <div className="saved-games-container">
            <h2 className="gradient-text" style={{ marginBottom: '2rem' }}>Jogos Salvos</h2>

            <div className="saved-games-grid">
                {savedGames.map((save) => (
                    <div key={save.id} className="glass-card saved-game-card">
                        <div className="saved-game-info">
                            <h3>{save.level_id.toUpperCase()}</h3>
                            <p className="game-mode">{MODE_NAMES[save.game_mode] || save.game_mode}</p>

                            <div className="game-stats">
                                <div className="stat">
                                    <Trophy size={16} color="var(--accent-secondary)" />
                                    <span>{save.score} pts</span>
                                </div>
                                <div className="stat">
                                    <Clock size={16} color="var(--text-muted)" />
                                    <span>{formatDate(save.updated_at)}</span>
                                </div>
                            </div>

                            {save.progress_data?.total && (
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${(save.current_index / save.progress_data.total) * 100}%`
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="saved-game-actions">
                            <button
                                className="btn-primary"
                                onClick={() => continueGame(save)}
                            >
                                <Play size={18} /> Continuar
                            </button>
                            <button
                                className="btn-icon"
                                onClick={() => deleteSave(save.id)}
                                title="Deletar"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .saved-games-container {
                    padding: 2rem;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .saved-games-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .saved-game-card {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .saved-game-info h3 {
                    font-size: 1.3rem;
                    margin: 0 0 0.5rem 0;
                    color: var(--accent-primary);
                }

                .game-mode {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin: 0 0 1rem 0;
                }

                .game-stats {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 1rem;
                }

                .stat {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .progress-bar {
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 1rem;
                }

                .progress-fill {
                    height: 100%;
                    background: var(--accent-primary);
                    transition: width 0.3s ease;
                }

                .saved-game-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .saved-game-actions .btn-primary {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .btn-icon {
                    padding: 0.8rem;
                    border: 2px solid var(--glass-border);
                    border-radius: 8px;
                    background: transparent;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-icon:hover {
                    border-color: #ff3e3e;
                    color: #ff3e3e;
                }
            `}</style>
        </div>
    );
}
