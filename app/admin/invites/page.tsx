"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { Copy, Check, UserPlus, Shield, Users, School } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext';

export default function InvitesPage() {
    const { data: session } = useSession();
    const { t } = useTranslation();
    const [role, setRole] = useState('student');
    const [maxUses, setMaxUses] = useState(1);
    const [generatedToken, setGeneratedToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Options
    const [discount, setDiscount] = useState(0);
    const [hasDiscount, setHasDiscount] = useState(false);
    const [familyMode, setFamilyMode] = useState(false);
    const [isFree, setIsFree] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const options = {
                discount_percent: hasDiscount ? discount : 0,
                free_family: familyMode,
                is_free: isFree
            };

            const { data, error } = await supabase.rpc('generate_invitation', {
                p_role: role,
                p_max_uses: maxUses,
                p_options: options
            });

            if (error) throw error;

            setGeneratedToken(data);
        } catch (error: any) {
            console.error('Error generating token:', error);
            alert('Erro ao gerar convite: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const inviteLink = generatedToken ? `${window.location.origin}/register?token=${generatedToken}` : '';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="admin-container" style={{ padding: '2rem', color: 'var(--text-primary)' }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Gerador de Convites</h1>

            <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px' }}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo de Usuário</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                        <button
                            className={`role-btn ${role === 'student' ? 'active' : ''}`}
                            onClick={() => setRole('student')}
                            style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #444', background: role === 'student' ? 'var(--accent-primary)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                        >
                            <School size={20} /> Aluno
                        </button>
                        <button
                            className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
                            onClick={() => setRole('teacher')}
                            style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #444', background: role === 'teacher' ? 'var(--accent-primary)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                        >
                            <School size={20} /> Professor
                        </button>
                        <button
                            className={`role-btn ${role === 'director' ? 'active' : ''}`}
                            onClick={() => setRole('director')}
                            style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #444', background: role === 'director' ? 'var(--accent-primary)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                        >
                            <Shield size={20} /> Diretor
                        </button>
                        <button
                            className={`role-btn ${role === 'employee' ? 'active' : ''}`}
                            onClick={() => setRole('employee')}
                            style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #444', background: role === 'employee' ? 'var(--accent-primary)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                        >
                            <Users size={20} /> Func.
                        </button>
                        <button
                            className={`role-btn ${role === 'friend' ? 'active' : ''}`}
                            onClick={() => setRole('friend')}
                            style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #444', background: role === 'friend' ? 'var(--accent-primary)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                        >
                            <Users size={20} /> Amigo
                        </button>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Quantidade de Usos</label>
                    <input
                        type="number"
                        min="1"
                        value={maxUses}
                        onChange={(e) => setMaxUses(parseInt(e.target.value))}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', color: 'white' }}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#aaa' }}>Opções Adicionais</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={familyMode}
                                onChange={(e) => setFamilyMode(e.target.checked)}
                            />
                            Modo Família (Acesso Familiar)
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={isFree}
                                onChange={(e) => setIsFree(e.target.checked)}
                            />
                            Grátis (Isento de Pagamento)
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <input
                                    type="checkbox"
                                    checked={hasDiscount}
                                    onChange={(e) => setHasDiscount(e.target.checked)}
                                />
                                Desconto (%)
                            </label>
                            {hasDiscount && (
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseInt(e.target.value))}
                                    placeholder="%"
                                    style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid #555', color: 'white' }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <button
                    className="btn-primary"
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                    {loading ? 'Gerando...' : <><UserPlus size={20} /> Gerar Link de Convite</>}
                </button>

                {generatedToken && (
                    <div className="result-area" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid #10b981' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#10b981', fontWeight: 'bold' }}>Link Gerado:</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={inviteLink}
                                readOnly
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white' }}
                            />
                            <button
                                onClick={copyToClipboard}
                                style={{ padding: '0.8rem', borderRadius: '8px', background: '#10b981', border: 'none', cursor: 'pointer', color: 'white' }}
                                title="Copiar"
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                            Este link é válido por 7 dias e pode ser usado {maxUses} vezes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
