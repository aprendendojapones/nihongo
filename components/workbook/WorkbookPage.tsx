"use client";

import { useState } from 'react';
import { WorkbookPage, WorkbookBlock } from '@/types/workbook-schema';
import { Play, Volume2, CheckCircle, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Assuming we can use this, or we'll simple-text it

interface WorkbookPageProps {
    page: WorkbookPage;
    onComplete?: () => void;
}

export default function WorkbookPageComponent({ page, onComplete }: WorkbookPageProps) {
    // State to store user answers by block ID
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong' | null>>({});

    const handleFillBlankChange = (blockId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [blockId]: value }));
        // Reset feedback when user types
        setFeedback(prev => ({ ...prev, [blockId]: null }));
    };

    const checkAnswer = (block: WorkbookBlock) => {
        const userAnswer = answers[block.id];
        if (!userAnswer) return;

        const isCorrect = String(userAnswer).toLowerCase().trim() === String(block.correctAnswer).toLowerCase().trim();
        setFeedback(prev => ({ ...prev, [block.id]: isCorrect ? 'correct' : 'wrong' }));
    };

    const playAudio = (url?: string) => {
        if (!url) return;
        // Mock audio play
        alert(`Playing audio: ${url}`);
        // In real impl: new Audio(url).play();
    };

    const renderBlock = (block: WorkbookBlock) => {
        switch (block.type) {
            case 'text':
                return (
                    <div key={block.id} className="mb-6 text-gray-300 leading-relaxed whitespace-pre-line">
                        {block.content}
                    </div>
                );

            case 'audio_example':
                return (
                    <div key={block.id} className="mb-6 bg-[#1a1a1a] p-4 rounded-lg border border-[#333] flex items-center gap-4">
                        <button 
                            onClick={() => playAudio(block.url)}
                            className="bg-[#2a2a2a] hover:bg-[#333] p-3 rounded-full transition-colors text-accent-primary"
                        >
                            <Volume2 size={24} />
                        </button>
                        <div>
                            <p className="text-xl font-bold text-white mb-1">{block.japanese}</p>
                            <p className="text-sm text-gray-400">{block.translation}</p>
                        </div>
                    </div>
                );

            case 'fill_blank':
                return (
                    <div key={block.id} className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                        <p className="mb-3 text-white font-medium">Exercício: {block.question}</p>
                        <div className="flex gap-2 items-center">
                            <input 
                                type="text" 
                                value={answers[block.id] || ''}
                                onChange={(e) => handleFillBlankChange(block.id, e.target.value)}
                                className="bg-[#0a0a0a] border border-[#444] rounded px-3 py-2 text-white outline-none focus:border-accent-primary"
                                placeholder="Sua resposta..."
                            />
                            <button 
                                onClick={() => checkAnswer(block)}
                                className="px-4 py-2 bg-[#333] hover:bg-[#444] rounded text-white text-sm transition-colors"
                            >
                                Verificar
                            </button>
                            {feedback[block.id] === 'correct' && <CheckCircle className="text-green-500" size={20} />}
                            {feedback[block.id] === 'wrong' && <XCircle className="text-red-500" size={20} />}
                        </div>
                    </div>
                );

            case 'multiple_choice':
                return (
                    <div key={block.id} className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                        <p className="mb-3 text-white font-medium">{block.question}</p>
                        <div className="flex flex-col gap-2">
                            {block.options?.map((opt, idx) => (
                                <label 
                                    key={idx} 
                                    className={`flex items-center gap-3 p-3 rounded cursor-pointer border transition-colors ${
                                        answers[block.id] === opt 
                                            ? 'bg-[#333] border-accent-primary' 
                                            : 'border-transparent hover:bg-[#222]'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name={`block_${block.id}`} 
                                        value={opt}
                                        checked={answers[block.id] === opt}
                                        onChange={() => {
                                            setAnswers(prev => ({ ...prev, [block.id]: opt }));
                                            // Auto-check for MC
                                            const isCorrect = opt === block.correctAnswer;
                                            setFeedback(prev => ({ ...prev, [block.id]: isCorrect ? 'correct' : 'wrong' }));
                                        }}
                                        className="accent-accent-primary"
                                    />
                                    <span className="text-gray-200">{opt}</span>
                                    {answers[block.id] === opt && feedback[block.id] === 'correct' && <CheckCircle className="text-green-500 ml-auto" size={16} />}
                                    {answers[block.id] === opt && feedback[block.id] === 'wrong' && <XCircle className="text-red-500 ml-auto" size={16} />}
                                </label>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-2">
            <h1 className="text-3xl font-bold mb-2 gradient-text">{page.title}</h1>
            <div className="h-1 w-20 bg-accent-primary mb-8 rounded"></div>

            <div className="space-y-4">
                {page.blocks.map(renderBlock)}
            </div>

            <div className="mt-12 flex justify-end">
                <button 
                    onClick={onComplete}
                    className="btn-primary flex items-center gap-2"
                >
                    Próxima Página <Play size={16} />
                </button>
            </div>
        </div>
    );
}
