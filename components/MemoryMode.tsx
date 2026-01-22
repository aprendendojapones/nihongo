"use client";

import { useState, useEffect } from 'react';
import { JapaneseItem } from '@/data/japanese';
import { Check, X, Clock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryModeProps {
    characters: JapaneseItem[];
    onComplete: (score: number) => void;
}

interface Card {
    id: string;
    content: string;
    type: 'char' | 'romaji';
    isFlipped: boolean;
    isMatched: boolean;
    item: JapaneseItem;
}

export default function MemoryMode({ characters, onComplete }: MemoryModeProps) {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<Card[]>([]);
    const [matchedCount, setMatchedCount] = useState(0);
    const [moves, setMoves] = useState(0);
    const [startTime] = useState(Date.now());
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        const initializeGame = () => {
            // Select random characters if too many (limit to 8 pairs for 4x4 grid)
            const selectedChars = characters.sort(() => Math.random() - 0.5).slice(0, 8);

            const newCards: Card[] = [];
            selectedChars.forEach((char, index) => {
                // Character card
                newCards.push({
                    id: `char-${index}`,
                    content: char.char,
                    type: 'char',
                    isFlipped: false,
                    isMatched: false,
                    item: char
                });
                // Romaji card
                newCards.push({
                    id: `romaji-${index}`,
                    content: char.romaji,
                    type: 'romaji',
                    isFlipped: false,
                    isMatched: false,
                    item: char
                });
            });

            setCards(newCards.sort(() => Math.random() - 0.5));
        };
        initializeGame();
    }, [characters]);

    const handleCardClick = (clickedCard: Card) => {
        if (isLocked || clickedCard.isFlipped || clickedCard.isMatched) return;

        const newCards = cards.map(card =>
            card.id === clickedCard.id ? { ...card, isFlipped: true } : card
        );
        setCards(newCards);

        const newFlipped = [...flippedCards, clickedCard];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            setIsLocked(true);
            checkForMatch(newFlipped, newCards);
        }
    };

    const checkForMatch = (currentFlipped: Card[], currentCards: Card[]) => {
        const [card1, card2] = currentFlipped;
        const isMatch = card1.item.char === card2.item.char;

        if (isMatch) {
            setTimeout(() => {
                setCards(currentCards.map(card =>
                    card.id === card1.id || card.id === card2.id
                        ? { ...card, isMatched: true, isFlipped: true }
                        : card
                ));
                setFlippedCards([]);
                setIsLocked(false);
                setMatchedCount(prev => {
                    const newCount = prev + 1;
                    if (newCount === currentCards.length / 2) {
                        finishGame(moves + 1);
                    }
                    return newCount;
                });
            }, 500);
        } else {
            setTimeout(() => {
                setCards(currentCards.map(card =>
                    card.id === card1.id || card.id === card2.id
                        ? { ...card, isFlipped: false }
                        : card
                ));
                setFlippedCards([]);
                setIsLocked(false);
            }, 1000);
        }
    };

    const finishGame = (finalMoves: number) => {
        // Calculate score based on moves vs optimal moves
        // Optimal is N pairs. Score = max(0, 100 - (moves - optimal) * 5)
        const optimalMoves = cards.length / 2;
        const penalty = (finalMoves - optimalMoves) * 5;
        const score = Math.max(0, 100 - penalty);

        setTimeout(() => {
            onComplete(score);
        }, 1000);
    };

    return (
        <div className="glass-card mem-container">
            <div className="mem-header">
                <div>
                    <h2 className="gradient-text mem-title">Memória</h2>
                    <p className="mem-subtitle">Encontre os pares</p>
                </div>
                <div className="mem-stats">
                    <div className="mem-stat-item">
                        <span className="mem-stat-label">Jogadas</span>
                        <span className="mem-stat-value">{moves}</span>
                    </div>
                    <div className="mem-stat-item">
                        <span className="mem-stat-label">Pares</span>
                        <span className="mem-stat-value">{matchedCount}/{cards.length / 2}</span>
                    </div>
                </div>
            </div>

            <div className="mem-grid">
                {cards.map(card => (
                    <div
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        className={`mem-card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
                    >
                        {/* Front (Hidden) */}
                        <div className="mem-card-face mem-card-front">
                            ?
                        </div>

                        {/* Back (Revealed) */}
                        <div className={`mem-card-face mem-card-back ${card.type} ${card.isMatched ? 'matched' : ''}`}>
                            {card.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
