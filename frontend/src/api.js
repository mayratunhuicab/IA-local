// Este archivo configura cómo conectarse al servidor backend

const API_URL = "http://localhost:8000";

export const api = {
  // Autenticación
  register: async (nombre, email, password) => {
    const response = await fetch(
      `${API_URL}/registrar?nombre=${encodeURIComponent(nombre)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      { method: "POST" }
    );
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(
      `${API_URL}/login?email=${encodeURIComponent(email)}&contraseña=${encodeURIComponent(password)}`,
      { method: "POST" }
    );
    return response.json();
  },

  // Chat
  sendMessage: async (email, area, mensaje) => {
    const response = await fetch(
      `${API_URL}/chat?email=${encodeURIComponent(email)}&mensaje=${encodeURIComponent(mensaje)}&area=${encodeURIComponent(area)}`,
      { method: "POST" }
    );
    return response.json();
  },

  // Tareas
  createTask: async (email, area, taskData) => {
    const { titulo, descripcion, prioridad, fecha_vencimiento } = taskData;
    const response = await fetch(
      `${API_URL}/crear-tarea?email=${encodeURIComponent(email)}&titulo=${encodeURIComponent(titulo)}&descripcion=${encodeURIComponent(descripcion)}&area=${encodeURIComponent(area)}&prioridad=${encodeURIComponent(prioridad)}&fecha_vencimiento=${encodeURIComponent(fecha_vencimiento || '')}`,
      { method: "POST" }
    );
    return response.json();
  },

  getTasks: async (email, area = null) => {
    let url = `${API_URL}/tareas/${email}`;
    if (area) url += `?area=${area}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.tareas || [];
  },

  updateTask: async (email, tareaId) => {
    const response = await fetch(
      `${API_URL}/tarea/${tareaId}/completar?email=${encodeURIComponent(email)}`,
      { method: "PUT" }
    );
    return response.json();
  },

  deleteTask: async (email, tareaId) => {
    const response = await fetch(
      `${API_URL}/tarea/${tareaId}?email=${encodeURIComponent(email)}`,
      { method: "DELETE" }
    );
    return response.json();
  }
};