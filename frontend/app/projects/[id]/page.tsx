"use client";

import { useAuth } from "../../../lib/useAuth";
import { useEffect, useState } from "react";
import { projectsApi, sprintsApi } from "../../../lib/api";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function ProjectDetails() {
  const { id } = useParams() as { id: string };
  const { user, loading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [sprints, setSprints] = useState([]);
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newSprint, setNewSprint] = useState({ name: "", goal: "", start_date: "", end_date: "" });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    else if (user && id) fetchProjectData();
  }, [user, loading, id, router]);

  const fetchProjectData = async () => {
    try {
        // En Next.js hay que crear las funciones del API si no están
        // Asegúramos que las APIs se mapeen con axiosClient en lib/api.ts
        const [projRes, sprintsRes] = await Promise.all([
           projectsApi.getOne(id),
           sprintsApi.getAll(id)
        ]);
        setProject(projRes.data);
        setSprints(sprintsRes.data);
    } catch (err) {
        console.error("Error al cargar proyecto", err);
    }
  }

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sprintsApi.create(id, newSprint);
      setIsCreatingSprint(false);
      setNewSprint({ name: "", goal: "", start_date: "", end_date: "" });
      fetchProjectData();
    } catch (err) {
      alert("Error creando sprint. Revisa la consola o permisos.");
    }
  }

  if (loading || !project) return <div style={{ padding: "50px" }}>Cargando datos del proyecto...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
       
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        <div>
           <button onClick={() => router.push("/dashboard")} style={{ marginRight: "15px", cursor: "pointer" }}>← Volver</button>
           <h1 style={{ display: "inline-block" }}>Proyecto: {project.name}</h1>
        </div>
      </header>

      <main style={{ marginTop: "20px" }}>
         <h3>{project.description}</h3>
         <hr />
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Sprints</h2>
            <button 
              onClick={() => setIsCreatingSprint(!isCreatingSprint)}
              style={{ background: "#28a745", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" }}
            >
              {isCreatingSprint ? "Cancelar" : "+ Crear Sprint"}
            </button>
         </div>

         {isCreatingSprint && (
             <form onSubmit={handleCreateSprint} style={{ background: "#f5f5f5", padding: "15px", borderRadius: "8px", margin: "15px 0", display: "grid", gap: "10px", gridTemplateColumns: "1fr 1fr" }}>
                <input type="text" placeholder="Nombre del Sprint" required title="Format ISO Date YYYY-MM-DD" value={newSprint.name} onChange={e => setNewSprint({...newSprint, name: e.target.value})} style={{ padding: "8px"}} />
                <input type="text" placeholder="Meta / Objetivo" value={newSprint.goal} onChange={e => setNewSprint({...newSprint, goal: e.target.value})} style={{ padding: "8px"}} />
                <input type="date" required value={newSprint.start_date} onChange={e => setNewSprint({...newSprint, start_date: e.target.value})} style={{ padding: "8px"}} title="Inicio"/>
                <input type="date" required value={newSprint.end_date} onChange={e => setNewSprint({...newSprint, end_date: e.target.value})} style={{ padding: "8px"}} title="Fin"/>
                <button type="submit" style={{ gridColumn: "span 2", background: "green", color: "white", border: "none", padding: "10px", cursor: "pointer" }}>Guardar Sprint</button>
             </form>
         )}

         {sprints.length === 0 ? (
            <p>Todavía no hay Sprints creados en este proyecto.</p>
         ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "flex", gap: "15px", flexDirection: "column" }}>
              {sprints.map((sprint: any) => (
                <li key={sprint.id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "5px", background: "white" }}>
                  <h3 style={{ margin: "0 0 10px 0" }}>{sprint.name} <span style={{fontSize: "12px", color: "gray"}}>(ID: {sprint.id})</span></h3>
                  <p style={{ margin: "0" }}>Meta: {sprint.goal}</p>
                  <p style={{ margin: "5px 0", fontSize: "14px", color: "blue" }}>{sprint.start_date} - {sprint.end_date}</p>
                  <button onClick={() => router.push(`/projects/${id}/sprints/${sprint.id}`)} style={{ background: "#0070f3", color: "white", padding: "8px 12px", border: "none", borderRadius: "4px", marginTop: "10px", cursor: "pointer"}}>Gestionar Tareas</button>
                </li>
              ))}
            </ul>
         )}
      </main>

    </div>
  )
}
