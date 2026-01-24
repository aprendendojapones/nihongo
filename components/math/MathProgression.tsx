"use client";

import { useState, useEffect, useCallback } from 'react';
import { getMathProblem, MathProblem, MathLevel } from '@/lib/mathUtils';
import { Check, X, ArrowLeft, Lock, Trophy, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MathProgressionProps {
    onBack: () => void;
}

const LEVELS = [
    { id: 1, name: '1º Ano', description: 'Soma simples (0-10)' },
    { id: 2, name: '2º Ano', description: 'Subtração simples (0-10)' },
    { id: 3, name: '3º Ano', description: 'Soma e Subtração (0-20)' },
    { id: 4, name: '4º Ano', description: 'Multiplicação básica' },
    { id: 5, name: '5º Ano', description: 'Divisão básica' },
    { id: 6, name: '6º Ano', description: 'Multiplicação avançada' },
    { id: 7, name: '7º Ano', description: 'Divisão avançada' },
    { id: 8, name: '8º Ano', description: 'Expressões numéricas' },
    { id: 9, name: '9º Ano', description: 'Desafios matemáticos' },
];

export default function MathProgression({ onBack }: MathProgressionProps) {
    const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
    const [currentLevel, setCurrentLevel] = useState<number>(1);
    const [problem, setProblem] = useState<MathProblem | null>(null);
    const [mode, setMode] = useState<'practice' | 'test'>('practice');
    const [testProgress, setTestProgress] = useState(0);
    const [testScore, setTestScore] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [showTestOption, setShowTestOption] = useState(false);

    const generateNewProblem = useCallback(() => {
        setProblem(getMathProblem(currentLevel as MathLevel));
        setFeedback(null);
    }, [currentLevel]);

    useEffect(() => {
        const saved = localStorage.getItem('math_unlocked_levels');
        if (saved) {
            setUnlockedLevels(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        generateNewProblem();
    }, [currentLevel, mode, generateNewProblem]);

    const startTest = () => {
        setMode('test');
        setTestProgress(0);
        setTestScore(0);
        setShowTestOption(false);
    };

    const finishTest = (finalScore: number) => {
        if (finalScore >= 8) {
            const nextLevel = currentLevel + 1;
            if (nextLevel <= 9 && !unlockedLevels.includes(nextLevel)) {
                const newUnlocked = [...unlockedLevels, nextLevel];
                setUnlockedLevels(newUnlocked);
                localStorage.setItem('math_unlocked_levels', JSON.stringify(newUnlocked));
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 }
                });
                alert(`Parabéns! Você passou na prova e desbloqueou o ${nextLevel}º Ano!`);
            }
        } else {
            alert(`Você acertou ${finalScore}/10. Precisa de pelo menos 8 para passar.`);
        }
        setMode('practice');
        setConsecutiveCorrect(0);
    };

    const handleAnswer = (selected: number) => {
        if (!problem || feedback) return;

        const isCorrect = selected === problem.answer;
        setFeedback(isCorrect ? 'correct' : 'wrong');

        if (mode === 'practice') {
            if (isCorrect) {
                const newConsecutive = consecutiveCorrect + 1;
                setConsecutiveCorrect(newConsecutive);
                if (newConsecutive >= 5 && !unlockedLevels.includes(currentLevel + 1)) {
                    setShowTestOption(true);
                }
                setTimeout(generateNewProblem, 1000);
            } else {
                setConsecutiveCorrect(0);
                setTimeout(() => setFeedback(null), 1000);
            }
        } else {
            // Modo Prova
            if (isCorrect) setTestScore(prev => prev + 1);

            setTimeout(() => {
                if (testProgress < 9) {
                    setTestProgress(prev => prev + 1);
                    generateNewProblem();
                } else {
                    finishTest(testScore + (isCorrect ? 1 : 0));
                }
            }, 1000);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 150px)' }}>
            {/* Sidebar de Níveis */}
            <aside className="glass-card" style={{ width: '250px', padding: '1rem', overflowY: 'auto' }}>
                <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Níveis</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {LEVELS.map(lvl => {
                        const isUnlocked = unlockedLevels.includes(lvl.id);
                        return (
                            <button
                                key={lvl.id}
                                onClick={() => isUnlocked && setCurrentLevel(lvl.id)}
                                disabled={!isUnlocked}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: currentLevel === lvl.id ? 'var(--accent-primary)' : 'transparent',
                                    color: currentLevel === lvl.id ? 'white' : isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isUnlocked ? <BookOpen size={18} /> : <Lock size={18} />}
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{lvl.name}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{lvl.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Área Principal do Jogo */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', flex: 1, position: 'relative' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <button className="btn-primary" onClick={onBack} style={{ padding: '0.5rem 1rem' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                            {mode === 'practice' ? `Praticando: ${LEVELS[currentLevel - 1].name}` : `PROVA: ${LEVELS[currentLevel - 1].name}`}
                        </div>
                        <div style={{ width: '40px' }} />
                    </header>

                    {mode === 'test' && (
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Questão {testProgress + 1} de 10</span>
                                <span>Acertos: {testScore}</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '4px' }}>
                                <div style={{ width: `${(testProgress / 10) * 100}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '4px', transition: 'width 0.3s' }} />
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize: '5rem', fontWeight: 'bold', margin: '2rem 0' }}>
                        {problem?.question} = ?
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
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

                    {mode === 'practice' && showTestOption && (
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px dashed #10b981' }}>
                            <h4 style={{ color: '#10b981', marginBottom: '1rem' }}>Você está indo muito bem!</h4>
                            <button className="btn-primary" onClick={startTest} style={{ background: '#10b981' }}>
                                Fazer Prova para o Próximo Nível
                            </button>
                            <button
                                onClick={() => setShowTestOption(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginLeft: '1rem', cursor: 'pointer' }}
                            >
                                Continuar Praticando
                            </button>
                        </div>
                    )}

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
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            zIndex: 10
                        }}>
                            {feedback === 'correct' ? <Check size={30} /> : <X size={30} />}
                            {feedback === 'correct' ? 'Correto!' : 'Ops!'}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
