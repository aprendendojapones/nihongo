"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, HelpCircle, Smartphone, MousePointer2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/TranslationContext';
import confetti from 'canvas-confetti';
import HandwritingCanvas from '@/components/HandwritingCanvas';
import './handwriting.css';

interface KanjiProblem {
    id: string;
    char: string;
    meaning: string;
    reading: string;
    hint?: string;
}

const KANJI_DATA: KanjiProblem[] = [
    { id: '1', char: '日', meaning: 'Sol / Dia', reading: 'Hi / Nichi' },
    { id: '2', char: '月', meaning: 'Lua / Mês', reading: 'Tsuki / Getsu' },
    { id: '3', char: '木', meaning: 'Árvore', reading: 'Ki / Moku' },
    { id: '4', char: '山', meaning: 'Montanha', reading: 'Yama / San' },
    { id: '5', char: '川', meaning: 'Rio', reading: 'Kawa / Sen' },
    { id: '6', char: '田', meaning: 'Campo de Arroz', reading: 'Ta / Den' },
    { id: '7', char: '人', meaning: 'Pessoa', reading: 'Hito / Jin' },
    { id: '8', char: '口', meaning: 'Boca', reading: 'Kuchi / Kou' },
    { id: '9', char: '車', meaning: 'Carro', reading: 'Kuruma / Sha' },
    { id: '10', char: '門', meaning: 'Portão', reading: 'Mon / Kado' }
];

interface KanjiDrawingModeProps {
    onComplete: (score: number) => void;
}

export default function KanjiDrawingMode({ onComplete }: KanjiDrawingModeProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [showHint, setShowHint] = useState(false);

    const currentProblem = KANJI_DATA[currentIndex];

    const handleRecognize = (recognizedChar: string) => {
        if (feedback) return;

        if (recognizedChar === currentProblem.char) {
            setFeedback('correct');
            setScore(s => s + 20);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            setTimeout(() => {
                if (currentIndex < KANJI_DATA.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                    setFeedback(null);
                    setShowHint(false);
                } else {
                    setIsFinished(true);
                    onComplete(score + 20);
                }
            }, 1500);
        } else {
            setFeedback('wrong');
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <h2 className="text-3xl font-bold mb-4 gradient-text">Parabéns!</h2>
                <p className="text-xl mb-8">Você completou o desafio de Kanji!</p>
                <div className="text-4xl font-bold mb-8 text-primary">{score} pts</div>
                <button
                    onClick={() => router.back()}
                    className="px-8 py-3 bg-primary rounded-full text-white font-bold hover:opacity-90 transition-all"
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="game-container max-w-4xl mx-auto p-4">
            <header className="flex items-center justify-between mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="text-xl font-bold">Kanji {currentIndex + 1}/{KANJI_DATA.length}</div>
                <div className="text-xl font-bold text-accent-secondary">{score} pts</div>
            </header>

            <main className="flex flex-col items-center gap-8">
                <div className="text-center mb-4">
                    <h2 className="text-gray-400 mb-2">Desenhe o Kanji para:</h2>
                    <p className="text-4xl font-bold text-white mb-2">{currentProblem.meaning}</p>
                    <p className="text-xl text-accent-primary">{currentProblem.reading}</p>
                </div>

                <div className="relative w-full max-w-[400px] aspect-square">
                    <HandwritingCanvas
                        onRecognize={handleRecognize}
                        expectedChar={currentProblem.char}
                    />

                    {/* Hint Overlay */}
                    {showHint && (
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center opacity-20">
                            <span className="text-[250px] font-jp text-white">{currentProblem.char}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <HelpCircle size={20} />
                        {showHint ? 'Ocultar Dica' : 'Ver Dica'}
                    </button>
                </div>

                {feedback && (
                    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-full flex items-center gap-3 text-xl font-bold shadow-2xl animate-bounce ${feedback === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        {feedback === 'correct' ? (
                            <><CheckCircle2 size={28} /> Correto!</>
                        ) : (
                            <><XCircle size={28} /> Tente novamente</>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
