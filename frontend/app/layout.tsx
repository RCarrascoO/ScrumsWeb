import GlobalAlerts from "./GlobalAlerts";

export const metadata = {
  title: "ScrumsWeb",
  description: "Gestión de proyectos Scrum",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          @supports (font: -apple-system-body) and (-webkit-appearance: none) {
            body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; }
          }
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(-45deg, #e0eafc, #cfdef3, #e6e9f0, #eef2f3);
            background-size: 400% 400%;
            animation: gradientBG 20s ease infinite;
            color: #1d1d1f;
            -webkit-font-smoothing: antialiased;
            letter-spacing: -0.015em;
            min-height: 100vh;
          }
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          button {
            font-family: inherit;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            border-radius: 12px !important;
            cursor: pointer;
          }
          button:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          button:active {
            transform: scale(0.96) !important;
          }
          input, select {
            font-family: inherit;
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 12px !important;
            outline: none;
            background: rgba(255,255,255,0.8);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }
          input:focus, select:focus {
            border-color: #0071e3;
            box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15);
            background: #fff;
          }
          a {
            color: #0071e3;
            text-decoration: none;
            transition: opacity 0.2s ease;
          }
          a:hover {
            opacity: 0.8;
          }
          
          /* Apple-like scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.2);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background-color: rgba(0,0,0,0.3);
          }
        `}} />
      </head>
      <body>
        <GlobalAlerts />
        {children}
      </body>
    </html>
  );
}