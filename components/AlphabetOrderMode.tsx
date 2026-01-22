"use client";

import { useState, useEffect } from 'react';
import { JapaneseItem } from '@/data/japanese';
import { Check, X, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AlphabetOrderModeProps {
    characters: JapaneseItem[];
    onComplete: (score: number) => void;
}

export default function AlphabetOrderMode({ characters, onComplete }: AlphabetOrderModeProps) {
    const [round, setRound] = useState(1);
    const [totalRounds] = useState(5);
    const [currentSet, setCurrentSet] = useState<JapaneseItem[]>([]);
    const [shuffledSet, setShuffledSet] = useState<JapaneseItem[]>([]);
    const [nextExpectedIndex, setNextExpectedIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per round
    const [isGameOver, setIsGameOver] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [completedIndices, setCompletedIndices] = useState<number[]>([]);

    // Initialize round
    useEffect(() => {
        if (round > totalRounds) {
            finishGame();
            return;
        }

        startRound();
    }, [round]);

    const startRound = () => {
        // Pick 5-8 random characters from the full list
        // Actually, for alphabet order, we should pick a contiguous chunk or just random ones?
        // Random ones are harder to order if they are far apart.
        // Let's pick random ones but sort them to know the expected order.

        const setSize = 5 + Math.min(round, 3); // Increase difficulty: 6, 7, 8...
        const shuffledAll = [...characters].sort(() => 0.5 - Math.random());
        const selected = shuffledAll.slice(0, setSize);

        // Sort them based on their original index in the 'characters' array (assuming 'characters' is passed in order)
        // If 'characters' is not guaranteed to be in order, we might need a better way.
        // But usually HIRAGANA_DATA is in order.
        // Let's rely on the index in the passed 'characters' array.

        const sorted = [...selected].sort((a, b) => {
            return characters.indexOf(a) - characters.indexOf(b);
        });

        setCurrentSet(sorted);
        setShuffledSet([...sorted].sort(() => 0.5 - Math.random()));
        setNextExpectedIndex(0);
        setCompletedIndices([]);
        setTimeLeft(30);
        setFeedback(null);
    };

    // Timer logic
    useEffect(() => {
        if (isGameOver || feedback === 'wrong') return;

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
    }, [round, isGameOver, feedback]);

    const handleTimeout = () => {
        setFeedback('wrong');
        setTimeout(() => {
            if (round < totalRounds) {
                setRound(prev => prev + 1);
            } else {
                finishGame();
            }
        }, 1500);
    };

    const handleCardClick = (char: JapaneseItem, index: number) => {
        if (feedback || completedIndices.includes(index)) return;

        const expectedChar = currentSet[nextExpectedIndex];

        if (char.id === expectedChar.id) {
            // Correct
            setCompletedIndices(prev => [...prev, index]);
            setNextExpectedIndex(prev => prev + 1);
            setScore(prev => prev + 10);

            if (nextExpectedIndex + 1 === currentSet.length) {
                // Round complete
                setFeedback('correct');
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 },
                    colors: ['#3effa2', '#00d4ff']
                });

                setTimeout(() => {
                    if (round < totalRounds) {
                        setRound(prev => prev + 1);
                    } else {
                        finishGame();
                    }
                }, 1500);
            }
        } else {
            // Wrong
            setFeedback('wrong');
            setScore(prev => Math.max(0, prev - 5));

            // Shake effect or something?
            setTimeout(() => {
                setFeedback(null);
            }, 500);
        }
    };

    const finishGame = () => {
        setIsGameOver(true);
        const maxScore = totalRounds * (5 + 3) * 10; // Approx max score
        const finalPercentage = Math.min(100, Math.round((score / maxScore) * 100)); // Normalize roughly
        // Or just pass the raw score if the parent handles it.
        // The parent expects a percentage (0-100) usually for 'completed' status, or raw score for XP.
        // Let's pass a percentage based on rounds completed?
        // Let's just pass 100 if finished all rounds.
        onComplete(100);
    };

    if (isGameOver) return null;

    return (
        <div className="ao-container">
            <div className="ao-header">
                <div className="ao-info">
                    <span>Rodada {round}/{totalRounds}</span>
                    <span>Pontos: {score}</span>
                </div>
                <div className="ao-timer-bar">
                    <div
                        className="ao-timer-fill"
                        style={{
                            '--progress': `${(timeLeft / 30) * 100}%`,
                            '--progress-color': timeLeft < 5 ? '#ff3e3e' : '#3effa2'
                        } as React.CSSProperties}
                    />
                </div>
            </div>

            <div className="ao-instruction">
                Selecione em ordem alfabética (A-I-U-E-O...)
            </div>

            <div className="ao-grid">
                {shuffledSet.map((char, index) => {
                    const isCompleted = completedIndices.includes(index);
                    return (
                        <button
                            key={char.id}
                            className={`ao-card glass-card ${isCompleted ? 'completed' : ''} ${feedback === 'wrong' && !isCompleted ? 'shake' : ''}`}
                            onClick={() => handleCardClick(char, index)}
                            disabled={isCompleted || !!feedback}
                        >
                            <span className="ao-char">{char.char}</span>
                            <span className="ao-romaji">{char.romaji}</span>
                        </button>
                    );
                })}
            </div>

            {feedback === 'correct' && (
                <div className="ao-feedback correct">
                    <Check size={48} /> Rodada Completa!
                </div>
            )}

            {feedback === 'wrong' && timeLeft <= 0 && (
                <div className="ao-feedback wrong">
                    <X size={48} /> Tempo Esgotado!
                </div>
            )}
        </div>
    );
}
