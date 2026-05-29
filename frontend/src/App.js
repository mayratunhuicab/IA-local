import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import Chat from './Chat';
import Tareas from './Tareas';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [vistaActual, setVistaActual] = useState('chat'); // 'chat' o 'tareas'

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (email, nombre) => {
    setUser({ email, nombre });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-main">
      <nav className="navbar">
        <div className="nav-brand">🤖 Asistente IA</div>
        <div className="nav-menu">
          <button 
            className={vistaActual === 'chat' ? 'active' : ''} 
            onClick={() => setVistaActual('chat')}
          >
            Chat
          </button>
          <button 
            className={vistaActual === 'tareas' ? 'active' : ''} 
            onClick={() => setVistaActual('tareas')}
          >
            Tareas
          </button>
        </div>
        <div className="nav-user">
          <span>Hola, <strong>{user.nombre}</strong></span>
          <button onClick={handleLogout} className="logout-btn">Salir</button>
        </div>
      </nav>

      <main className="content">
        {vistaActual === 'chat' ? (
          <Chat email={user.email} />
        ) : (
          <Tareas email={user.email} />
        )}
      </main>
    </div>
  );
}

export default App;
