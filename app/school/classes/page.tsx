"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Video, Plus, X, ArrowLeft, Trash2 } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext';
import '../school.css';

interface LiveClass {
    id: string;
    title: string;
    description: string;
    start_time: string;
    duration_minutes: number;
    meeting_url: string;
    is_cancelled: boolean;
}

export default function SchoolClassesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const user = session?.user as any;
    
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        meeting_url: ''
    });

    useEffect(() => {
        if (user?.school_id) {
            fetchClasses();
        }
    }, [user]);

    const fetchClasses = async () => {
        try {
            const { data, error } = await supabase
                .from('live_classes')
                .select('*')
                .eq('school_id', user.school_id)
                .order('start_time', { ascending: true });

            if (error) throw error;
            setClasses(data || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        
        try {
            const { error } = await supabase
                .from('live_classes')
                .insert({
                    school_id: user.school_id,
                    creator_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    start_time: startDateTime.toISOString(),
                    duration_minutes: formData.duration,
                    meeting_url: formData.meeting_url
                });

            if (error) throw error;

            setShowModal(false);
            setFormData({ title: '', description: '', date: '', time: '', duration: 60, meeting_url: '' });
            fetchClasses();
            alert('Aula agendada com sucesso!');
        } catch (error: any) {
            alert('Erro ao agendar aula: ' + error.message);
        }
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    };

    if (!user || !['director', 'teacher', 'admin'].includes(user.role)) {
        return <div className="p-8 text-white">Acesso restrito.</div>;
    }

    return (
        <div className="school-container">
            <header className="school-header">
                 <button className="icon-button" onClick={() => router.push('/school')}>
                    <ArrowLeft size={24} />
                </button>
                <div className="school-header-info">
                    <h1 className="gradient-text">Aulas ao Vivo</h1>
                    <p>Gerencie o cronograma de aulas da sua escola.</p>
                </div>
                <button 
                    className="btn-primary" 
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={20} /> Agendar Nova Aula
                </button>
            </header>

            <div className="school-grid">
                <section className="glass-card" style={{ gridColumn: 'span 2' }}>
                    <h3 className="mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-accent-primary" /> 
                        Próximas Aulas
                    </h3>

                    {loading ? (
                        <p>Carregando...</p>
                    ) : classes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classes.map(cls => (
                                <div key={cls.id} className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333] hover:border-[#555] transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-white">{cls.title}</h4>
                                        <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                                            {cls.duration_minutes} min
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4 h-10 overflow-hidden">{cls.description}</p>
                                    
                                    <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                        <Calendar size={16} />
                                        <span>{formatDate(cls.start_time)}</span>
                                    </div>
                                    
                                    {cls.meeting_url && (
                                        <a 
                                            href={cls.meeting_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm mt-2"
                                        >
                                            <Video size={16} /> Link da Reunião
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Nenhuma aula agendada.</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Create Class Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="glass-card w-full max-w-lg relative bg-[#111]">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-6 gradient-text">Agendar Nova Aula</h2>
                        
                        <form onSubmit={handleCreateClass} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Título da Aula</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:border-accent-primary outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="Ex: Introdução ao Hiragana"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                                <textarea 
                                    className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:border-accent-primary outline-none h-24 resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="Detalhes sobre o conteúdo da aula..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Data</label>
                                    <input 
                                        type="date" 
                                        required
                                        className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:border-accent-primary outline-none"
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Horário</label>
                                    <input 
                                        type="time" 
                                        required
                                        className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:border-accent-primary outline-none"
                                        value={formData.time}
                                        onChange={e => setFormData({...formData, time: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Duração (min)</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="15"
                                        step="15"
                                        className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:border-accent-primary outline-none"
                                        value={formData.duration}
                                        onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Link da Reunião (Zoom/Meet)</label>
                                    <input 
                                        type="url" 
                                        className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:border-accent-primary outline-none"
                                        value={formData.meeting_url}
                                        onChange={e => setFormData({...formData, meeting_url: e.target.value})}
                                        placeholder="https://meet.google.com/..."
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary mt-4 py-3 font-bold text-lg">
                                Confirmar Agendamento
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
