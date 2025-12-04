from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date


# 1. CATEGORÍA DE PRODUCTO
class CategoriaProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class CategoriaProductoCreate(CategoriaProductoBase):
    """Schema para crear categoría de producto"""
    pass


class CategoriaProductoRead(CategoriaProductoBase):
    id: int

    class Config:
        orm_mode = True


# 2. PAÍS
class PaisBase(BaseModel):
    nombre: str
    codigo_iso: str
    region: Optional[str] = None


class PaisCreate(PaisBase):
    """Schema para crear país"""
    pass


class PaisRead(PaisBase):
    id: int

    class Config:
        orm_mode = True


# 3. CLIENTE
class ClienteBase(BaseModel):
    nombre: str
    tipo: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    pais_id: Optional[int] = None


class ClienteCreate(ClienteBase):
    pass


class ClienteRead(ClienteBase):
    id: int

    class Config:
        orm_mode = True


# 4. PROVEEDOR
class ProveedorBase(BaseModel):
    nombre: str
    tipo: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    pais_id: Optional[int] = None


class ProveedorCreate(ProveedorBase):
    pass


class ProveedorRead(ProveedorBase):
    id: int

    class Config:
        orm_mode = True


# 5. PUERTO
class PuertoBase(BaseModel):
    nombre: str
    tipo: Optional[str] = None
    pais_id: int


class PuertoCreate(PuertoBase):
    pass


class PuertoRead(PuertoBase):
    id: int

    class Config:
        orm_mode = True


# 6. MEDIO TRANSPORTE
class MedioTransporteBase(BaseModel):
    tipo: str
    empresa: Optional[str] = None


class MedioTransporteCreate(MedioTransporteBase):
    pass


class MedioTransporteRead(MedioTransporteBase):
    id: int

    class Config:
        orm_mode = True


# 7. PRODUCTO
class ProductoBase(BaseModel):
    nombre: str
    tipo: str
    unidad_medida: str = "kg"
    precio_referencia: float = Field(
        gt=0, description="Precio unitario de referencia, debe ser > 0"
    )
    stock_disponible: float = Field(
        ge=0, description="Stock disponible, no puede ser negativo"
    )
    categoria_id: Optional[int] = None


class ProductoCreate(ProductoBase):
    pass


class ProductoRead(ProductoBase):
    id: int

    class Config:
        orm_mode = True


# 8. OPERACIÓN
class OperacionBase(BaseModel):
    tipo: Literal["importacion", "exportacion"] = Field(
        description="Debe ser 'importacion' o 'exportacion'"
    )
    fecha: date
    estado: str = "pendiente"
    costo_total: Optional[float] = None
    observaciones: Optional[str] = None

    cliente_id: Optional[int] = None
    proveedor_id: Optional[int] = None

    pais_origen_id: Optional[int] = None
    pais_destino_id: Optional[int] = None

    puerto_origen_id: Optional[int] = None
    puerto_destino_id: Optional[int] = None

    medio_transporte_id: Optional[int] = None


class OperacionCreate(OperacionBase):
    pass


class OperacionRead(OperacionBase):
    id: int

    class Config:
        orm_mode = True


# 9. DETALLE OPERACIÓN
class DetalleOperacionBase(BaseModel):
    producto_id: int
    operacion_id: int
    cantidad: float = Field(gt=0, description="Cantidad debe ser > 0")
    precio_unitario: float = Field(gt=0, description="Precio unitario debe ser > 0")


class DetalleOperacionCreate(DetalleOperacionBase):
    pass


class DetalleOperacionRead(DetalleOperacionBase):
    id: int

    class Config:
        orm_mode = True


# 10. INSPECCIÓN CALIDAD
class InspeccionCalidadBase(BaseModel):
    fecha: date
    resultado: str
    observaciones: Optional[str] = None
    operacion_id: int
    producto_id: Optional[int] = None


class InspeccionCalidadCreate(InspeccionCalidadBase):
    pass


class InspeccionCalidadRead(InspeccionCalidadBase):
    id: int

    class Config:
        orm_mode = True
