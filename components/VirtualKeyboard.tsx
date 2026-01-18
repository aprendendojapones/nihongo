"use client";

import { useState } from 'react';
import { Delete, ChevronDown, ChevronUp } from 'lucide-react';

interface VirtualKeyboardProps {
    onInput: (char: string) => void;
    onDelete: () => void;
    visible: boolean;
    onToggle: () => void;
}

const HIRAGANA = [
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['さ', 'し', 'す', 'せ', 'そ'],
    ['た', 'ち', 'つ', 'て', 'と'],
    ['な', 'に', 'ぬ', 'ね', 'の'],
    ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    ['ま', 'み', 'む', 'め', 'も'],
    ['や', 'ゆ', 'よ'],
    ['ら', 'り', 'る', 'れ', 'ろ'],
    ['わ', 'を', 'ん']
];

const KATAKANA = [
    ['ア', 'イ', 'ウ', 'エ', 'オ'],
    ['カ', 'キ', 'ク', 'ケ', 'コ'],
    ['サ', 'シ', 'ス', 'セ', 'ソ'],
    ['タ', 'チ', 'ツ', 'テ', 'ト'],
    ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
    ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
    ['マ', 'ミ', 'ム', 'メ', 'モ'],
    ['ヤ', 'ユ', 'ヨ'],
    ['ラ', 'リ', 'ル', 'レ', 'ロ'],
    ['ワ', 'ヲ', 'ン']
];

export default function VirtualKeyboard({ onInput, onDelete, visible, onToggle }: VirtualKeyboardProps) {
    const [mode, setMode] = useState<'hiragana' | 'katakana'>('hiragana');

    if (!visible) {
        return (
            <button
                onClick={onToggle}
                className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:opacity-90 transition-all"
                title="Open Keyboard"
            >
                <span className="text-xl font-bold">あ</span>
            </button>
        );
    }

    const currentLayout = mode === 'hiragana' ? HIRAGANA : KATAKANA;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center p-2 border-b border-border bg-muted/30">
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('hiragana')}
                        className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${mode === 'hiragana'
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-muted text-muted-foreground'
                            }`}
                    >
                        あ Hiragana
                    </button>
                    <button
                        onClick={() => setMode('katakana')}
                        className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${mode === 'katakana'
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-muted text-muted-foreground'
                            }`}
                    >
                        ア Katakana
                    </button>
                </div>
                <button
                    onClick={onToggle}
                    className="p-2 hover:bg-muted rounded-full text-muted-foreground"
                >
                    <ChevronDown size={20} />
                </button>
            </div>

            <div className="p-2 overflow-x-auto">
                <div className="flex flex-col gap-1 min-w-[300px]">
                    {currentLayout.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-1">
                            {row.map((char) => (
                                <button
                                    key={char}
                                    onClick={() => onInput(char)}
                                    className="w-10 h-10 flex items-center justify-center rounded bg-card hover:bg-accent hover:text-accent-foreground border border-border text-lg shadow-sm active:scale-95 transition-transform"
                                >
                                    {char}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-2 border-t border-border flex justify-end bg-muted/30">
                <button
                    onClick={onDelete}
                    className="px-6 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md flex items-center gap-2 transition-colors"
                >
                    <Delete size={18} /> Backspace
                </button>
            </div>
        </div>
    );
}
