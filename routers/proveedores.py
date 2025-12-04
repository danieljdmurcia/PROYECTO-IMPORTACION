from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import Proveedor
from schemas import ProveedorCreate, ProveedorRead

router = APIRouter(prefix="/proveedores", tags=["proveedores"])


@router.post("/", response_model=ProveedorRead)
def create_item(data: ProveedorCreate, session: Session = Depends(get_session)):
    item = Proveedor(**data.dict())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/", response_model=List[ProveedorRead])
def list_items(session: Session = Depends(get_session)):
    statement = select(Proveedor)
    return session.exec(statement).all()


@router.get("/{item_id}", response_model=ProveedorRead)
def get_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Proveedor, item_id)
    if not item:
        raise HTTPException(404, "Proveedor no encontrado")
    return item


@router.put("/{item_id}", response_model=ProveedorRead)
def update_item(item_id: int, data: ProveedorCreate, session: Session = Depends(get_session)):
    item = session.get(Proveedor, item_id)
    if not item:
        raise HTTPException(404, "Proveedor no encontrado")
    for k, v in data.dict().items():
        setattr(item, k, v)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Proveedor, item_id)
    if not item:
        raise HTTPException(404, "Proveedor no encontrado")
    session.delete(item)
    session.commit()
    return {"message": "Proveedor eliminado correctamente"}
