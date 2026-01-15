export default function Home() {
  return (
    <main>
      <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '800px' }}>
        <h1 className="gradient-text" style={{ fontSize: '4rem', marginBottom: '1rem' }}>日本語 Master</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
          Aprenda Japonês do N5 ao N1 com gamificação e prática de escrita em tempo real.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3>Níveis JLPT</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Conteúdo estruturado do básico ao avançado.</p>
          </div>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3>Modo Game</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Aprenda brincando e suba no ranking global.</p>
          </div>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3>Escrita Real-time</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Use seu celular como tablet de escrita para o PC.</p>
          </div>
        </div>

        <div style={{ marginTop: '4rem' }}>
          <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
            Começar Agora
          </button>
        </div>
      </div>
    </main>
  );
}
