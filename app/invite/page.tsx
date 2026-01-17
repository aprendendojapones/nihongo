"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { UserPlus, ShieldCheck, School } from 'lucide-react';

function InviteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [schoolName, setSchoolName] = useState('');
    const [loading, setLoading] = useState(true);

    const schoolId = searchParams.get('schoolId');
    const role = searchParams.get('role');

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

    const handleAccept = async () => {
        if (status === 'unauthenticated') {
            signIn('google', { callbackUrl: window.location.href });
            return;
        }

        if (session?.user?.email && schoolId && role) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    role: role,
                    school_id: schoolId
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
                        <School size={64} color="var(--accent-primary)" />
                        <ShieldCheck size={24} color="var(--accent-secondary)" style={{ position: 'absolute', bottom: 0, right: 0 }} />
                    </div>
                </div>

                <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Convite Especial</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Você foi convidado para ser <strong>{role === 'director' ? 'Diretor' : 'Professor'}</strong> na escola <strong>{schoolName}</strong>.
                </p>

                <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '1rem' }}
                    onClick={handleAccept}
                >
                    {status === 'authenticated' ? 'Aceitar Convite' : 'Entrar com Google para Aceitar'}
                </button>

                <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Ao aceitar, você terá acesso ao painel de gerenciamento da escola.
                </p>
            </div>
        </div>
    );
}

export default function InvitePage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <InviteContent />
        </Suspense>
    );
}
