"use client";

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
    const router = useRouter();

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
                <XCircle
                    size={64}
                    color="#ef4444"
                    style={{ margin: '0 auto 2rem' }}
                />
                <h1 style={{ marginBottom: '1rem' }}>
                    Pagamento Cancelado
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Você cancelou o processo de pagamento. Não se preocupe, você ainda pode assinar quando quiser!
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    <button
                        className="btn-primary"
                        onClick={() => router.push('/pricing')}
                        style={{ width: '100%' }}
                    >
                        Ver Planos Novamente
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => router.push('/lessons')}
                        style={{ width: '100%' }}
                    >
                        Continuar com Plano Grátis
                    </button>
                </div>
            </div>
        </div>
    );
}
