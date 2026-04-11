"use client";

import { useState } from "react";
import { authApi } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.register({ name, email, password });
      alert("Registro exitoso, ahora puedes iniciar sesión");
      router.push("/login");
    } catch (err) {
      alert("Error al registrarse");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", fontFamily: "sans-serif" }}>
      <h1>Registro ScrumsWeb</h1>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          type="text" 
          placeholder="Nombre" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
          style={{ padding: "10px" }}
        />
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
        <button type="submit" style={{ padding: "10px", background: "#28a745", color: "white", border: "none" }}>Registrarse</button>
      </form>
      <p style={{ marginTop: "15px" }}>
        ¿Ya tienes cuenta? <a href="/login">Inicia Sesión</a>
      </p>
    </div>
  );
}