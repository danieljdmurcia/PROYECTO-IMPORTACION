from fastAPI import FastAPI
from database import init_db
from routers import (
    categorias_producto,
    paises,
    clientes,
    proveedores,
    puertos,
    medios_transporte,
    productos,
    operaciones,
    detalles_operacion,
    inspecciones_calidad,
    reportes,
)

app = FastAPI(
    title="Sistema de Gestión de Importación y Exportación de Frutas y Verduras",
    description="API para gestionar productos agrícolas y sus operaciones de comercio internacional.",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


# Routers CRUD
app.include_router(categorias_producto.router)
app.include_router(paises.router)
app.include_router(clientes.router)
app.include_router(proveedores.router)
app.include_router(puertos.router)
app.include_router(medios_transporte.router)
app.include_router(productos.router)
app.include_router(operaciones.router)
app.include_router(detalles_operacion.router)
app.include_router(inspecciones_calidad.router)

# Routers de reportes
app.include_router(reportes.router)


@app.get("/")
def root():
    return {
        "mensaje": "API de Gestión de Importación y Exportación de Frutas y Verduras",
        "docs": "/docs",
        "redoc": "/redoc",
    }
