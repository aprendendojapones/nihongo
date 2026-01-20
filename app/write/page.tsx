"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PCHandwritingView from '@/components/PCHandwritingView';
import { ArrowLeft } from 'lucide-react';
import '../dashboard/dashboard.css';

export default function WritePage() {
    const { data: session } = useSession();
    const router = useRouter();

    if (!session) {
        router.push('/');
        return null;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <button
                    className="btn-primary"
                    onClick={() => router.back()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={20} /> Voltar
                </button>
            </header>

            <main style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <PCHandwritingView />
            </main>
        </div>
    );
}
