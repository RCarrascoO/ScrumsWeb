export const metadata = {
  title: "ScrumsWeb",
  description: "Gestion de proyectos Scrum",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}