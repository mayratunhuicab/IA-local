import React, { useState, useEffect, useRef } from 'react';
import { api } from './api';
import './Chat.css';

const Chat = ({ email }) => {
  const [area, setArea] = useState('Vida Personal');
  const [mensaje, setMensaje] = useState('');
  const [historial, setHistorial] = useState([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [historial, escribiendo]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const nuevoMensajeUsuario = { sender: 'user', text: mensaje };
    setHistorial([...historial, nuevoMensajeUsuario]);
    setMensaje('');
    setEscribiendo(true);

    try {
      const data = await api.sendMessage(email, area, mensaje);
      setHistorial(prev => [...prev, { sender: 'ai', text: data.respuesta }]);
    } catch (err) {
      setHistorial(prev => [...prev, { sender: 'ai', text: 'Lo siento, tuve un problema al procesar tu solicitud.' }]);
    } finally {
      setEscribiendo(false);
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="area-selector">
        {['Escuela', 'Trabajo', 'Vida Personal'].map(a => (
          <button 
            key={a} 
            className={area === a ? 'active' : ''} 
            onClick={() => setArea(a)}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="chat-box">
        <div className="messages-list">
          {historial.length === 0 && (
            <div className="empty-chat">¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy con tu {area}?</div>
          )}
          {historial.map((m, index) => (
            <div key={index} className={`message-bubble ${m.sender}`}>
              {m.text}
            </div>
          ))}
          {escribiendo && (
            <div className="message-bubble ai typing">
              <span>.</span><span>.</span><span>.</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={enviarMensaje}>
          <input
            type="text"
            placeholder={`Escribe un mensaje para ${area}...`}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />
          <button type="submit" disabled={!mensaje.trim()}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;