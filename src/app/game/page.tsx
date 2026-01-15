"use client";

import { useState, useEffect } from 'react';
import { JapaneseItem, HIRAGANA_DATA } from '@/data/japanese';
import confetti from 'canvas-confetti';

export default function GameMode() {
    const [currentItem, setCurrentItem] = useState<JapaneseItem | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const nextQuestion = () => {
        const item = HIRAGANA_DATA[Math.floor(Math.random() * HIRAGANA_DATA.length)];
        setCurrentItem(item);

        const others = HIRAGANA_DATA
            .filter(i => i.id !== item.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(i => i.romaji);

        setOptions([...others, item.romaji].sort(() => 0.5 - Math.random()));
        setFeedback(null);
    };

    useEffect(() => {
        nextQuestion();
    }, []);

    const handleAnswer = (answer: string) => {
        if (answer === currentItem?.romaji) {
            setFeedback('correct');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff3e3e', '#ffd700', '#ffffff']
            });
            setTimeout(nextQuestion, 1500);
        } else {
            setFeedback('wrong');
        }
    };

    if (!currentItem) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="glass-card animate-fade-in" style={{ padding: '4rem', textAlign: 'center', width: '100%', maxWidth: '500px' }}>
                <div style={{ fontSize: '8rem', marginBottom: '2rem', fontFamily: 'var(--font-jp)' }}>
                    {currentItem.char}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {options.map((opt) => (
                        <button
                            key={opt}
                            className="btn-primary"
                            style={{
                                background: feedback === 'correct' && opt === currentItem.romaji ? '#4caf50' :
                                    feedback === 'wrong' && opt !== currentItem.romaji ? 'rgba(255,255,255,0.05)' : 'var(--accent-primary)',
                                fontSize: '1.5rem'
                            }}
                            onClick={() => handleAnswer(opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {feedback === 'wrong' && (
                    <p style={{ color: 'var(--accent-primary)', marginTop: '1.5rem' }}>Tente novamente!</p>
                )}
            </div>
        </div>
    );
}
