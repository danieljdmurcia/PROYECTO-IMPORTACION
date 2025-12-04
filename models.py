from typing import Optional, List
from datetime import date
from sqlmodel import SQLModel, Field, Relationship


# 1. CATEGORÍA DE PRODUCTO
class CategoriaProducto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: Optional[str] = None

    productos: List["Producto"] = Relationship(back_populates="categoria")


# 2. PAÍS
class Pais(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    codigo_iso: str

    clientes: List["Cliente"] = Relationship(back_populates="pais")
    proveedores: List["Proveedor"] = Relationship(back_populates="pais")
    puertos: List["Puerto"] = Relationship(back_populates="pais")


# 3. CLIENTE
class Cliente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    tipo: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None

    pais_id: Optional[int] = Field(default=None, foreign_key="pais.id")
    pais: Optional[Pais] = Relationship(back_populates="clientes")

    operaciones: List["Operacion"] = Relationship(back_populates="cliente")


# 4. PROVEEDOR
class Proveedor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    tipo: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None

    pais_id: Optional[int] = Field(default=None, foreign_key="pais.id")
    pais: Optional[Pais] = Relationship(back_populates="proveedores")

    operaciones: List["Operacion"] = Relationship(back_populates="proveedor")


# 5. PUERTO / TERMINAL
class Puerto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    tipo: Optional[str] = None

    pais_id: int = Field(foreign_key="pais.id")
    pais: Pais = Relationship(back_populates="puertos")

    operaciones_origen: List["Operacion"] = Relationship(
        back_populates="puerto_origen",
        sa_relationship_kwargs={"foreign_keys": "[Operacion.puerto_origen_id]"},
    )
    operaciones_destino: List["Operacion"] = Relationship(
        back_populates="puerto_destino",
        sa_relationship_kwargs={"foreign_keys": "[Operacion.puerto_destino_id]"},
    )


# 6. MEDIO DE TRANSPORTE
class MedioTransporte(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tipo: str
    empresa: Optional[str] = None

    operaciones: List["Operacion"] = Relationship(back_populates="medio_transporte")


# 7. PRODUCTO
class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    tipo: str                       # fruta / verdura
    unidad_medida: str = "kg"
    precio_referencia: float
    stock_disponible: float = 0

    categoria_id: Optional[int] = Field(default=None, foreign_key="categoriaproducto.id")
    categoria: Optional[CategoriaProducto] = Relationship(back_populates="productos")

    detalles: List["DetalleOperacion"] = Relationship(back_populates="producto")


# 8. OPERACIÓN
class Operacion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tipo: str                        # importacion / exportacion
    fecha: date = Field(default_factory=date.today)
    estado: str = "pendiente"
    costo_total: Optional[float] = None
    observaciones: Optional[str] = None

    cliente_id: Optional[int] = Field(default=None, foreign_key="cliente.id")
    cliente: Optional[Cliente] = Relationship(back_populates="operaciones")

    proveedor_id: Optional[int] = Field(default=None, foreign_key="proveedor.id")
    proveedor: Optional[Proveedor] = Relationship(back_populates="operaciones")

    pais_origen_id: Optional[int] = Field(default=None, foreign_key="pais.id")
    pais_destino_id: Optional[int] = Field(default=None, foreign_key="pais.id")

    puerto_origen_id: Optional[int] = Field(default=None, foreign_key="puerto.id")
    puerto_destino_id: Optional[int] = Field(default=None, foreign_key="puerto.id")

    medio_transporte_id: Optional[int] = Field(default=None, foreign_key="mediotransporte.id")
    medio_transporte: Optional[MedioTransporte] = Relationship(back_populates="operaciones")

    detalles: List["DetalleOperacion"] = Relationship(back_populates="operacion")
    inspecciones: List["InspeccionCalidad"] = Relationship(back_populates="operacion")

    puerto_origen: Optional[Puerto] = Relationship(
        back_populates="operaciones_origen",
        sa_relationship_kwargs={"foreign_keys": "[Operacion.puerto_origen_id]"},
    )
    puerto_destino: Optional[Puerto] = Relationship(
        back_populates="operaciones_destino",
        sa_relationship_kwargs={"foreign_keys": "[Operacion.puerto_destino_id]"},
    )


# 9. DETALLE DE OPERACIÓN
class DetalleOperacion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int = Field(foreign_key="producto.id")
    operacion_id: int = Field(foreign_key="operacion.id")

    cantidad: float
    precio_unitario: float

    producto: Producto = Relationship(back_populates="detalles")
    operacion: Operacion = Relationship(back_populates="detalles")


# 10. INSPECCIÓN DE CALIDAD
class InspeccionCalidad(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    fecha: date = Field(default_factory=date.today)
    resultado: str
    observaciones: Optional[str] = None

    operacion_id: int = Field(foreign_key="operacion.id")
    operacion: Operacion = Relationship(back_populates="inspecciones")

    producto_id: Optional[int] = Field(default=None, foreign_key="producto.id")
    producto: Optional[Producto] = Relationship()
