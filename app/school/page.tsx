"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, QrCode, GraduationCap, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';
import { useTranslation } from '@/components/TranslationContext';
import './school.css';

export default function SchoolDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const user = session?.user as any;
    const [students, setStudents] = useState<any[]>([]);
    const [onboardingQr, setOnboardingQr] = useState('');
    const [showQr, setShowQr] = useState(false);

    useEffect(() => {
        if (user && !['director', 'teacher', 'admin'].includes(user.role)) {
            router.push('/dashboard');
        } else if (user?.school_id) {
            fetchStudents();
            generateOnboardingQr();
        }
    }, [user]);

    const fetchStudents = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('school_id', user.school_id)
            .eq('role', 'student');
        if (data) setStudents(data);
    };

    const generateOnboardingQr = async () => {
        const baseUrl = window.location.origin;
        const onboardingUrl = `${baseUrl}/join?schoolId=${user.school_id}`;
        const qr = await QRCode.toDataURL(onboardingUrl, {
            width: 400,
            margin: 2,
            color: { dark: '#3effa2', light: '#ffffff' }
        });
        setOnboardingQr(qr);
    };

    if (!user || !['director', 'teacher', 'admin'].includes(user.role)) return null;

    return (
        <div className="school-container">
            <header className="school-header">
                <div className="school-header-info">
                    <h1 className="gradient-text">{t('school_dashboard')}</h1>
                    <p>{user.schoolName || 'Sua Escola'} • {user.role === 'director' ? t('director') : t('teacher')}</p>
                </div>
                <button
                    className="btn-primary btn-onboarding"
                    onClick={() => setShowQr(true)}
                >
                    <QrCode size={20} /> {t('student_onboarding')}
                </button>
            </header>

            <div className="school-grid">
                <section className="glass-card students-section">
                    <div className="students-header">
                        <h2 className="students-title">
                            <Users size={24} /> {t('enrolled_students')}
                        </h2>
                        <div className="search-container">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder={t('search_student')}
                                className="search-input"
                            />
                        </div>
                    </div>

                    <div className="students-list">
                        {students.length > 0 ? students.map(student => (
                            <div key={student.id} className="student-item">
                                <div className="student-info">
                                    <img src={student.avatar_url || '/default-avatar.png'} alt="Avatar" className="student-avatar" />
                                    <div className="student-details">
                                        <h3>{student.full_name}</h3>
                                        <p>{t('level')}: {student.level} • {student.xp} XP</p>
                                    </div>
                                </div>
                                <button
                                    className="btn-view-progress"
                                    onClick={() => router.push(`/school/student/${student.id}`)}
                                >
                                    {t('view_progress')}
                                </button>
                            </div>
                        )) : (
                            <div className="no-students-placeholder">
                                <GraduationCap size={48} className="no-students-icon" />
                                <p>{t('no_students')}</p>
                            </div>
                        )}
                    </div>
                </section>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section className="glass-card school-stats-section">
                        <h3>{t('school_stats')}</h3>
                        <div className="stats-list">
                            <div className="stat-item">
                                <span className="stat-label">{t('total_students')}</span>
                                <span className="stat-value">{students.length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">{t('average_level')}</span>
                                <span className="stat-value">N5</span>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>

            {showQr && (
                <div className="qr-modal-overlay">
                    <div className="glass-card qr-modal-content">
                        <h2 className="gradient-text qr-modal-title">{t('student_onboarding')}</h2>
                        <p className="qr-modal-desc">{t('onboarding_desc')}</p>
                        <div className="qr-image-container">
                            <img src={onboardingQr} alt="Onboarding QR" className="qr-image" />
                        </div>
                        <br />
                        <button className="btn-primary" onClick={() => setShowQr(false)}>{t('close')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
