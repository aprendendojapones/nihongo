"use client";

import { useState, useEffect, useCallback } from 'react';
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

    useEffect(() => {
        const initializeGame = () => {
            // Limit to 5 pairs for better mobile UX
            const selectedChars = characters.sort(() => Math.random() - 0.5).slice(0, 5);

            const left: MatchItem[] = selectedChars.map((char, i) => ({
                id: `left-${i}`,
                content: char.char,
                type: 'char' as const,
                item: char,
                state: 'idle' as const
            })).sort(() => Math.random() - 0.5);

            const right: MatchItem[] = selectedChars.map((char, i) => ({
                id: `right-${i}`,
                content: char.romaji,
                type: 'romaji' as const,
                item: char,
                state: 'idle' as const
            })).sort(() => Math.random() - 0.5);

            setLeftItems(left);
            setRightItems(right);
        };
        initializeGame();
    }, [characters]);

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

    const updateItemState = (list: MatchItem[], setList: any, id: string, state: MatchItem['state']) => {
        setList((prev: MatchItem[]) => prev.map(item => item.id === id ? { ...item, state } : item));
    };

    const clearSelection = () => {
        setLeftItems(prev => prev.map(i => i.state === 'wrong' || i.state === 'selected' ? { ...i, state: 'idle' } : i));
        setRightItems(prev => prev.map(i => i.state === 'wrong' || i.state === 'selected' ? { ...i, state: 'idle' } : i));
        setSelectedLeft(null);
        setSelectedRight(null);
    };

    const finishGame = useCallback((finalScore: number) => {
        onComplete(finalScore);
    }, [onComplete]);

    useEffect(() => {
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
                        setTimeout(() => finishGame(score + 20), 1000);
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

        if (selectedLeft && selectedRight) {
            checkMatch();
        }
    }, [selectedLeft, selectedRight, leftItems, rightItems, onComplete, score, leftItems.length, finishGame, updateItemState]);

    const getItemClass = (item: MatchItem) => {
        let className = `mm-item ${item.type}`;
        if (item.state === 'selected') className += ' selected';
        else if (item.state === 'matched') className += ' matched';
        else if (item.state === 'wrong') className += ' wrong';
        return className;
    };

    return (
        <div className="glass-card mm-container">
            <div className="mm-header">
                <div>
                    <h2 className="gradient-text mm-title">Combinação</h2>
                    <p className="mm-subtitle">Conecte os pares</p>
                </div>
                <div className="mm-score">
                    <Zap size={24} color="var(--accent-secondary)" />
                    <span className="mm-score-value">{score}</span>
                </div>
            </div>

            <div className="mm-grid">
                <div className="mm-column">
                    {leftItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item, 'left')}
                            className={getItemClass(item)}
                        >
                            {item.content}
                        </div>
                    ))}
                </div>

                <div className="mm-column">
                    {rightItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item, 'right')}
                            className={getItemClass(item)}
                        >
                            {item.content}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
