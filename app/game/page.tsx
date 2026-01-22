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
import HandwritingCanvas from '@/components/HandwritingCanvas';
import TrueFalseMode from '@/components/TrueFalseMode';
import FillBlankMode from '@/components/FillBlankMode';
import AlphabetOrderMode from '@/components/AlphabetOrderMode';
import SentenceScrambleMode from '@/components/SentenceScrambleMode';
import ListeningMode from '@/components/ListeningMode';
import { FILL_BLANK_DATA } from '@/data/fill-blank-data';
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
    const [questionType, setQuestionType] = useState<'char-to-romaji' | 'romaji-to-char'>('char-to-romaji');
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const levelData = JAPANESE_DATA[levelId as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.katakana;
        const shuffled = [...levelData].sort(() => Math.random() - 0.5);
        setShuffledData(shuffled);
    }, [levelId]);

    useEffect(() => {
        if (!feedback && !isFinished && inputRef.current) {
            inputRef.current.focus();
        }
    }, [feedback, isFinished, currentCharIndex, phase]);

    const currentItem = shuffledData[currentCharIndex];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserInput(value);

        const target = questionType === 'char-to-romaji' ? currentItem.romaji : currentItem.char;
        if (value.toLowerCase().trim() === target.toLowerCase()) {
            handleCorrect();
        }
    };

    const handleCorrect = () => {
        if (feedback) return;
        setFeedback('correct');
        setScore(s => s + 10);

        setTimeout(() => {
            setFeedback(null);
            setUserInput('');

            if (phase === 'practice') {
                if (practiceCount < 9) {
                    setPracticeCount(p => p + 1);
                    // Cycle through characters
                    setCurrentCharIndex((currentCharIndex + 1) % shuffledData.length);
                } else {
                    setPhase('test');
                    setPracticeCount(0);
                    setCurrentCharIndex(Math.floor(Math.random() * shuffledData.length));
                    setQuestionType(Math.random() > 0.5 ? 'char-to-romaji' : 'romaji-to-char');
                }
            } else {
                if (testCorrectCount < 4) {
                    setTestCorrectCount(t => t + 1);
                    setCurrentCharIndex(Math.floor(Math.random() * shuffledData.length));
                    setQuestionType(Math.random() > 0.5 ? 'char-to-romaji' : 'romaji-to-char');
                } else {
                    finishGame();
                }
            }
        }, 800);
    };

    const finishGame = async () => {
        setIsFinished(true);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        if (user) {
            await supabase.rpc('increment_xp', { user_id: user.id, amount: 100 });
            await supabase.from('user_progress').upsert({
                user_id: user.id,
                lesson_id: levelId,
                completed: true,
                score: score
            });
        }
    };

    if (!currentItem) return <div className="loading-container">{t('loading')}...</div>;

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
                    </div>
                    <div className="completion-actions">
                        <button className="btn-primary" onClick={() => router.push('/lessons')}>
                            {t('back_to_lessons')}
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
                        style={{ width: `${phase === 'practice' ? (practiceCount / 10) * 100 : (testCorrectCount / 5) * 100}%` }}
                    />
                </div>
                <div className="game-stats">
                    <Star size={20} color="var(--accent-secondary)" />
                    <span className="score-value">{score}</span>
                </div>
            </header>

            <main className="glass-card game-card">
                <div className="phase-indicator-container">
                    <span className={`phase-indicator ${phase === 'practice' ? 'phase-practice' : 'phase-test'}`}>
                        {phase === 'practice' ? `${t('practice')} ${practiceCount + 1}/10` : `${t('test')} ${testCorrectCount + 1}/5`}
                    </span>
                </div>

                <div className="game-question-display">
                    <h2 className="game-char">{questionType === 'char-to-romaji' ? currentItem.char : currentItem.romaji}</h2>
                    {phase === 'practice' && questionType === 'char-to-romaji' && (
                        <p className="game-romaji">{currentItem.romaji}</p>
                    )}
                </div>

                <div className="game-input-container">
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        placeholder={questionType === 'char-to-romaji' ? t('type_romaji') : t('type_character')}
                        className="game-input"
                        disabled={!!feedback}
                    />
                </div>

                {feedback && (
                    <div className={`feedback-message ${feedback === 'correct' ? 'feedback-correct' : 'feedback-wrong'}`}>
                        {feedback === 'correct' ? <><CheckCircle2 size={24} /> {t('correct')}!</> : <><XCircle size={24} /> {t('try_again')}</>}
                    </div>
                )}
            </main>
        </div>
    );
}

function GamePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { t } = useTranslation();
    const user = session?.user as any;

    const levelId = searchParams.get('level') || 'katakana';
    const mode = searchParams.get('mode') || 'study';

    const handlePracticeComplete = async (finalScore: number, xp: number, coins: number) => {
        if (user) {
            await supabase.rpc('increment_xp', { user_id: user.id, amount: xp });
            await supabase.from('user_progress').upsert({
                user_id: user.id,
                lesson_id: `${levelId}_${mode}`,
                completed: true,
                score: finalScore
            });
        }
        router.push('/lessons');
    };

    const handleExamComplete = async (results: any) => {
        if (user) {
            await supabase.rpc('increment_xp', { user_id: user.id, amount: 1000 });
            await supabase.from('user_progress').upsert({
                user_id: user.id,
                lesson_id: `${levelId}_exam`,
                completed: true,
                score: results.score
            });
        }
        router.push('/lessons');
    };

    if (mode === 'final_exam') {
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
                    <div className="header-spacer"></div>
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
                    <div className="header-spacer"></div>
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
                    <h1 className="gradient-text">Memory Mode</h1>
                    <div className="header-spacer"></div>
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
                    <h1 className="gradient-text">Matching Mode</h1>
                    <div className="header-spacer"></div>
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

    if (mode === 'truefalse') {
        const levelData = JAPANESE_DATA[levelId as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.katakana;
        return <TrueFalseMode characters={levelData} onComplete={(score) => handlePracticeComplete(score, 100, 0)} />;
    }

    if (mode === 'fillblank') {
        return <FillBlankMode questions={FILL_BLANK_DATA} onComplete={(score) => handlePracticeComplete(score, 100, 0)} />;
    }

    if (mode === 'alphabetorder') {
        const levelData = JAPANESE_DATA[levelId as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.katakana;
        return <AlphabetOrderMode characters={levelData} onComplete={(score) => handlePracticeComplete(score, 100, 0)} />;
    }

    if (mode === 'sentence_scramble') {
        return <SentenceScrambleMode onComplete={(score) => handlePracticeComplete(score, 150, 0)} />;
    }

    if (mode === 'listening') {
        return <ListeningMode onComplete={(score) => handlePracticeComplete(score, 100, 0)} />;
    }

    // Use repetition mode for hiragana and katakana (default study mode)
    if (levelId === 'hiragana' || levelId === 'katakana') {
        return <RepetitionMode levelId={levelId} />;
    }

    return <RepetitionMode levelId={levelId} />;
}

export default function GamePage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div className="loading-container">{t('loading')}...</div>}>
            <GamePageContent />
        </Suspense>
    );
}
