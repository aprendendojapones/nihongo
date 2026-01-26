"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Check, Users, School, Star, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext';
import './pricing.css';

interface Plan {
    id: string;
    name: string;
    price: number;
    description: string;
    max_members: number;
}

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            const { data } = await supabase.from('plans').select('*').order('price');
            if (data) setPlans(data);
            setLoading(false);
        };
        fetchPlans();
    }, []);

    const handleSubscribe = async (planId: string) => {
        if (!session?.user) {
            router.push('/login');
            return;
        }

        setSubscribing(planId);
        try {
            // In a real app, this would redirect to Stripe/Payment Gateway
            // For now, we simulate a successful subscription
            const { error } = await supabase.rpc('subscribe_user', {
                p_user_id: (session.user as any).id,
                p_plan_id: planId
            });

            if (error) throw error;

            alert('Assinatura realizada com sucesso!');
            router.push('/profile');
        } catch (error: any) {
            console.error('Error subscribing:', error);
            alert('Erro ao assinar: ' + error.message);
        } finally {
            setSubscribing(null);
        }
    };

    if (loading) return <div className="loading-container">Carregando planos...</div>;

    return (
        <div className="pricing-container">
            <header className="pricing-header">
                <button className="icon-button" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Escolha seu Plano</h1>
                <p>Invista no seu futuro com o Nihongo App</p>
            </header>

            <div className="plans-grid">
                {plans.map((plan) => (
                    <div key={plan.id} className={`plan-card ${plan.id}`}>
                        <div className="plan-icon">
                            {plan.id === 'individual' && <Star size={40} />}
                            {plan.id === 'family' && <Users size={40} />}
                            {plan.id === 'school' && <School size={40} />}
                        </div>
                        <h2>{plan.name}</h2>
                        <div className="plan-price">
                            <span className="currency">¥</span>
                            <span className="amount">{plan.price}</span>
                            <span className="period">/mês</span>
                        </div>
                        <p className="plan-description">{plan.description}</p>

                        <ul className="plan-features">
                            <li><Check size={16} /> Acesso a todos os jogos</li>
                            <li><Check size={16} /> Sem anúncios</li>
                            {plan.id === 'family' && <li><Check size={16} /> Até 4 pessoas</li>}
                            {plan.id === 'family' && <li><Check size={16} /> Painel de Família</li>}
                            {plan.id === 'school' && <li><Check size={16} /> Desconto progressivo</li>}
                        </ul>

                        <button
                            className="btn-primary subscribe-button"
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={!!subscribing}
                        >
                            {subscribing === plan.id ? 'Processando...' : 'Assinar Agora'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
