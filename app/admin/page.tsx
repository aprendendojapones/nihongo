"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Users, School, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/components/TranslationContext';
import './admin.css';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const user = session?.user as any;
    const [schools, setSchools] = useState<any[]>([]);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [invitationLink, setInvitationLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/dashboard');
        } else {
            fetchSchools();
        }
    }, [user]);

    const fetchSchools = async () => {
        const { data } = await supabase.from('schools').select('*, profiles(full_name)');
        if (data) setSchools(data);
    };

    const createSchool = async () => {
        if (!newSchoolName) return;
        const { data, error } = await supabase
            .from('schools')
            .insert({ name: newSchoolName })
            .select()
            .single();

        if (data) {
            setNewSchoolName('');
            fetchSchools();
        }
    };

    const generateInvite = (schoolId: string, role: string) => {
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/invite?schoolId=${schoolId}&role=${role}`;
        setInvitationLink(inviteUrl);
        setCopied(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(invitationLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>{t('admin_panel')}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{t('admin_panel_desc')}</p>
            </header>

            <div className="admin-grid">
                <section className="glass-card admin-section">
                    <h2 className="admin-section-title">
                        <Plus size={24} /> {t('create_new_school')}
                    </h2>
                    <div className="admin-input-group">
                        <input
                            type="text"
                            placeholder={t('school_name_placeholder')}
                            value={newSchoolName}
                            onChange={(e) => setNewSchoolName(e.target.value)}
                            className="admin-input"
                        />
                        <button className="btn-primary" onClick={createSchool}>{t('create')}</button>
                    </div>
                </section>

                <section className="glass-card admin-section">
                    <h2 className="admin-section-title">
                        <LinkIcon size={24} /> {t('generate_invite')}
                    </h2>
                    {invitationLink ? (
                        <div className="invite-link-container">
                            <div className="invite-link-box">
                                <span className="invite-link-text">{invitationLink}</span>
                                <button onClick={copyToClipboard} className="copy-button" style={{ color: copied ? '#3effa2' : 'white' }}>
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid #444' }} onClick={() => setInvitationLink('')}>{t('generate_another')}</button>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('invite_desc')}</p>
                    )}
                </section>
            </div>

            <section className="glass-card admin-section" style={{ marginTop: '2rem' }}>
                <h2 className="admin-section-title">
                    <School size={24} /> {t('registered_schools')}
                </h2>
                <div className="school-list">
                    {schools.map(school => (
                        <div key={school.id} className="school-item">
                            <div className="school-info">
                                <h3>{school.name}</h3>
                                <p>{t('director')}: {school.profiles?.full_name || t('not_assigned')}</p>
                            </div>
                            <div className="school-actions">
                                <button className="btn-primary btn-director" onClick={() => generateInvite(school.id, 'director')}>{t('invite_director')}</button>
                                <button className="btn-primary btn-teacher" onClick={() => generateInvite(school.id, 'teacher')}>{t('invite_teacher')}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
