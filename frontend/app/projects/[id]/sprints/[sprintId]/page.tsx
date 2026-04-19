"use client";

import { useAuth } from "../../../../../lib/useAuth";
import { useEffect, useState } from "react";
import { tasksApi, sprintsApi, usersApi } from "../../../../../lib/api";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function SprintDetails() {
  const { id, sprintId } = useParams() as { id: string, sprintId: string };
  const { user, loading } = useAuth();
  const isManagerOrAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";
  const router = useRouter();

  const [sprint, setSprint] = useState<any>(null);
  const [tasks, setTasks] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "MEDIUM", estimate_hours: 0 });

  const [usersList, setUsersList] = useState<any[]>([]);
  const [showAssignModalForTask, setShowAssignModalForTask] = useState<string | null>(null);
  const [promptConfig, setPromptConfig] = useState<{isOpen: boolean, title: string, defaultValue: string, onConfirm: (val: string) => void} | null>(null);
  const [searchUser, setSearchUser] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    else if (user && sprintId) fetchTasksData();
  }, [user, loading, id, router]);

  const fetchTasksData = async () => {
    try {
        const [sprintRes, tasksRes] = await Promise.all([
           sprintsApi.getOne(sprintId),
           tasksApi.getBySprint ? tasksApi.getBySprint(sprintId) : tasksApi.getAll(sprintId)
        ]);
        setSprint(sprintRes.data);
        setTasks(tasksRes.data);
        
        usersApi.getAll().then(res => setUsersList(res.data)).catch(console.error);
    } catch (err) {
        console.error("Error al cargar tareas", err);
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksApi.create(sprintId, newTask);
      setIsCreatingTask(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", estimate_hours: 0 });
      fetchTasksData();
    } catch (err) {
      alert("Error creando tarea.");
    }
  }

  
  const handleAssignTask = async (taskId: string, email: string) => {
    try {
      await tasksApi.assignEmail(taskId, email);
      alert("Usuario asignado exitosamente.");
      setShowAssignModalForTask(null);
      fetchTasksData();
    } catch (err: any) {
       if (err.response?.status === 404) alert("Usuario o tarea no encontrados.");
       else if (err.response?.status === 403) alert("Permisos insuficientes.");
       else alert("Error al asignar usuario.");
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string, assigneeId: number) => {
    if (!isManagerOrAdmin && assigneeId !== user?.id) {
       alert("No puedes mover una tarea que no tienes asignada.");
       return;
    }
     try {
       await tasksApi.update(taskId, { status: newStatus });
       fetchTasksData();
     } catch (err) {
        alert("Error actualizando tarea");
     }
  }

  if (loading || !sprint) return <div style={{ padding: "50px" }}>Cargando sprint...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        <div>
           <button onClick={() => router.push(`/projects/${id}`)} style={{ marginRight: "15px", cursor: "pointer" }}>← Volver</button>
           <h1 style={{ display: "inline-block" }}>Sprint: {sprint.name}</h1>
        </div>
      </header>

      <main style={{ marginTop: "20px" }}>
         <h3>Lista de Tareas</h3>
         {isManagerOrAdmin && (<button 
           onClick={() => setIsCreatingTask(!isCreatingTask)}
           style={{ background: "#0070f3", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", marginBottom: "15px" }}
         >
           {isCreatingTask ? "Cancelar" : "+ Crear Tarea"}
         </button>)}

         {isCreatingTask && isManagerOrAdmin && (
             <form onSubmit={handleCreateTask} style={{ background: "#f5f5f5", padding: "15px", borderRadius: "8px", margin: "15px 0", display: "grid", gap: "10px", gridTemplateColumns: "1fr 1fr" }}>
                <input type="text" placeholder="Título" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} style={{ padding: "8px"}} />
                <input type="text" placeholder="Descripción" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={{ padding: "8px"}} />
                <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} style={{ padding: "8px"}} >
                   <option value="LOW">Baja</option>
                   <option value="MEDIUM">Media</option>
                   <option value="HIGH">Alta</option>
                   <option value="CRITICAL">Crítica</option>
                </select>
                <input type="number" placeholder="Horas estimadas" min={0} value={newTask.estimate_hours} onChange={e => setNewTask({...newTask, estimate_hours: parseFloat(e.target.value) || 0})} style={{ padding: "8px"}} title="Horas"/>
                <button type="submit" style={{ gridColumn: "span 2", background: "green", color: "white", border: "none", padding: "10px", cursor: "pointer" }}>Guardar Tarea</button>
             </form>
         )}

         <div style={{ display: "flex", gap: "20px" }}>
            {["TODO", "IN_PROGRESS", "DONE"].map(statusGroup => (
               <div key={statusGroup} style={{ flex: 1, backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "8px" }}>
                  <h4>{statusGroup.replace("_", " ")}</h4>
                  {tasks.filter((t: any) => t.status === statusGroup).map((task: any) => (
                     <div key={task.id} style={{ background: "white", padding: "15px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ddd", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                        <b style={{display:"block", marginBottom:"5px"}}>{task.title}</b>
                        <p style={{margin:"0 0 10px 0", fontSize:"13px", color:"#555"}}>{task.description}</p>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", fontSize: "12px", background: "#f1f1f1", padding: "8px", borderRadius: "5px", marginBottom: "10px" }}>
                          <div style={{ gridColumn: "span 2", marginBottom: "5px", paddingBottom: "5px", borderBottom: "1px solid #ccc" }}>
                              <b>Asignado a:</b> {task.assignee_id ? (usersList.find(u => u.id === task.assignee_id)?.name || `Usuario ID: #${task.assignee_id}`) : "Nadie"}
                              {isManagerOrAdmin && (
                                <button onClick={() => setShowAssignModalForTask(task.id)} style={{ marginLeft: "10px", fontSize:"11px", padding: "2px 5px", cursor: "pointer" }}>Reasignar</button>
                              )}
                          </div>
                          <div><b>Prioridad:</b> {task.priority}</div>
                          <div><b>Estimado:</b> {task.estimate_hours || 0}h</div>
                          <div><b>Usado:</b> {task.spent_hours || 0}h</div>
                        </div>

                        <div style={{ display: "flex", gap: "auto", justifyContent: "space-between", marginTop: "10px" }}>
                           {statusGroup !== "DONE" && (
                              <div style={{ display: "flex", gap: "5px" }}>
                                <button 
                                  onClick={() => {
                                    if (!isManagerOrAdmin && task.assignee_id !== user?.id) {
                                       alert("No puedes agregar horas a una tarea donde no estás asignado.");
                                       return;
                                    }
                                    setPromptConfig({
                                      isOpen: true,
                                      title: "¿Cuántas horas adicionales usaste en esta tarea?",
                                      defaultValue: "1",
                                      onConfirm: (hours) => {
                                        if (hours) {
                                          const parsed = parseFloat(hours);
                                          if (!isNaN(parsed)) {
                                            tasksApi.update(task.id, { spent_hours: Math.max(0, (task.spent_hours || 0) + parsed) })
                                              .then(fetchTasksData)
                                              .catch(console.error);
                                          }
                                        }
                                      }
                                    });
                                  }} 
                                  style={{ background: "rgba(0,113,227,0.1)", color: "#0071e3", border: "none", padding: "5px 10px", borderRadius: "12px", cursor: "pointer", fontSize:"12px", fontWeight:500 }}
                                >
                                  + Horas
                                </button>
                                <button 
                                  onClick={() => {
                                    if (!isManagerOrAdmin && task.assignee_id !== user?.id) {
                                       alert("No puedes restar horas a una tarea donde no estás asignado.");
                                       return;
                                    }
                                    setPromptConfig({
                                      isOpen: true,
                                      title: "¿Cuántas horas deseas restar de esta tarea?",
                                      defaultValue: "1",
                                      onConfirm: (hours) => {
                                        if (hours) {
                                          const parsed = parseFloat(hours);
                                          if (!isNaN(parsed)) {
                                            tasksApi.update(task.id, { spent_hours: Math.max(0, (task.spent_hours || 0) - parsed) })
                                              .then(fetchTasksData)
                                              .catch(console.error);
                                          }
                                        }
                                      }
                                    });
                                  }} 
                                  style={{ background: "rgba(255,59,48,0.1)", color: "#ff3b30", border: "none", padding: "5px 10px", borderRadius: "12px", cursor: "pointer", fontSize:"12px", fontWeight:500 }}
                                >
                                  - Horas
                                </button>
                              </div>
                           )}

                           <div style={{ marginLeft: "auto" }}>
                              {statusGroup === "TODO" && <button onClick={() => updateTaskStatus(task.id, "IN_PROGRESS", task.assignee_id)} style={{ fontSize:"12px" }}>En Progreso →</button>}
                              {statusGroup === "IN_PROGRESS" && (
                                 <>
                                   <button onClick={() => updateTaskStatus(task.id, "TODO", task.assignee_id)} style={{ fontSize:"12px" }}>← TODO</button>
                                   <button onClick={() => updateTaskStatus(task.id, "DONE", task.assignee_id)} style={{ marginLeft: "5px", fontSize:"12px" }}>Terminar →</button>
                                 </>
                              )}
                              {statusGroup === "DONE" && <button onClick={() => updateTaskStatus(task.id, "IN_PROGRESS", task.assignee_id)} style={{ fontSize:"12px" }}>← En Progreso</button>}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            ))}
         </div>
      </main>

      {showAssignModalForTask && isManagerOrAdmin && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "400px", maxWidth: "90%", maxHeight: "80vh", overflowY: "auto" }}>
             <h3>Asignar Tarea:</h3>
             <input 
               type="text" 
               placeholder="Buscar por nombre o correo..." 
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
                     <button onClick={() => handleAssignTask(showAssignModalForTask, u.email)} style={{ background: "#28a745", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}>Elegir</button>
                  </li>
               ))}
               {usersList.length === 0 && <p>Cargando usuarios...</p>}
             </ul>
             <button onClick={() => setShowAssignModalForTask(null)} style={{ marginTop: "15px", width: "100%", background: "#ccc", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      {promptConfig?.isOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.4)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000}}>
          <div style={{ background: "rgba(255,255,255,0.85)", padding: "24px", borderRadius: "24px", width: "360px", maxWidth: "90%", boxShadow: "0 25px 50px rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.6)", textAlign: "center" }}>
             <p style={{ margin: "0 0 20px 0", fontWeight: 600, fontSize: "16px", color: "#1d1d1f" }}>
               {promptConfig.title}
             </p>
             <input 
               type="text" 
               id="custom-prompt-input"
               defaultValue={promptConfig.defaultValue}
               autoFocus
               style={{ width: "100%", padding: "12px", marginBottom: "20px", boxSizing: "border-box", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", outline: "none", fontSize: "15px", transition: "all 0.3s ease" }}
               onFocus={(e) => { e.target.style.boxShadow = "0 0 0 4px rgba(0,113,227,0.2)"; e.target.style.borderColor = "#0071e3"; }}
               onBlur={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = "rgba(0,0,0,0.1)"; }}
               onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                     const val = (e.target as HTMLInputElement).value;
                     promptConfig.onConfirm(val);
                     setPromptConfig(null);
                  }
               }}
             />
             <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
               <button 
                 onClick={() => setPromptConfig(null)} 
                 style={{ flex: 1, padding: "10px 0", background: "none", color: "#0071e3", border: "1px solid rgba(0,113,227,0.3)", borderRadius: "20px", cursor: "pointer", fontSize: "15px", fontWeight: 500, transition: "all 0.2s" }}
                 onMouseOver={(e) => e.currentTarget.style.background = "rgba(0,113,227,0.1)"}
                 onMouseOut={(e) => e.currentTarget.style.background = "none"}
               >
                 Cancelar
               </button>
               <button 
                 onClick={() => {
                   const val = (document.getElementById("custom-prompt-input") as HTMLInputElement).value;
                   promptConfig.onConfirm(val);
                   setPromptConfig(null);
                 }} 
                 style={{ flex: 1, padding: "10px 0", background: "#0071e3", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "15px", fontWeight: 500, transition: "all 0.2s" }}
                 onMouseOver={(e) => e.currentTarget.style.transform = "scale(0.96)"}
                 onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
               >
                 Aceptar
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
