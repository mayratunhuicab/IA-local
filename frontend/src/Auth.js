import React, { useState } from 'react';
import { api } from './api';
import './Auth.css';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || (!isLogin && !formData.nombre)) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await api.login(formData.email, formData.password);
        // Asumimos que la respuesta contiene el nombre del usuario
      } else {
        response = await api.register(formData.nombre, formData.email, formData.password);
      }

      const userData = { email: formData.email, nombre: response.nombre || formData.nombre };
      localStorage.setItem('user', JSON.stringify(userData));
      onLoginSuccess(userData.email, userData.nombre);
    } catch (err) {
      setError(err.message || 'Error en la autenticación. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Bienvenida de nuevo' : 'Crear Cuenta'}</h2>
        <p className="auth-subtitle">Tu asistente personal con IA</p>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Tu nombre" />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-toggle">
          <span>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;