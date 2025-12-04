from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import MedioTransporte
from schemas import MedioTransporteCreate, MedioTransporteRead

router = APIRouter(prefix="/medios-transporte", tags=["medios_transporte"])


@router.post("/", response_model=MedioTransporteRead)
def create_item(data: MedioTransporteCreate, session: Session = Depends(get_session)):
    item = MedioTransporte(**data.dict())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/", response_model=List[MedioTransporteRead])
def list_items(session: Session = Depends(get_session)):
    statement = select(MedioTransporte)
    return session.exec(statement).all()


@router.get("/{item_id}", response_model=MedioTransporteRead)
def get_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(MedioTransporte, item_id)
    if not item:
        raise HTTPException(404, "MedioTransporte no encontrado")
    return item


@router.put("/{item_id}", response_model=MedioTransporteRead)
def update_item(item_id: int, data: MedioTransporteCreate, session: Session = Depends(get_session)):
    item = session.get(MedioTransporte, item_id)
    if not item:
        raise HTTPException(404, "MedioTransporte no encontrado")
    for k, v in data.dict().items():
        setattr(item, k, v)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(MedioTransporte, item_id)
    if not item:
        raise HTTPException(404, "MedioTransporte no encontrado")
    session.delete(item)
    session.commit()
    return {"message": "MedioTransporte eliminado correctamente"}
