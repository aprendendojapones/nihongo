"use client";

import { useState, useEffect } from 'react';
import { JapaneseItem } from '@/data/japanese';
import { Check, X, Zap } from 'lucide-react';

interface MatchingModeProps {
    characters: JapaneseItem[];
    onComplete: (score: number) => void;
}

interface MatchItem {
    id: string;
    content: string;
    type: 'char' | 'romaji';
    item: JapaneseItem;
    state: 'idle' | 'selected' | 'matched' | 'wrong';
}

export default function MatchingMode({ characters, onComplete }: MatchingModeProps) {
    const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
    const [rightItems, setRightItems] = useState<MatchItem[]>([]);
    const [selectedLeft, setSelectedLeft] = useState<MatchItem | null>(null);
    const [selectedRight, setSelectedRight] = useState<MatchItem | null>(null);
    const [score, setScore] = useState(0);
    const [matches, setMatches] = useState(0);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        // Limit to 5 pairs for better mobile UX
        const selectedChars = characters.sort(() => Math.random() - 0.5).slice(0, 5);

        const left: MatchItem[] = selectedChars.map((char, i) => ({
            id: `left-${i}`,
            content: char.char,
            type: 'char',
            item: char,
            state: 'idle'
        })).sort(() => Math.random() - 0.5);

        const right: MatchItem[] = selectedChars.map((char, i) => ({
            id: `right-${i}`,
            content: char.romaji,
            type: 'romaji',
            item: char,
            state: 'idle'
        })).sort(() => Math.random() - 0.5);

        setLeftItems(left);
        setRightItems(right);
    };

    const handleItemClick = (item: MatchItem, side: 'left' | 'right') => {
        if (item.state === 'matched' || item.state === 'wrong') return;

        // Reset previous wrong states
        if (selectedLeft?.state === 'wrong' || selectedRight?.state === 'wrong') {
            clearSelection();
            // If clicking the same item that was wrong, just select it
            // Otherwise, continue with new selection
        }

        if (side === 'left') {
            if (selectedLeft?.id === item.id) {
                setSelectedLeft(null);
                updateItemState(leftItems, setLeftItems, item.id, 'idle');
            } else {
                setSelectedLeft(item);
                updateItemState(leftItems, setLeftItems, item.id, 'selected');
                // Deselect other left items
                leftItems.forEach(i => {
                    if (i.id !== item.id && i.state === 'selected') {
                        updateItemState(leftItems, setLeftItems, i.id, 'idle');
                    }
                });
            }
        } else {
            if (selectedRight?.id === item.id) {
                setSelectedRight(null);
                updateItemState(rightItems, setRightItems, item.id, 'idle');
            } else {
                setSelectedRight(item);
                updateItemState(rightItems, setRightItems, item.id, 'selected');
                // Deselect other right items
                rightItems.forEach(i => {
                    if (i.id !== item.id && i.state === 'selected') {
                        updateItemState(rightItems, setRightItems, i.id, 'idle');
                    }
                });
            }
        }
    };

    useEffect(() => {
        if (selectedLeft && selectedRight) {
            checkMatch();
        }
    }, [selectedLeft, selectedRight]);

    const checkMatch = () => {
        if (!selectedLeft || !selectedRight) return;

        const isMatch = selectedLeft.item.char === selectedRight.item.char;

        if (isMatch) {
            updateItemState(leftItems, setLeftItems, selectedLeft.id, 'matched');
            updateItemState(rightItems, setRightItems, selectedRight.id, 'matched');
            setScore(prev => prev + 20);
            setMatches(prev => {
                const newMatches = prev + 1;
                if (newMatches === leftItems.length) {
                    setTimeout(() => finishGame(), 1000);
                }
                return newMatches;
            });
            setSelectedLeft(null);
            setSelectedRight(null);
        } else {
            updateItemState(leftItems, setLeftItems, selectedLeft.id, 'wrong');
            updateItemState(rightItems, setRightItems, selectedRight.id, 'wrong');
            setScore(prev => Math.max(0, prev - 5));

            setTimeout(() => {
                updateItemState(leftItems, setLeftItems, selectedLeft.id, 'idle');
                updateItemState(rightItems, setRightItems, selectedRight.id, 'idle');
                setSelectedLeft(null);
                setSelectedRight(null);
            }, 800);
        }
    };

    const updateItemState = (list: MatchItem[], setList: any, id: string, state: MatchItem['state']) => {
        setList((prev: MatchItem[]) => prev.map(item => item.id === id ? { ...item, state } : item));
    };

    const clearSelection = () => {
        setLeftItems(prev => prev.map(i => i.state === 'wrong' || i.state === 'selected' ? { ...i, state: 'idle' } : i));
        setRightItems(prev => prev.map(i => i.state === 'wrong' || i.state === 'selected' ? { ...i, state: 'idle' } : i));
        setSelectedLeft(null);
        setSelectedRight(null);
    };

    const finishGame = () => {
        // Bonus for speed could be added here
        onComplete(score);
    };

    const getItemStyle = (item: MatchItem) => {
        let baseStyle = {
            padding: '1.5rem',
            borderRadius: '12px',
            cursor: 'pointer',
            border: '2px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: item.type === 'char' ? '2rem' : '1.2rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            height: '80px'
        };

        if (item.state === 'selected') {
            baseStyle.border = '2px solid var(--accent-primary)';
            baseStyle.background = 'rgba(62, 255, 162, 0.1)';
        } else if (item.state === 'matched') {
            baseStyle.border = '2px solid #4ade80';
            baseStyle.background = 'rgba(76, 175, 80, 0.2)';
            baseStyle.cursor = 'default';
            // @ts-ignore
            baseStyle.opacity = 0.5;
        } else if (item.state === 'wrong') {
            baseStyle.border = '2px solid #ff3e3e';
            baseStyle.background = 'rgba(255, 62, 62, 0.2)';
        }

        return baseStyle;
    };

    return (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="gradient-text" style={{ margin: 0 }}>Combinação</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Conecte os pares</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={24} color="var(--accent-secondary)" />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{score}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    {leftItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item, 'left')}
                            style={getItemStyle(item)}
                        >
                            {item.content}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    {rightItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item, 'right')}
                            style={getItemStyle(item)}
                        >
                            {item.content}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
