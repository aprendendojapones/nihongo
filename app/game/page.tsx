"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trophy, ArrowLeft, HelpCircle, CheckCircle2, XCircle, Star, RefreshCw } from 'lucide-react';
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

    const levelId = searchParams.get('level') || 'katakana';
    const isTest = searchParams.get('mode') === 'test';

    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const levelData = JAPANESE_DATA[levelId as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.katakana;
    const currentItem = levelData[currentIndex];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (feedback) return;

        const isCorrect = userInput.toLowerCase().trim() === currentItem.romaji.toLowerCase();

        if (isCorrect) {
            setFeedback('correct');
            setScore(s => s + 10);
            if (currentIndex === levelData.length - 1) {
                setTimeout(finishGame, 1000);
            } else {
                setTimeout(() => {
                    setCurrentIndex(i => i + 1);
                    setUserInput('');
                    setFeedback(null);
                    setShowHint(false);
                }, 1000);
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
            const xpGained = score + (isTest ? 500 : 100);
            await supabase.rpc('increment_xp', { user_id: user.id, amount: xpGained });

            if (isTest && score >= levelData.length * 8) {
                const { data: progress } = await supabase
                    .from('user_progress')
                    .upsert({
                        user_id: user.id,
                        lesson_id: `${levelId}_test`,
                        completed: true,
                        score: score
                    });
            } else {
                await supabase
                    .from('user_progress')
                    .upsert({
                        user_id: user.id,
                        lesson_id: levelId,
                        completed: true,
                        score: score
                    });
            }
        }
    };

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
        <div className="game-container">
            <header className="game-header">
                <button className="hint-button" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </button>
                <div className="game-progress-container">
                    <div
                        className="game-progress-fill"
                        style={{ width: `${(currentIndex / levelData.length) * 100}%` }}
                    />
                </div>
                <div className="game-stats">
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
                        type="text"
                        autoFocus
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
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
                <button className="hint-button" onClick={() => setShowHint(!showHint)}>
                    <HelpCircle size={20} /> {t('hint')}
                </button>
                <p style={{ color: 'var(--text-muted)' }}>{currentIndex + 1} / {levelData.length}</p>
            </footer>
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
