from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import Pais
from schemas import PaisCreate, PaisRead

router = APIRouter(prefix="/paises", tags=["paises"])


@router.post("/", response_model=PaisRead)
def create_item(data: PaisCreate, session: Session = Depends(get_session)):
    item = Pais(**data.dict())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/", response_model=List[PaisRead])
def list_items(session: Session = Depends(get_session)):
    statement = select(Pais)
    return session.exec(statement).all()


@router.get("/{item_id}", response_model=PaisRead)
def get_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Pais, item_id)
    if not item:
        raise HTTPException(404, "Pais no encontrado")
    return item


@router.put("/{item_id}", response_model=PaisRead)
def update_item(item_id: int, data: PaisCreate, session: Session = Depends(get_session)):
    item = session.get(Pais, item_id)
    if not item:
        raise HTTPException(404, "Pais no encontrado")
    for k, v in data.dict().items():
        setattr(item, k, v)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Pais, item_id)
    if not item:
        raise HTTPException(404, "Pais no encontrado")
    session.delete(item)
    session.commit()
    return {"message": "Pais eliminado correctamente"}
