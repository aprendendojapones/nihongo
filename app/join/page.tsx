"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { UserPlus, GraduationCap, School } from 'lucide-react';

function JoinContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [schoolName, setSchoolName] = useState('');
    const [loading, setLoading] = useState(true);

    const schoolId = searchParams.get('schoolId');

    useEffect(() => {
        if (schoolId) {
            fetchSchoolName();
        }
    }, [schoolId]);

    const fetchSchoolName = async () => {
        const { data } = await supabase.from('schools').select('name').eq('id', schoolId).single();
        if (data) setSchoolName(data.name);
        setLoading(false);
    };

    const handleJoin = async () => {
        if (status === 'unauthenticated') {
            signIn('google', { callbackUrl: window.location.href });
            return;
        }

        if (session?.user?.email && schoolId) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    school_id: schoolId,
                    role: 'student' // Ensure they are marked as student
                })
                .eq('email', session.user.email);

            if (!error) {
                router.push('/dashboard');
            } else {
                console.error('Error updating profile:', error);
            }
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="loader"></div></div>;

    return (
        <div className="flex-center" style={{ height: '100vh', padding: '2rem' }}>
            <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '3rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <GraduationCap size={64} color="var(--accent-secondary)" />
                        <School size={24} color="var(--accent-primary)" style={{ position: 'absolute', bottom: 0, right: 0 }} />
                    </div>
                </div>

                <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Bem-vindo à Escola!</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Você está prestes a se matricular na escola <strong>{schoolName}</strong>.
                </p>

                <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '1rem', background: 'var(--accent-secondary)', border: 'none' }}
                    onClick={handleJoin}
                >
                    {status === 'authenticated' ? 'Confirmar Matrícula' : 'Entrar com Google para Matricular'}
                </button>

                <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Ao se matricular, seus professores poderão acompanhar seu progresso e te ajudar nos estudos.
                </p>
            </div>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <JoinContent />
        </Suspense>
    );
}
