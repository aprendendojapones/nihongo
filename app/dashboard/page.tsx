"use client";

import { Trophy, Star, Flame, BookOpen, User, LogOut } from 'lucide-react';
import PCHandwritingView from '@/components/PCHandwritingView';
import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
    const { data: session } = useSession();
    const user = session?.user as any;

    const userStats = {
        level: user?.level || 'N5',
        xp: user?.xp || 0,
        rank: 42,
        streak: user?.streak || 0
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {user?.image ? (
                        <img src={user.image} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--accent-primary)' }} />
                    ) : (
                        <div className="glass-card" style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={32} />
                        </div>
                    )}
                    <div>
                        <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Olá, {user?.name || 'Estudante'}!</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Nível Atual: {userStats.level}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div className="glass-card" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Flame color="var(--accent-primary)" size={20} />
                        <span>{userStats.streak} Dias</span>
                    </div>
                    <div className="glass-card" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star color="var(--accent-secondary)" size={20} />
                        <span>{userStats.xp} XP</span>
                    </div>
                    <button
                        onClick={() => signOut()}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <LogOut size={20} /> Sair
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section className="glass-card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                            < BookOpen size={24} /> Próxima Lição: Hiragana Básico
                        </h2>
                        <div style={{ background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ background: 'var(--accent-primary)', width: '65%', height: '100%' }} />
                        </div>
                        <p style={{ color: 'var(--text-muted)' }}>65% do nível N5 concluído</p>
                        <button className="btn-primary" style={{ marginTop: '1.5rem' }}>Continuar Estudando</button>
                    </section>

                    <PCHandwritingView />
                </div>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Trophy size={20} color="var(--accent-secondary)" /> Ranking Global
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderRadius: '8px', background: i === 3 ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                                    <span style={{ color: i <= 3 ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>#{i}</span>
                                    <span>Usuário {i}</span>
                                    <span style={{ fontWeight: 'bold' }}>{5000 - i * 500}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3>Seu Nível: {userStats.level}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Faltam 750 XP para o nível N4.
                        </p>
                        <button className="btn-primary" style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid var(--accent-primary)' }}>
                            Ver Conquistas
                        </button>
                    </section>
                </aside>
            </div>
        </div>
    );
}
