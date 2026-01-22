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
            description: 'Pratique com repetição espaçada e aprenda novos caracteres',
            icon: <BookOpen size={48} />,
            difficulty: 'easy',
            estimatedTime: '10-15 min',
            color: '#2196f3',
            available: true
        },
        {
            id: 'quiz',
            name: 'Quiz Mode',
            description: 'Perguntas de múltipla escolha alternando entre texto e desenho',
            icon: <Target size={48} />,
            difficulty: 'easy',
            estimatedTime: '5-10 min',
            color: '#3effa2',
            available: true
        },
        {
            id: 'timed',
            name: 'Timed Mode',
            description: 'Responda o máximo de perguntas em 60 segundos',
            icon: <Clock size={48} />,
            difficulty: 'medium',
            estimatedTime: '1 min',
            color: '#ffc107',
            available: true
        },
        {
            id: 'memory',
            name: 'Memory Mode',
            description: 'Jogo da memória com caracteres japoneses',
            icon: <Brain size={48} />,
            difficulty: 'easy',
            estimatedTime: '3-5 min',
            color: '#00bcd4',
            available: true
        },
        {
            id: 'matching',
            name: 'Matching Mode',
            description: 'Conecte caracteres com seus romaji correspondentes',
            icon: <Link2 size={48} />,
            difficulty: 'easy',
            estimatedTime: '5 min',
            color: '#4caf50',
            available: true
        },
        {
            id: 'truefalse',
            name: 'True or False',
            description: 'Julgue se o par caractere/romaji está correto',
            icon: <CheckSquare size={48} />,
            difficulty: 'easy',
            estimatedTime: '3-5 min',
            color: '#ff5722',
            available: true
        },
        {
            id: 'fillblank',
            name: 'Fill in the Blank',
            description: 'Complete a frase com a palavra correta',
            icon: <FileText size={48} />,
            difficulty: 'medium',
            estimatedTime: '5-10 min',
            color: '#9c27b0',
            available: true
        },
        {
            id: 'alphabetorder',
            name: 'Alphabet Order',
            description: 'Organize caracteres em ordem alfabética',
            icon: <ArrowDownAZ size={48} />,
            difficulty: 'hard',
            estimatedTime: '5-7 min',
            color: '#f44336',
            available: true
        },
        {
            id: 'final_exam',
            name: 'Final Exam',
            description: 'Teste final para provar seus conhecimentos',
            icon: <Trophy size={48} />,
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
                            style={{ '--game-color': game.color } as React.CSSProperties}
                        >
                            <div className="game-icon">
                                {game.icon}
                            </div>

                            <h3 className="game-name">{game.name}</h3>
                            <p className="game-description">{game.description}</p>

                            <div className="game-meta">
                                <span className={`difficulty ${game.difficulty}`}>
                                    {getDifficultyLabel(game.difficulty)}
                                </span>
                                <span className="time">
                                    <Clock size={14} />
                                    {game.estimatedTime}
                                </span>
                            </div>

                            <button
                                className={`btn-play ${!game.available ? 'disabled' : ''}`}
                                disabled={!game.available}
                            >
                                {game.available ? 'Jogar' : 'Em breve'}
                            </button>

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
