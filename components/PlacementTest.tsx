"use client";

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Trophy, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { JAPANESE_DATA } from '@/data/japanese';
import './placement.css';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function PlacementTest({ onComplete }: { onComplete: (level: string) => void }) {
    const { data: session } = useSession();
    const user = session?.user as any;

    const [currentLevel, setCurrentLevel] = useState('N5');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [levelScore, setLevelScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [finalPlacement, setFinalPlacement] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        generateQuestionsForLevel(currentLevel);
    }, [currentLevel]);

    const generateQuestionsForLevel = (level: string) => {
        setLoading(true);
        const data = JAPANESE_DATA[level.toLowerCase() as keyof typeof JAPANESE_DATA] || JAPANESE_DATA.n5;

        // Shuffle and pick 5
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 5);

        const newQuestions = shuffled.map(item => {
            const correctMeaning = item.meaning;
            const otherMeanings = data
                .filter(d => d.id !== item.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(d => d.meaning);

            const options = [correctMeaning, ...otherMeanings].sort(() => Math.random() - 0.5);

            return {
                id: item.id,
                text: item.type === 'kanji' ? `Qual o significado de ${item.char}?` : `O que significa "${item.char}"?`,
                options,
                correct: options.indexOf(correctMeaning),
                level
            };
        });

        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setLevelScore(0);
        setLoading(false);
    };

    const handleAnswer = (index: number) => {
        const isCorrect = index === questions[currentQuestionIndex].correct;
        const newScore = isCorrect ? levelScore + 1 : levelScore;
        setLevelScore(newScore);

        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = index;
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            // Level finished, check if passed
            // Strict: Need 4/5 (80%) to proceed
            if (newScore >= 4) {
                const nextLevelIndex = LEVELS.indexOf(currentLevel) + 1;
                if (nextLevelIndex < LEVELS.length) {
                    setCurrentLevel(LEVELS[nextLevelIndex]);
                } else {
                    // Finished all levels!
                    finishTest('N1');
                }
            } else {
                // Failed this level, determine placement
                // If failed N5, place in Basics. If passed N5 but failed N4, place in N5.
                const placement = newScore >= 4 ? currentLevel : (currentLevel === 'N5' ? 'Basics' : LEVELS[LEVELS.indexOf(currentLevel) - 1]);
                finishTest(placement);
            }
        }
    };

    const finishTest = async (level: string) => {
        setFinalPlacement(level);
        setIsFinished(true);

        if (user) {
            await supabase.from('profiles').update({ level }).eq('id', user.id);
        }
    };

    if (loading) return <div className="loading-state">Gerando teste...</div>;

    if (isFinished) {
        return (
            <div className="glass-card result-card animate-fade-in">
                <Trophy size={64} color="var(--accent-secondary)" className="result-icon" />
                <h2 className="result-title">Avaliação Concluída!</h2>
                <p className="result-desc">Com base no seu desempenho, seu nível recomendado é:</p>

                <div className="result-level">{finalPlacement}</div>

                <div className="result-stats">
                    <div className="stat-item">
                        <span className="stat-label">Último Nível Tentado</span>
                        <span className="stat-value">{currentLevel}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Acertos no Nível</span>
                        <span className="stat-value">{levelScore}/5</span>
                    </div>
                </div>

                <div className="result-actions">
                    <button className="btn-primary" onClick={() => onComplete(finalPlacement)}>
                        Começar Jornada <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="placement-container">
            <header className="placement-header">
                <h1>Teste de Nivelamento</h1>
                <p>Descubra seu nível de japonês</p>

                <div className="level-progress">
                    {LEVELS.map((l, i) => (
                        <div
                            key={l}
                            className={`level-dot ${l === currentLevel ? 'active' : ''} ${LEVELS.indexOf(l) < LEVELS.indexOf(currentLevel) ? 'completed' : ''}`}
                        >
                            {l}
                        </div>
                    ))}
                </div>
            </header>

            <main className="glass-card question-card animate-slide-up">
                <div className="question-header">
                    <span>Questão {currentQuestionIndex + 1}/5</span>
                    <span className="question-level-badge">{currentLevel}</span>
                </div>

                <h2 className="question-text">{currentQuestion.text}</h2>

                <div className="options-grid">
                    {currentQuestion.options.map((option: string, index: number) => (
                        <button
                            key={index}
                            className="option-button"
                            onClick={() => handleAnswer(index)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </main>

            <footer className="placement-footer">
                <span>Progresso do Nível</span>
                <div className="progress-dots">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className={`progress-dot ${i <= currentQuestionIndex ? 'active' : ''} ${i < currentQuestionIndex ? 'completed' : ''}`}
                        />
                    ))}
                </div>
            </footer>
        </div>
    );
}
