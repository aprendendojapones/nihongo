"use client";

import { useState, useEffect } from 'react';
import { Trophy, ArrowRight, Lock, CheckCircle2, Star, Zap, Clock, Brain, Link2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/components/TranslationContext';
import './lessons.css';

interface Level {
    id: string;
    titleKey: string;
    descriptionKey: string;
    type: 'katakana' | 'hiragana' | 'kanji' | 'jlpt';
    requiredLevel?: string;
    xpReward: number;
}

const LEVELS: Level[] = [
    { id: 'katakana', titleKey: 'level_katakana_title', descriptionKey: 'level_katakana_desc', type: 'katakana', xpReward: 500 },
    { id: 'hiragana', titleKey: 'level_hiragana_title', descriptionKey: 'level_hiragana_desc', type: 'hiragana', requiredLevel: 'katakana_test', xpReward: 500 },

    // N5
    { id: 'kanji_basics', titleKey: 'level_n5_kanji_title', descriptionKey: 'level_n5_kanji_desc', type: 'kanji', requiredLevel: 'hiragana_test', xpReward: 1000 },
    { id: 'n5_vocab', titleKey: 'level_n5_vocab_title', descriptionKey: 'level_n5_vocab_desc', type: 'jlpt', requiredLevel: 'kanji_basics_test', xpReward: 1000 },
    { id: 'n5_final', titleKey: 'level_n5_final_title', descriptionKey: 'level_n5_final_desc', type: 'jlpt', requiredLevel: 'n5_vocab_test', xpReward: 2000 },

    // N4
    { id: 'n4_kanji', titleKey: 'level_n4_kanji_title', descriptionKey: 'level_n4_kanji_desc', type: 'kanji', requiredLevel: 'n5_final_test', xpReward: 1500 },
    { id: 'n4_vocab', titleKey: 'level_n4_vocab_title', descriptionKey: 'level_n4_vocab_desc', type: 'jlpt', requiredLevel: 'n4_kanji_test', xpReward: 1500 },
    { id: 'n4_final', titleKey: 'level_n4_final_title', descriptionKey: 'level_n4_final_desc', type: 'jlpt', requiredLevel: 'n4_vocab_test', xpReward: 3000 },

    // N3
    { id: 'n3_kanji', titleKey: 'level_n3_kanji_title', descriptionKey: 'level_n3_kanji_desc', type: 'kanji', requiredLevel: 'n4_final_test', xpReward: 2000 },
    { id: 'n3_vocab', titleKey: 'level_n3_vocab_title', descriptionKey: 'level_n3_vocab_desc', type: 'jlpt', requiredLevel: 'n3_kanji_test', xpReward: 2000 },
    { id: 'n3_final', titleKey: 'level_n3_final_title', descriptionKey: 'level_n3_final_desc', type: 'jlpt', requiredLevel: 'n3_vocab_test', xpReward: 4000 },

    // N2
    { id: 'n2_kanji', titleKey: 'level_n2_kanji_title', descriptionKey: 'level_n2_kanji_desc', type: 'kanji', requiredLevel: 'n3_final_test', xpReward: 3000 },
    { id: 'n2_vocab', titleKey: 'level_n2_vocab_title', descriptionKey: 'level_n2_vocab_desc', type: 'jlpt', requiredLevel: 'n2_kanji_test', xpReward: 3000 },
    { id: 'n2_final', titleKey: 'level_n2_final_title', descriptionKey: 'level_n2_final_desc', type: 'jlpt', requiredLevel: 'n2_vocab_test', xpReward: 6000 },

    // N1
    { id: 'n1_kanji', titleKey: 'level_n1_kanji_title', descriptionKey: 'level_n1_kanji_desc', type: 'kanji', requiredLevel: 'n2_final_test', xpReward: 5000 },
    { id: 'n1_vocab', titleKey: 'level_n1_vocab_title', descriptionKey: 'level_n1_vocab_desc', type: 'jlpt', requiredLevel: 'n1_kanji_test', xpReward: 5000 },
    { id: 'n1_final', titleKey: 'level_n1_final_title', descriptionKey: 'level_n1_final_desc', type: 'jlpt', requiredLevel: 'n1_vocab_test', xpReward: 10000 },
];

const PRACTICE_MODES = [
    { id: 'quiz', icon: Trophy, title: 'Quiz', desc: 'Escolha múltipla', color: '#3effa2' },
    { id: 'timed', icon: Clock, title: 'Contra o Tempo', desc: '60 segundos', color: '#ff3e3e' },
    { id: 'memory', icon: Brain, title: 'Memória', desc: 'Jogo de pares', color: '#00d4ff' },
    { id: 'matching', icon: Link2, title: 'Combinação', desc: 'Conecte os pares', color: '#ffa500' },
];

export default function LessonsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { t } = useTranslation();
    const user = session?.user as any;
    const [completedLevels, setCompletedLevels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [showModeSelector, setShowModeSelector] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProgress();
        }
    }, [user]);

    const fetchProgress = async () => {
        const { data } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('completed', true);

        if (data) {
            setCompletedLevels(data.map(p => p.lesson_id));
        }
        setLoading(false);
    };

    const startLevel = (levelId: string, isTest: boolean = false) => {
        if (isTest) {
            router.push(`/game?level=${levelId}&mode=test`);
        } else if (levelId.includes('final')) {
            router.push(`/game?level=${levelId}&mode=final_exam`);
        } else if (levelId === 'katakana' || levelId === 'hiragana') {
            router.push(`/game?level=${levelId}`);
        } else {
            setSelectedLevel(levelId);
            setShowModeSelector(true);
        }
    };

    const selectMode = (mode: string) => {
        if (selectedLevel) {
            router.push(`/game?level=${selectedLevel}&mode=${mode}`);
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="loader"></div></div>;

    return (
        <div className="lessons-container">
            <header className="lessons-header">
                <h1 className="gradient-text">{t('learning_path')}</h1>
                <p>{t('learning_path_desc')}</p>
            </header>

            <div className="levels-grid">
                {LEVELS.map((level) => {
                    const isUnlocked = !level.requiredLevel || completedLevels.includes(level.requiredLevel);
                    const completed = completedLevels.includes(level.id);

                    return (
                        <div
                            key={level.id}
                            className={`glass-card level-card ${!isUnlocked ? 'locked' : ''}`}
                        >
                            <div className="level-info">
                                <div className="level-icon-container">
                                    {completed ? (
                                        <CheckCircle2 size={32} color="var(--accent-primary)" />
                                    ) : !isUnlocked ? (
                                        <Lock size={32} color="var(--text-muted)" />
                                    ) : (
                                        <Star size={32} color="var(--accent-secondary)" />
                                    )}
                                </div>
                                <div className="level-text">
                                    <h2>{t(level.titleKey)}</h2>
                                    <p>{t(level.descriptionKey)}</p>
                                </div>
                            </div>

                            <div className="level-actions">
                                {isUnlocked ? (
                                    <>
                                        {completed && (
                                            <button
                                                className="btn-primary btn-test"
                                                onClick={() => startLevel(level.id, true)}
                                            >
                                                <Trophy size={18} /> {t('take_test')}
                                            </button>
                                        )}
                                        <button
                                            className="btn-primary"
                                            onClick={() => startLevel(level.id)}
                                        >
                                            {completed ? t('review') : t('start')} <ArrowRight size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="locked-info">
                                        <p>{t('locked')}</p>
                                        <p>{t('locked_desc').replace('{level}', t(LEVELS.find(l => `${l.id}_test` === level.requiredLevel)?.titleKey || 'level_previous'))}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {showModeSelector && (
                <div className="modal-overlay" onClick={() => setShowModeSelector(false)}>
                    <div className="glass-card mode-selector-modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="gradient-text">Escolha o Modo de Prática</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Selecione como você quer praticar
                        </p>

                        <div className="modes-grid">
                            {PRACTICE_MODES.map((mode) => {
                                const Icon = mode.icon;
                                return (
                                    <div
                                        key={mode.id}
                                        className="mode-card"
                                        onClick={() => selectMode(mode.id)}
                                        style={{ borderColor: mode.color }}
                                    >
                                        <Icon size={32} color={mode.color} />
                                        <h3>{mode.title}</h3>
                                        <p>{mode.desc}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            className="btn-primary"
                            onClick={() => setShowModeSelector(false)}
                            style={{ marginTop: '1rem', width: '100%' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
