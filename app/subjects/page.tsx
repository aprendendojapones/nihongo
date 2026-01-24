"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/components/TranslationContext';
import '../games/games.css';
import './subjects.css';

interface Subject {
    id: string;
    name: string;
    slug: string;
    visibility_level: 'admin' | 'staff' | 'everyone';
}

interface Category {
    id: string;
    name: string;
    subject_id: string;
    visibility_level: 'admin' | 'staff' | 'everyone';
}

interface Game {
    id: string;
    game_id: string;
    category_id: string;
    name: string;
    description: string;
    visibility_level: 'admin' | 'staff' | 'everyone';
}

export default function OtherSubjectsPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [userRole, setUserRole] = useState<string>('student');

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('email', session.user.email)
                    .single();
                if (profile) setUserRole(profile.role);
            }
        };
        fetchUserRole();
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch visible subjects (excluding Japanese)
            const { data: subjectsData } = await supabase
                .from('subjects')
                .select('*')
                .eq('visible', true)
                .neq('slug', 'japanese')
                .order('order_index');

            // Fetch visible categories
            const { data: categoriesData } = await supabase
                .from('game_categories')
                .select('*')
                .eq('visible', true)
                .order('order_index');

            // Fetch visible games
            const { data: gamesData } = await supabase
                .from('games_config')
                .select('*')
                .eq('visible', true)
                .order('order_index');

            setSubjects(subjectsData || []);
            setCategories(categoriesData || []);
            setGames(gamesData || []);

            if (subjectsData && subjectsData.length > 0) {
                setSelectedSubject(subjectsData[0].id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayGame = (gameId: string) => {
        router.push(`/game?mode=${gameId}`);
    };

    if (loading) return <div className="loading-container">Carregando...</div>;

    const canSee = (visibilityLevel: string) => {
        if (userRole === 'admin') return true;
        if (userRole === 'teacher' || userRole === 'director') {
            return visibilityLevel === 'everyone' || visibilityLevel === 'staff';
        }
        return visibilityLevel === 'everyone';
    };

    const filteredSubjects = subjects.filter(s => canSee(s.visibility_level));
    const filteredCategories = categories.filter(c => canSee(c.visibility_level));
    const filteredGames = games.filter(g => canSee(g.visibility_level));

    if (filteredSubjects.length === 0) {
        return (
            <div className="games-container">
                <header className="games-header">
                    <button className="icon-button" onClick={() => router.back()}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="gradient-text">Outras Matérias</h1>
                    <div className="header-spacer"></div>
                </header>
                <div className="no-subjects-message">
                    <p>Nenhuma matéria disponível no momento.</p>
                </div>
            </div>
        );
    }

    const currentCategories = filteredCategories.filter(c => c.subject_id === selectedSubject);

    return (
        <div className="games-container">
            <header className="games-header">
                <button className="icon-button" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="gradient-text">Outras Matérias</h1>
                <div className="header-spacer"></div>
            </header>

            {/* Subject Tabs */}
            <div className="subject-tabs">
                {filteredSubjects.map(subject => (
                    <button
                        key={subject.id}
                        className={`subject-tab-btn ${selectedSubject === subject.id ? 'active' : ''}`}
                        onClick={() => setSelectedSubject(subject.id)}
                    >
                        {subject.name}
                    </button>
                ))}
            </div>

            {/* Categories and Games */}
            <div className="games-content">
                {currentCategories.map(category => {
                    const categoryGames = filteredGames.filter(g => g.category_id === category.id);

                    if (categoryGames.length === 0) return null;

                    return (
                        <section key={category.id} className="category-section-student">
                            <h2 className="category-title">{category.name}</h2>
                            <div className="games-grid">
                                {categoryGames.map(game => (
                                    <div key={game.id} className="game-card" onClick={() => handlePlayGame(game.game_id)}>
                                        <div className="game-card-content">
                                            <h3 className="game-card-title">{game.name}</h3>
                                            <p className="game-card-description">{game.description}</p>
                                            <button className="game-play-btn">
                                                <Play size={20} /> Jogar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
