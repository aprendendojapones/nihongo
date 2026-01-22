"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/TranslationContext';
import confetti from 'canvas-confetti';
import './handwriting.css'; // Reuse existing styles for consistency

interface SentenceProblem {
    id: string;
    targetSentence: string; // The correct Japanese sentence
    translation: string; // The Portuguese/English translation
    words: string[]; // The words to be arranged
}

const SENTENCE_DATA: SentenceProblem[] = [
    {
        id: '1',
        targetSentence: '私は日本語を勉強します',
        translation: 'Eu estudo japonês',
        words: ['私', 'は', '日本語', 'を', '勉強', 'します']
    },
    {
        id: '2',
        targetSentence: 'これは何ですか',
        translation: 'O que é isto?',
        words: ['これ', 'は', '何', 'ですか']
    },
    {
        id: '3',
        targetSentence: '寿司が好きです',
        translation: 'Eu gosto de sushi',
        words: ['寿司', 'が', '好き', 'です']
    },
    {
        id: '4',
        targetSentence: 'トイレはどこですか',
        translation: 'Onde fica o banheiro?',
        words: ['トイレ', 'は', 'どこ', 'ですか']
    },
    {
        id: '5',
        targetSentence: '明日東京に行きます',
        translation: 'Amanhã vou para Tóquio',
        words: ['明日', '東京', 'に', '行きます']
    }
];

interface SentenceScrambleModeProps {
    onComplete: (score: number) => void;
}

export default function SentenceScrambleMode({ onComplete }: SentenceScrambleModeProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const currentProblem = SENTENCE_DATA[currentProblemIndex];

    useEffect(() => {
        if (currentProblem) {
            // Shuffle words
            const shuffled = [...currentProblem.words].sort(() => Math.random() - 0.5);
            setAvailableWords(shuffled);
            setSelectedWords([]);
            setFeedback(null);
        }
    }, [currentProblem]);

    const handleWordClick = (word: string, index: number, isSelected: boolean) => {
        if (feedback) return;

        if (isSelected) {
            // Remove from selected, add back to available
            const newSelected = [...selectedWords];
            newSelected.splice(index, 1);
            setSelectedWords(newSelected);
            setAvailableWords([...availableWords, word]);
        } else {
            // Add to selected, remove from available
            const newAvailable = [...availableWords];
            newAvailable.splice(index, 1);
            setAvailableWords(newAvailable);
            setSelectedWords([...selectedWords, word]);
        }
    };

    const checkAnswer = () => {
        const formedSentence = selectedWords.join('');
        if (formedSentence === currentProblem.targetSentence) {
            setFeedback('correct');
            setScore(s => s + 20);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setTimeout(() => {
                if (currentProblemIndex < SENTENCE_DATA.length - 1) {
                    setCurrentProblemIndex(prev => prev + 1);
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
                <p className="text-xl mb-8">Você completou o desafio de frases!</p>
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
                <div className="text-xl font-bold">Frase {currentProblemIndex + 1}/{SENTENCE_DATA.length}</div>
                <div className="text-xl font-bold text-accent-secondary">{score} pts</div>
            </header>

            <main className="flex flex-col items-center gap-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl text-gray-400 mb-2">Traduza esta frase:</h2>
                    <p className="text-3xl font-bold text-white">{currentProblem.translation}</p>
                </div>

                {/* Selected Words Area */}
                <div className="w-full min-h-[80px] p-4 bg-white/5 rounded-xl border-2 border-white/10 flex flex-wrap gap-3 justify-center items-center mb-4 transition-all">
                    {selectedWords.length === 0 && (
                        <span className="text-gray-500 italic">Toque nas palavras para formar a frase...</span>
                    )}
                    {selectedWords.map((word, index) => (
                        <button
                            key={`selected-${index}`}
                            onClick={() => handleWordClick(word, index, true)}
                            className="px-4 py-2 bg-accent-primary text-white rounded-lg font-bold text-xl shadow-lg transform hover:scale-105 transition-all animate-fade-in"
                        >
                            {word}
                        </button>
                    ))}
                </div>

                {/* Available Words Area */}
                <div className="flex flex-wrap gap-3 justify-center">
                    {availableWords.map((word, index) => (
                        <button
                            key={`available-${index}`}
                            onClick={() => handleWordClick(word, index, false)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xl border border-white/10 transition-all"
                        >
                            {word}
                        </button>
                    ))}
                </div>

                {/* Check Button */}
                <button
                    onClick={checkAnswer}
                    disabled={selectedWords.length === 0 || !!feedback}
                    className={`mt-8 px-12 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 ${selectedWords.length > 0
                        ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-primary/20'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Verificar
                </button>

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
