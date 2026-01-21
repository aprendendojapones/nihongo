"use client";

import { useState, useEffect } from 'react';
import { JapaneseItem } from '@/data/japanese';
import { Check, X, Clock } from 'lucide-react';
import HandwritingCanvas from './HandwritingCanvas';

interface QuizModeProps {
    characters: JapaneseItem[];
    onComplete: (score: number) => void;
}

export default function QuizMode({ characters, onComplete }: QuizModeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [options, setOptions] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [score, setScore] = useState(0);
    const [startTime] = useState(Date.now());
    const [questionType, setQuestionType] = useState<'char-to-romaji' | 'romaji-to-char'>('char-to-romaji');

    const currentChar = characters[currentIndex];

    useEffect(() => {
        const generateOptions = () => {
            if (!currentChar) return;

            // Alternate question types
            const type = currentIndex % 2 === 0 ? 'char-to-romaji' : 'romaji-to-char';
            setQuestionType(type);

            if (type === 'char-to-romaji') {
                const correct = currentChar.romaji;
                const wrongOptions = characters
                    .filter(c => c.romaji !== correct)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(c => c.romaji);

                const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
                setOptions(allOptions);
            }
        };

        if (currentChar) {
            generateOptions();
        }
    }, [currentIndex, currentChar, characters]);

    const handleAnswer = (answer: string) => {
        const isCorrect = questionType === 'char-to-romaji'
            ? answer === currentChar.romaji
            : answer === currentChar.char;

        setUserAnswer(answer);
        setFeedback(isCorrect ? 'correct' : 'wrong');

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentIndex < characters.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setUserAnswer('');
                setFeedback(null);
            } else {
                const timeSpent = Math.round((Date.now() - startTime) / 1000);
                const finalScore = Math.round((score / characters.length) * 100);
                onComplete(finalScore);
            }
        }, 1000);
    };

    const handleCanvasRecognize = (recognizedChar: string) => {
        handleAnswer(recognizedChar);
    };

    if (!currentChar) return null;

    return (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Pergunta {currentIndex + 1}/{characters.length}</span>
                <span>Pontos: {score}</span>
            </div>

            {questionType === 'char-to-romaji' ? (
                <>
                    {/* Show Japanese character, ask for romaji */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ fontSize: '6rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                            {currentChar.char}
                        </div>
                        {currentChar.meaning && (
                            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                                {currentChar.meaning}
                            </p>
                        )}
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            Qual é o romaji?
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                disabled={!!feedback}
                                style={{
                                    padding: '1.5rem',
                                    fontSize: '1.5rem',
                                    border: `2px solid ${feedback && option === userAnswer ? (feedback === 'correct' ? '#4ade80' : '#ff3e3e') : 'var(--glass-border)'}`,
                                    borderRadius: '8px',
                                    background: feedback && option === userAnswer ? (feedback === 'correct' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 62, 62, 0.1)') : 'var(--glass-bg)',
                                    color: 'var(--text-primary)',
                                    cursor: feedback ? 'default' : 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    {/* Show romaji, ask to draw character */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Desenhe o caractere para:
                        </p>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                            {currentChar.romaji}
                        </div>
                        {currentChar.meaning && (
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                ({currentChar.meaning})
                            </p>
                        )}
                    </div>

                    <HandwritingCanvas
                        onRecognize={handleCanvasRecognize}
                        expectedChar={currentChar.char}
                        disabled={!!feedback}
                    />

                    {feedback && (
                        <div style={{
                            marginTop: '1rem',
                            textAlign: 'center',
                            color: feedback === 'correct' ? '#4ade80' : '#ff3e3e',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                        }}>
                            {feedback === 'correct' ? (
                                <><Check size={24} style={{ verticalAlign: 'middle' }} /> Correto!</>
                            ) : (
                                <><X size={24} style={{ verticalAlign: 'middle' }} /> Incorreto. Era: {currentChar.char}</>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
