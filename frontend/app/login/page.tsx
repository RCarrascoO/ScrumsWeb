"use client";

import { useState } from "react";
import { authApi } from "../../lib/api";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.login({ email, password });
      Cookies.set("access_token", res.data.access_token);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", fontFamily: "sans-serif" }}>
      <h1>Iniciar Sesión en ScrumsWeb</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          type="email" 
          placeholder="Correo" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          style={{ padding: "10px" }}
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          style={{ padding: "10px" }}
        />
        <button type="submit" style={{ padding: "10px", background: "#0070f3", color: "white", border: "none" }}>Entrar</button>
      </form>
      <p style={{ marginTop: "15px" }}>
        ¿No tienes cuenta? <a href="/register">Regístrate</a>
      </p>
    </div>
  );
}