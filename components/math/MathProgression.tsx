"use client";

import { useState, useEffect, useCallback } from 'react';
import { getMathProblem, MathProblem, MathLevel } from '@/lib/mathUtils';
import { Check, X, ArrowLeft, Lock, Trophy, BookOpen, Star, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

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
    { id: 10, name: '10º Ano', description: 'Álgebra básica' },
    { id: 11, name: '11º Ano', description: 'Geometria e Funções' },
    { id: 12, name: '12º Ano', description: 'Preparação Acadêmica' },
];

export default function MathProgression({ onBack }: MathProgressionProps) {
    const { data: session } = useSession();
    const user = session?.user as any;

    // Game State
    const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
    const [currentLevel, setCurrentLevel] = useState<number>(1);
    const [problem, setProblem] = useState<MathProblem | null>(null);
    const [mode, setMode] = useState<'practice' | 'test'>('practice');
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [showTestOption, setShowTestOption] = useState(false);

    // XP & Player Level State (Geral)
    const [totalXp, setTotalXp] = useState(0);
    const [playerLevel, setPlayerLevel] = useState(1);

    // XP & Level State (Por Ano)
    const [yearXp, setYearXp] = useState(0);
    const [yearLevel, setYearLevel] = useState(1);
    const [correctCount, setCorrectCount] = useState(0); // Acertos no nível atual (prática)

    // Test State
    const [testQuestions, setTestQuestions] = useState(0);
    const [testCorrect, setTestCorrect] = useState(0);
    const [testResults, setTestResults] = useState<{ score: number, total: number } | null>(null);

    const threshold = currentLevel * 10;

    useEffect(() => {
        const fetchProgress = async () => {
            if (!user) return;

            // Buscar níveis desbloqueados
            const { data: progressData } = await supabase
                .from('user_progress')
                .select('lesson_id')
                .eq('user_id', user.id)
                .like('lesson_id', 'math_level_%');

            if (progressData && progressData.length > 0) {
                const levels = progressData.map(p => parseInt(p.lesson_id.replace('math_level_', '')));
                setUnlockedLevels(prev => Array.from(new Set([...prev, ...levels])));
            }

            // Buscar XP e Nível do Perfil
            const { data: profileData } = await supabase
                .from('profiles')
                .select('xp')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setTotalXp(profileData.xp);
                setPlayerLevel(Math.floor(profileData.xp / 1000) + 1);
            }
        };

        fetchProgress();
    }, [user]);

    useEffect(() => {
        const fetchYearProgress = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('user_progress')
                .select('score')
                .eq('user_id', user.id)
                .eq('lesson_id', `math_year_xp_${currentLevel}`)
                .single();

            if (data) {
                setYearXp(data.score);
                setYearLevel(Math.floor(data.score / 200) + 1);
            } else {
                setYearXp(0);
                setYearLevel(1);
            }
        };
        fetchYearProgress();
    }, [currentLevel, user]);

    const saveProgress = async (newTotalXp: number, newYearXp: number) => {
        if (!user) return;

        // Atualizar XP no perfil
        await supabase.rpc('increment_xp', { user_id: user.id, amount: 20 });

        // Salvar XP do ano na tabela user_progress (usando score para armazenar XP acumulado do ano)
        await supabase.from('user_progress').upsert({
            user_id: user.id,
            lesson_id: `math_year_xp_${currentLevel}`,
            completed: false,
            score: newYearXp
        });
    };

    const generateNewProblem = useCallback(() => {
        setProblem(getMathProblem(currentLevel as MathLevel));
        setUserInput('');
        setFeedback(null);
    }, [currentLevel]);

    useEffect(() => {
        generateNewProblem();
    }, [generateNewProblem]);

    const handleAnswer = (val: string) => {
        if (feedback || !problem) return;
        setUserInput(val);

        const numVal = parseInt(val);
        if (isNaN(numVal)) return;

        if (numVal === problem.answer) {
            setFeedback('correct');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            if (mode === 'practice') {
                const newTotalXp = totalXp + 20;
                const newYearXp = yearXp + 20;

                setTotalXp(newTotalXp);
                setPlayerLevel(Math.floor(newTotalXp / 1000) + 1);

                setYearXp(newYearXp);
                const newYearLevel = Math.floor(newYearXp / 200) + 1;
                setYearLevel(newYearLevel);

                saveProgress(newTotalXp, newYearXp);

                setCorrectCount(prev => {
                    const next = prev + 1;
                    if (next >= threshold || newYearLevel >= 5) setShowTestOption(true);
                    return next;
                });
            } else {
                setTestCorrect(prev => prev + 1);
            }

            setTimeout(() => {
                if (mode === 'test') {
                    if (testQuestions + 1 >= 20) {
                        finishTest(testCorrect + 1);
                    } else {
                        setTestQuestions(prev => prev + 1);
                        generateNewProblem();
                    }
                } else {
                    generateNewProblem();
                }
            }, 1000);
        } else if (val.length >= problem.answer.toString().length) {
            setFeedback('wrong');
            if (mode === 'practice') {
                setTotalXp(prev => Math.max(0, prev - 5));
                setYearXp(prev => Math.max(0, prev - 5));
            }
            setTimeout(() => {
                if (mode === 'test') {
                    if (testQuestions + 1 >= 20) {
                        finishTest(testCorrect);
                    } else {
                        setTestQuestions(prev => prev + 1);
                        generateNewProblem();
                    }
                } else {
                    setUserInput('');
                    setFeedback(null);
                }
            }, 1000);
        }
    };

    const startTest = () => {
        setMode('test');
        setTestQuestions(0);
        setTestCorrect(0);
        setTestResults(null);
        setShowTestOption(false);
        generateNewProblem();
    };

    const finishTest = (finalCorrect: number) => {
        const pass = finalCorrect >= 16; // 80% de 20
        setTestResults({ score: finalCorrect, total: 20 });

        if (pass && !unlockedLevels.includes(currentLevel + 1)) {
            const nextLvl = currentLevel + 1;
            setUnlockedLevels(prev => [...prev, nextLvl]);
            setTotalXp(prev => prev + 200);
            setPlayerLevel(Math.floor((totalXp + 200) / 1000) + 1);

            if (user) {
                supabase.rpc('increment_xp', { user_id: user.id, amount: 200 }).then(() => {
                    supabase.from('user_progress').upsert({
                        user_id: user.id,
                        lesson_id: `math_level_${nextLvl}`,
                        completed: true,
                        score: finalCorrect
                    });
                });
            }
        }
    };

    const nextLevel = () => {
        setCurrentLevel(prev => prev + 1);
        setMode('practice');
        setCorrectCount(0);
        setTestResults(null);
        setShowTestOption(false);
    };

    const renderVisual = (num: number, icon: string) => {
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px', maxWidth: '300px', margin: '0 auto' }}>
                {Array.from({ length: num }).map((_, i) => (
                    <span key={i} style={{ fontSize: '2rem' }}>{icon}</span>
                ))}
            </div>
        );
    };

    if (testResults) {
        const pass = testResults.score >= 16;
        return (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <Trophy size={80} color={pass ? '#fbbf24' : '#94a3b8'} style={{ marginBottom: '2rem' }} />
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    {pass ? 'Parabéns!' : 'Quase lá!'}
                </h2>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Você acertou {testResults.score} de {testResults.total} questões ({Math.round((testResults.score / testResults.total) * 100)}%).
                </p>
                {pass ? (
                    <button className="btn-primary" onClick={nextLevel}>
                        Ir para o Nível {currentLevel + 1}
                    </button>
                ) : (
                    <button className="btn-primary" onClick={() => { setMode('practice'); setTestResults(null); }}>
                        Praticar Mais
                    </button>
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button className="btn-primary" onClick={onBack} style={{ padding: '0.5rem 1rem' }}>
                    <ArrowLeft size={20} />
                </button>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div className="glass-card" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={20} color="#fbbf24" fill="#fbbf24" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Nível Geral {playerLevel}</span>
                            <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${(totalXp % 1000) / 10}%`, height: '100%', background: '#fbbf24' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                <aside className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} /> Progresso
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {LEVELS.map((lvl) => {
                            const isUnlocked = unlockedLevels.includes(lvl.id);
                            const isCurrent = currentLevel === lvl.id;
                            return (
                                <button
                                    key={lvl.id}
                                    onClick={() => isUnlocked && setCurrentLevel(lvl.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        background: isCurrent ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                        border: '1px solid',
                                        borderColor: isCurrent ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                        color: isCurrent ? 'white' : 'var(--text-primary)',
                                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                                        width: '100%',
                                        textAlign: 'left',
                                        opacity: isUnlocked ? 1 : 0.5
                                    }}
                                >
                                    {isUnlocked ? <BookOpen size={18} /> : <Lock size={18} />}
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{lvl.name}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{lvl.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                        {mode === 'practice' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <Check size={16} /> {correctCount} / {threshold} para a prova
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 'bold' }}>
                                Prova: Questão {testQuestions + 1} / 20
                            </div>
                        )}
                    </div>

                    <h2 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                        {mode === 'practice' ? 'Praticando' : 'Modo Prova'} - {LEVELS.find(l => l.id === currentLevel)?.name}
                    </h2>

                    {mode === 'practice' && (
                        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <span>Progresso do Ano</span>
                                <span>Nível {yearLevel}</span>
                            </div>
                            <div style={{ width: '200px', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: `${(yearXp % 200) / 2}%`, height: '100%', background: 'var(--accent-primary)' }} />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '3rem' }}>
                        <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>
                            {problem?.visualType !== 'number' && problem?.visualIcon ? (
                                renderVisual(problem.numA, problem.visualIcon)
                            ) : (
                                problem?.numA
                            )}
                        </div>
                        <div style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>
                            {problem?.operator === '*' ? '×' : problem?.operator === '/' ? '÷' : problem?.operator}
                        </div>
                        <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>
                            {problem?.visualType !== 'number' && problem?.visualIcon ? (
                                renderVisual(problem.numB, problem.visualIcon)
                            ) : (
                                problem?.numB
                            )}
                        </div>
                        <div style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>=</div>
                        <div style={{ width: '150px' }}>
                            <input
                                type="text"
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

                    <AnimatePresence>
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
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
