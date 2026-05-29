from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Crear base de datos SQLite
DATABASE_URL = "sqlite:///./asistente.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Modelo: Usuario
class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    contraseña = Column(String)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

# Modelo: Tarea
class Tarea(Base):
    __tablename__ = "tareas"
    
    id = Column(Integer, primary_key=True, index=True)
    email_usuario = Column(String, index=True)  # Email del usuario propietario
    titulo = Column(String)
    descripcion = Column(Text)
    area = Column(String)  # "Escuela", "Trabajo", "Vida Personal"
    prioridad = Column(String, default="media")  # "baja", "media", "alta"
    fecha_vencimiento = Column(DateTime, nullable=True)
    completada = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_recordatorio = Column(DateTime, nullable=True)  # Cuándo avisar

# Modelo: Historial de Chat
class HistorialChat(Base):
    __tablename__ = "historial_chat"
    
    id = Column(Integer, primary_key=True, index=True)
    email_usuario = Column(String, index=True)
    area = Column(String)
    pregunta = Column(Text)
    respuesta = Column(Text)
    fecha = Column(DateTime, default=datetime.utcnow)

# Crear las tablas
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()