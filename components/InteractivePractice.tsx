"use client";

import { useState, useEffect } from 'react';
import { JapaneseItem } from '@/data/japanese';
import PCHandwritingView from './PCHandwritingView';
import { Check, X, ArrowRight } from 'lucide-react';
import './handwriting.css';

interface InteractivePracticeProps {
    characters: JapaneseItem[];
    mode?: 'sequential' | 'random';
    onComplete?: (score: number) => void;
}

export default function InteractivePractice({ characters, mode = 'sequential', onComplete }: InteractivePracticeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [practiceMode, setPracticeMode] = useState<'write' | 'type'>('type');
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);

    const currentChar = characters[currentIndex];

    // Alterna entre escrita e digitação
    useEffect(() => {
        // Se o caractere tem traçado (hiragana/katakana/kanji), alterna
        // Senão, sempre digitação (vocabulário)
        if (currentChar?.type === 'vocabulary') {
            setPracticeMode('type');
        } else {
            // Alterna: ímpar = escrever, par = digitar
            setPracticeMode(currentIndex % 2 === 0 ? 'type' : 'write');
        }
        setUserInput('');
        setFeedback(null);
    }, [currentIndex, currentChar]);

    const handleTypingSubmit = () => {
        const isCorrect = userInput.toLowerCase().trim() === currentChar.romaji.toLowerCase();
        setFeedback(isCorrect ? 'correct' : 'wrong');
        setAttempts(prev => prev + 1);

        if (isCorrect) {
            setScore(prev => prev + 1);
            setTimeout(nextCharacter, 1000);
        } else {
            setTimeout(() => {
                setFeedback(null);
                setUserInput('');
            }, 1500);
        }
    };

    const handleWritingComplete = () => {
        // Chamado quando o usuário completa a escrita corretamente
        setFeedback('correct');
        setScore(prev => prev + 1);
        setAttempts(prev => prev + 1);
        setTimeout(nextCharacter, 1000);
    };

    const nextCharacter = () => {
        if (currentIndex < characters.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Fim da prática
            if (onComplete) {
                onComplete(Math.round((score / attempts) * 100));
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && practiceMode === 'type' && userInput.trim()) {
            handleTypingSubmit();
        }
    };

    if (!currentChar) {
        return (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Prática Concluída!</h2>
                <p>Pontuação: {score}/{attempts} ({Math.round((score / attempts) * 100)}%)</p>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            {/* Header com progresso */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span>Progresso: {currentIndex + 1}/{characters.length}</span>
                    <span>Pontos: {score}/{attempts}</span>
                </div>
                <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--glass-border)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${((currentIndex + 1) / characters.length) * 100}%`,
                        height: '100%',
                        background: 'var(--accent-primary)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>

            {/* Área de prática */}
            {practiceMode === 'type' ? (
                // Modo Digitação: Mostra japonês, usuário digita romaji
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Digite o romaji:
                    </h3>
                    <div style={{
                        fontSize: '6rem',
                        fontWeight: 'bold',
                        margin: '2rem 0',
                        color: 'var(--accent-primary)'
                    }}>
                        {currentChar.char}
                    </div>
                    {currentChar.meaning && (
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            {currentChar.meaning}
                        </p>
                    )}
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite aqui..."
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.5rem',
                            textAlign: 'center',
                            border: `2px solid ${feedback === 'wrong' ? '#ff3e3e' : 'var(--glass-border)'}`,
                            borderRadius: '8px',
                            background: 'var(--glass-bg)',
                            color: 'var(--text-primary)',
                            marginBottom: '1rem'
                        }}
                    />
                    <button
                        className="btn-primary"
                        onClick={handleTypingSubmit}
                        disabled={!userInput.trim()}
                        style={{ width: '100%' }}
                    >
                        Verificar
                    </button>
                </div>
            ) : (
                // Modo Escrita: Mostra romaji, usuário escreve
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Escreva o caractere:
                    </h3>
                    <div style={{
                        fontSize: '4rem',
                        fontWeight: 'bold',
                        margin: '2rem 0',
                        color: 'var(--accent-primary)'
                    }}>
                        {currentChar.romaji}
                    </div>
                    <PCHandwritingView
                        targetChar={currentChar.char}
                        onComplete={handleWritingComplete}
                    />
                </div>
            )}

            {/* Feedback */}
            {feedback && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: feedback === 'correct' ? 'rgba(76, 175, 80, 0.95)' : 'rgba(255, 62, 62, 0.95)',
                    color: 'white',
                    padding: '2rem 3rem',
                    borderRadius: '16px',
                    fontSize: '3rem',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                    {feedback === 'correct' ? <Check size={48} /> : <X size={48} />}
                    {feedback === 'correct' ? 'Correto!' : 'Tente novamente'}
                </div>
            )}
        </div>
    );
}
