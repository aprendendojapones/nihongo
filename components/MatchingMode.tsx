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
