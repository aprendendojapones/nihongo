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
    visibility_level: 'admin' | 'staff' | 'everyone';
}

interface Category {
    id: string;
    subject_id: string;
    name: string;
    visible: boolean;
    order_index: number;
    visibility_level: 'admin' | 'staff' | 'everyone';
}

interface Game {
    id: string;
    game_id: string;
    category_id: string;
    name: string;
    description: string;
    visible: boolean;
    order_index: number;
    visibility_level: 'admin' | 'staff' | 'everyone';
}

export default function AdminGamesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const user = session?.user as any;

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCheckingRole, setIsCheckingRole] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/games/data');
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setSubjects(data.subjects || []);
            setCategories(data.categories || []);
            setGames(data.games || []);

            if (data.subjects && data.subjects.length > 0 && !selectedSubject) {
                setSelectedSubject(data.subjects[0].id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedSubject]);

    useEffect(() => {
        const checkRole = async () => {
            if (user?.role === 'admin') {
                setIsCheckingRole(false);
                fetchData();
                return;
            }

            if (session?.user?.email) {
                const { data } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('email', session.user.email)
                    .single();

                if (data?.role === 'admin') {
                    setIsCheckingRole(false);
                    fetchData();
                    return;
                }
            }

            router.push('/dashboard');
        };

        if (session !== undefined) {
            checkRole();
        }
    }, [session, user, fetchData, router]);

    const updateSubject = async (subjectId: string, updates: Partial<Subject>) => {
        try {
            const res = await fetch('/api/admin/subjects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: subjectId, ...updates })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            fetchData();
        } catch (error: any) {
            alert('Erro ao atualizar matéria: ' + error.message);
        }
    };

    const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: categoryId, ...updates })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            fetchData();
        } catch (error: any) {
            alert('Erro ao atualizar categoria: ' + error.message);
        }
    };

    const updateGame = async (gameId: string, updates: Partial<Game>) => {
        try {
            const res = await fetch('/api/admin/games', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: gameId, ...updates })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            fetchData();
        } catch (error: any) {
            alert('Erro ao atualizar jogo: ' + error.message);
        }
    };

    const addSubject = async () => {
        const name = prompt('Nome da matéria:');
        if (!name) return;
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        try {
            const res = await fetch('/api/admin/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, slug, visible: true, order_index: subjects.length + 1 })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            fetchData();
        } catch (error: any) {
            alert('Erro ao adicionar matéria: ' + error.message);
        }
    };

    const addCategory = async () => {
        if (!selectedSubject) return;
        const name = prompt('Nome da categoria:');
        if (!name) return;
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject_id: selectedSubject,
                    name,
                    visible: true,
                    order_index: categories.filter(c => c.subject_id === selectedSubject).length + 1
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            fetchData();
        } catch (error: any) {
            alert('Erro ao adicionar categoria: ' + error.message);
        }
    };

    const VisibilitySelector = ({
        value,
        onChange
    }: {
        value: 'admin' | 'staff' | 'everyone',
        onChange: (val: 'admin' | 'staff' | 'everyone') => void
    }) => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as any)}
            className="visibility-select"
            style={{
                padding: '4px 8px',
                borderRadius: '4px',
                background: value === 'admin' ? 'rgba(239, 68, 68, 0.2)' :
                    value === 'staff' ? 'rgba(245, 158, 11, 0.2)' :
                        'rgba(16, 185, 129, 0.2)',
                color: value === 'admin' ? '#ef4444' :
                    value === 'staff' ? '#f59e0b' :
                        '#10b981',
                border: '1px solid currentColor',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                outline: 'none'
            }}
        >
            <option value="admin">🔒 Só Eu</option>
            <option value="staff">👥 Staff</option>
            <option value="everyone">🌍 Todos</option>
        </select>
    );

    if (loading || isCheckingRole) return <div className="loading-container">Carregando...</div>;

    const currentCategories = categories.filter(c => c.subject_id === selectedSubject);

    return (
        <div className="admin-container">
            <header className="admin-header">
                <button className="icon-button" onClick={() => router.push('/admin')} title="Voltar">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="gradient-text">Gerenciar Jogos</h1>
                <div className="header-spacer"></div>
            </header>

            <div className="admin-content">
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
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <span>{subject.name}</span>
                                <div className="flex items-center gap-1">
                                    <VisibilitySelector
                                        value={subject.visibility_level || 'everyone'}
                                        onChange={(val) => updateSubject(subject.id, { visibility_level: val })}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            updateSubject(subject.id, { visible: !subject.visible });
                                        }}
                                        className="icon-btn-sm"
                                        title={subject.visible ? "Ocultar" : "Mostrar"}
                                    >
                                        {subject.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

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
                                            <VisibilitySelector
                                                value={category.visibility_level || 'everyone'}
                                                onChange={(val) => updateCategory(category.id, { visibility_level: val })}
                                            />
                                        </div>
                                        <button
                                            onClick={() => updateCategory(category.id, { visible: !category.visible })}
                                            className="visibility-toggle"
                                            title={category.visible ? "Ocultar" : "Mostrar"}
                                        >
                                            {category.visible ? <Eye size={20} /> : <EyeOff size={20} />}
                                        </button>
                                    </div>

                                    <div className="games-list">
                                        {games
                                            .filter(g => g.category_id === category.id)
                                            .map(game => (
                                                <div key={game.id} className="game-item">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <GripVertical size={16} className="text-gray-500" />
                                                        <div className="flex-1">
                                                            <div className="font-medium">{game.name}</div>
                                                            <div className="text-sm text-gray-400">{game.description}</div>
                                                        </div>
                                                        <VisibilitySelector
                                                            value={game.visibility_level || 'everyone'}
                                                            onChange={(val) => updateGame(game.id, { visibility_level: val })}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => updateGame(game.id, { visible: !game.visible })}
                                                        className="visibility-toggle"
                                                        title={game.visible ? "Ocultar" : "Mostrar"}
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
