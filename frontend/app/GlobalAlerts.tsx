"use client";

import { useEffect, useState } from "react";

export default function GlobalAlerts() {
  const [alerts, setAlerts] = useState<{id: number, message: string}[]>([]);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: any) => {
      const id = Date.now() + Math.random();
      setAlerts((prev) => [...prev, { id, message: String(message) }]);
      // auto remove auto 4.5 secs
      setTimeout(() => {
        setAlerts((prev) => prev.filter(a => a.id !== id));
      }, 4500);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  return (
    <div style={{ position: "fixed", top: "30px", left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: "10px", pointerEvents: "none" }}>
       {alerts.map((alert) => (
         <div key={alert.id} style={{ 
            background: "rgba(255,255,255,0.85)", 
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 15px 30px rgba(0,0,0,0.12), 0 5px 15px rgba(0,0,0,0.05)",
            padding: "16px 30px",
            borderRadius: "40px",
            color: "#1d1d1f",
            fontWeight: 600,
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "slideDownAlert 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <circle cx="12" cy="12" r="10"></circle>
               <line x1="12" y1="8" x2="12" y2="12"></line>
               <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {alert.message}
         </div>
       ))}
       <style dangerouslySetInnerHTML={{__html: `
         @keyframes slideDownAlert {
           from { opacity: 0; transform: translateY(-30px) scale(0.9); }
           to { opacity: 1; transform: translateY(0) scale(1); }
         }
       `}} />
    </div>
  );
}
