"use client";

import { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import canvasConfetti from 'canvas-confetti';

const HIRAGANA_DATA = [
    { char: 'あ', romaji: 'a' }, { char: 'い', romaji: 'i' }, { char: 'う', romaji: 'u' },
    { char: 'え', romaji: 'e' }, { char: 'お', romaji: 'o' },
    { char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' }, { char: 'く', romaji: 'ku' },
    { char: 'け', romaji: 'ke' }, { char: 'こ', romaji: 'ko' }
];

export default function GameMode() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const currentChar = HIRAGANA_DATA[currentIndex];

    const handleCheck = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.toLowerCase() === currentChar.romaji) {
            setScore(s => s + 100);
            setFeedback('correct');
            canvasConfetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff3e3e', '#ffd700', '#ffffff']
            });

            setTimeout(() => {
                setFeedback(null);
                setInputValue('');
                setCurrentIndex((prev) => (prev + 1) % HIRAGANA_DATA.length);
            }, 1000);
        } else {
            setFeedback('wrong');
            setTimeout(() => setFeedback(null), 500);
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <header style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                <Link href="/dashboard" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <ArrowLeft size={20} /> Voltar
                </Link>
                <div className="glass-card" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={20} color="var(--accent-secondary)" />
                    <span style={{ fontWeight: 'bold' }}>{score} XP</span>
                </div>
            </header>

            <main className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '4rem 2rem', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: '8rem', marginBottom: '2rem', fontFamily: 'var(--font-jp)' }} className={feedback === 'correct' ? 'animate-fade-in' : ''}>
                    {currentChar.char}
                </div>

                <form onSubmit={handleCheck}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Digite o romaji..."
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.2rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: `2px solid ${feedback === 'correct' ? '#4caf50' : feedback === 'wrong' ? '#f44336' : 'var(--glass-border)'}`,
                            borderRadius: '12px',
                            color: 'white',
                            textAlign: 'center',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                        }}
                    />
                </form>

                <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>
                    Escreva a pronúncia em romaji (ex: a, ka, sa)
                </p>
            </main>
        </div>
    );
}
