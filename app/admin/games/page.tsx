"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Eye, EyeOff, GripVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import '../admin.css';
import '../games-styles.css';

interface Subject {
    id: string;
    name: string;
    slug: string;
    visible: boolean;
    order_index: number;
}

interface Category {
    id: string;
    subject_id: string;
    name: string;
    visible: boolean;
    order_index: number;
}

interface Game {
    id: string;
    game_id: string;
    category_id: string;
    name: string;
    description: string;
    visible: boolean;
    order_index: number;
}

export default function AdminGamesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const user = session?.user as any;

    const [subjects, setSubjects] = useState<Subject[]>([]);
};

const toggleCategoryVisibility = async (categoryId: string, currentVisible: boolean) => {
    await supabase
        .from('game_categories')
        .update({ visible: !currentVisible })
        .eq('id', categoryId);
    fetchData();
};

const toggleGameVisibility = async (gameId: string, currentVisible: boolean) => {
    await supabase
        .from('games_config')
        .update({ visible: !currentVisible })
        .eq('id', gameId);
    fetchData();
};

const addSubject = async () => {
    const name = prompt('Nome da matéria:');
    if (!name) return;

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await supabase.from('subjects').insert({
        name,
        slug,
        visible: true,
        order_index: subjects.length + 1
    });
    fetchData();
};

const addCategory = async () => {
    if (!selectedSubject) return;

    const name = prompt('Nome da categoria:');
    if (!name) return;

    await supabase.from('game_categories').insert({
        subject_id: selectedSubject,
        name,
        visible: true,
        order_index: categories.filter(c => c.subject_id === selectedSubject).length + 1
    });
    fetchData();
};

if (loading || isCheckingRole) return <div className="loading-container">Carregando...</div>;

const currentCategories = categories.filter(c => c.subject_id === selectedSubject);

return (
    <div className="admin-container">
        <header className="admin-header">
            <button className="icon-button" onClick={() => router.push('/admin')}>
                <ArrowLeft size={24} />
            </button>
            <h1 className="gradient-text">Gerenciar Jogos</h1>
            <div className="header-spacer"></div>
        </header>

        <div className="admin-content">
            {/* Subjects Section */}
            <section className="glass-card mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Matérias</h2>
                    <button onClick={addSubject} className="btn-primary flex items-center gap-2">
                        <Plus size={20} /> Adicionar Matéria
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {subjects.map(subject => (
                        <div
                            key={subject.id}
                            className={`subject-tab ${selectedSubject === subject.id ? 'active' : ''}`}
                            onClick={() => setSelectedSubject(subject.id)}
                        >
                            <span>{subject.name}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSubjectVisibility(subject.id, subject.visible);
                                }}
                                className="ml-2"
                            >
                                {subject.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories Section */}
            {selectedSubject && (
                <section className="glass-card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Categorias</h2>
                        <button onClick={addCategory} className="btn-primary flex items-center gap-2">
                            <Plus size={20} /> Adicionar Categoria
                        </button>
                    </div>

                    <div className="space-y-4">
                        {currentCategories.map(category => (
                            <div key={category.id} className="category-section">
                                <div className="category-header">
                                    <div className="flex items-center gap-2">
                                        <GripVertical size={20} className="text-gray-500" />
                                        <h3 className="text-lg font-semibold">{category.name}</h3>
                                    </div>
                                    <button
                                        onClick={() => toggleCategoryVisibility(category.id, category.visible)}
                                        className="visibility-toggle"
                                    >
                                        {category.visible ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>

                                {/* Games in this category */}
                                <div className="games-list">
                                    {games
                                        .filter(g => g.category_id === category.id)
                                        .map(game => (
                                            <div key={game.id} className="game-item">
                                                <div className="flex items-center gap-2">
                                                    <GripVertical size={16} className="text-gray-500" />
                                                    <div>
                                                        <div className="font-medium">{game.name}</div>
                                                        <div className="text-sm text-gray-400">{game.description}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleGameVisibility(game.id, game.visible)}
                                                    className="visibility-toggle"
                                                >
                                                    {game.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    </div>
);
}
