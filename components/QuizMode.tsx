"use client";

import { useState, useEffect } from 'react';
import { JapaneseItem } from '@/data/japanese';
import { Check, X, Clock } from 'lucide-react';
import HandwritingCanvas from './HandwritingCanvas';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';

interface QuizModeProps {
    characters: JapaneseItem[];
    onComplete: (score: number) => void;
}

export default function QuizMode({ characters, onComplete }: QuizModeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [options, setOptions] = useState<{ id: string; text: string; isCorrect: boolean }[]>([]);
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
                    .map(c => ({ id: c.romaji, text: c.romaji, isCorrect: false }));

                const correctOption = { id: correct, text: correct, isCorrect: true };
                const allOptions = [correctOption, ...wrongOptions].sort(() => Math.random() - 0.5);
                setOptions(allOptions);
            }
        };

        if (currentChar) {
            generateOptions();
        }
    }, [currentIndex, currentChar, characters]);

    const handleAnswer = (answer: string | boolean) => {
        let isCorrect = false;

        if (typeof answer === 'boolean') {
            isCorrect = answer;
            // For MCQ, we don't strictly need to set userAnswer string if we trust the component's validation
            // But we can set it for consistency if needed, or just rely on isCorrect
        } else {
            // Canvas answer (string)
            isCorrect = answer === currentChar.char;
            setUserAnswer(answer);
        }

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
                <MultipleChoiceQuestion
                    question={currentChar.char}
                    questionSubtext={currentChar.meaning || 'Qual é o romaji?'}
                    options={options}
                    onAnswer={handleAnswer}
                    disabled={!!feedback}
                />
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
