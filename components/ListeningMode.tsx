"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/TranslationContext';
import confetti from 'canvas-confetti';
import './handwriting.css';

interface ListeningProblem {
    id: string;
    char: string;
    romaji: string;
    options: string[]; // Options to choose from (can be romaji or other chars)
}

const LISTENING_DATA: ListeningProblem[] = [
    { id: '1', char: 'あ', romaji: 'a', options: ['a', 'i', 'u', 'e'] },
    { id: '2', char: 'か', romaji: 'ka', options: ['ka', 'ki', 'ku', 'ko'] },
    { id: '3', char: 'さ', romaji: 'sa', options: ['sa', 'shi', 'su', 'se'] },
    { id: '4', char: 'た', romaji: 'ta', options: ['ta', 'chi', 'tsu', 'te'] },
    { id: '5', char: 'な', romaji: 'na', options: ['na', 'ni', 'nu', 'ne'] },
    { id: '6', char: 'は', romaji: 'ha', options: ['ha', 'hi', 'fu', 'he'] },
    { id: '7', char: 'ま', romaji: 'ma', options: ['ma', 'mi', 'mu', 'me'] },
    { id: '8', char: 'や', romaji: 'ya', options: ['ya', 'yu', 'yo', 'wa'] },
    { id: '9', char: 'ら', romaji: 'ra', options: ['ra', 'ri', 'ru', 're'] },
    { id: '10', char: 'わ', romaji: 'wa', options: ['wa', 'wo', 'n', 'ya'] }
];

interface ListeningModeProps {
    onComplete: (score: number) => void;
}

export default function ListeningMode({ onComplete }: ListeningModeProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const currentProblem = LISTENING_DATA[currentProblemIndex];

    const playAudio = React.useCallback(() => {
        if (isPlaying) return;
        setIsPlaying(true);

        // Using browser's SpeechSynthesis for simplicity
        const utterance = new SpeechSynthesisUtterance(currentProblem.char);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.8;

        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
    }, [currentProblem, isPlaying]);

    useEffect(() => {
        // Auto-play when problem changes
        if (!isFinished) {
            setTimeout(playAudio, 500);
        }
    }, [currentProblemIndex, isFinished, playAudio]);

    const handleOptionClick = (option: string) => {
        if (feedback) return;

        if (option === currentProblem.romaji) {
            setFeedback('correct');
            setScore(s => s + 10);
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 }
            });
            setTimeout(() => {
                if (currentProblemIndex < LISTENING_DATA.length - 1) {
                    setCurrentProblemIndex(prev => prev + 1);
                    setFeedback(null);
                } else {
                    setIsFinished(true);
                    onComplete(score + 10);
                }
            }, 1000);
        } else {
            setFeedback('wrong');
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <h2 className="text-3xl font-bold mb-4 gradient-text">Parabéns!</h2>
                <p className="text-xl mb-8">Você completou o treino de audição!</p>
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
                <div className="text-xl font-bold">Questão {currentProblemIndex + 1}/{LISTENING_DATA.length}</div>
                <div className="text-xl font-bold text-accent-secondary">{score} pts</div>
            </header>

            <main className="flex flex-col items-center gap-12">
                <div className="text-center">
                    <h2 className="text-2xl text-gray-400 mb-8">Ouça e escolha o Romaji correto</h2>

                    <button
                        onClick={playAudio}
                        className={`w-48 h-48 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${isPlaying
                            ? 'bg-accent-primary shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-110'
                            : 'bg-white/10 hover:bg-white/20 border-4 border-white/20'
                            }`}
                    >
                        <Volume2 size={80} className={isPlaying ? 'text-white animate-pulse' : 'text-gray-300'} />
                    </button>
                    <p className="mt-4 text-gray-500 text-sm">Toque para ouvir novamente</p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    {currentProblem.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionClick(option)}
                            className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-2xl font-bold transition-all hover:scale-105 active:scale-95"
                        >
                            {option}
                        </button>
                    ))}
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
