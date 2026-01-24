"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { getMathProblem, MathProblem, MathLevel } from '@/lib/mathUtils';
import { Check, X, ArrowLeft, Lock, Trophy, BookOpen, Star, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

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
    // Game State
    const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
    const [currentLevel, setCurrentLevel] = useState<number>(1);
    const [problem, setProblem] = useState<MathProblem | null>(null);
    const [mode, setMode] = useState<'practice' | 'test'>('practice');
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    // XP & Player Level State
    const [xp, setXp] = useState(0);
    const [playerLevel, setPlayerLevel] = useState(1);
    const xpToNextLevel = playerLevel * 100;

    // Test State
    const [testProgress, setTestProgress] = useState(0);
    const [testScore, setTestScore] = useState(0);
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [showTestOption, setShowTestOption] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const generateNewProblem = useCallback(() => {
        setProblem(getMathProblem(currentLevel as MathLevel));
        setFeedback(null);
        setUserInput('');
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [currentLevel]);

    // Load Data
    useEffect(() => {
        const savedLevels = localStorage.getItem('math_unlocked_levels');
        if (savedLevels) setUnlockedLevels(JSON.parse(savedLevels));

        const savedXp = localStorage.getItem('math_xp');
        if (savedXp) setXp(parseInt(savedXp));

        const savedPlayerLevel = localStorage.getItem('math_player_level');
        if (savedPlayerLevel) setPlayerLevel(parseInt(savedPlayerLevel));
    }, []);

    // Save Data
    useEffect(() => {
        localStorage.setItem('math_xp', xp.toString());
        localStorage.setItem('math_player_level', playerLevel.toString());
    }, [xp, playerLevel]);

    useEffect(() => {
        generateNewProblem();
    }, [currentLevel, mode, generateNewProblem]);

    const handleLevelUp = useCallback(() => {
        if (xp >= xpToNextLevel) {
            setXp(prev => prev - xpToNextLevel);
            setPlayerLevel(prev => prev + 1);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500']
            });
        }
    }, [xp, xpToNextLevel]);

    useEffect(() => {
        handleLevelUp();
    }, [xp, handleLevelUp]);

    const handleAnswer = (value: string) => {
        if (!problem || feedback) return;

        setUserInput(value);
        const numValue = parseInt(value);

        if (numValue === problem.answer) {
            setFeedback('correct');

            if (mode === 'practice') {
                // XP Logic: +20 XP (100%)
                setXp(prev => prev + 20);

                const newConsecutive = consecutiveCorrect + 1;
                setConsecutiveCorrect(newConsecutive);
                if (newConsecutive >= 5 && !unlockedLevels.includes(currentLevel + 1)) {
                    setShowTestOption(true);
                }
                setTimeout(generateNewProblem, 800);
            } else {
                // Modo Prova
                setTestScore(prev => prev + 1);
                setTimeout(() => {
                    if (testProgress < 9) {
                        setTestProgress(prev => prev + 1);
                        generateNewProblem();
                    } else {
                        finishTest(testScore + 1);
                    }
                }, 800);
            }
        } else if (value.length >= problem.answer.toString().length && numValue !== problem.answer) {
            // Se o usuário digitou o número de dígitos esperado e está errado
            setFeedback('wrong');
            if (mode === 'practice') {
                // XP Logic: -5 XP (25% of 20)
                setXp(prev => Math.max(0, prev - 5));
                setConsecutiveCorrect(0);
                setTimeout(() => {
                    setFeedback(null);
                    setUserInput('');
                }, 1000);
            } else {
                setTimeout(() => {
                    if (testProgress < 9) {
                        setTestProgress(prev => prev + 1);
                        generateNewProblem();
                    } else {
                        finishTest(testScore);
                    }
                }, 1000);
            }
        }
    };

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
            }
        }
        setMode('practice');
        setConsecutiveCorrect(0);
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
                {/* XP Bar Header */}
                <div className="glass-card" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            background: 'var(--accent-primary)',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            boxShadow: '0 0 15px var(--accent-primary)'
                        }}>
                            {playerLevel}
                        </div>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Nível</span>
                    </div>

                    <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(xp / xpToNextLevel) * 100}%` }}
                            style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--accent-primary), #60a5fa)',
                                borderRadius: '6px'
                            }}
                        />
                    </div>

                    <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                        {xp} / {xpToNextLevel} XP
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <header style={{ position: 'absolute', top: '2rem', left: '2rem', right: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button className="btn-primary" onClick={onBack} style={{ padding: '0.5rem 1rem' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '1.2rem' }}>
                            {mode === 'practice' ? LEVELS[currentLevel - 1].name : `PROVA: ${LEVELS[currentLevel - 1].name}`}
                        </div>
                        <div style={{ width: '40px' }} />
                    </header>

                    {mode === 'test' && (
                        <div style={{ position: 'absolute', top: '6rem', left: '2rem', right: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Questão {testProgress + 1} de 10</span>
                                <span>Acertos: {testScore}</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '4px' }}>
                                <div style={{ width: `${(testProgress / 10) * 100}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '4px', transition: 'width 0.3s' }} />
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize: '6rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--text-primary)' }}>
                        {problem?.question} = ?
                    </div>

                    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                        <input
                            ref={inputRef}
                            type="number"
                            value={userInput}
                            onChange={(e) => handleAnswer(e.target.value)}
                            placeholder="?"
                            autoFocus
                            style={{
                                width: '100%',
                                fontSize: '4rem',
                                textAlign: 'center',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '4px solid var(--accent-primary)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontWeight: 'bold'
                            }}
                        />
                    </div>

                    <AnimatePresence>
                        {mode === 'practice' && showTestOption && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px dashed #10b981' }}
                            >
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
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {feedback && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: feedback === 'correct' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                                color: 'white',
                                padding: '2rem 4rem',
                                borderRadius: '1rem',
                                fontSize: '3rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                zIndex: 10,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                            }}
                        >
                            {feedback === 'correct' ? <Check size={50} /> : <X size={50} />}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span>{feedback === 'correct' ? 'Correto!' : 'Ops!'}</span>
                                {mode === 'practice' && (
                                    <span style={{ fontSize: '1rem', opacity: 0.8 }}>
                                        {feedback === 'correct' ? '+20 XP' : '-5 XP'}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
