"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trophy, ArrowLeft, HelpCircle, CheckCircle2, XCircle, Star, RefreshCw, RotateCcw, ChevronLeft, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { JAPANESE_DATA } from '@/data/japanese';
import PCHandwritingView from '@/components/PCHandwritingView';
import { useTranslation } from '@/components/TranslationContext';
import FinalExam from '@/components/FinalExam';
import VirtualKeyboard from '@/components/VirtualKeyboard';
import QuizMode from '@/components/QuizMode';
import TimedMode from '@/components/TimedMode';
import MemoryMode from '@/components/MemoryMode';
import MatchingMode from '@/components/MatchingMode';
import './game.css';

// Repetition Mode: For Hiragana/Katakana
// Phase 1: Practice 10 times (show character + romaji)
// Phase 2: Test 5 times (must get correct to advance)
function RepetitionMode({ levelId }: { levelId: string }) {
    const router = useRouter();
    const { t } = useTranslation();
    const { data: session } = useSession();
    const user = session?.user as any;
    const inputRef = useRef<HTMLInputElement>(null);

    const [shuffledData, setShuffledData] = useState<any[]>([]);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [practiceCount, setPracticeCount] = useState(0); // 0-9 for practice phase
    const [testCorrectCount, setTestCorrectCount] = useState(0); // 0-4 for test phase
    const [phase, setPhase] = useState<'practice' | 'test'>('practice');
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const levelData = JAPANESE_DATA[levelId as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.katakana;
        setShuffledData([...levelData]);
    }, [levelId]);

    useEffect(() => {
        if (!feedback && !isFinished && inputRef.current) {
            inputRef.current.focus();
        }
    }, [feedback, isFinished, currentCharIndex, phase]);

    const currentItem = shuffledData[currentCharIndex];

    const handleNext = () => {
        if (phase === 'practice') {
            if (practiceCount < 9) {
                setPracticeCount(practiceCount + 1);
            } else {
                // Move to test phase
                setPhase('test');
                setPracticeCount(0);
                setTestCorrectCount(0);
            }
        }
        setUserInput('');
        setFeedback(null);
    };

    const handleBack = () => {
        if (currentCharIndex > 0) {
            setCurrentCharIndex(currentCharIndex - 1);
            setPhase('practice');
            setPracticeCount(0);
            setTestCorrectCount(0);
            setUserInput('');
            setFeedback(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentItem) return;

        const isCorrect = userInput.toLowerCase().trim() === currentItem.romaji.toLowerCase() ||
            userInput === currentItem.char;

        if (isCorrect) {
            setFeedback('correct');
            setScore(s => s + 10);

            if (phase === 'test') {
                if (testCorrectCount < 4) {
                    setTestCorrectCount(testCorrectCount + 1);
                    setTimeout(() => {
                        setUserInput('');
                        setFeedback(null);
                    }, 800);
                } else {
                    // Completed test phase, move to next character
                    setTimeout(() => {
                        if (currentCharIndex === shuffledData.length - 1) {
                            finishGame();
                        } else {
                            setCurrentCharIndex(currentCharIndex + 1);
                            setPhase('practice');
                            setPracticeCount(0);
                            setTestCorrectCount(0);
                            setUserInput('');
                            setFeedback(null);
                        }
                    }, 800);
                }
            } else {
                setTimeout(() => {
                    handleNext();
                }, 800);
            }
        } else {
            setFeedback('wrong');
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const finishGame = async () => {
        setIsFinished(true);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3effa2', '#ff3e3e', '#ffffff']
        });

        if (user) {
            const xpGained = score + 100;
            await supabase.rpc('increment_xp', { user_id: user.id, amount: xpGained });
            await supabase.from('user_progress').upsert({
                user_id: user.id,
                lesson_id: levelId,
                completed: true,
                score: score
            });
        }
    };

    if (!currentItem) {
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
                            <span className="completion-stat-value">+{score + 100}</span>
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
        <div className="game-container">
            <header className="game-header">
                <button className="icon-button" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </button>
                <div className="game-progress-container">
                    <div
                        className="game-progress-fill"
                        style={{ width: `${(currentCharIndex / shuffledData.length) * 100}%` }}
                    />
                </div>
                <div className="game-stats">
                    <Star size={20} color="var(--accent-secondary)" />
                    <span style={{ fontWeight: 'bold' }}>{score}</span>
                </div>
            </header>

            <main className="game-main">
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <span style={{
                        background: phase === 'practice' ? 'rgba(62, 255, 162, 0.2)' : 'rgba(255, 62, 62, 0.2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: phase === 'practice' ? '#3effa2' : '#ff3e3e'
                    }}>
                        {phase === 'practice' ? `Prática ${practiceCount + 1}/10` : `Teste ${testCorrectCount + 1}/5`}
                    </span>
                </div>

                <div className="game-question-display">
                    <span className="game-char">{currentItem.char}</span>
                    {phase === 'practice' && (
                        <span className="game-meaning" style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>
                            {currentItem.romaji}
                        </span>
                    )}
                </div>

                {phase === 'practice' ? (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button className="btn-primary" onClick={handleNext} style={{ minWidth: '200px' }}>
                            <Eye size={20} /> Próximo
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="game-input-container">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={t('type_romaji')}
                            className="game-input"
                            disabled={!!feedback}
                        />
                    </form>
                )}

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
                <button
                    className="hint-button"
                    onClick={handleBack}
                    disabled={currentCharIndex === 0}
                    style={{ opacity: currentCharIndex === 0 ? 0.5 : 1 }}
                >
                    <ChevronLeft size={20} /> Voltar
                </button>
                <p style={{ color: 'var(--text-muted)' }}>
                    {currentCharIndex + 1} / {shuffledData.length}
                </p>
                <div style={{ width: '80px' }}></div>
            </footer>
        </div>
    );
}

// Original game content (for other levels)
function GameContent({ levelId, mode }: { levelId: string, mode: string }) {
    // ... (keep existing GameContent implementation)
    const router = useRouter();
    const { data: session } = useSession();
    const { t } = useTranslation();
    const user = session?.user as any;
    const inputRef = useRef<HTMLInputElement>(null);

    const isTest = mode === 'test';

    // Game State
    const [shuffledData, setShuffledData] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(false);

    // New Features State
    const [hintMultiplier, setHintMultiplier] = useState(1.0);
    const [correctList, setCorrectList] = useState<any[]>([]);
    const [wrongList, setWrongList] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize and Load Persistence
    useEffect(() => {
        const savedState = localStorage.getItem(`game_state_${levelId}`);
        const levelData = JAPANESE_DATA[levelId as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.katakana;

        if (savedState && !isTest) { // Don't load persistence for test mode
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
    }, [levelId, isTest]);

    // Save Persistence
    useEffect(() => {
        if (isLoaded && !isFinished && !isTest) {
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
    }, [isLoaded, isFinished, shuffledData, currentIndex, score, hintMultiplier, correctList, wrongList, levelId, userInput, isTest]);

    // Auto-focus input
    useEffect(() => {
        if (!feedback && !isFinished && inputRef.current) {
            inputRef.current.focus();
        }
    }, [feedback, isFinished, currentIndex]);

    const currentItem = shuffledData[currentIndex];

    const handleHint = () => {
        if (!showHint && currentItem && !isTest) {
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

        if (currentItem && (
            value.toLowerCase().trim() === currentItem.romaji.toLowerCase() ||
            value === currentItem.char
        )) {
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
        if (currentItem && (
            userInput.toLowerCase().trim() === currentItem.romaji.toLowerCase() ||
            userInput === currentItem.char
        )) {
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

                <main className="game-main">
                    <div className="game-question-display">
                        <span className="game-char">{currentItem.char}</span>
                        {currentItem.meaning && (
                            <span className="game-meaning">{currentItem.meaning}</span>
                        )}
                    </div>

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
                    {!isTest && (
                        <button className="hint-button" onClick={handleHint}>
                            <HelpCircle size={20} /> {t('hint')}
                        </button>
                    )}
                    <p style={{ color: 'var(--text-muted)' }}>{currentIndex + 1} / {shuffledData.length}</p>
                    <button className="hint-button" onClick={resetGame} title={t('reset_game')}>
                        <RotateCcw size={20} />
                    </button>
                </footer>
            </div >

            <aside className="game-side-list correct-list">
                <h3>{t('correct') || 'Correct'}</h3>
                <div className="list-items">
                    {correctList.map((item, i) => (
                        <div key={i} className="list-item correct">{item.char}</div>
                    ))}
                </div>
            </aside>
        </div >
    );
}

function GamePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const levelId = searchParams.get('level') || 'katakana';
    const mode = searchParams.get('mode') || 'study'; // study, game, test, final_exam

    const handleExamComplete = async (passed: boolean, score: number) => {
        if (passed) {
            // Save progress
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('user_progress').upsert({
                    user_id: user.id,
                    lesson_id: levelId,
                    completed: true,
                    score: score,
                    updated_at: new Date().toISOString()
                });
            }
            router.push('/lessons');
        }
    };

    const handlePracticeComplete = async (score: number, maxScore: number, timeSpent: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('practice_results').insert({
                user_id: user.id,
                game_mode: mode,
                level_id: levelId,
                score: score,
                max_score: maxScore,
                time_spent: timeSpent
            });
        }
        // Show completion screen or redirect
        setScore(score);
        setIsFinished(true);
    };

    if (mode === 'final_exam') {
        // Extract level (N5, N4, etc.) from levelId (e.g., n5_final -> N5)
        const examLevel = levelId.split('_')[0].toUpperCase();
        return (
            <FinalExam
                level={examLevel}
                onComplete={handleExamComplete}
                onCancel={() => router.back()}
            />
        );
    }

    // New Modes Integration
    if (mode === 'quiz') {
        const levelData = JAPANESE_DATA[levelId as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.katakana;
        return (
            <div className="game-container">
                <header className="game-header">
                    <button className="icon-button" onClick={() => router.back()}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="gradient-text">Quiz</h1>
                    <div style={{ width: 40 }}></div>
                </header>
                <main className="game-main">
                    <QuizMode
                        characters={levelData}
                        onComplete={(score) => handlePracticeComplete(score, 100, 0)}
                    />
                </main>
            </div>
        );
    }

    if (mode === 'timed') {
        const levelData = JAPANESE_DATA[levelId as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.katakana;
        return (
            <div className="game-container">
                <header className="game-header">
                    <button className="icon-button" onClick={() => router.back()}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="gradient-text">Contra o Tempo</h1>
                    <div style={{ width: 40 }}></div>
                </header>
                <main className="game-main">
                    <TimedMode
                        characters={levelData}
                        onComplete={(score) => handlePracticeComplete(score, 0, 60)}
                    />
                </main>
            </div>
        );
    }

    if (mode === 'memory') {
        const levelData = JAPANESE_DATA[levelId as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.katakana;
        return (
            <div className="game-container">
                <header className="game-header">
                    <button className="icon-button" onClick={() => router.back()}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="gradient-text">Memória</h1>
                    <div style={{ width: 40 }}></div>
                </header>
                <main className="game-main">
                    <MemoryMode
                        characters={levelData}
                        onComplete={(score) => handlePracticeComplete(score, 100, 0)}
                    />
                </main>
            </div>
        );
    }

    if (mode === 'matching') {
        const levelData = JAPANESE_DATA[levelId as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.katakana;
        return (
            <div className="game-container">
                <header className="game-header">
                    <button className="icon-button" onClick={() => router.back()}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="gradient-text">Combinação</h1>
                    <div style={{ width: 40 }}></div>
                </header>
                <main className="game-main">
                    <MatchingMode
                        characters={levelData}
                        onComplete={(score) => handlePracticeComplete(score, 100, 0)}
                    />
                </main>
            </div>
        );
    }

    // Use repetition mode for hiragana and katakana (default study mode)
    if (levelId === 'hiragana' || levelId === 'katakana') {
        return <RepetitionMode levelId={levelId} />;
    }

    return <GameContent levelId={levelId} mode={mode} />;
}

export default function GamePage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div className="flex-center" style={{ height: '100vh' }}>{t('loading')}...</div>}>
            <GamePageContent />
        </Suspense>
    );
}
