"use client";

import { useState, useEffect } from 'react';
import { JapaneseItem } from '@/data/japanese';
import { Check, X, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrueFalseModeProps {
    characters: JapaneseItem[];
    onComplete: (score: number) => void;
}

export default function TrueFalseMode({ characters, onComplete }: TrueFalseModeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5); // 5 seconds per question
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<{ char: JapaneseItem, displayedRomaji: string, isCorrect: boolean } | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [combo, setCombo] = useState(0);

    // Generate new question
    useEffect(() => {
        if (currentIndex >= characters.length) {
            finishGame();
            return;
        }

        const char = characters[currentIndex];
        const isCorrect = Math.random() > 0.5;
        let displayedRomaji = char.romaji;

        if (!isCorrect) {
            // Pick a random wrong romaji
            const wrongChars = characters.filter(c => c.romaji !== char.romaji);
            const randomWrong = wrongChars[Math.floor(Math.random() * wrongChars.length)];
            displayedRomaji = randomWrong.romaji;
        }

        setCurrentQuestion({ char, displayedRomaji, isCorrect });
        setTimeLeft(5);
        setFeedback(null);
    }, [currentIndex, characters]);

    // Timer logic
    useEffect(() => {
        if (isGameOver || feedback) return;

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
    }, [currentIndex, isGameOver, feedback]);

    const handleTimeout = () => {
        setFeedback('wrong');
        setCombo(0);
        setTimeout(nextQuestion, 1000);
    };

    const handleAnswer = (answer: boolean) => {
        if (feedback || !currentQuestion) return;

        const isCorrect = answer === currentQuestion.isCorrect;

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

        setTimeout(nextQuestion, 800);
    };

    const nextQuestion = () => {
        if (currentIndex < characters.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            finishGame();
        }
    };

    const finishGame = () => {
        setIsGameOver(true);
        const maxScore = characters.length * 10; // Base max score without combos
        const finalPercentage = Math.min(100, Math.round((score / maxScore) * 100));
        onComplete(finalPercentage);
    };

    if (!currentQuestion) return null;

    return (
        <div className="tf-container">
            <div className="tf-header">
                <div className="tf-progress">
                    <span>Questão {currentIndex + 1}/{characters.length}</span>
                    <div className="tf-combo">
                        {combo > 1 && <span className="combo-badge">Combo x{combo}!</span>}
                    </div>
                </div>
                <div className="tf-score">Pontos: {score}</div>
            </div>

            <div className="tf-timer-bar">
                <div
                    className="tf-timer-fill"
                    style={{
                        width: `${(timeLeft / 5) * 100}%`,
                        background: timeLeft < 2 ? '#ff3e3e' : '#3effa2'
                    }}
                />
            </div>

            <div className="tf-card glass-card">
                <div className="tf-char">{currentQuestion.char.char}</div>
                <div className="tf-equals">=</div>
                <div className="tf-romaji">{currentQuestion.displayedRomaji}</div>
            </div>

            <div className="tf-actions">
                <button
                    className={`btn-tf btn-false ${feedback === 'wrong' && !currentQuestion.isCorrect ? 'correct-choice' : ''}`}
                    onClick={() => handleAnswer(false)}
                    disabled={!!feedback}
                >
                    <X size={48} />
                    <span>Falso</span>
                </button>

                <button
                    className={`btn-tf btn-true ${feedback === 'correct' && currentQuestion.isCorrect ? 'correct-choice' : ''}`}
                    onClick={() => handleAnswer(true)}
                    disabled={!!feedback}
                >
                    <Check size={48} />
                    <span>Verdadeiro</span>
                </button>
            </div>

            {feedback && (
                <div className={`tf-feedback ${feedback}`}>
                    {feedback === 'correct' ? 'Correto!' : 'Errado!'}
                </div>
            )}

            <style jsx>{`
                .tf-container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 1rem;
                }

                .tf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    font-size: 1.2rem;
                }

                .combo-badge {
                    background: var(--accent-secondary);
                    color: white;
                    padding: 0.2rem 0.8rem;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: bold;
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .tf-timer-bar {
                    height: 8px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                    margin-bottom: 2rem;
                    overflow: hidden;
                }

                .tf-timer-fill {
                    height: 100%;
                    transition: width 0.1s linear, background 0.3s ease;
                }

                .tf-card {
                    padding: 3rem;
                    text-align: center;
                    margin-bottom: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .tf-char {
                    font-size: 6rem;
                    font-weight: bold;
                    color: var(--accent-primary);
                }

                .tf-equals {
                    font-size: 2rem;
                    color: var(--text-muted);
                }

                .tf-romaji {
                    font-size: 3rem;
                    font-weight: bold;
                }

                .tf-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .btn-tf {
                    padding: 2rem;
                    border: none;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.5rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: white;
                }

                .btn-false {
                    background: rgba(255, 62, 62, 0.2);
                    border: 2px solid #ff3e3e;
                    color: #ff3e3e;
                }

                .btn-true {
                    background: rgba(62, 255, 162, 0.2);
                    border: 2px solid #3effa2;
                    color: #3effa2;
                }

                .btn-tf:hover:not(:disabled) {
                    transform: translateY(-4px);
                    filter: brightness(1.2);
                }

                .btn-tf:active:not(:disabled) {
                    transform: translateY(0);
                }

                .tf-feedback {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 4rem;
                    font-weight: bold;
                    text-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 100;
                    pointer-events: none;
                }

                .tf-feedback.correct { color: #3effa2; }
                .tf-feedback.wrong { color: #ff3e3e; }

                @keyframes popIn {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
