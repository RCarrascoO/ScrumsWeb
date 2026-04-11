"use client";

import { useAuth } from "../../lib/useAuth";
import { useEffect, useState } from "react";
import { projectsApi } from "../../lib/api";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      fetchProjects();
    }
  }, [user, loading, router]);

  const fetchProjects = async () => {
    try {
      const res = await projectsApi.getAll();
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectsApi.create(newProject);
      setNewProject({ name: "", description: "" });
      setIsCreating(false);
      fetchProjects(); // Recargar proyectos
    } catch (err) {
      alert("Error al crear el proyecto. Verifica tus permisos.");
    }
  };

  const handleLogout = () => {
    Cookies.remove("access_token");
    window.location.href = "/login";
  };

  if (loading || !user) return <p>Cargando...</p>;

  const isAdmin = user?.role === "ADMIN";

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        <h1>ScrumsWeb Dashboard</h1>
        <div>
          <span>Hola, {user.name} ({user.role})</span>
          <button onClick={handleLogout} style={{ marginLeft: "15px", padding: "5px 10px", background: "red", color: "white", border: "none", cursor: "pointer" }}>Salir</button>
        </div>
      </header>

      <main style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Tus Proyectos</h2>
          {isAdmin && (
            <button 
              onClick={() => setIsCreating(!isCreating)}
              style={{ background: "#0070f3", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" }}
            >
              {isCreating ? "Cancelar" : "+ Crear Proyecto"}
            </button>
          )}
        </div>

        {isCreating && isAdmin && (
          <form onSubmit={handleCreateProject} style={{ background: "#f5f5f5", padding: "15px", borderRadius: "8px", margin: "15px 0", display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              placeholder="Nombre del proyecto" 
              value={newProject.name}
              onChange={e => setNewProject({...newProject, name: e.target.value})}
              required
              style={{ padding: "8px", flex: 1 }}
            />
            <input 
              type="text" 
              placeholder="Descripción" 
              value={newProject.description}
              onChange={e => setNewProject({...newProject, description: e.target.value})}
              style={{ padding: "8px", flex: 2 }}
            />
            <button type="submit" style={{ background: "green", color: "white", border: "none", padding: "8px 15px", cursor: "pointer" }}>Guardar</button>
          </form>
        )}

        {projects.length === 0 ? (
          <p>No tienes proyectos vinculados. ¡Pídele a un admin que te agregue a uno o crea uno!</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "15px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {projects.map((proj: any) => (
              <li 
                key={proj.id} 
                onClick={() => router.push(`/projects/${proj.id}`)}
                style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "5px", cursor: "pointer", background: "white", transition: "transform 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>{proj.name}</h3>
                <p style={{ margin: "0", color: "#666" }}>{proj.description}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}