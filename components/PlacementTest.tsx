"use client";

import { useState } from 'react';
import { Trophy, ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import { useTranslation } from './TranslationContext';
import './placement.css';

interface Question {
    id: number;
    text: string;
    options: string[];
    correct: number;
}

const QUESTIONS: Question[] = [
    { id: 1, text: 'Qual o som de あ?', options: ['a', 'i', 'u', 'e'], correct: 0 },
    { id: 2, text: 'Qual o som de カ?', options: ['ka', 'ki', 'ku', 'ke'], correct: 0 },
    { id: 3, text: 'O que significa 先生?', options: ['Estudante', 'Escola', 'Professor', 'Livro'], correct: 2 },
    { id: 4, text: 'Como se diz "Água" em japonês?', options: ['Mizu', 'Hon', 'Niku', 'Sakana'], correct: 0 },
    { id: 5, text: 'Qual o kanji para "Sol/Dia"?', options: ['月', '日', '火', '水'], correct: 1 },
];

export default function PlacementTest({ onComplete }: { onComplete: (level: string) => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const { t } = useTranslation();

    const handleAnswer = (index: number) => {
        if (index === QUESTIONS[currentStep].correct) {
            setScore(s => s + 1);
        }

        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(s => s + 1);
        } else {
            setIsFinished(true);
        }
    };

    const getLevel = () => {
        if (score === QUESTIONS.length) return 'N4';
        if (score >= 3) return 'N5';
        return 'Basics';
    };

    if (isFinished) {
        const level = getLevel();
        return (
            <div className="placement-container">
                <div className="glass-card result-card animate-fade-in">
                    <Trophy size={80} color="var(--accent-secondary)" className="result-icon" />
                    <h2 className="result-title">{t('test_completed')}!</h2>
                    <p>{t('recommended_level')}:</p>
                    <div className="result-level">{level}</div>
                    <button className="btn-primary" onClick={() => onComplete(level)}>
                        {t('start_learning')} <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    const question = QUESTIONS[currentStep];

    return (
        <div className="placement-container">
            <header className="placement-header">
                <h1 className="gradient-text">{t('placement_test')}</h1>
                <p>{t('placement_test_desc')}</p>
            </header>

            <div className="glass-card question-card">
                <h2 className="question-text">{question.text}</h2>
                <div className="options-grid">
                    {question.options.map((opt, i) => (
                        <button
                            key={i}
                            className="option-button"
                            onClick={() => handleAnswer(i)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <footer className="placement-footer">
                <span>{t('question')} {currentStep + 1} / {QUESTIONS.length}</span>
                <div className="progress-dots">
                    {QUESTIONS.map((_, i) => (
                        <div
                            key={i}
                            className={`progress-dot ${i <= currentStep ? 'active' : 'inactive'}`}
                        />
                    ))}
                </div>
            </footer>
        </div>
    );
}
