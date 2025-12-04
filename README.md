.# Sistema de Gestión de Importación y Exportación de Frutas y Verduras 

Proyecto desarrollado como entrega de **Desarrollo de Software**.  
Permite gestionar todo el ciclo de una operación de comercio internacional de frutas y verduras:

- Catálogo de productos y categorías  
- Gestión de clientes y proveedores  
- Países, puertos y medios de transporte  
- Operaciones de **importación** y **exportación**  
- Detalles de las operaciones (productos, cantidades, precios)  
- Inspecciones de calidad  
- Reportes de negocio

---

##  Tecnologías utilizadas

**Backend**

- Python 3.11
- FastAPI
- SQLModel + SQLAlchemy
- Pydantic v2
- PostgreSQL en la nube (Supabase)
- Uvicorn

**Frontend**

- HTML5
- CSS3 (diseño responsive)
- JavaScript (fetch API para consumir el backend)
- Múltiples vistas: `index.html`, `productos.html`, `clientes.html`, etc.

---

##  Estructura del proyecto

```txt
proyecto_agro_full/
├─ proyecto_agro/
│  ├─ main.py                 # Punto de entrada de la API FastAPI
│  ├─ models.py               # Modelos de base de datos (SQLModel)
│  ├─ schemas.py              # Esquemas Pydantic para entrada/salida
│  ├─ database.py             # Conexión a la BD (SQLite o Supabase)
│  └─ routers/                # Ruters de cada módulo (CRUD + lógica)
│      ├─ categorias_producto.py
│      ├─ clientes.py
│      ├─ proveedores.py
│      ├─ paises.py
│      ├─ puertos.py
│      ├─ medios_transporte.py
│      ├─ operaciones.py
│      ├─ detalles_operacion.py
│      ├─ inspecciones_calidad.py
│      └─ reportes.py
│
├─ frontend_todos_modelos/
│  ├─ css/
│  │  └─ styles.css           # Estilos globales para todas las páginas
│  ├─ js/
│  │  ├─ common.js            # Configuración base (URL de la API, helpers)
│  │  ├─ productos.js
│  │  ├─ clientes.js
│  │  ├─ proveedores.js
│  │  ├─ paises.js
│  │  ├─ puertos.js
│  │  ├─ medios_transporte.js
│  │  ├─ operaciones.js
│  │  ├─ detalles.js
│  │  ├─ inspecciones.js
│  │  └─ reportes.js
│  ├─ index.html              # Panel principal
│  ├─ productos.html
│  ├─ clientes.html
│  ├─ proveedores.html
│  ├─ paises.html
│  ├─ puertos.html
│  ├─ medios_transporte.html
│  ├─ operaciones.html
│  ├─ detalles.html
│  ├─ inspecciones.html
│  └─ reportes.html
│
├─ requirements.txt
└─ README.md

# database.py
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///app.db")

DATABASE_URL=postgresql://postgres:TU_PASSWORD@dbxxxx.supabase.co:5432/postgres?sslmode=require

como ejecutar en local?

1.Clonar el repositorio:
git clone https://github.com/danieljdmurcia/PROYECTO-IMPORTACION.git
cd PROYECTO-IMPORTACION  # o proyecto_agro_full según el nombre

2.Crear y activar entorno virtual (Windows PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1

3.Instalar dependencias:
pip install -r requirements.txt

Iniciar el servidor FastAPI:
cd proyecto_agro
python -m uvicorn main:app --reload

La API quedará disponible en:

Documentación Swagger: http://127.0.0.1:8000/docs

Redoc: http://127.0.0.1:8000/redoc

Endpoint raíz: http://127.0.0.1:8000/


Proveedor: Render.com

Tipo de servicio: Web Service (Python / FastAPI)

Comando de arranque:

cd proyecto_agro && uvicorn main:app --host 0.0.0.0 --port 8000


Variables de entorno importantes:

DATABASE_URL → conexión a Supabase

(Opcional) PYTHON_VERSION si Render lo requiere

URL pública de la API:

https://proyecto-importacion-2.onrender.com/paises.html


#Endpoints principales (CRUD)

Cada entidad tiene su router y endpoints REST:

GET /productos/ – Listar productos

POST /productos/ – Crear producto

PUT /productos/{id} – Actualizar

DELETE /productos/{id} – Eliminar

Igual para:

/categorias-producto/

/clientes/

/proveedores/

/paises/

/puertos/

/medios-transporte/

/operaciones/

/detalles-operacion/

/inspecciones-calidad/

Endpoints de reportes

En el router reportes.py se incluyen ejemplos de reportes como:

Operaciones por país

Operaciones por mes

Productos más exportados/importados

Operaciones pendientes vs completadas

Estos endpoints están listos para ser consumidos desde reportes.html con reportes.js.

Nombre: Jaider Daniel Murcia Murcia 

Materia: Desarrollo de Software

Tecnologías: FastAPI · SQLModel · PostgreSQL · Supabase · HTML · CSS · JS.cd "
