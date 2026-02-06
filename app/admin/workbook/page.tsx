"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Course } from '@/types/workbook-schema';
import { Plus, Edit, Trash, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminWorkbookPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async () => {
        if (!newCourseTitle.trim()) return;
        
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('courses')
                .insert({
                    title: newCourseTitle,
                    description: 'Novo curso',
                    level: 'Basics',
                    is_published: false
                })
                .select()
                .single();

            if (error) throw error;
            
            setCourses([data, ...courses]);
            setNewCourseTitle('');
            setIsCreating(false);
        } catch (error) {
            console.error('Error creating course:', error);
            alert('Erro ao criar curso. Verifique se a tabela "courses" existe.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetupDb = async () => {
        if (!confirm('Isso irá criar as tabelas necessárias no banco de dados. Continuar?')) return;
        try {
            const res = await fetch('/api/admin/run-migration', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert('Banco de dados configurado com sucesso!');
                fetchCourses();
            } else {
                alert('Erro: ' + JSON.stringify(data));
            }
        } catch (e) {
            alert('Erro de conexão');
        }
    };

    const handleImportContent = async () => {
        if (!confirm('Isso irá importar o conteúdo antigo (N5/Hiragana) para o novo formato. Continuar?')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/seed-content', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert('Conteúdo importado com sucesso!');
                fetchCourses();
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (e) {
            alert('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const handleSeedOfficial = async () => {
        if (!confirm('Isso irá apagar/sobrescrever o conteúdo oficial N5-N1. Leva alguns segundos. Continuar?')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/seed-official', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(`Sucesso! Níveis importados: ${data.seeded.join(', ')}`);
                fetchCourses();
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (e) {
            alert('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 text-white min-h-screen bg-[#050505]">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Gestão de Cursos (Workbook)</h1>
                    <p className="text-gray-400">Crie e edite os materiais didáticos interativos.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleSetupDb}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded text-sm"
                    >
                        Configurar Banco
                    </button>
                    <button 
                        onClick={handleImportContent}
                        className="bg-blue-900 hover:bg-blue-800 text-blue-100 px-4 py-2 rounded text-sm"
                    >
                        Importar Legado
                    </button>
                     <button 
                        onClick={handleSeedOfficial}
                        className="bg-purple-900 hover:bg-purple-800 text-purple-100 px-4 py-2 rounded text-sm"
                    >
                        Importar N5-N1 (Oficial)
                    </button>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} /> Novo Curso
                    </button>
                </div>
            </header>

            {isCreating && (
                <div className="mb-8 p-6 bg-[#111] border border-[#333] rounded-lg animate-fade-in">
                    <h3 className="font-bold mb-4">Criar Novo Curso</h3>
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            value={newCourseTitle}
                            onChange={(e) => setNewCourseTitle(e.target.value)}
                            placeholder="Nome do Curso (ex: Japonês N5)"
                            className="bg-[#000] border border-[#444] p-3 rounded flex-1 text-white"
                        />
                        <button onClick={handleCreateCourse} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white">Salvar</button>
                        <button onClick={() => setIsCreating(false)} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded text-white">Cancelar</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">Carregando cursos...</div>
            ) : courses.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-[#111] rounded-lg border border-[#333]">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhum curso encontrado. Crie o primeiro!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-[#111] border border-[#333] rounded-xl p-6 hover:border-accent-primary transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#222] rounded-lg">
                                    <BookOpen size={24} className="text-accent-primary" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-[#333] rounded text-gray-400 hover:text-white" title="Editar Detalhes">
                                        <Edit size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                            <p className="text-gray-400 text-sm mb-6 line-clamp-2">{course.description || 'Sem descrição'}</p>
                            
                            <div className="flex justify-between items-center mt-auto">
                                <span className="text-xs font-mono bg-[#222] px-2 py-1 rounded text-gray-400">
                                    Nível: {(course as any).level || 'N/A'}
                                </span>
                                
                                <Link 
                                    href={`/admin/workbook/course/${course.id}`}
                                    className="text-sm font-bold text-accent-primary hover:text-accent-secondary flex items-center gap-1"
                                >
                                    Gerenciar Módulos <Layers size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
