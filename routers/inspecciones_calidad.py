from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import InspeccionCalidad
from schemas import InspeccionCalidadCreate, InspeccionCalidadRead

router = APIRouter(prefix="/inspecciones-calidad", tags=["inspecciones_calidad"])


@router.post("/", response_model=InspeccionCalidadRead)
def create_item(data: InspeccionCalidadCreate, session: Session = Depends(get_session)):
    item = InspeccionCalidad(**data.dict())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/", response_model=List[InspeccionCalidadRead])
def list_items(session: Session = Depends(get_session)):
    statement = select(InspeccionCalidad)
    return session.exec(statement).all()


@router.get("/{item_id}", response_model=InspeccionCalidadRead)
def get_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(InspeccionCalidad, item_id)
    if not item:
        raise HTTPException(404, "InspeccionCalidad no encontrado")
    return item


@router.put("/{item_id}", response_model=InspeccionCalidadRead)
def update_item(item_id: int, data: InspeccionCalidadCreate, session: Session = Depends(get_session)):
    item = session.get(InspeccionCalidad, item_id)
    if not item:
        raise HTTPException(404, "InspeccionCalidad no encontrado")
    for k, v in data.dict().items():
        setattr(item, k, v)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(InspeccionCalidad, item_id)
    if not item:
        raise HTTPException(404, "InspeccionCalidad no encontrado")
    session.delete(item)
    session.commit()
    return {"message": "InspeccionCalidad eliminado correctamente"}
