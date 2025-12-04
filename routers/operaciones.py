from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import Operacion, Cliente, Proveedor, Puerto, Pais, DetalleOperacion
from schemas import OperacionCreate, OperacionRead

router = APIRouter(prefix="/operaciones", tags=["operaciones"])


# ----------------------------------------------------
#   VALIDACIONES DE RELACIONES Y REGLAS DE NEGOCIO
# ----------------------------------------------------
def validar_relaciones_operacion(data: OperacionCreate, session: Session) -> None:
    # Reglas según tipo de operación
    if data.tipo == "exportacion" and not data.cliente_id:
        raise HTTPException(
            status_code=400,
            detail="Las operaciones de exportación deben tener un cliente asociado.",
        )

    if data.tipo == "importacion" and not data.proveedor_id:
        raise HTTPException(
            status_code=400,
            detail="Las operaciones de importación deben tener un proveedor asociado.",
        )

    # Cliente
    cliente = None
    if data.cliente_id is not None:
        cliente = session.get(Cliente, data.cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=404,
                detail=f"El cliente con id {data.cliente_id} no existe.",
            )

    # Proveedor
    proveedor = None
    if data.proveedor_id is not None:
        proveedor = session.get(Proveedor, data.proveedor_id)
        if not proveedor:
            raise HTTPException(
                status_code=404,
                detail=f"El proveedor con id {data.proveedor_id} no existe.",
            )

    # Cliente y proveedor no pueden ser del mismo país (si ambos existen)
    if cliente and proveedor and cliente.pais_id == proveedor.pais_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "El cliente y el proveedor no pueden pertenecer al mismo país. "
                "En las operaciones de comercio internacional debe existir intercambio entre países distintos."
            ),
        )

    # País origen / destino
    if data.pais_origen_id is not None:
        if not session.get(Pais, data.pais_origen_id):
            raise HTTPException(
                status_code=404,
                detail=f"El país de origen con id {data.pais_origen_id} no existe.",
            )

    if data.pais_destino_id is not None:
        if not session.get(Pais, data.pais_destino_id):
            raise HTTPException(
                status_code=404,
                detail=f"El país de destino con id {data.pais_destino_id} no existe.",
            )

    # Si hay puerto pero no país, rechazamos
    if data.puerto_origen_id is not None and data.pais_origen_id is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Si se especifica un puerto de origen, también debe indicarse el país de origen."
            ),
        )
    if data.puerto_destino_id is not None and data.pais_destino_id is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Si se especifica un puerto de destino, también debe indicarse el país de destino."
            ),
        )

    # Puerto origen
    if data.puerto_origen_id is not None and data.pais_origen_id is not None:
        puerto_origen = session.get(Puerto, data.puerto_origen_id)
        if not puerto_origen:
            raise HTTPException(
                status_code=404,
                detail=f"El puerto de origen con id {data.puerto_origen_id} no existe.",
            )
        if puerto_origen.pais_id != data.pais_origen_id:
            raise HTTPException(
                status_code=400,
                detail="El puerto de origen no pertenece al país de origen.",
            )

    # Puerto destino
    if data.puerto_destino_id is not None and data.pais_destino_id is not None:
        puerto_destino = session.get(Puerto, data.puerto_destino_id)
        if not puerto_destino:
            raise HTTPException(
                status_code=404,
                detail=f"El puerto de destino con id {data.puerto_destino_id} no existe.",
            )
        if puerto_destino.pais_id != data.pais_destino_id:
            raise HTTPException(
                status_code=400,
                detail="El puerto de destino no pertenece al país de destino.",
            )


# ----------------------------------------------------
#   CRUD COMPLETO DE OPERACIONES
# ----------------------------------------------------
@router.post("/", response_model=OperacionRead)
def create_operacion(data: OperacionCreate, session: Session = Depends(get_session)):
    validar_relaciones_operacion(data, session)

    # Ignoramos cualquier costo_total que mande el cliente:
    payload = data.dict(exclude={"costo_total"})
    operacion = Operacion(**payload)
    operacion.costo_total = 0.0  # se actualizará con los detalles

    session.add(operacion)
    session.commit()
    session.refresh(operacion)
    return operacion


@router.get("/", response_model=List[OperacionRead])
def list_operaciones(session: Session = Depends(get_session)):
    return session.exec(select(Operacion)).all()


@router.get("/{operacion_id}", response_model=OperacionRead)
def get_operacion(operacion_id: int, session: Session = Depends(get_session)):
    operacion = session.get(Operacion, operacion_id)
    if not operacion:
        raise HTTPException(status_code=404, detail="La operación no fue encontrada.")
    return operacion


@router.put("/{operacion_id}", response_model=OperacionRead)
def update_operacion(
    operacion_id: int, data: OperacionCreate, session: Session = Depends(get_session)
):
    operacion = session.get(Operacion, operacion_id)
    if not operacion:
        raise HTTPException(status_code=404, detail="La operación no fue encontrada.")

    # Verificamos si ya tiene detalles
    detalles_existentes = session.exec(
        select(DetalleOperacion).where(DetalleOperacion.operacion_id == operacion_id)
    ).all()
    if detalles_existentes and data.tipo != operacion.tipo:
        raise HTTPException(
            status_code=400,
            detail=(
                "No es posible cambiar el tipo de operación porque ya tiene "
                "detalles asociados. Elimine o ajuste los detalles primero."
            ),
        )

    validar_relaciones_operacion(data, session)

    # No permitimos modificar costo_total manualmente
    update_data = data.dict(exclude={"costo_total"}, exclude_unset=True)
    for field, value in update_data.items():
        setattr(operacion, field, value)

    session.add(operacion)
    session.commit()
    session.refresh(operacion)
    return operacion


@router.delete("/{operacion_id}")
def delete_operacion(operacion_id: int, session: Session = Depends(get_session)):
    operacion = session.get(Operacion, operacion_id)
    if not operacion:
        raise HTTPException(status_code=404, detail="La operación no existe.")

    detalles_existentes = session.exec(
        select(DetalleOperacion).where(DetalleOperacion.operacion_id == operacion_id)
    ).all()
    if detalles_existentes:
        raise HTTPException(
            status_code=400,
            detail=(
                "No se puede eliminar la operación porque tiene detalles asociados. "
                "Elimine primero los detalles de la operación."
            ),
        )

    session.delete(operacion)
    session.commit()
    return {"message": "Operación eliminada correctamente."}
