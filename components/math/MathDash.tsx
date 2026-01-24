"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { getMathProblem, MathProblem } from '@/lib/mathUtils';
import { Check, X, ArrowLeft, Zap, Trophy, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MathDashProps {
    onBack: () => void;
}

export default function MathDash({ onBack }: MathDashProps) {
    const [problem, setProblem] = useState<MathProblem | null>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [combo, setCombo] = useState(0);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [highScore, setHighScore] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const generateNewProblem = useCallback(() => {
        // No Dash, a dificuldade aumenta com o score
        const level = Math.min(9, Math.floor(score / 10) + 1) as any;
        setProblem(getMathProblem(level));
        setFeedback(null);
    }, [score]);

    useEffect(() => {
        const saved = localStorage.getItem('math_dash_highscore');
        if (saved) setHighScore(parseInt(saved));
    }, []);

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setGameState('finished');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState, timeLeft]);

    useEffect(() => {
        if (gameState === 'finished') {
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('math_dash_highscore', score.toString());
                confetti({
                    particleCount: 200,
                    spread: 90,
                    origin: { y: 0.6 }
                });
            }
        }
    }, [gameState, score, highScore]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(60);
        setCombo(0);
        setGameState('playing');
        generateNewProblem();
    };

    const handleAnswer = (selected: number) => {
        if (!problem || feedback || gameState !== 'playing') return;

        const isCorrect = selected === problem.answer;
        setFeedback(isCorrect ? 'correct' : 'wrong');

        if (isCorrect) {
            const newCombo = combo + 1;
            setCombo(newCombo);
            const points = 10 * (Math.floor(newCombo / 5) + 1);
            setScore(prev => prev + points);
            setTimeLeft(prev => Math.min(60, prev + 2)); // Ganha 2 segundos
            setTimeout(generateNewProblem, 200);
        } else {
            setCombo(0);
            setTimeLeft(prev => Math.max(0, prev - 5)); // Perde 5 segundos
            setTimeout(() => setFeedback(null), 500);
        }
    };

    if (gameState === 'idle') {
        return (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                <div className="icon-container" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', margin: '0 auto 2rem' }}>
                    <Zap size={60} />
                </div>
                <h2 style={{ marginBottom: '1rem' }}>Math Dash</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Resolva o máximo de contas que puder! <br />
                    Acertos dão tempo e combos dão mais pontos. <br />
                    Erros tiram 5 segundos!
                </p>
                <div style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                    Recorde: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{highScore}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={onBack} style={{ flex: 1, background: 'transparent', border: '1px solid var(--accent-primary)' }}>
                        Voltar
                    </button>
                    <button className="btn-primary" onClick={startGame} style={{ flex: 2 }}>
                        Começar!
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                <Trophy size={80} color="#f59e0b" style={{ margin: '0 auto 2rem' }} />
                <h2 style={{ marginBottom: '1rem' }}>Tempo Esgotado!</h2>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
                    {score}
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Sua pontuação final.
                </p>
                {score >= highScore && score > 0 && (
                    <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '2rem' }}>
                        🎉 NOVO RECORDE! 🎉
                    </div>
                )}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={() => setGameState('idle')} style={{ flex: 1 }}>
                        Menu
                    </button>
                    <button className="btn-primary" onClick={startGame} style={{ flex: 1 }}>
                        Tentar de Novo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: timeLeft < 10 ? '#ef4444' : 'inherit' }}>
                    <Timer size={24} /> {timeLeft}s
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {score}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 'bold' }}>
                    <Zap size={20} /> x{combo}
                </div>
            </header>

            <div style={{ fontSize: '4rem', fontWeight: 'bold', margin: '3rem 0' }}>
                {problem?.question}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {problem?.options.map((opt, i) => (
                    <button
                        key={i}
                        className="btn-primary"
                        onClick={() => handleAnswer(opt)}
                        style={{ fontSize: '1.5rem', padding: '1.5rem', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {feedback && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: feedback === 'correct' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    padding: '1.5rem 3rem',
                    borderRadius: '1rem',
                    fontSize: '2rem',
                    zIndex: 10
                }}>
                    {feedback === 'correct' ? <Check size={40} /> : <X size={40} />}
                </div>
            )}
        </div>
    );
}
