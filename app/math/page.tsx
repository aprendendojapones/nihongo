"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Trophy, Zap, ArrowLeft, GraduationCap } from 'lucide-react';
import '../dashboard/dashboard.css';
import MathQuiz from '@/components/math/MathQuiz';
import MathProgression from '@/components/math/MathProgression';
import MathDash from '@/components/math/MathDash';

export default function MathPage() {
    const router = useRouter();
    const [gameMode, setGameMode] = useState<'menu' | 'quiz' | 'progression' | 'dash'>('menu');

    const renderGame = () => {
        switch (gameMode) {
            case 'quiz':
                return <MathQuiz onBack={() => setGameMode('menu')} />;
            case 'progression':
                return <MathProgression onBack={() => setGameMode('menu')} />;
            case 'dash':
                return <MathDash onBack={() => setGameMode('menu')} />;
            default:
                return null;
        }
    };

    if (gameMode !== 'menu') {
        return (
            <div className="dashboard-container">
                {renderGame()}
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <button
                    className="btn-primary"
                    onClick={() => router.push('/dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={20} /> Voltar ao Dashboard
                </button>
                <h1 className="gradient-text">Jogos de Matemática</h1>
            </header>

            <main className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', padding: '1rem' }}>
                <div
                    className="glass-card clickable-card"
                    onClick={() => setGameMode('quiz')}
                    style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
                >
                    <div className="icon-container" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', margin: '0 auto 1.5rem' }}>
                        <Calculator size={40} />
                    </div>
                    <h3>Múltipla Escolha</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Pratique contas rápidas com 4 opções de resposta.</p>
                </div>

                <div
                    className="glass-card clickable-card"
                    onClick={() => setGameMode('progression')}
                    style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
                >
                    <div className="icon-container" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', margin: '0 auto 1.5rem' }}>
                        <GraduationCap size={40} />
                    </div>
                    <h3>Níveis Escolares</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Suba de nível resolvendo contas e passando em provas.</p>
                </div>

                <div
                    className="glass-card clickable-card"
                    onClick={() => setGameMode('dash')}
                    style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
                >
                    <div className="icon-container" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', margin: '0 auto 1.5rem' }}>
                        <Zap size={40} />
                    </div>
                    <h3>Math Dash</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Seja rápido! Resolva o máximo de contas antes do tempo acabar.</p>
                </div>
            </main>
        </div>
    );
}
