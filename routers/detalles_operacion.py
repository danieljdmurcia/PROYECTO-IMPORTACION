from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import DetalleOperacion, Producto, Operacion
from schemas import DetalleOperacionCreate, DetalleOperacionRead

router = APIRouter(prefix="/detalles-operacion", tags=["detalles_operacion"])


# ----------------------------------------------------
#   FUNCIONES AUXILIARES: STOCK + COSTO TOTAL
# ----------------------------------------------------
def ajustar_stock_creacion(
    session: Session, operacion: Operacion, producto: Producto, cantidad: float
) -> None:
    if operacion.tipo == "exportacion":
        if cantidad > producto.stock_disponible:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"No se puede exportar {cantidad} {producto.unidad_medida} de "
                    f"{producto.nombre}. Stock disponible: {producto.stock_disponible}."
                ),
            )
        producto.stock_disponible -= cantidad

    elif operacion.tipo == "importacion":
        producto.stock_disponible += cantidad

    session.add(producto)


def ajustar_stock_actualizacion(
    session: Session,
    operacion: Operacion,
    producto: Producto,
    cantidad_anterior: float,
    cantidad_nueva: float,
) -> None:
    diferencia = cantidad_nueva - cantidad_anterior

    if operacion.tipo == "exportacion":
        # Si diferencia > 0, estamos exportando MÁS cantidad
        if diferencia > 0 and diferencia > producto.stock_disponible:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"No se puede aumentar la cantidad a {cantidad_nueva}. "
                    f"Stock disponible: {producto.stock_disponible}."
                ),
            )
        producto.stock_disponible -= diferencia

    elif operacion.tipo == "importacion":
        # Si diferencia > 0, entra más stock; si < 0, corregimos restando
        producto.stock_disponible += diferencia

    if producto.stock_disponible < 0:
        # Por seguridad, nunca debería pasar
        raise HTTPException(
            status_code=400,
            detail="El ajuste de stock dejaría el inventario en negativo.",
        )

    session.add(producto)


def ajustar_stock_eliminacion(
    session: Session, operacion: Operacion, producto: Producto, cantidad: float
) -> None:
    if operacion.tipo == "exportacion":
        # Si se elimina un detalle de exportación, devolvemos stock
        producto.stock_disponible += cantidad
    elif operacion.tipo == "importacion":
        # Si se elimina una importación, restamos ese stock
        producto.stock_disponible -= cantidad
        if producto.stock_disponible < 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    "No se puede eliminar el detalle: dejaría el stock del producto en negativo."
                ),
            )

    session.add(producto)


def recalcular_costo_total(session: Session, operacion_id: int) -> None:
    detalles = session.exec(
        select(DetalleOperacion).where(DetalleOperacion.operacion_id == operacion_id)
    ).all()

    total = sum(d.cantidad * d.precio_unitario for d in detalles)

    operacion = session.get(Operacion, operacion_id)
    if operacion:
        operacion.costo_total = float(total) if total else 0.0
        session.add(operacion)
        session.commit()
        session.refresh(operacion)


# ----------------------------------------------------
#   CRUD DE DETALLES DE OPERACIÓN
# ----------------------------------------------------
@router.post("/", response_model=DetalleOperacionRead)
def create_detalle(
    data: DetalleOperacionCreate, session: Session = Depends(get_session)
):
    operacion = session.get(Operacion, data.operacion_id)
    if not operacion:
        raise HTTPException(
            status_code=404, detail="La operación asociada no existe."
        )

    producto = session.get(Producto, data.producto_id)
    if not producto:
        raise HTTPException(
            status_code=404, detail="El producto asociado no existe."
        )

    # Ajustar stock según tipo (import/export)
    ajustar_stock_creacion(session, operacion, producto, data.cantidad)

    detalle = DetalleOperacion(
        producto_id=data.producto_id,
        operacion_id=data.operacion_id,
        cantidad=data.cantidad,
        precio_unitario=data.precio_unitario,
    )

    session.add(detalle)
    session.commit()
    session.refresh(detalle)

    # Recalcular costo total de la operación
    recalcular_costo_total(session, data.operacion_id)

    return detalle


@router.get("/", response_model=List[DetalleOperacionRead])
def list_detalles(session: Session = Depends(get_session)):
    return session.exec(select(DetalleOperacion)).all()


@router.get("/{detalle_id}", response_model=DetalleOperacionRead)
def get_detalle(detalle_id: int, session: Session = Depends(get_session)):
    detalle = session.get(DetalleOperacion, detalle_id)
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle no encontrado.")
    return detalle


@router.put("/{detalle_id}", response_model=DetalleOperacionRead)
def update_detalle(
    detalle_id: int, data: DetalleOperacionCreate, session: Session = Depends(get_session)
):
    """
    Por simplicidad, en el update usamos el mismo schema que en create,
    pero solo se recomienda cambiar cantidad y precio_unitario.
    """
    detalle = session.get(DetalleOperacion, detalle_id)
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle no encontrado.")

    operacion = session.get(Operacion, detalle.operacion_id)
    producto = session.get(Producto, detalle.producto_id)
    if not operacion or not producto:
        raise HTTPException(
            status_code=400,
            detail="La operación o el producto asociados al detalle no existen.",
        )

    # Ajuste de stock según diferencia de cantidades
    ajustar_stock_actualizacion(
        session,
        operacion,
        producto,
        cantidad_anterior=detalle.cantidad,
        cantidad_nueva=data.cantidad,
    )

    detalle.cantidad = data.cantidad
    detalle.precio_unitario = data.precio_unitario

    session.add(detalle)
    session.commit()
    session.refresh(detalle)

    recalcular_costo_total(session, detalle.operacion_id)

    return detalle


@router.delete("/{detalle_id}")
def delete_detalle(detalle_id: int, session: Session = Depends(get_session)):
    detalle = session.get(DetalleOperacion, detalle_id)
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle no encontrado.")

    operacion = session.get(Operacion, detalle.operacion_id)
    producto = session.get(Producto, detalle.producto_id)
    if not operacion or not producto:
        raise HTTPException(
            status_code=400,
            detail="La operación o el producto asociados al detalle no existen.",
        )

    # Revertir impacto en stock
    ajustar_stock_eliminacion(session, operacion, producto, detalle.cantidad)

    operacion_id = detalle.operacion_id

    session.delete(detalle)
    session.commit()

    # Recalcular costo total
    recalcular_costo_total(session, operacion_id)

    return {"message": "Detalle eliminado correctamente."}
