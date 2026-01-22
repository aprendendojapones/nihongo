"use client";

import { useRouter } from 'next/navigation';
import { Target, Clock, Brain, Link2, CheckSquare, FileText, ArrowDownAZ, ArrowLeft, Gamepad2, Trophy, BookOpen } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext';
import './games.css';

interface GameMode {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    image: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
    color: string;
    available: boolean;
}

export default function GamesPage() {
    const router = useRouter();
    const { t } = useTranslation();

    const GAME_MODES: GameMode[] = [
        {
            id: 'study',
            name: 'Practice Mode',
            description: 'Pratique com repetição espaçada',
            icon: <BookOpen size={32} />,
            image: '/games/game_practice.png',
            difficulty: 'easy',
            estimatedTime: '10-15 min',
            color: '#2196f3',
            available: true
        },
        {
            id: 'quiz',
            name: 'Quiz Mode',
            description: 'Perguntas de múltipla escolha',
            icon: <Target size={32} />,
            image: '/games/game_quiz.png',
            difficulty: 'easy',
            estimatedTime: '5-10 min',
            color: '#3effa2',
            available: true
        },
        {
            id: 'timed',
            name: 'Timed Mode',
            description: 'Responda rápido!',
            icon: <Clock size={32} />,
            image: '/games/game_timed.png',
            difficulty: 'medium',
            estimatedTime: '1 min',
            color: '#ffc107',
            available: true
        },
        {
            id: 'memory',
            name: 'Memory Mode',
            description: 'Jogo da memória',
            icon: <Brain size={32} />,
            image: '/games/game_memory.png',
            difficulty: 'easy',
            estimatedTime: '3-5 min',
            color: '#00bcd4',
            available: true
        },
        {
            id: 'matching',
            name: 'Matching Mode',
            description: 'Conecte os pares',
            icon: <Link2 size={32} />,
            image: '/games/game_matching.png',
            difficulty: 'easy',
            estimatedTime: '5 min',
            color: '#4caf50',
            available: true
        },
        {
            id: 'truefalse',
            name: 'True or False',
            description: 'Verdadeiro ou Falso?',
            icon: <CheckSquare size={32} />,
            image: '/games/game_truefalse.png',
            difficulty: 'easy',
            estimatedTime: '3-5 min',
            color: '#ff5722',
            available: true
        },
        {
            id: 'fillblank',
            name: 'Fill in the Blank',
            description: 'Complete a frase',
            icon: <FileText size={32} />,
            image: '/games/game_fillblank.png',
            difficulty: 'medium',
            estimatedTime: '5-10 min',
            color: '#9c27b0',
            available: true
        },
        {
            id: 'alphabetorder',
            name: 'Alphabet Order',
            description: 'Ordem alfabética',
            icon: <ArrowDownAZ size={32} />,
            image: '/games/game_fillblank.png', // Reuse for now
            difficulty: 'hard',
            estimatedTime: '5-7 min',
            color: '#f44336',
            available: true
        },
        {
            id: 'sentence_scramble',
            name: 'Sentence Scramble',
            description: 'Ordene as frases',
            icon: <Link2 size={32} />, // Reuse icon
            image: '/games/game_matching.png', // Reuse matching image for now
            difficulty: 'medium',
            estimatedTime: '5-10 min',
            color: '#ff9800',
            available: true
        },
        {
            id: 'listening',
            name: 'Listening',
            description: 'Prática de audição',
            icon: <Target size={32} />, // Reuse icon
            image: '/games/game_quiz.png', // Reuse quiz image for now
            difficulty: 'easy',
            estimatedTime: '5 min',
            color: '#00bcd4',
            available: true
        },
        {
            id: 'final_exam',
            name: 'Final Exam',
            description: 'Teste final',
            icon: <Trophy size={32} />,
            image: '/games/game_timed.png', // Reuse timed image for now
            difficulty: 'hard',
            estimatedTime: '15-20 min',
            color: '#ff9800',
            available: true
        }
    ];

    const handleGameClick = (gameId: string, available: boolean) => {
        if (!available) return;

        // For now, redirect to game page with mode parameter
        // In the future, we can add level selection modal
        router.push(`/game?mode=${gameId}&level=hiragana`);
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'Fácil';
            case 'medium': return 'Médio';
            case 'hard': return 'Difícil';
            default: return difficulty;
        }
    };

    return (
        <div className="games-page">
            <header className="games-header">
                <button
                    className="icon-button"
                    onClick={() => router.push('/lessons')}
                    title={t('back') || 'Voltar'}
                    aria-label={t('back') || 'Voltar'}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="gradient-text">Jogos</h1>
                <div className="header-spacer"></div>
            </header>

            <div className="games-container">
                <div className="games-hero">
                    <Gamepad2 size={64} className="hero-icon" />
                    <h2>Escolha seu Jogo</h2>
                    <p>Pratique japonês de forma divertida com diferentes modos de jogo</p>
                </div>

                <div className="games-grid">
                    {GAME_MODES.map((game) => (
                        <div
                            key={game.id}
                            className={`game-card ${!game.available ? 'disabled' : ''}`}
                            onClick={() => handleGameClick(game.id, game.available)}
                            style={{
                                '--game-color': game.color,
                                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9)), url(${game.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            } as React.CSSProperties}
                        >
                            <div className="game-card-content">
                                <div className="game-icon-wrapper">
                                    {game.icon}
                                </div>

                                <div className="game-info">
                                    <h3 className="game-name">{game.name}</h3>
                                    <p className="game-description">{game.description}</p>
                                </div>

                                <div className="game-meta">
                                    <span className={`difficulty ${game.difficulty}`}>
                                        {getDifficultyLabel(game.difficulty)}
                                    </span>
                                    <span className="time">
                                        <Clock size={14} />
                                        {game.estimatedTime}
                                    </span>
                                </div>
                            </div>

                            {!game.available && (
                                <div className="coming-soon-badge">Em breve</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
