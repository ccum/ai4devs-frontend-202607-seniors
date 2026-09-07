### 1. Rutas en App.tsx

```
Necesito configurar react-router-dom (ya está en package.json) en frontend/src/App.tsx. Quiero dos rutas: "/positions" que renderice el componente Positions (frontend/src/components/Positions.tsx) y "/positions/:id" que por ahora renderice un placeholder (el componente Position lo crearemos en otro paso). Usa el patrón de React Router v6 (BrowserRouter, Routes, Route). No toques index.tsx salvo que sea estrictamente necesario. Muéstrame el diff antes de aplicarlo.
```

### 2. Conectar el botón "Ver proceso"
```
En frontend/src/components/Positions.tsx, el botón "Ver proceso" de cada tarjeta debe navegar a /positions/{id} usando useNavigate de react-router-dom. Añade un campo id de tipo number al tipo Position y a los datos mock existentes (usa 1, 2, 3 para que coincidan con las posiciones reales de la base de datos). No cambies el resto del diseño ni los filtros existentes.

```
### 3. Crear Position.tsx (esqueleto + fetch de datos)
```
Crea un nuevo componente frontend/src/components/Position.tsx para la vista detalle de una posición (kanban de candidatos). Debe:
- Leer el id de la URL con useParams
- Hacer fetch a GET http://localhost:3010/position/:id/interviewflow para obtener positionName y interviewFlow.interviewSteps (ordenados por orderIndex)
- Hacer fetch a GET http://localhost:3010/position/:id/candidates para obtener fullName, averageScore y currentInterviewStep de cada candidato
- Mostrar el positionName como título arriba y una flecha/botón para volver a /positions
- Pintar una columna por cada interviewStep, agrupando cada candidato en la columna cuyo name coincida con su currentInterviewStep (todavía SIN drag and drop)
- Usar react-bootstrap para mantener consistencia visual con Positions.tsx
- Manejar estados de loading y error básicos
Muéstrame el plan antes de escribir código, y no instales ninguna librería nueva en este paso.

```

### 4. Conectar Position.tsx real a la ruta
```
Reemplaza el placeholder de la ruta "/positions/:id" en App.tsx para que use el componente Position real que acabamos de crear en el paso anterior.
```

### 5. Drag and drop
```
Añade drag-and-drop al kanban de frontend/src/components/Position.tsx usando la librería @hello-pangea/dnd (instálala primero). Envuelve el tablero en DragDropContext, cada columna en Droppable y cada tarjeta de candidato en Draggable. En el onDragEnd:
- Actualiza el estado local para mover la tarjeta a la nueva columna de forma optimista
- Llama a PUT http://localhost:3010/candidates/:candidateId con el body que espera el backend (verifica el shape exacto revisando backend/src/presentation/controllers/candidateController.ts antes de asumirlo, no uses el shape del enunciado sin confirmar)
- Si el PUT falla, revierte el cambio visual y muestra un error
No cambies el fetch inicial de datos ni el diseño ya existente de las tarjetas.
```

### 6. Responsive (móvil)
```
Ajusta el layout del kanban en frontend/src/components/Position.tsx para que en viewport móvil (breakpoint sm de Bootstrap) las columnas se apilen verticalmente ocupando el 100% del ancho, y en desktop se muestren en fila. No introduzcas ninguna librería CSS nueva, usa las utilidades de react-bootstrap/Bootstrap que ya están en el proyecto.

```
### 7. (Opcional pero recomendado) Auditoría rápida
```
Revisa frontend/src/components/Position.tsx contra buenas prácticas de accesibilidad WCAG 2.2 AA: roles ARIA, navegación por teclado para el drag and drop, contraste de color y labels. Dame un informe con severidad y propuesta de fix para cada hallazgo, sin aplicar cambios todavía.
```