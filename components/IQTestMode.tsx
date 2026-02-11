"use client";

import { useState, useEffect } from 'react';
import { Trophy, Clock, Brain, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext';
import confetti from 'canvas-confetti';

interface IQQuestion {
    id: number;
    question: string;
    options: string[]; // 4 options
    correctIndex: number; // 0-3
    image?: string; // Optional image URL for visual puzzles
}

const IQ_QUESTIONS: IQQuestion[] = [
    {
        id: 1,
        question: "Qual número completa a sequência: 2, 4, 8, 16, ...?",
        options: ["24", "32", "20", "64"],
        correctIndex: 1
    },
    {
        id: 2,
        question: "Se alguns Smaugs são Thors e alguns Thors são Thrains, então necessariamente...",
        options: ["Alguns Smaugs são Thrains", "Nenhum Smaug é Thrain", "Não se pode concluir nada", "Todos os Smaugs são Thrains"],
        correctIndex: 2
    },
    {
        id: 3,
        question: "Qual forma completa o padrão? (Imagine um quadrado, triangulo, circulo, quadrado, triangulo...)",
        options: ["Quadrado", "Triângulo", "Círculo", "Losango"],
        correctIndex: 2
    },
    {
        id: 4,
        question: "Complete a analogia: Dedo está para Mão assim como Folha está para...",
        options: ["Árvore", "Ramo", "Raiz", "Flor"],
        correctIndex: 1
    },
    {
        id: 5,
        question: "Se 5 máquinas levam 5 minutos para fazer 5 peças, quanto tempo 100 máquinas levariam para fazer 100 peças?",
        options: ["100 minutos", "50 minutos", "5 minutos", "20 minutos"],
        correctIndex: 2
    },
    {
        id: 6,
        question: "Maria tem 3 irmãos: Rafa, Gabi e Pedro. Se Pedro tem 2 irmãs, quantas irmãs tem Rafa?",
        options: ["1", "2", "3", "0"],
        correctIndex: 1
    },
    {
        id: 7,
        question: "Qual palavra não pertence ao grupo?",
        options: ["Maçã", "Pera", "Batata", "Uva"],
        correctIndex: 2
    },
    {
        id: 8,
        question: "Qual o próximo número: 1, 1, 2, 3, 5, 8, 13, ...?",
        options: ["18", "21", "24", "15"],
        correctIndex: 1
    }
];

interface IQTestModeProps {
    onComplete: (score: number) => void;
}

export default function IQTestMode({ onComplete }: IQTestModeProps) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [iqEstimate, setIqEstimate] = useState(0);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (!isFinished && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isFinished) {
            finishTest();
        }
    }, [timeLeft, isFinished]);

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = [...answers, optionIndex];
        setAnswers(newAnswers);

        if (currentIndex < IQ_QUESTIONS.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            finishTest(newAnswers);
        }
    };

    const finishTest = (finalAnswers?: number[]) => {
        setIsFinished(true);
        const userAnswers = finalAnswers || answers;
        
        // Calculate Score
        let correctCount = 0;
        userAnswers.forEach((ans, idx) => {
            if (ans === IQ_QUESTIONS[idx].correctIndex) {
                correctCount++;
            }
        });

        // Basic IQ Calculation Formula (Simplified)
        // Base IQ 80 + (Correct * 15) + (Bonus if fast)
        // Max 8 correct * 15 = 120 + 80 = 200 (capped realistic max logic)
        // Bonus: max 10 pts for speed
        const speedBonus = timeLeft > 300 ? 10 : timeLeft > 60 ? 5 : 0;
        const rawIQ = 70 + (correctCount * 12) + speedBonus;
        const finalIQ = Math.min(Math.max(rawIQ, 70), 160); // Clamp between 70 and 160

        setScore(correctCount);
        setIqEstimate(finalIQ);

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    if (isFinished) {
        return (
            <div className="glass-card game-completion-card animate-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
                <Brain size={80} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
                <h1 className="gradient-text" style={{ fontSize: '2rem' }}>Resultado do Teste</h1>
                
                <div style={{ margin: '2rem 0' }}>
                    <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                        {iqEstimate}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>QI Estimado</div>
                </div>

                <div className="completion-stats">
                    <div className="completion-stat-item">
                        <span className="completion-stat-label">Acertos</span>
                        <span className="completion-stat-value">{score}/{IQ_QUESTIONS.length}</span>
                    </div>
                    <div className="completion-stat-item">
                        <span className="completion-stat-label">Tempo</span>
                        <span className="completion-stat-value">{formatTime(600 - timeLeft)}</span>
                    </div>
                </div>

                <p style={{ marginTop: '1.5rem', opacity: 0.8 }}>
                    *Este é um teste simplificado para fins de entretenimento e prática cognitiva.
                </p>

                <div className="completion-actions" style={{ marginTop: '2rem' }}>
                    <button className="btn-primary" onClick={() => onComplete(iqEstimate)}>
                        Concluir e Salvar
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = IQ_QUESTIONS[currentIndex];

    return (
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Brain size={24} />
                    <span>Questão {currentIndex + 1}/{IQ_QUESTIONS.length}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft < 60 ? '#ff3e3e' : 'var(--accent-primary)', fontWeight: 'bold' }}>
                    <Clock size={24} />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </header>

            <main>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: 1.4 }}>
                    {currentQuestion.question}
                </h2>

                <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={idx}
                            className="glass-card option-card"
                            onClick={() => handleAnswer(idx)}
                            style={{
                                padding: '1.5rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid var(--glass-border)',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                        >
                            <span style={{ 
                                width: '30px', 
                                height: '30px', 
                                borderRadius: '50%', 
                                background: 'var(--accent-surface)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {['A', 'B', 'C', 'D'][idx]}
                            </span>
                            {option}
                        </button>
                    ))}
                </div>
            </main>

            <div style={{ marginTop: '2rem', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px' }}>
                <div 
                    style={{ 
                        height: '100%', 
                        background: 'var(--accent-gradient)', 
                        width: `${((currentIndex) / IQ_QUESTIONS.length) * 100}%`,
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                    }} 
                />
            </div>
        </div>
    );
}
