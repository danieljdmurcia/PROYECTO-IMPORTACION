from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import Cliente
from schemas import ClienteCreate, ClienteRead

router = APIRouter(prefix="/clientes", tags=["clientes"])


@router.post("/", response_model=ClienteRead)
def create_item(data: ClienteCreate, session: Session = Depends(get_session)):
    item = Cliente(**data.dict())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/", response_model=List[ClienteRead])
def list_items(session: Session = Depends(get_session)):
    statement = select(Cliente)
    return session.exec(statement).all()


@router.get("/{item_id}", response_model=ClienteRead)
def get_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Cliente, item_id)
    if not item:
        raise HTTPException(404, "Cliente no encontrado")
    return item


@router.put("/{item_id}", response_model=ClienteRead)
def update_item(item_id: int, data: ClienteCreate, session: Session = Depends(get_session)):
    item = session.get(Cliente, item_id)
    if not item:
        raise HTTPException(404, "Cliente no encontrado")
    for k, v in data.dict().items():
        setattr(item, k, v)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Cliente, item_id)
    if not item:
        raise HTTPException(404, "Cliente no encontrado")
    session.delete(item)
    session.commit()
    return {"message": "Cliente eliminado correctamente"}
