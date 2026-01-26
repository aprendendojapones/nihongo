"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Save, Shield, Globe, ArrowLeft, Eye, EyeOff, ScanLine, Trophy, Star, Zap, BookOpen } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext';
import { Country, State, City } from 'country-state-city';
import './profile.css';

export default function ProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { t, setLang, lang } = useTranslation();
    const user = session?.user as any;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        phone: '',
        address: '', // Street address
        country: '',
        state: '',
        city: '',
        phone_public: false,
        address_public: false,
        language_pref: 'pt',
        schoolName: '',
        xp: 0,
        level: 'N5'
    });

    const [progress, setProgress] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.email) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*, schools(name)')
                    .eq('email', user.email)
                    .single();

                if (data) {
                    setFormData({
                        username: data.username || '',
                        full_name: data.full_name || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        country: data.country || '',
                        state: data.state || '',
                        city: data.city || '',
                        phone_public: data.phone_public || false,
                        address_public: data.address_public || false,
                        language_pref: data.language_pref || 'pt',
                        schoolName: data.schools?.name || '',
                        xp: data.xp || 0,
                        level: data.level || 'N5'
                    });
                    if (data.language_pref) {
                        setLang(data.language_pref);
                    }

                    // Fetch user progress
                    const { data: progressData } = await supabase
                        .from('user_progress')
                        .select('*')
                        .eq('user_id', data.id) // Use UUID from profile data
                        .order('completed_at', { ascending: false });

                    if (progressData) {
                        setProgress(progressData);
                    }

                    // Fetch subscription
                    const { data: subData } = await supabase
                        .from('subscriptions')
                        .select('*, plans(name)')
                        .eq('user_id', data.id) // Use UUID from profile data
                        .eq('status', 'active')
                        .single();

                    if (subData) {
                        setSubscription(subData);
                    }
                }
            }
            setLoading(false);
        };

        fetchProfile();
    }, [user?.email, setLang]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'language_pref') {
            setLang(value as any);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        if (user?.email) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: formData.username,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    address: formData.address,
                    country: formData.country,
                    state: formData.state,
                    city: formData.city,
                    phone_public: formData.phone_public,
                    address_public: formData.address_public,
                    language_pref: formData.language_pref
                })
                .eq('email', user.email);

            if (!error) {
                alert('Perfil atualizado com sucesso!');
            } else {
                console.error('Error updating profile:', error);
                alert(`Erro ao atualizar perfil: ${error.message}`);
            }
        }
        setSaving(false);
    };

    const [showScanner, setShowScanner] = useState(false);
    const [scanError, setScanError] = useState('');

    const handleScan = async (data: string | null) => {
        if (data) {
            setShowScanner(false);
            // Assuming data is the school ID
            const schoolId = data;

            // Verify school exists
            const { data: schoolData, error: schoolError } = await supabase
                .from('schools')
                .select('name')
                .eq('id', schoolId)
                .single();

            if (schoolData) {
                // Update user profile
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ school_id: schoolId })
                    .eq('email', user.email);

                if (!updateError) {
                    setFormData(prev => ({ ...prev, schoolName: schoolData.name }));
                    alert(`Vinculado com sucesso à escola: ${schoolData.name}`);
                } else {
                    alert('Erro ao vincular escola.');
                }
            } else {
                alert('Escola não encontrada.');
            }
        }
    };

    const handleError = (err: any) => {
        console.error(err);
        setScanError('Erro ao acessar a câmera.');
    };

    // Dynamically import QrReader to avoid SSR issues
    const QrReader = dynamic(() => import('react-qr-reader').then(mod => mod.QrReader), {
        ssr: false
    });

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}>{t('loading')}...</div>;

    return (
        <div className="profile-container">
            <header className="profile-header">
                <button className="icon-button" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{t('profile') || 'Meu Perfil'}</h1>
            </header>

            <main className="glass-card profile-card">
                <div className="profile-avatar-section">
                    {user?.image ? (
                        <img src={user.image} alt="Avatar" className="profile-avatar" />
                    ) : (
                        <div className="profile-avatar-placeholder">
                            <User size={48} />
                        </div>
                    )}
                    <div className="profile-basic-info">
                        <h2>{user?.name}</h2>
                        <p>{user?.email}</p>
                        <span className="role-badge">{user?.role || 'Estudante'}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-section">
                        <h3><User size={18} /> Informações Pessoais</h3>

                        <div className="form-group">
                            <label>Nome de Usuário (Público)</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Seu @usuario"
                                className="input-field"
                            />
                        </div>

                        <div className="form-group">
                            <label>Nome Completo</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Seu nome completo"
                                className="input-field"
                            />
                        </div>

                        <div className="form-group">
                            <label>Escola</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={formData.schoolName || 'Nenhuma escola vinculada'}
                                    disabled
                                    className="input-field disabled"
                                    style={{ opacity: 0.7, cursor: 'not-allowed', flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowScanner(true)}
                                    title="Escanear QR Code da Escola"
                                >
                                    <ScanLine size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3><Shield size={18} /> Privacidade e Contato</h3>

                        <div className="form-group privacy-group">
                            <div className="input-with-privacy">
                                <label>Telefone (Opcional)</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+55 (11) 99999-9999"
                                    className="input-field"
                                />
                            </div>
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    name="phone_public"
                                    checked={formData.phone_public}
                                    onChange={handleChange}
                                />
                                <span className="toggle-text">
                                    {formData.phone_public ? <Eye size={16} /> : <EyeOff size={16} />}
                                    {formData.phone_public ? ' Público' : ' Privado'}
                                </span>
                            </label>
                        </div>

                        <div className="form-group privacy-group">
                            <div className="input-with-privacy">
                                <label>Localização</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value, state: '', city: '' }))}
                                        className="input-field"
                                    >
                                        <option value="">Selecione o País</option>
                                        {Country.getAllCountries().map((country) => (
                                            <option key={country.isoCode} value={country.isoCode}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value, city: '' }))}
                                        className="input-field"
                                        disabled={!formData.country}
                                    >
                                        <option value="">Selecione o Estado</option>
                                        {formData.country && State.getStatesOfCountry(formData.country).map((state) => (
                                            <option key={state.isoCode} value={state.isoCode}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className="input-field"
                                        disabled={!formData.state}
                                    >
                                        <option value="">Selecione a Cidade</option>
                                        {formData.country && formData.state && City.getCitiesOfState(formData.country, formData.state).map((city) => (
                                            <option key={city.name} value={city.name}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    name="address_public"
                                    checked={formData.address_public}
                                    onChange={handleChange}
                                />
                                <span className="toggle-text">
                                    {formData.address_public ? <Eye size={16} /> : <EyeOff size={16} />}
                                    {formData.address_public ? ' Público' : ' Privado'}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3><Globe size={18} /> Preferências</h3>
                        <div className="form-group">
                            <label>Idioma do Sistema</label>
                            <select
                                name="language_pref"
                                value={formData.language_pref}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="pt">Português</option>
                                <option value="en">English</option>
                                <option value="jp">日本語</option>
                                <option value="fil">Filipino</option>
                                <option value="zh">中文</option>
                                <option value="hi">हिन्दी</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary save-button" disabled={saving}>
                        {saving ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
                    </button>
                </form>

                <div className="profile-subscription-section" style={{ marginTop: '2rem' }}>
                    <div className="form-section">
                        <h3><Star size={18} /> Assinatura</h3>
                        {subscription ? (
                            <div className="subscription-card active">
                                <div className="sub-header">
                                    <span className="plan-name">{subscription.plans?.name}</span>
                                    <span className="status-badge active">Ativo</span>
                                </div>
                                <p>Renova em: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
                                {subscription.plan_id === 'family' && (
                                    <button className="btn-secondary" style={{ marginTop: '1rem' }}>
                                        Gerenciar Família
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="subscription-card inactive">
                                <p>Você está no plano gratuito.</p>
                                <button
                                    className="btn-primary"
                                    onClick={() => router.push('/pricing')}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Ver Planos Premium
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-progress-section">
                    <div className="form-section">
                        <h3><Trophy size={18} /> Meu Progresso</h3>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon"><Star size={24} fill="var(--accent-primary)" /></div>
                                <div className="stat-value">{formData.xp}</div>
                                <div className="stat-label">XP Total</div>
                                <div className="xp-bar-container">
                                    <div className="xp-bar-fill" style={{ width: `${(formData.xp % 1000) / 10}%` }}></div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><Zap size={24} /></div>
                                <div className="stat-value">{formData.level}</div>
                                <div className="stat-label">Nível Atual</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><BookOpen size={24} /></div>
                                <div className="stat-value">{progress.filter(p => p.completed).length}</div>
                                <div className="stat-label">Atividades</div>
                            </div>
                        </div>

                        <div className="recent-activities">
                            <h4 className="recent-activities-title">Atividades Recentes</h4>
                            <div className="progress-list">
                                {progress.length > 0 ? (
                                    progress.slice(0, 5).map((item) => (
                                        <div key={item.id} className="progress-item">
                                            <div className="progress-item-info">
                                                <Trophy size={16} color="var(--accent-secondary)" />
                                                <span className="progress-item-name">
                                                    {item.lesson_id.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                                </span>
                                            </div>
                                            <span className="progress-item-score">
                                                {item.score !== null ? `${item.score} pts` : 'Concluído'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                                        Nenhuma atividade registrada ainda.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showScanner && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="modal-content glass-card" style={{ width: '90%', maxWidth: '400px', padding: '20px' }}>
                        <h3>Escanear QR Code da Escola</h3>
                        <div style={{ width: '100%', height: '300px', background: '#000', marginBottom: '1rem', overflow: 'hidden', borderRadius: '8px' }}>
                            <QrReader
                                onResult={(result: any, error: any) => {
                                    if (!!result) {
                                        handleScan(result?.text);
                                    }
                                    if (!!error) {
                                        console.info(error);
                                    }
                                }}
                                constraints={{ facingMode: 'environment' }}
                            />
                        </div>
                        <p style={{ textAlign: 'center', color: '#aaa', fontSize: '0.9rem' }}>Aponte a câmera para o QR Code</p>
                        <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setShowScanner(false)}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
}
