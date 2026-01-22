"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Trophy, BookOpen, Gamepad2, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/components/TranslationContext';
import '../school.css'; // Reuse school styles

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

export default function StudentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { t } = useTranslation();
    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [progress, setProgress] = useState<ProgressItem[]>([]);
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

            // Fetch Progress
            const { data: progressData, error: progressError } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', studentId)
                .order('completed_at', { ascending: false });

            if (progressError) throw progressError;
            setProgress(progressData || []);

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
                                <User size={48} />
                            )}
                        </div>
                        <h2>{student.username}</h2>
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
                            <span className="stat-value">{progress.length}</span>
                            <span className="stat-label">Atividades</span>
                        </div>
                        <div className="stat-box">
                            <Calendar size={24} color="#aaa" />
                            <span className="stat-value">{formatDate(student.created_at)}</span>
                            <span className="stat-label">Entrou em</span>
                        </div>
                    </div>
                </aside>

                {/* Progress History */}
                <section className="glass-card progress-history-section">
                    <h3>Histórico de Atividades</h3>
                    <div className="progress-list">
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
    );
}
