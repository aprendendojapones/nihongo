"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext';

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        if (sessionId) {
            // Give webhook time to process
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            padding: '2rem'
        }}>
            <div className="glass-card" style={{
                maxWidth: '500px',
                width: '100%',
                padding: '3rem',
                textAlign: 'center'
            }}>
                {loading ? (
                    <>
                        <div className="spinner" style={{ margin: '0 auto 2rem' }}></div>
                        <h1 style={{ marginBottom: '1rem' }}>Processando pagamento...</h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Aguarde enquanto confirmamos sua assinatura
                        </p>
                    </>
                ) : (
                    <>
                        <CheckCircle
                            size={64}
                            color="#10b981"
                            style={{ margin: '0 auto 2rem' }}
                        />
                        <h1 style={{ marginBottom: '1rem', color: '#10b981' }}>
                            Pagamento Confirmado! 🎉
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Sua assinatura foi ativada com sucesso. Agora você tem acesso completo a todo o conteúdo premium!
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                            <button
                                className="btn-primary"
                                onClick={() => router.push('/lessons')}
                                style={{ width: '100%' }}
                            >
                                Começar a Estudar
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => router.push('/profile')}
                                style={{ width: '100%' }}
                            >
                                Ver Meu Perfil
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
