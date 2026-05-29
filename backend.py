from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import ollama
from database import engine, Base, get_db, Usuario, Tarea, HistorialChat

# Crear las tablas
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Permitir conexiones desde cualquier lugar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== AUTENTICACIÓN ====================

@app.post("/registrar")
def registrar(nombre: str, email: str, password: str, db: Session = Depends(get_db)):
    """Registrar un nuevo usuario"""
    
    # Verificar si el usuario ya existe
    usuario_existente = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    # Crear nuevo usuario
    nuevo_usuario = Usuario(
        nombre=nombre,
        email=email,
        contraseña=password  # En producción, encriptar esto
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return {"mensaje": f"¡Bienvenido {nombre}!", "email": email}

@app.post("/login")
def login(email: str, contraseña: str, db: Session = Depends(get_db)):
    """Login de usuario"""
    
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    
    if usuario.contraseña != contraseña:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    
    return {"mensaje": "¡Login exitoso!", "nombre": usuario.nombre, "email": email}

# ==================== CHAT CON IA ====================

@app.post("/chat")
def chat(email: str, mensaje: str, area: str, db: Session = Depends(get_db)):
    """Chat con el asistente IA"""
    
    # Verificar que el usuario existe
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")
    
    try:
        # Llamar a Ollama
        respuesta = ollama.generate(
            model="mistral",
            prompt=f"""Eres un asistente personal inteligente que ayuda a organizar tareas en tres áreas:
            - Escuela (tareas académicas, estudios, exámenes)
            - Trabajo (proyectos, reuniones, informes)
            - Vida Personal (salud, familia, hobbies, amigos)

Área actual: {area}

Instrucciones:
1. Si el usuario menciona una tarea específica, responde de forma clara y breve
2. Si quiere crear una tarea, responde: "TAREA_CREADA: [título]"
3. Siempre responde en español
4. Sé amable y empático

Mensaje del usuario: {mensaje}

Responde:""",
            stream=False
        )
        
        texto_respuesta = respuesta['response'].strip()
        
        # Guardar en historial
        historial = HistorialChat(
            email_usuario=email,
            area=area,
            pregunta=mensaje,
            respuesta=texto_respuesta
        )
        
        db.add(historial)
        db.commit()
        
        return {"respuesta": texto_respuesta}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ==================== GESTIÓN DE TAREAS ====================

@app.post("/crear-tarea")
def crear_tarea(
    email: str,
    titulo: str,
    descripcion: str,
    area: str,
    prioridad: str = "media",
    fecha_vencimiento: str = None,
    db: Session = Depends(get_db)
):
    """Crear una nueva tarea"""
    
    # Verificar usuario
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")
    
    # Convertir fecha si se proporciona
    fecha_venc = None
    if fecha_vencimiento:
        try:
            fecha_venc = datetime.fromisoformat(fecha_vencimiento)
        except:
            fecha_venc = None
    
    # Crear tarea
    nueva_tarea = Tarea(
        email_usuario=email,
        titulo=titulo,
        descripcion=descripcion,
        area=area,
        prioridad=prioridad,
        fecha_vencimiento=fecha_venc,
        fecha_recordatorio=fecha_venc - timedelta(hours=1) if fecha_venc else None  # Recordar 1 hora antes
    )
    
    db.add(nueva_tarea)
    db.commit()
    db.refresh(nueva_tarea)
    
    return {"mensaje": "Tarea creada", "id": nueva_tarea.id, "titulo": titulo}

@app.get("/tareas/{email}")
def obtener_tareas(email: str, area: str = None, db: Session = Depends(get_db)):
    """Obtener tareas del usuario"""
    
    # Verificar usuario
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    
    # Obtener tareas
    query = db.query(Tarea).filter(Tarea.email_usuario == email)
    
    if area:
        query = query.filter(Tarea.area == area)
    
    tareas = query.all()
    
    return {
        "tareas": [
            {
                "id": t.id,
                "titulo": t.titulo,
                "descripcion": t.descripcion,
                "area": t.area,
                "prioridad": t.prioridad,
                "fecha_vencimiento": t.fecha_vencimiento.isoformat() if t.fecha_vencimiento else None,
                "completada": t.completada,
                "fecha_creacion": t.fecha_creacion.isoformat()
            }
            for t in tareas
        ]
    }

@app.put("/tarea/{tarea_id}/completar")
def marcar_completada(tarea_id: int, email: str, db: Session = Depends(get_db)):
    """Marcar una tarea como completada"""
    
    tarea = db.query(Tarea).filter(
        Tarea.id == tarea_id,
        Tarea.email_usuario == email
    ).first()
    
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    tarea.completada = True
    db.commit()
    
    return {"mensaje": "Tarea completada"}

@app.delete("/tarea/{tarea_id}")
def eliminar_tarea(tarea_id: int, email: str, db: Session = Depends(get_db)):
    """Eliminar una tarea"""
    
    tarea = db.query(Tarea).filter(
        Tarea.id == tarea_id,
        Tarea.email_usuario == email
    ).first()
    
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    db.delete(tarea)
    db.commit()
    
    return {"mensaje": "Tarea eliminada"}

# ==================== UTILIDADES ====================

@app.get("/")
def inicio():
    return {"mensaje": "¡Servidor funcionando! Bienvenido a tu asistente personal"}

@app.get("/health")
def health():
    return {"status": "ok"}