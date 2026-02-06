"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Trophy, BookOpen, Gamepad2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/components/TranslationContext';
import '../../school.css';

interface StudentProfile {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
    xp: number;
    level: string;
    email: string;
    created_at: string;
}

interface ProgressItem {
    lesson_id: string;
    completed: boolean;
    score: number;
    completed_at: string;
}

interface WorkbookProgressItem {
    id: string;
    page_id: string;
    is_completed: boolean;
    last_updated: string;
    page: {
        title: string;
        order_index: number;
        module: {
            title: string;
            order_index: number;
            course: {
                title: string;
            }
        }
    }
}

export default function StudentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { t } = useTranslation();
    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [progress, setProgress] = useState<ProgressItem[]>([]);
    const [workbookProgress, setWorkbookProgress] = useState<WorkbookProgressItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchStudentData(params.id as string);
        }
    }, [params.id]);

    const fetchStudentData = async (studentId: string) => {
        try {
            // Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', studentId)
                .single();

            if (profileError) throw profileError;
            setStudent(profileData);

            // Fetch Old Progress
            const { data: progressData, error: progressError } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', studentId)
                .order('completed_at', { ascending: false });

            if (progressError) throw progressError;
            setProgress(progressData || []);

            // Fetch Workbook Progress
            const { data: wbData, error: wbError } = await supabase
                .from('user_workbook_progress')
                .select(`
                    *,
                    page:workbook_pages (
                        title,
                        order_index,
                        module:modules (
                            title,
                            order_index,
                            course:courses (
                                title
                            )
                        )
                    )
                `)
                .eq('user_id', studentId);

            if (wbError) {
                console.error('Workbook data error', wbError);
            } else {
                setWorkbookProgress(wbData || []);
            }

        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container">Carregando...</div>;
    if (!student) return <div className="loading-container">Aluno não encontrado</div>;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getLessonType = (lessonId: string) => {
        if (lessonId.includes('exam')) return 'Prova';
        if (lessonId.includes('quiz') || lessonId.includes('game') || lessonId.includes('mode')) return 'Jogo';
        return 'Lição';
    };

    // Group Workbook Progress
    const groupedWorkbook = workbookProgress.reduce((acc: any, item: any) => {
        const courseTitle = item.page?.module?.course?.title || 'Curso Desconhecido';
        const moduleTitle = item.page?.module?.title || 'Módulo Desconhecido';
        
        if (!acc[courseTitle]) acc[courseTitle] = {};
        if (!acc[courseTitle][moduleTitle]) acc[courseTitle][moduleTitle] = [];
        
        acc[courseTitle][moduleTitle].push(item);
        return acc;
    }, {});

    return (
        <div className="school-container">
            <header className="school-header">
                <button className="icon-button" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </button>
                <div className="school-header-info">
                    <h1 className="gradient-text">{student.full_name}</h1>
                    <p>{student.email} • {t('student')}</p>
                </div>
            </header>

            <div className="school-grid">
                {/* Student Stats Card */}
                <aside className="glass-card student-profile-card">
                    <div className="profile-header-large">
                        <div className="avatar-large">
                            {student.avatar_url ? (
                                <img src={student.avatar_url} alt={student.username} />
                            ) : (
                                <div className="bg-[#222] w-full h-full flex items-center justify-center rounded-full">
                                    <User size={48} className="text-gray-400" />
                                </div>
                            )}
                        </div>
                        <h2>{student.username || student.full_name}</h2>
                        <span className="level-badge-large">{student.level || 'N5'}</span>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-box">
                            <Trophy size={24} color="var(--accent-secondary)" />
                            <span className="stat-value">{student.xp}</span>
                            <span className="stat-label">XP Total</span>
                        </div>
                        <div className="stat-box">
                            <BookOpen size={24} color="var(--primary)" />
                            <span className="stat-value">{workbookProgress.length}</span>
                            <span className="stat-label">Páginas Concluídas</span>
                        </div>
                        <div className="stat-box">
                            <Calendar size={24} color="#aaa" />
                            <span className="stat-value">{formatDate(student.created_at)}</span>
                            <span className="stat-label">Entrou em</span>
                        </div>
                    </div>
                </aside>

                <div className="flex flex-col gap-6">
                    {/* NEW: Workbook Progress Section */}
                    <section className="glass-card">
                        <h3 className="mb-4 flex items-center gap-2 font-bold text-xl">
                            <BookOpen size={24} className="text-accent-primary" />
                            Progresso nos Livros
                        </h3>
                        
                        {Object.keys(groupedWorkbook).length > 0 ? (
                            Object.entries(groupedWorkbook).map(([course, modules]: [string, any]) => (
                                <div key={course} className="mb-6 border border-[#333] rounded-lg p-4 bg-[#111]">
                                    <h4 className="font-bold text-lg mb-4 text-gray-200">{course}</h4>
                                    {Object.entries(modules).map(([module, items]: [string, any]) => (
                                        <div key={module} className="mb-4 ml-4">
                                            <h5 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">{module}</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {items.map((item: any) => (
                                                    <div key={item.id} className="flex items-center justify-between p-2 bg-[#1a1a1a] rounded border border-[#333]">
                                                        <span className="text-sm text-gray-300 truncate max-w-[200px]" title={item.page.title}>
                                                            {item.page.title}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">{formatDate(item.last_updated)}</span>
                                                            {item.is_completed ? (
                                                                <CheckCircle size={16} className="text-green-500" />
                                                            ) : (
                                                                <Clock size={16} className="text-yellow-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">O aluno ainda não iniciou nenhum livro interativo.</p>
                        )}
                    </section>

                    {/* Progress History (Legacy) */}
                    <section className="glass-card progress-history-section">
                        <h3>Histórico de Atividades (Legado)</h3>
                        <div className="progress-list max-h-[300px] overflow-y-auto">
                            {progress.length > 0 ? progress.map((item, index) => (
                                <div key={index} className="progress-item">
                                    <div className="progress-icon">
                                        {getLessonType(item.lesson_id) === 'Jogo' ? (
                                            <Gamepad2 size={20} color="var(--accent-secondary)" />
                                        ) : (
                                            <BookOpen size={20} color="var(--primary)" />
                                        )}
                                    </div>
                                    <div className="progress-details">
                                        <span className="activity-name">{item.lesson_id.replace(/_/g, ' ').toUpperCase()}</span>
                                        <span className="activity-date">{formatDate(item.completed_at)}</span>
                                    </div>
                                    <div className="progress-score">
                                        <span className="score-value">{item.score}</span>
                                        <span className="score-label">pts</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="no-data">Nenhuma atividade registrada ainda.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
