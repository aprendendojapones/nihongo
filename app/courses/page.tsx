"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BookOpen, ChevronRight, GraduationCap, Loader2 } from 'lucide-react';
import './courses.css';

interface Course {
    id: string;
    title: string;
    description: string;
    level: string;
    is_published: boolean;
}

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="courses-container">
            <header className="courses-header">
                <div>
                    <h1 className="gradient-text">Meus Cursos</h1>
                    <p>Continue sua jornada de aprendizado</p>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-white" size={48} />
                </div>
            ) : courses.length === 0 ? (
                <div className="empty-state glass-card">
                    <BookOpen size={48} className="text-gray-500 mb-4" />
                    <h2>Nenhum curso encontrado</h2>
                    <p>O conteúdo está sendo preparado. Volte em breve!</p>
                </div>
            ) : (
                <div className="courses-grid">
                    {courses.map((course) => (
                        <div 
                            key={course.id} 
                            className="glass-card course-card"
                            onClick={() => router.push(`/courses/${course.id}`)}
                        >
                            <div className="course-icon">
                                <GraduationCap size={32} />
                            </div>
                            <div className="course-content">
                                <div className="course-badges">
                                    <span className={`badge badge-${course.level.toLowerCase()}`}>
                                        {course.level}
                                    </span>
                                </div>
                                <h3>{course.title}</h3>
                                <p>{course.description}</p>
                            </div>
                            <div className="course-arrow">
                                <ChevronRight size={24} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
