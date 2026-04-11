# ScrumsWeb - MVP (Primera Versión)

Este repositorio contiene la primera versión funcional (MVP) de ScrumsWeb, un sistema para la gestión de proyectos ágiles con Kanban. Dado que este es un primer avance, nos hemos centrado en asegurar las funcionalidades básicas definidas en nuestro documento de "descripción" para tener un ciclo de trabajo funcional.

## Estado Actual (Versión 1)

Actualmente las operativas y reglas de negocio funcionan de la siguiente manera:
- **Administrador (Admin):** Puede crear Proyectos, Sprints y Tareas directamente.
- **Usuario Normal (Developer):** Al entrar a cualquier proyecto, puede crear Sprints y generar nuevas Tareas.
- **Trabajo colaborativo:** Ambos roles tienen los permisos necesarios para trabajar sobre las tareas (avanzarlas en el flujo del Kanban, registrar horas y quitar horas si es necesario).

---

## Misión de la Segunda Versión (v2)

Para nuestra próxima entrega, los permisos, flujos y calidad del producto se escalarán para cumplir con las siguientes reglas restrictivas:

- **Admin:** Tendrá control global y podrá gestionar todo.
- **Manager:** Podrá crear proyectos, asignar usuarios al proyecto, crear sprints y tareas. Además, será capaz de **asignar tareas a un usuario específico** (buscándolo/asignándolo mediante su correo o nombre).
- **Usuario:** La visualización quedará restringida. Solo podrá ver los proyectos en los cuales participe (esté asignado) y los sprints dentro de ellos. Asimismo, **únicamente** podrá modificar las horas (tiempo usado) y el estado de las tareas que se encuentren asignadas a él.

**Nota técnica y de diseño:**  
Obviamente, dejaremos para después las mejoras visuales exhaustivas. Aunque los sistemas montados ya superan lo mínimo que un MVP estándar solicita, con el tiempo que tuvimos optamos por priorizar el avance estricto de las funciones operativas que redactamos en la "descripción" del producto, consolidando completamente el backend y los cimientos del cliente.
