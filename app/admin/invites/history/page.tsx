"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check, Filter, Users, Calendar, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext';
import '../../admin.css';

interface Invitation {
    id: string;
    token: string;
    role: string;
    created_by: string;
    max_uses: number;
    uses: number;
    options: any;
    expires_at: string;
    created_at: string;
    active: boolean;
    status: 'active' | 'used' | 'expired';
    inviteLink: string;
    isFamilyPlan: boolean;
    isFree: boolean;
    discount: number;
    creator?: {
        id: string;
        email: string;
        full_name: string;
    };
}

export default function InvitationHistoryPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired' | 'family'>('all');
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            console.log('[History Page] Fetching invitations...');
            const response = await fetch('/api/admin/invites/history');
            console.log('[History Page] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[History Page] Error response:', errorData);
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('[History Page] Received invitations:', data.length);
            setInvitations(data);
        } catch (error: any) {
            console.error('[History Page] Error fetching invitations:', error);
            alert(`Erro ao carregar histórico de convites: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (link: string, token: string) => {
        navigator.clipboard.writeText(link);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const filteredInvitations = invitations.filter(invite => {
        if (filter === 'all') return true;
        if (filter === 'family') return invite.isFamilyPlan;
        return invite.status === filter;
    });

    const stats = {
        total: invitations.length,
        active: invitations.filter(i => i.status === 'active').length,
        used: invitations.filter(i => i.status === 'used').length,
        expired: invitations.filter(i => i.status === 'expired').length,
        family: invitations.filter(i => i.isFamilyPlan).length
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#10b981';
            case 'used': return '#6b7280';
            case 'expired': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'used': return 'Usado';
            case 'expired': return 'Expirado';
            default: return status;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-white">{t('loading')}</div>;
    }

    return (
        <div className="admin-container" style={{ padding: '2rem', color: 'var(--text-primary)' }}>
            <header className="admin-header" style={{ marginBottom: '2rem' }}>
                <button className="icon-button" onClick={() => router.back()} style={{ marginRight: '1rem' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('invite_history')}</h1>
            </header>

            {/* Statistics */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{stats.total}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('total')}</div>
                </div>
                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.active}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('active')}</div>
                </div>
                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6b7280' }}>{stats.used}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('used')}</div>
                </div>
                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.expired}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('expired')}</div>
                </div>
                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.family}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('family')}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {['all', 'active', 'used', 'expired', 'family'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className="btn-secondary"
                        style={{
                            background: filter === f ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                            border: filter === f ? '1px solid var(--accent-primary)' : '1px solid #444',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Filter size={16} />
                        {f === 'all' ? t('all') : f === 'active' ? t('active') : f === 'used' ? t('used') : f === 'expired' ? t('expired') : t('family')}
                    </button>
                ))}
            </div>

            {/* Invitations List */}
            <div className="invitations-list" style={{ display: 'grid', gap: '1rem' }}>
                {filteredInvitations.length === 0 ? (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {t('no_invites_found')}
                    </div>
                ) : (
                    filteredInvitations.map(invite => (
                        <div key={invite.id} className="glass-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            background: getStatusColor(invite.status),
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {getStatusText(invite.status)}
                                        </span>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.1)',
                                            fontSize: '0.8rem'
                                        }}>
                                            {invite.role}
                                        </span>
                                        {invite.isFamilyPlan && (
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                background: '#8b5cf6',
                                                fontSize: '0.8rem'
                                            }}>
                                                👨‍👩‍👧‍👦 Família
                                            </span>
                                        )}
                                        {invite.isFree && (
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                background: '#10b981',
                                                fontSize: '0.8rem'
                                            }}>
                                                {t('free')}
                                            </span>
                                        )}
                                        {invite.discount > 0 && (
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                background: '#f59e0b',
                                                fontSize: '0.8rem'
                                            }}>
                                                -{invite.discount}%
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={14} />
                                        {invite.creator?.full_name || invite.creator?.email || t('unknown')}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                        {invite.uses}/{invite.max_uses}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('uses')}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    value={invite.inviteLink}
                                    readOnly
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        borderRadius: '4px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid #444',
                                        color: 'white',
                                        fontSize: '0.85rem'
                                    }}
                                />
                                <button
                                    onClick={() => copyToClipboard(invite.inviteLink, invite.token)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '4px',
                                        background: copiedToken === invite.token ? '#10b981' : 'var(--accent-primary)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {copiedToken === invite.token ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={14} />
                                    {t('created')}: {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={14} />
                                    {t('expires')}: {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
