"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/components/TranslationContext';
import './register-school.css';

export default function RegisterSchool() {
    const router = useRouter();
    const { data: session } = useSession();
    const { data: session } = useSession();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        fax: '',
        email: '',
        map_pin: ''
    });

    useEffect(() => {
        if (!session) {
            router.push('/');
        }
    }, [session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create school
            const { data: school, error: schoolError } = await supabase
                .from('schools')
                .insert({
                    name: formData.name,
                    address: formData.address,
                    phone: formData.phone,
                    fax: formData.fax,
                    email: formData.email,
                    map_pin: formData.map_pin,
                    director_id: (session?.user as any)?.id
                })
                .select()
                .single();

            if (schoolError) throw schoolError;

            // Update user profile to director role and link to school
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    role: 'director',
                    school_id: school.id
                })
                .eq('id', (session?.user as any)?.id);

            if (profileError) throw profileError;

            alert('Escola registrada com sucesso!');
            router.push('/school');
        } catch (error) {
            console.error('Error registering school:', error);
            alert('Erro ao registrar escola. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!session) return null;

    return (
        <div className="register-school-container">
            <div className="register-school-card glass-card">
                <h1 className="gradient-text">Registrar Escola</h1>
                <p className="subtitle">Preencha os dados da sua escola</p>

                <form onSubmit={handleSubmit} className="school-form">
                    <div className="form-group">
                        <label>Nome da Escola *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Escola Nihongo Master"
                        />
                    </div>

                    <div className="form-group">
                        <label>Endereço *</label>
                        <input
                            type="text"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Rua, número, bairro, cidade, estado"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Telefone *</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(11) 1234-5678"
                            />
                        </div>

                        <div className="form-group">
                            <label>Fax</label>
                            <input
                                type="tel"
                                value={formData.fax}
                                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                                placeholder="(11) 1234-5678"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="contato@escola.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Pin do Mapa (URL do Google Maps)</label>
                        <input
                            type="url"
                            value={formData.map_pin}
                            onChange={(e) => setFormData({ ...formData, map_pin: e.target.value })}
                            placeholder="https://maps.google.com/..."
                        />
                        <small>Cole o link de compartilhamento do Google Maps</small>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrar Escola'}
                    </button>
                </form>
            </div>
        </div>
    );
}
