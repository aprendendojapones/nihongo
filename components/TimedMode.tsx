"use client";

import { useState, useEffect } from 'react';
import { JapaneseItem } from '@/data/japanese';
import { Clock, Zap } from 'lucide-react';

interface TimedModeProps {
    characters: JapaneseItem[];
    timeLimit?: number; // seconds
    onComplete: (score: number, correctAnswers: number) => void;
}

export default function TimedMode({ characters, timeLimit = 60, onComplete }: TimedModeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [isActive, setIsActive] = useState(true);

    const currentChar = characters[currentIndex];

    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsActive(false);
                    onComplete(score, score);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, score, onComplete]);

    const handleSubmit = () => {
        if (userInput.toLowerCase().trim() === currentChar.romaji.toLowerCase()) {
            setScore(prev => prev + 1);
        }

        // Próximo caractere
        if (currentIndex < characters.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserInput('');
        } else {
            // Reinicia do começo
            setCurrentIndex(0);
            setUserInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && userInput.trim()) {
            handleSubmit();
        }
    };

    if (!isActive) {
        return (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                <h2>Tempo Esgotado!</h2>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--accent-primary)', margin: '2rem 0' }}>
                    {score}
                </div>
                <p>Respostas corretas</p>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '2rem',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={24} color="var(--accent-secondary)" />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{score}</span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: timeLeft <= 10 ? '#ff3e3e' : 'var(--text-primary)'
                }}>
                    <Clock size={24} />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{timeLeft}s</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '6rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                    {currentChar.char}
                </div>
                {currentChar.meaning && (
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                        {currentChar.meaning}
                    </p>
                )}
            </div>

            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite o romaji..."
                autoFocus
                style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    border: '2px solid var(--glass-border)',
                    borderRadius: '8px',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                }}
            />
            <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!userInput.trim()}
                style={{ width: '100%' }}
            >
                Próximo
            </button>
        </div>
    );
}
