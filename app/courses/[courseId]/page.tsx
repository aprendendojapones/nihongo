"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, PlayCircle, Book, CheckCircle, Lock } from 'lucide-react';
import '../courses.css'; // Reuse CSS

interface Page {
    id: string;
    title: string;
    order: number;
}

interface Module {
    id: string;
    title: string;
    order: number;
    pages: Page[];
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [modules, setModules] = useState<Module[]>([]);
    const [courseTitle, setCourseTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseContent();
    }, [resolvedParams.courseId]);

    const fetchCourseContent = async () => {
        try {
            // 1. Fetch Course Info
            const { data: course } = await supabase
                .from('courses')
                .select('title')
                .eq('id', resolvedParams.courseId)
                .single();
            
            if (course) setCourseTitle(course.title);

            // 2. Fetch Modules
            const { data: modulesData } = await supabase
                .from('modules')
                .select(`
                    id, 
                    title, 
                    order_index,
                    workbook_pages (
                        id,
                        title,
                        order_index
                    )
                `)
                .eq('course_id', resolvedParams.courseId)
                .order('order_index', { ascending: true });

            if (modulesData) {
                // Sort pages within modules
                const formattedModules = modulesData.map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    order: m.order_index,
                    pages: m.workbook_pages.sort((a: any, b: any) => a.order_index - b.order_index)
                }));
                setModules(formattedModules);
            }

        } catch (error) {
            console.error('Error content:', error);
        } finally {
            setLoading(false);
        }
    };

    const startPage = (pageId: string) => {
        // We need a route for the actual workbook player
        // Let's assume /workbook/[pageId]
        router.push(`/workbook/${pageId}`);
    };

    if (loading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="courses-container">
            <button className="back-button mb-6 flex items-center gap-2 text-gray-400 hover:text-white" onClick={() => router.back()}>
                <ChevronLeft size={20} /> Voltar
            </button>

            <header className="courses-header">
                <h1 className="gradient-text">{courseTitle}</h1>
                <p>{modules.length} Módulos Disponíveis</p>
            </header>

            <div className="modules-list flex flex-col gap-6">
                {modules.map((module) => (
                    <div key={module.id} className="module-group">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-accent-secondary">
                            <Book size={20} />
                            {module.title}
                        </h2>
                        
                        <div className="pages-grid grid gap-3">
                            {module.pages.map((page) => (
                                <div 
                                    key={page.id} 
                                    className="glass-card page-item p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => startPage(page.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                                            <PlayCircle size={20} />
                                        </div>
                                        <span className="font-medium">{page.title}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Iniciar
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
