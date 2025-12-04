# database.py
import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv   # <-- NUEVO

# 1. Cargar variables de entorno desde .env
load_dotenv()  # busca un archivo .env en la raíz del proyecto

# 2. Leer la variable de entorno o usar SQLite por defecto (solo en local)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///app.db")

# 3. Asegurar SSL obligatorio en Supabase
if DATABASE_URL.startswith("postgresql://") and "sslmode" not in DATABASE_URL:
    # si ya hay parámetros, usamos &; si no, usamos ?
    separator = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL += f"{separator}sslmode=require"

# 4. Crear motor de conexión
engine = create_engine(
    DATABASE_URL,
    echo=True  # Muestra logs de SQL en la consola
)

# 5. Dependencia para obtener la sesión
def get_session():
    with Session(engine) as session:
        yield session

# 6. Inicialización de tablas
def init_db():
    SQLModel.metadata.create_all(engine)
