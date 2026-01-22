"use client";

import { useState, useEffect } from 'react';
import { FillBlankQuestion } from '@/data/fill-blank-data';
import { Check, X, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FillBlankModeProps {
    questions: FillBlankQuestion[];
    onComplete: (score: number) => void;
}

export default function FillBlankMode({ questions, onComplete }: FillBlankModeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10); // 10 seconds per question
    const [isGameOver, setIsGameOver] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [combo, setCombo] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const currentQuestion = questions[currentIndex];

    // Timer logic
    useEffect(() => {
        if (isGameOver || feedback || !currentQuestion) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0.1) {
                    clearInterval(timer);
                    handleTimeout();
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, isGameOver, feedback, currentQuestion]);

    const handleTimeout = () => {
        setFeedback('wrong');
        setCombo(0);
        setTimeout(nextQuestion, 1500);
    };

    const handleAnswer = (answer: string) => {
        if (feedback || !currentQuestion) return;

        setSelectedOption(answer);
        const isCorrect = answer === currentQuestion.missingWord;

        if (isCorrect) {
            setScore(prev => prev + 10 + (combo * 2)); // Bonus for combo
            setFeedback('correct');
            setCombo(prev => prev + 1);

            if (combo > 2) {
                confetti({
                    particleCount: 30,
                    spread: 50,
                    origin: { y: 0.7 },
                    colors: ['#3effa2', '#00d4ff']
                });
            }
        } else {
            setFeedback('wrong');
            setCombo(0);
        }

        setTimeout(nextQuestion, 1500);
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setTimeLeft(10);
            setFeedback(null);
            setSelectedOption(null);
        } else {
            finishGame();
        }
    };

    const finishGame = () => {
        setIsGameOver(true);
        const maxScore = questions.length * 10; // Base max score without combos
        const finalPercentage = Math.min(100, Math.round((score / maxScore) * 100));
        onComplete(finalPercentage);
    };

    if (!currentQuestion) return null;

    // Split sentence by missing word placeholder (assuming we replace it visually)
    // Actually the data has 'sentence' like '私は___です。'
    // We can just display it as is, or replace '___' with the answer if feedback is present.

    const displaySentence = feedback && selectedOption
        ? currentQuestion.sentence.replace('___', feedback === 'correct' ? currentQuestion.missingWord : selectedOption)
        : currentQuestion.sentence;

    return (
        <div className="fb-container">
            <div className="fb-header">
                <div className="fb-progress">
                    <span>Questão {currentIndex + 1}/{questions.length}</span>
                    <div className="fb-combo">
                        {combo > 1 && <span className="combo-badge">Combo x{combo}!</span>}
                    </div>
                </div>
                <div className="fb-score">Pontos: {score}</div>
            </div>

            <div className="fb-timer-bar">
                <div
                    className="fb-timer-fill"
                    style={{
                        '--progress': `${(timeLeft / 10) * 100}%`,
                        '--progress-color': timeLeft < 3 ? '#ff3e3e' : '#3effa2'
                    } as React.CSSProperties}
                />
            </div>

            <div className="fb-card glass-card">
                <div className="fb-sentence">
                    {currentQuestion.sentence.split('___').map((part, i, arr) => (
                        <span key={i}>
                            {part}
                            {i < arr.length - 1 && (
                                <span className={`fb-blank ${feedback ? (feedback === 'correct' ? 'correct' : 'wrong') : ''}`}>
                                    {feedback ? (feedback === 'correct' ? currentQuestion.missingWord : (selectedOption === currentQuestion.missingWord ? currentQuestion.missingWord : selectedOption)) : '___'}
                                </span>
                            )}
                        </span>
                    ))}
                </div>
                <div className="fb-translation">{currentQuestion.translation}</div>
            </div>

            <div className="fb-options">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        className={`btn-fb ${feedback === 'correct' && option === currentQuestion.missingWord ? 'correct' :
                            feedback === 'wrong' && option === selectedOption ? 'wrong' :
                                feedback === 'wrong' && option === currentQuestion.missingWord ? 'correct-highlight' : ''
                            }`}
                        onClick={() => handleAnswer(option)}
                        disabled={!!feedback}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {feedback && (
                <div className={`fb-feedback ${feedback}`}>
                    {feedback === 'correct' ? 'Correto!' : 'Errado!'}
                </div>
            )}
        </div>
    );
}
