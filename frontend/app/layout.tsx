import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from './providers';

export const metadata: Metadata = {
  title: 'ScrumsWeb - Herramienta Scrum',
  description: 'WebApp Scrum para gestión de equipos, proyectos, sprints, backlog y métricas.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
