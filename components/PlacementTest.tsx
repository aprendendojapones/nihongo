"use client";

import { useState } from 'react';
import { PLACEMENT_TEST_QUESTIONS, calculateStartingLevel } from '@/lib/placement';
import styles from './placement.module.css';

export default function PlacementTest() {
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [assignedLevel, setAssignedLevel] = useState('');

    const handleAnswer = (answer: string) => {
        if (answer === PLACEMENT_TEST_QUESTIONS[currentStep].correctAnswer) {
            setScore(score + 1);
        }

        if (currentStep + 1 < PLACEMENT_TEST_QUESTIONS.length) {
            setCurrentStep(currentStep + 1);
        } else {
            const level = calculateStartingLevel(score + (answer === PLACEMENT_TEST_QUESTIONS[currentStep].correctAnswer ? 1 : 0), PLACEMENT_TEST_QUESTIONS.length);
            setAssignedLevel(level);
            setFinished(true);
        }
    };

    if (finished) {
        return (
            <div className="glass-card animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
                <h2 className="gradient-text" style={{ fontSize: '2.5rem' }}>Teste Concluído!</h2>
                <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>Seu nível inicial recomendado é:</p>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--accent-secondary)', margin: '1rem 0' }}>
                    {assignedLevel}
                </div>
                <button className="btn-primary" onClick={() => window.location.href = '/dashboard'}>
                    Começar Estudos
                </button>
            </div>
        );
    }

    const question = PLACEMENT_TEST_QUESTIONS[currentStep];

    return (
        <div className="glass-card animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '600px' }}>
            <div style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                Questão {currentStep + 1} de {PLACEMENT_TEST_QUESTIONS.length}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{question.text}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        className={styles.optionBtn}
                        onClick={() => handleAnswer(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}
