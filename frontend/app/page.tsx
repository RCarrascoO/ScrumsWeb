import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem', maxWidth: 980, margin: '0 auto' }}>
      <section>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>ScrumsWeb</h1>
        <p style={{ fontSize: '1.2rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          Una herramienta Scrum completa para gestionar equipos, proyectos, sprints y métricas.
        </p>
        <Link
          href="/projects"
          style={{ display: 'inline-block', marginTop: '1rem', padding: '0.9rem 1.4rem', background: '#0f172a', color: '#fff', borderRadius: 8 }}
        >
          Ver proyectos
        </Link>
        <Link
          href="/login"
          style={{ display: 'inline-block', marginTop: '1rem', marginLeft: '1rem', padding: '0.9rem 1.4rem', background: '#1d4ed8', color: '#fff', borderRadius: 8 }}
        >
          Iniciar sesión / Registrarse
        </Link>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Funcionalidades iniciales</h2>
        <ul style={{ lineHeight: 1.7, paddingLeft: '1.2rem' }}>
          <li>Creación de equipos y proyectos.</li>
          <li>Gestión de sprints dentro de cada proyecto.</li>
          <li>Creación de backlog y tareas en un siguiente paso.</li>
          <li>Interfaz sencilla para iniciar la planificación Scrum.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Arquitectura propuesta</h2>
        <ol style={{ lineHeight: 1.7, paddingLeft: '1.2rem' }}>
          <li>Next.js con App Router para frontend.</li>
          <li>FastAPI como backend REST independiente.</li>
          <li>SQLite para el prototipo inicial en backend.</li>
          <li>Docker para contenedores frontend y backend.</li>
        </ol>
      </section>
    </main>
  );
}
