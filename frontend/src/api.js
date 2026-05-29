// Este archivo configura cómo conectarse al servidor backend

const API_URL = "http://localhost:8000";

export const api = {
  // Autenticación
  registrar: async (nombre, email, password) => {
    const response = await fetch(
      `${API_URL}/registrar?nombre=${nombre}&email=${email}&password=${password}`,
      { method: "POST" }
    );
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(
      `${API_URL}/login?email=${email}&password=${password}`,
      { method: "POST" }
    );
    return response.json();
  },

  // Chat
  chat: async (email, mensaje, area) => {
    const response = await fetch(
      `${API_URL}/chat?email=${email}&mensaje=${encodeURIComponent(mensaje)}&area=${area}`,
      { method: "POST" }
    );
    return response.json();
  },

  // Tareas
  crearTarea: async (email, titulo, descripcion, area, prioridad) => {
    const response = await fetch(
      `${API_URL}/crear-tarea?email=${email}&titulo=${encodeURIComponent(titulo)}&descripcion=${encodeURIComponent(descripcion)}&area=${area}&prioridad=${prioridad}`,
      { method: "POST" }
    );
    return response.json();
  },

  obtenerTareas: async (email, area = null) => {
    let url = `${API_URL}/tareas/${email}`;
    if (area) url += `?area=${area}`;
    const response = await fetch(url);
    return response.json();
  },

  marcarCompletada: async (email, tareaId) => {
    const response = await fetch(
      `${API_URL}/tarea/${tareaId}/completar?email=${email}`,
      { method: "PUT" }
    );
    return response.json();
  },

  eliminarTarea: async (email, tareaId) => {
    const response = await fetch(
      `${API_URL}/tarea/${tareaId}?email=${email}`,
      { method: "DELETE" }
    );
    return response.json();
  }
};