"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Course, WorkbookModule, WorkbookPage } from '@/types/workbook-schema';
import { Plus, Edit, Trash, ArrowLeft, FileText, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function CourseModulesPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<WorkbookModule[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isCreatingModule, setIsCreatingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            // Fetch Course
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();
            
            if (courseError) throw courseError;
            setCourse(courseData);

            // Fetch Modules with Pages
            const { data: modulesData, error: modulesError } = await supabase
                .from('modules')
                .select(`
                    *,
                    pages:workbook_pages(*)
                `)
                .eq('course_id', courseId)
                .order('order_index');

            if (modulesError) throw modulesError;
            
            // Transform data to match Schema (simplified for now)
            setModules(modulesData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateModule = async () => {
        if (!newModuleTitle.trim()) return;
        
        try {
            const { data, error } = await supabase
                .from('modules')
                .insert({
                    course_id: courseId,
                    title: newModuleTitle,
                    description: '',
                    order_index: modules.length // Append to end
                })
                .select()
                .single();

            if (error) throw error;
            
            setModules([...modules, { ...data, pages: [] }]); // Init with empty pages
            setNewModuleTitle('');
            setIsCreatingModule(false);
        } catch (error) {
            console.error('Error creating module:', error);
        }
    };

    const handleCreatePage = async (moduleId: string) => {
        const title = prompt('Nome da Nova Página:');
        if (!title) return;

        try {
            const { data, error } = await supabase
                .from('workbook_pages')
                .insert({
                    module_id: moduleId,
                    title: title,
                    content: [], // Empty blocks
                    order_index: 999 // TODO: proper ordering
                })
                .select()
                .single();

            if (error) throw error;

            // Refresh data (simplest way to update nested structure)
            fetchData();
        } catch (error) {
            console.error('Error creating page:', error);
        }
    };

    if (loading) return <div className="p-8 text-white">Carregando...</div>;
    if (!course) return <div className="p-8 text-white">Curso não encontrado.</div>;

    return (
        <div className="p-8 text-white min-h-screen bg-[#050505]">
            <header className="mb-8">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft size={20} /> Voltar
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">{course.title}</h1>
                        <p className="text-gray-400">Gerenciar Módulos e Páginas</p>
                    </div>
                    <button 
                        onClick={() => setIsCreatingModule(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} /> Novo Módulo
                    </button>
                </div>
            </header>

            {isCreatingModule && (
                <div className="mb-8 p-6 bg-[#111] border border-[#333] rounded-lg animate-fade-in">
                    <h3 className="font-bold mb-4">Novo Módulo (Capítulo)</h3>
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            placeholder="Nome do Módulo (ex: Introdução)"
                            className="bg-[#000] border border-[#444] p-3 rounded flex-1 text-white"
                        />
                        <button onClick={handleCreateModule} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white">Salvar</button>
                        <button onClick={() => setIsCreatingModule(false)} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded text-white">Cancelar</button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {modules.map((module, mIndex) => (
                    <div key={module.id} className="bg-[#111] border border-[#333] rounded-xl overflow-hidden">
                        <div className="p-4 bg-[#1a1a1a] border-b border-[#333] flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-3">
                                <span className="text-gray-500 font-mono text-sm">#{mIndex + 1}</span>
                                {module.title}
                            </h3>
                            <div className="flex gap-2">
                                <button title="Editar Módulo" className="p-2 hover:bg-[#333] rounded text-gray-400 hover:text-white">
                                    <Edit size={16} />
                                </button>
                                <button 
                                    onClick={() => handleCreatePage(module.id)}
                                    className="bg-[#333] hover:bg-[#444] text-xs px-3 py-2 rounded text-white flex items-center gap-1 font-bold"
                                >
                                    <Plus size={14} /> Nova Página
                                </button>
                            </div>
                        </div>

                        <div className="p-2">
                            {module.pages && module.pages.length > 0 ? (
                                <div className="space-y-1">
                                    {(module.pages as WorkbookPage[]).map((page, pIndex) => (
                                        <div key={page.id} className="flex items-center justify-between p-3 rounded hover:bg-[#222] group transition-colors">
                                            <div className="flex items-center gap-3">
                                                <GripVertical size={16} className="text-gray-600 cursor-grab" />
                                                <FileText size={16} className="text-accent-primary" />
                                                <span className="text-gray-200">{page.title}</span>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                                                <Link 
                                                    href={`/admin/workbook/editor/${page.id}`}
                                                    className="px-3 py-1 bg-accent-primary hover:bg-accent-secondary text-white text-xs rounded font-bold"
                                                >
                                                    Editar Conteúdo
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-600 text-sm">
                                    Nenhuma página neste módulo.
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {modules.length === 0 && !isCreatingModule && (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-[#333] rounded-lg">
                        <p>Este curso ainda não tem módulos.</p>
                        <button onClick={() => setIsCreatingModule(true)} className="text-accent-primary hover:underline mt-2">
                            Criar o primeiro módulo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
