"use client";

import { useAuth } from "../../../../../lib/useAuth";
import { useEffect, useState } from "react";
import { tasksApi, sprintsApi } from "../../../../../lib/api";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function SprintDetails() {
  const { id, sprintId } = useParams() as { id: string, sprintId: string };
  const { user, loading } = useAuth();
  const router = useRouter();

  const [sprint, setSprint] = useState<any>(null);
  const [tasks, setTasks] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "MEDIUM", estimate_hours: 0 });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    else if (user && sprintId) fetchTasksData();
  }, [user, loading, id, router]);

  const fetchTasksData = async () => {
    try {
        const [sprintRes, tasksRes] = await Promise.all([
           sprintsApi.getOne(sprintId),
           tasksApi.getAll(sprintId)
        ]);
        setSprint(sprintRes.data);
        setTasks(tasksRes.data);
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

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
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
         <button 
           onClick={() => setIsCreatingTask(!isCreatingTask)}
           style={{ background: "#0070f3", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", marginBottom: "15px" }}
         >
           {isCreatingTask ? "Cancelar" : "+ Crear Tarea"}
         </button>

         {isCreatingTask && (
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
                          <div><b>Prioridad:</b> {task.priority}</div>
                          <div><b>Estimado:</b> {task.estimate_hours || 0}h</div>
                          <div><b>Usado:</b> {task.spent_hours || 0}h</div>
                        </div>

                        <div style={{ display: "flex", gap: "auto", justifyContent: "space-between", marginTop: "10px" }}>
                           {statusGroup !== "DONE" && (
                              <div style={{ display: "flex", gap: "5px" }}>
                                <button 
                                  onClick={() => {
                                    const hours = prompt("¿Cuántas horas adicionales usaste en esta tarea?", "1");
                                    if (hours) {
                                      const parsed = parseFloat(hours);
                                      if (!isNaN(parsed)) {
                                        tasksApi.update(task.id, { spent_hours: Math.max(0, (task.spent_hours || 0) + parsed) })
                                          .then(fetchTasksData)
                                          .catch(console.error);
                                      }
                                    }
                                  }} 
                                  style={{ background: "#17a2b8", color: "white", border: "none", padding: "5px 8px", borderRadius: "3px", cursor: "pointer", fontSize:"12px" }}
                                >
                                  + Horas
                                </button>
                                <button 
                                  onClick={() => {
                                    const hours = prompt("¿Cuántas horas deseas restar de esta tarea?", "1");
                                    if (hours) {
                                      const parsed = parseFloat(hours);
                                      if (!isNaN(parsed)) {
                                        tasksApi.update(task.id, { spent_hours: Math.max(0, (task.spent_hours || 0) - parsed) })
                                          .then(fetchTasksData)
                                          .catch(console.error);
                                      }
                                    }
                                  }} 
                                  style={{ background: "#dc3545", color: "white", border: "none", padding: "5px 8px", borderRadius: "3px", cursor: "pointer", fontSize:"12px" }}
                                >
                                  - Horas
                                </button>
                              </div>
                           )}

                           <div style={{ marginLeft: "auto" }}>
                              {statusGroup === "TODO" && <button onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")} style={{ fontSize:"12px" }}>En Progreso →</button>}
                              {statusGroup === "IN_PROGRESS" && (
                                 <>
                                   <button onClick={() => updateTaskStatus(task.id, "TODO")} style={{ fontSize:"12px" }}>← TODO</button>
                                   <button onClick={() => updateTaskStatus(task.id, "DONE")} style={{ marginLeft: "5px", fontSize:"12px" }}>Terminar →</button>
                                 </>
                              )}
                              {statusGroup === "DONE" && <button onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")} style={{ fontSize:"12px" }}>← En Progreso</button>}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            ))}
         </div>
      </main>

    </div>
  )
}
