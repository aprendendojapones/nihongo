"use client";

import { useState, useEffect, useRef } from 'react';
import { Trophy, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from './TranslationContext';
import { JAPANESE_DATA } from '@/data/japanese';
import './placement.css'; // Reuse placement styles for consistency

interface Question {
    id: string;
    text: string;
    options: string[];
    correct: number;
    originalItem: any;
}

interface FinalExamProps {
    level: string;
    onComplete: (passed: boolean, score: number) => void;
    onCancel: () => void;
}

export default function FinalExam({ level, onComplete, onCancel }: FinalExamProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime] = useState(Date.now());
    const [timeTaken, setTimeTaken] = useState(0);
    const { t } = useTranslation();

    // Hidden timer check (e.g., auto-fail if > 20 mins)
    useEffect(() => {
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > 20 * 60 * 1000) { // 20 minutes limit
                finishExam(true); // Force finish due to timeout
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    useEffect(() => {
        generateExam();
    }, [level]);

    const generateExam = () => {
        let data: any[] = [];
        // Map level to data keys
        if (level === 'N5') data = JAPANESE_DATA.n5_final;
        else if (level === 'N4') data = JAPANESE_DATA.n4_final;
        else if (level === 'N3') data = JAPANESE_DATA.n3;
        else if (level === 'N2') data = JAPANESE_DATA.n2;
        else if (level === 'N1') data = JAPANESE_DATA.n1;

        if (data.length === 0) return;

        // Exam: 20 questions (mixed)
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 20);

        const newQuestions = shuffled.map(item => {
            const otherItems = data.filter(i => i.id !== item.id).sort(() => Math.random() - 0.5).slice(0, 3);
            const options = [item.meaning, ...otherItems.map((i: any) => i.meaning)].sort(() => Math.random() - 0.5);

            return {
                id: item.id,
                text: item.type === 'kanji' ? `Qual o significado de ${item.char}?` : `O que significa "${item.char}"?`,
                options,
                correct: options.indexOf(item.meaning),
                originalItem: item
            };
        });

        setQuestions(newQuestions);
    };

    const handleAnswer = (index: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = index;
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            finishExam(false);
        }
    };

    const finishExam = (timeout: boolean) => {
        const endTime = Date.now();
        setTimeTaken((endTime - startTime) / 1000);
        setIsFinished(true);
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correct) score++;
        });
        return score;
    };

    if (isFinished) {
        const score = calculateScore();
        const percentage = (score / questions.length) * 100;
        const passed = percentage >= 80; // Strict pass

        return (
            <div className="placement-container">
                <div className="glass-card result-card animate-fade-in">
                    {passed ? (
                        <Trophy size={80} color="#3effa2" className="result-icon" />
                    ) : (
                        <AlertTriangle size={80} color="#ff6347" className="result-icon" />
                    )}

                    <h2 className="result-title">
                        {passed ? "Aprovado!" : "Não foi dessa vez..."}
                    </h2>

                    <div className="result-stats">
                        <div className="stat-item">
                            <span className="stat-label">Acertos</span>
                            <span className="stat-value">{score} / {questions.length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Tempo</span>
                            <span className="stat-value">{Math.floor(timeTaken / 60)}m {Math.floor(timeTaken % 60)}s</span>
                        </div>
                    </div>

                    <p className="result-desc">
                        {passed
                            ? `Parabéns! Você dominou o nível ${level}.`
                            : `Você precisa de 80% para passar. Continue estudando!`}
                    </p>

                    <div className="result-actions">
                        <button className="btn-secondary" onClick={onCancel}>
                            Voltar
                        </button>
                        {passed && (
                            <button className="btn-primary" onClick={() => onComplete(true, score)}>
                                Continuar
                            </button>
                        )}
                        {!passed && (
                            <button className="btn-primary" onClick={() => window.location.reload()}>
                                Tentar Novamente
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (questions.length === 0) return <div className="loading-state">{t('loading')}...</div>;

    const question = questions[currentQuestionIndex];

    return (
        <div className="placement-container">
            <header className="placement-header">
                <h1 className="gradient-text">Exame Final {level}</h1>
                <p>Responda com atenção. O tempo está correndo...</p>
            </header>

            <div className="glass-card question-card">
                <div className="question-header">
                    <span className="question-number">Questão {currentQuestionIndex + 1} / {questions.length}</span>
                    <Clock size={16} className="text-muted" /> {/* Icon only, no time shown */}
                </div>
                <h2 className="question-text">{question.text}</h2>
                <div className="options-grid">
                    {question.options.map((opt, i) => (
                        <button
                            key={i}
                            className={`option-button ${answers[currentQuestionIndex] === i ? 'selected' : ''}`}
                            onClick={() => handleAnswer(i)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
