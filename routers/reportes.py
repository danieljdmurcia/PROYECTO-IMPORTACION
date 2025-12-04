from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from database import get_session
from models import Operacion, DetalleOperacion, Producto, Pais

router = APIRouter(prefix="/reportes", tags=["reportes"])


@router.get("/operaciones-por-estado")
def operaciones_por_estado(session: Session = Depends(get_session)):
    """
    Reporte: cantidad y costo total por estado de la operación.
    """
    rows = session.exec(
        select(
            Operacion.estado,
            func.count(Operacion.id),
            func.coalesce(func.sum(Operacion.costo_total), 0),
        ).group_by(Operacion.estado)
    ).all()

    return [
        {
            "estado": estado,
            "cantidad_operaciones": int(cant),
            "costo_total": float(total),
        }
        for estado, cant, total in rows
    ]


@router.get("/top-productos-exportados")
def top_productos_exportados(limit: int = 5, session: Session = Depends(get_session)):
    """
    Reporte: top N productos por cantidad exportada.
    """
    rows = session.exec(
        select(
            Producto.nombre,
            func.coalesce(func.sum(DetalleOperacion.cantidad), 0),
        )
        .join(DetalleOperacion, DetalleOperacion.producto_id == Producto.id)
        .join(Operacion, DetalleOperacion.operacion_id == Operacion.id)
        .where(Operacion.tipo == "exportacion")
        .group_by(Producto.id)
        .order_by(func.sum(DetalleOperacion.cantidad).desc())
        .limit(limit)
    ).all()

    return [
        {"producto": nombre, "cantidad_exportada": float(cant)} for nombre, cant in rows
    ]


@router.get("/ingresos-por-mes")
def ingresos_por_mes(anio: int, session: Session = Depends(get_session)):
    """
    Reporte: ingresos (costo_total) por mes de un año dado.
    Solo considera operaciones con costo_total > 0.
    """
    # Para SQLite usamos strftime; ajusta si usas otro motor.
    rows = session.exec(
        select(
            func.strftime("%m", Operacion.fecha),
            func.coalesce(func.sum(Operacion.costo_total), 0),
        )
        .where(func.strftime("%Y", Operacion.fecha) == str(anio))
        .group_by(func.strftime("%m", Operacion.fecha))
        .order_by(func.strftime("%m", Operacion.fecha))
    ).all()

    return [
        {"mes": mes, "ingresos": float(total)} for mes, total in rows
    ]
