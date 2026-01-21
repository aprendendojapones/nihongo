"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InteractivePractice from '@/components/InteractivePractice';
import { HIRAGANA_DATA, KATAKANA_DATA, KANJI_N5, VOCAB_N5, JapaneseItem } from '@/data/japanese';
import { ArrowLeft } from 'lucide-react';
import '../dashboard/dashboard.css';

function PracticePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'hiragana';
    const [showResults, setShowResults] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    const getCharacters = (): JapaneseItem[] => {
        switch (type) {
            case 'hiragana':
                return HIRAGANA_DATA;
            case 'katakana':
                return KATAKANA_DATA;
            case 'kanji-n5':
            case 'kanji_basics':
                return KANJI_N5;
            case 'vocab-n5':
            case 'n5_vocab':
                return VOCAB_N5;
            default:
                return HIRAGANA_DATA;
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'hiragana':
                return 'Prática de Hiragana';
            case 'katakana':
                return 'Prática de Katakana';
            case 'kanji-n5':
            case 'kanji_basics':
                return 'Prática de Kanji N5';
            case 'vocab-n5':
            case 'n5_vocab':
                return 'Prática de Vocabulário N5';
            default:
                return 'Prática';
        }
    };

    const handleComplete = (score: number) => {
        setFinalScore(score);
        setShowResults(true);
    };

    if (showResults) {
        return (
            <div className="dashboard-container">
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' }}>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                        {finalScore >= 80 ? '🎉' : finalScore >= 60 ? '👍' : '💪'}
                    </h1>
                    <h2>Prática Concluída!</h2>
                    <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--accent-primary)', margin: '2rem 0' }}>
                        {finalScore}%
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        {finalScore >= 80 ? 'Excelente trabalho!' : finalScore >= 60 ? 'Bom trabalho! Continue praticando.' : 'Continue se esforçando!'}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn-primary"
                            onClick={() => setShowResults(false)}
                            style={{ flex: 1 }}
                        >
                            Praticar Novamente
                        </button>
                        <button
                            className="btn-primary"
                            onClick={() => router.push('/lessons')}
                            style={{ flex: 1, background: 'transparent', border: '1px solid var(--accent-primary)' }}
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <button
                    className="btn-primary"
                    onClick={() => router.back()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={20} /> Voltar
                </button>
                <h1 className="gradient-text">{getTitle()}</h1>
            </header>

            <main style={{ padding: '2rem' }}>
                <InteractivePractice
                    characters={getCharacters()}
                    mode="sequential"
                    onComplete={handleComplete}
                />
            </main>
        </div>
    );
}

export default function PracticePage() {
    return (
        <Suspense fallback={<div className="flex-center" style={{ height: '100vh' }}>Carregando...</div>}>
            <PracticePageContent />
        </Suspense>
    );
}
