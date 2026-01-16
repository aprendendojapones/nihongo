"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '800px' }}>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '1rem' }}>
          日本語 Master
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
          Aprenda Japonês do N5 ao N1 com gamificação e prática de escrita em tempo real.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginTop: '3rem'
        }}>
          <div
            className="glass-card"
            style={{ padding: '2rem', cursor: 'pointer' }}
            onClick={() => router.push('/dashboard')}
          >
            <h3>Níveis JLPT</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Conteúdo estruturado do básico ao avançado.
            </p>
          </div>

          <div
            className="glass-card"
            style={{ padding: '2rem', cursor: 'pointer' }}
            onClick={() => router.push('/game')}
          >
            <h3>Modo Game</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Aprenda brincando e suba no ranking global.
            </p>
          </div>

          <div
            className="glass-card"
            style={{ padding: '2rem', cursor: 'pointer' }}
            onClick={() => router.push('/dashboard')}
          >
            <h3>Escrita Real-time</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Use seu celular como tablet de escrita para o PC.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '4rem' }}>
          <button
            className="btn-primary"
            style={{ fontSize: '1.1rem', padding: '16px 48px' }}
            onClick={() => router.push('/dashboard')}
          >
            Começar Agora
          </button>
        </div>
      </div>
    </main>
  );
}
