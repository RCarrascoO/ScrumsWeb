"use client";

import { useAuth } from "../../../lib/useAuth";
import { useEffect, useState } from "react";
import { projectsApi, sprintsApi, usersApi } from "../../../lib/api";
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
  
  // States para Asignación de Usuario
  const [usersList, setUsersList] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchUser, setSearchUser] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    else if (user && id) fetchProjectData();
  }, [user, loading, id, router]);

  const fetchProjectData = async () => {
    try {
        const [projRes, sprintsRes] = await Promise.all([
           projectsApi.getOne(id),
           sprintsApi.getAll(id)
        ]);
        setProject(projRes.data);
        setSprints(sprintsRes.data);
        
        if (user?.role === "ADMIN" || user?.role === "MANAGER") {
             usersApi.getAll().then(res => setUsersList(res.data)).catch(console.error);
        }
    } catch (err) {
        console.error("Error al cargar proyecto", err);
    }
  }

  const handleAssignUser = async (email: string) => {
       try {
           await projectsApi.assignUser(id, email);
           alert("Usuario asignado al proyecto exitosamente.");
           setShowAssignModal(false);
       } catch (err: any) {
           if (err.response?.status === 404) alert("Usuario o proyecto no encontrados.");
           else alert("Error al asignar al usuario. Revise permisos.");
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

  const isManagerOrAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
       
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        <div>
           <button onClick={() => router.push("/dashboard")} style={{ marginRight: "15px", cursor: "pointer" }}>← Volver</button>
           <h1 style={{ display: "inline-block" }}>Proyecto: {project.name}</h1>
           {isManagerOrAdmin && (
             <button onClick={() => setShowAssignModal(true)} style={{ marginLeft: "15px", background: "#17a2b8", color: "white", padding: "8px 15px", borderRadius: "5px", border: "none", cursor: "pointer" }}>👤 Asignar Usuario</button>
           )}
        </div>
      </header>

      <main style={{ marginTop: "20px" }}>
         <h3>{project.description}</h3>
         <hr />
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Sprints</h2>
            {isManagerOrAdmin && (
              <button 
                onClick={() => setIsCreatingSprint(!isCreatingSprint)}
                style={{ background: "#28a745", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" }}
              >
                {isCreatingSprint ? "Cancelar" : "+ Crear Sprint"}
              </button>
            )}
         </div>

         {isCreatingSprint && isManagerOrAdmin && (
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

      {showAssignModal && isManagerOrAdmin && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "400px", maxWidth: "90%", maxHeight: "80vh", overflowY: "auto" }}>
             <h3>Asignar Usuario al Proyecto</h3>
             <input 
               type="text" 
               placeholder="Buscar por nombre o email..." 
               value={searchUser} 
               onChange={e => setSearchUser(e.target.value)}
               style={{ width: "100%", padding: "8px", marginBottom: "15px", boxSizing: "border-box" }}
             />
             <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
               {usersList.filter(u => u.email.toLowerCase().includes(searchUser.toLowerCase()) || u.name.toLowerCase().includes(searchUser.toLowerCase())).map(u => (
                  <li key={u.id} style={{ padding: "10px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <div>
                       <strong>{u.name}</strong> <br/> <small>{u.email}</small> <br/> <small style={{color: "gray"}}>{u.role}</small>
                     </div>
                     <button onClick={() => handleAssignUser(u.email)} style={{ background: "#28a745", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}>Elegir</button>
                  </li>
               ))}
               {usersList.length === 0 && <p>Cargando usuarios...</p>}
             </ul>
             <button onClick={() => setShowAssignModal(false)} style={{ marginTop: "15px", width: "100%", background: "#ccc", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer" }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}
