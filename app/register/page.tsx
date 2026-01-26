"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

function RegisterContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [inviteData, setInviteData] = useState<any>(null);

    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            validateToken();
        } else {
            setLoading(false);
        }
    }, [token]);

    const validateToken = async () => {
        // We can't fully validate without consuming in the current RPC design for security,
        // but we can check if it exists if we added a public read policy.
        // For now, let's just assume it's valid and try to consume on click.
        // Or better, we can add a 'get_token_info' RPC if needed.
        // For this MVP, we'll just show the UI.
        setLoading(false);
    };

    const handleRegister = async () => {
        if (status === 'unauthenticated') {
            signIn('google', { callbackUrl: window.location.href });
            return;
        }

        if (!token) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('consume_invitation', {
                p_token: token,
                p_user_id: (session?.user as any).id
            });

            if (error) throw error;

            setSuccess(true);
            setInviteData(data); // Options returned from RPC

            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (err: any) {
            console.error('Error consuming token:', err);
            setError(err.message || 'Erro ao processar convite.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex-center" style={{ height: '100vh', padding: '2rem' }}>
                <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '3rem', textAlign: 'center' }}>
                    <AlertCircle size={64} color="var(--accent-secondary)" style={{ margin: '0 auto 1rem' }} />
                    <h2>Link Inválido</h2>
                    <p>Este link de convite parece estar incompleto ou inválido.</p>
                    <button className="btn-primary" onClick={() => router.push('/')} style={{ marginTop: '1rem' }}>
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-center" style={{ height: '100vh', padding: '2rem' }}>
            <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '3rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <UserPlus size={64} color="var(--accent-primary)" />
                    </div>
                </div>

                <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Aceitar Convite</h1>

                {success ? (
                    <div className="animate-fade-in">
                        <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ fontSize: '1.2rem', color: '#10b981' }}>Convite aceito com sucesso!</p>
                        <p style={{ color: 'var(--text-muted)' }}>Redirecionando...</p>
                    </div>
                ) : (
                    <>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Você foi convidado para se juntar ao Nihongo Master.
                        </p>

                        {error && (
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '1rem', color: '#ef4444' }}>
                                {error}
                            </div>
                        )}

                        <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '1rem' }}
                            onClick={handleRegister}
                            disabled={loading}
                        >
                            {loading ? 'Processando...' : (status === 'authenticated' ? 'Confirmar e Aceitar' : 'Entrar com Google para Aceitar')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
