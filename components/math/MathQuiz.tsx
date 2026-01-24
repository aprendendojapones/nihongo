"use client";

import { useState, useEffect } from 'react';
import { getMathProblem, MathProblem } from '@/lib/mathUtils';
import { Check, X, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MathQuizProps {
    onBack: () => void;
}

export default function MathQuiz({ onBack }: MathQuizProps) {
    const [problem, setProblem] = useState<MathProblem | null>(null);
    const [score, setScore] = useState(0);
    const [total, setTotal] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    useEffect(() => {
        generateNewProblem();
    }, []);

    const generateNewProblem = () => {
        // No modo Quiz livre, usamos um nível médio (ex: 4)
        setProblem(getMathProblem(4));
        setFeedback(null);
    };

    const handleAnswer = (selected: number) => {
        if (!problem || feedback) return;

        const isCorrect = selected === problem.answer;
        setFeedback(isCorrect ? 'correct' : 'wrong');
        setTotal(prev => prev + 1);

        if (isCorrect) {
            setScore(prev => prev + 1);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setTimeout(generateNewProblem, 1000);
        } else {
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    if (!problem) return null;

    return (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button className="btn-primary" onClick={onBack} style={{ padding: '0.5rem 1rem' }}>
                    <ArrowLeft size={20} />
                </button>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Pontuação: <span style={{ color: 'var(--accent-primary)' }}>{score}</span> / {total}
                </div>
            </header>

            <div style={{ fontSize: '4rem', fontWeight: 'bold', margin: '3rem 0', color: 'var(--text-primary)' }}>
                {problem.question} = ?
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {problem.options.map((opt, i) => (
                    <button
                        key={i}
                        className="btn-primary"
                        onClick={() => handleAnswer(opt)}
                        style={{
                            fontSize: '1.5rem',
                            padding: '1.5rem',
                            background: feedback === 'correct' && opt === problem.answer ? '#10b981' :
                                feedback === 'wrong' && opt !== problem.answer ? 'var(--glass-bg)' : 'var(--glass-bg)',
                            border: feedback === 'correct' && opt === problem.answer ? '2px solid #10b981' :
                                feedback === 'wrong' && opt === problem.answer ? '2px solid #10b981' : '1px solid var(--glass-border)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {feedback && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: feedback === 'correct' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    padding: '2rem 4rem',
                    borderRadius: '1rem',
                    fontSize: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    zIndex: 100
                }}>
                    {feedback === 'correct' ? <Check size={40} /> : <X size={40} />}
                    {feedback === 'correct' ? 'Correto!' : 'Tente novamente'}
                </div>
            )}
        </div>
    );
}
