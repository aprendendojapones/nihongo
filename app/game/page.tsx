"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trophy, ArrowLeft, HelpCircle, CheckCircle2, XCircle, Star, RefreshCw, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { JAPANESE_DATA } from '@/data/japanese';
import PCHandwritingView from '@/components/PCHandwritingView';
import { useTranslation } from '@/components/TranslationContext';
import './game.css';

function GameContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { t } = useTranslation();
    const user = session?.user as any;
    const inputRef = useRef<HTMLInputElement>(null);

    const levelId = searchParams.get('level') || 'katakana';
    const isTest = searchParams.get('mode') === 'test';

    // Game State
    const [shuffledData, setShuffledData] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [showHint, setShowHint] = useState(false);
    
    // New Features State
    const [hintMultiplier, setHintMultiplier] = useState(1.0);
    const [correctList, setCorrectList] = useState<any[]>([]);
    const [wrongList, setWrongList] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize and Load Persistence
    useEffect(() => {
        const savedState = localStorage.getItem(`game_state_${levelId}`);
        const levelData = JAPANESE_DATA[levelId as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.katakana;

        if (savedState) {
            const state = JSON.parse(savedState);
            setShuffledData(state.shuffledData);
            setCurrentIndex(state.currentIndex);
            setScore(state.score);
            setHintMultiplier(state.hintMultiplier);
            setCorrectList(state.correctList);
            setWrongList(state.wrongList);
            setUserInput(state.userInput || '');
        } else {
            // Shuffle data for new game
            const shuffled = [...levelData].sort(() => Math.random() - 0.5);
            setShuffledData(shuffled);
            setUserInput('');
        }
        setIsLoaded(true);
    }, [levelId]);

    // Save Persistence
    useEffect(() => {
        if (isLoaded && !isFinished) {
            const state = {
                shuffledData,
                currentIndex,
                score,
                hintMultiplier,
                correctList,
                wrongList,
                userInput
            };
            localStorage.setItem(`game_state_${levelId}`, JSON.stringify(state));
        }
    }, [isLoaded, isFinished, shuffledData, currentIndex, score, hintMultiplier, correctList, wrongList, levelId, userInput]);

    // Auto-focus input
    useEffect(() => {
        if (!feedback && !isFinished && inputRef.current) {
            inputRef.current.focus();
        }
    }, [feedback, isFinished, currentIndex]);

    const currentItem = shuffledData[currentIndex];

    const handleHint = () => {
        if (!showHint && currentItem) {
            setShowHint(true);
            // Pre-fill first letter ONLY when hint is requested
            if (userInput.length === 0) {
                setUserInput(currentItem.romaji.charAt(0));
            }
            // Penalty logic: first hint 50%, then -10% each
            setHintMultiplier(prev => {
                if (prev > 0.5) return 0.5;
                return Math.max(0.1, prev - 0.1);
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserInput(value);

        if (currentItem && value.toLowerCase().trim() === currentItem.romaji.toLowerCase()) {
            triggerCorrect();
        }
    };

    const triggerCorrect = () => {
        if (feedback) return;
        setFeedback('correct');
        const pointsGained = Math.round(10 * hintMultiplier);
        setScore(s => s + pointsGained);
        setCorrectList(prev => [...prev, currentItem]);
        
        if (!showHint) {
            setHintMultiplier(prev => Math.min(1.0, prev + 0.1));
        }

        if (currentIndex === shuffledData.length - 1) {
            setTimeout(finishGame, 1000);
        } else {
            setTimeout(() => {
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                setUserInput(''); // No auto-fill for next item
                setFeedback(null);
                setShowHint(false);
            }, 1000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentItem && userInput.toLowerCase().trim() === currentItem.romaji.toLowerCase()) {
            triggerCorrect();
        } else if (!feedback) {
            setFeedback('wrong');
            if (!wrongList.find(item => item.char === currentItem.char)) {
                setWrongList(prev => [...prev, currentItem]);
            }
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const finishGame = async () => {
        setIsFinished(true);
        localStorage.removeItem(`game_state_${levelId}`);
        
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3effa2', '#ff3e3e', '#ffffff']
        });

        if (user) {
            const xpGained = score + (isTest ? 500 : 100);
            await supabase.rpc('increment_xp', { user_id: user.id, amount: xpGained });

            const lessonId = isTest ? `${levelId}_test` : levelId;
            await supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    lesson_id: lessonId,
                    completed: true,
                    score: score
                });
        }
    };

    const resetGame = () => {
        if (confirm(t('confirm_reset_game') || 'Reset game progress?')) {
            localStorage.removeItem(`game_state_${levelId}`);
            window.location.reload();
        }
    };

    if (!isLoaded || !currentItem) {
        return <div className="flex-center" style={{ height: '100vh' }}>{t('loading')}...</div>;
    }

    if (isFinished) {
        return (
            <div className="game-container">
                <div className="glass-card game-completion-card animate-fade-in">
                    <Trophy size={80} color="var(--accent-secondary)" className="completion-icon" />
                    <h1 className="gradient-text completion-title">{t('congratulations')}!</h1>
                    <p>{t('level_completed').replace('{level}', levelId)}</p>

                    <div className="completion-stats">
                        <div className="completion-stat-item">
                            <span className="completion-stat-label">Score</span>
                            <span className="completion-stat-value">{score}</span>
                        </div>
                        <div className="completion-stat-item">
                            <span className="completion-stat-label">XP</span>
                            <span className="completion-stat-value">+{score + (isTest ? 500 : 100)}</span>
                        </div>
                    </div>

                    <div className="completion-actions">
                        <button className="btn-primary" onClick={() => router.push('/lessons')}>
                            {t('back_to_lessons')}
                        </button>
                        <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--accent-primary)' }} onClick={() => window.location.reload()}>
                            <RefreshCw size={18} /> {t('play_again')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="game-layout">
            <aside className="game-side-list wrong-list">
                <h3>{t('wrong') || 'Wrong'}</h3>
                <div className="list-items">
                    {wrongList.map((item, i) => (
                        <div key={i} className="list-item wrong">{item.char}</div>
                    ))}
                </div>
            </aside>

            <div className="game-container">
                <header className="game-header">
                    <button className="icon-button" onClick={() => router.back()}>
                        <ArrowLeft size={24} />
                    </button>
                    <div className="game-progress-container">
                        <div
                            className="game-progress-fill"
                            style={{ width: `${(currentIndex / shuffledData.length) * 100}%` }}
                        />
                    </div>
                    <div className="game-stats">
                        <div className="multiplier-badge" title="Score Multiplier">
                            {(hintMultiplier * 100).toFixed(0)}%
                        </div>
                        <Star size={20} color="var(--accent-secondary)" />
                        <span style={{ fontWeight: 'bold' }}>{score}</span>
                    </div>
                </header>

                <main className="glass-card game-card">
                    <p className="question-label">{isTest ? t('test_mode') : t('practice_mode')}</p>
                    <h2 className="question-main">{currentItem.char}</h2>
                    {showHint && <p className="question-sub">{currentItem.romaji}</p>}

                    {currentItem.type === 'kanji' && (
                        <div style={{ width: '100%', marginBottom: '2rem' }}>
                            <PCHandwritingView />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="game-input-container">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={handleInputChange}
                            placeholder={t('type_romaji')}
                            className="game-input"
                            disabled={!!feedback}
                        />
                    </form>

                    {feedback && (
                        <div className={`feedback-message ${feedback === 'correct' ? 'feedback-correct' : 'feedback-wrong'}`}>
                            {feedback === 'correct' ? (
                                <><CheckCircle2 size={24} /> {t('correct')}!</>
                            ) : (
                                <><XCircle size={24} /> {t('try_again')}</>
                            )}
                        </div>
                    )}
                </main>

                <footer className="game-footer">
                    <button className="hint-button" onClick={handleHint}>
                        <HelpCircle size={20} /> {t('hint')}
                    </button>
                    <p style={{ color: 'var(--text-muted)' }}>{currentIndex + 1} / {shuffledData.length}</p>
                    <button className="hint-button" onClick={resetGame} title={t('reset_game')}>
                        <RotateCcw size={20} />
                    </button>
                </footer>
            </div>

            <aside className="game-side-list correct-list">
                <h3>{t('correct') || 'Correct'}</h3>
                <div className="list-items">
                    {correctList.map((item, i) => (
                        <div key={i} className="list-item correct">{item.char}</div>
                    ))}
                </div>
            </aside>
        </div>
    );
}

export default function GamePage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div className="flex-center" style={{ height: '100vh' }}>{t('loading')}...</div>}>
            <GameContent />
        </Suspense>
    );
}
