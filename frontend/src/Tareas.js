import React, { useState, useEffect } from 'react';
import { api } from './api';
import './Tareas.css';

const Tareas = ({ email }) => {
  const [area, setArea] = useState('Escuela');
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState({ titulo: '', descripcion: '', prioridad: 'Media', fecha_vencimiento: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarTareas();
  }, [area]);

  const cargarTareas = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks(email, area);
      setTareas(data);
    } catch (err) {
      console.error("Error al cargar tareas", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevaTarea.titulo) return;
    try {
      await api.createTask(email, area, nuevaTarea);
      setNuevaTarea({ titulo: '', descripcion: '', prioridad: 'Media', fecha_vencimiento: '' });
      cargarTareas();
    } catch (err) {
      alert("Error al crear la tarea");
    }
  };

  const toggleCompletada = async (tarea) => {
    try {
      await api.updateTask(email, tarea.id, { completada: !tarea.completada });
      cargarTareas();
    } catch (err) {
      alert("Error al actualizar");
    }
  };

  const eliminarTarea = async (id) => {
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    try {
      await api.deleteTask(email, id);
      cargarTareas();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  return (
    <div className="tareas-container">
      <div className="tabs">
        {['Escuela', 'Trabajo', 'Vida Personal'].map(a => (
          <button key={a} className={area === a ? 'active' : ''} onClick={() => setArea(a)}>{a}</button>
        ))}
      </div>

      <form className="tarea-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Título de la tarea..." 
          value={nuevaTarea.titulo} 
          onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
          required
        />
        <textarea 
          placeholder="Descripción..." 
          value={nuevaTarea.descripcion}
          onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
        />
        <div className="form-row">
          <select 
            value={nuevaTarea.prioridad}
            onChange={(e) => setNuevaTarea({...nuevaTarea, prioridad: e.target.value})}
          >
            <option>Baja</option>
            <option>Media</option>
            <option>Alta</option>
          </select>
          <input 
            type="date" 
            value={nuevaTarea.fecha_vencimiento}
            onChange={(e) => setNuevaTarea({...nuevaTarea, fecha_vencimiento: e.target.value})}
          />
          <button type="submit">Agregar</button>
        </div>
      </form>

      <div className="lista-tareas">
        {loading ? <p>Cargando tareas...</p> : tareas.length === 0 ? <p>No hay tareas en esta sección.</p> : (
          tareas.map(t => (
            <div key={t.id} className={`tarea-item ${t.completada ? 'done' : ''}`}>
              <div className="tarea-check">
                <input 
                  type="checkbox" 
                  checked={t.completada} 
                  onChange={() => toggleCompletada(t)} 
                />
              </div>
              <div className="tarea-content">
                <h3>{t.titulo}</h3>
                <p>{t.descripcion}</p>
                <div className="tarea-meta">
                  <span className={`prioridad ${t.prioridad.toLowerCase()}`}>{t.prioridad}</span>
                  {t.fecha_vencimiento && <span>📅 {t.fecha_vencimiento}</span>}
                </div>
              </div>
              <button className="delete-btn" onClick={() => eliminarTarea(t.id)}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tareas;