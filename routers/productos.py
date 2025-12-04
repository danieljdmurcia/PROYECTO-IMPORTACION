from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import Producto
from schemas import ProductoCreate, ProductoRead

router = APIRouter(prefix="/productos", tags=["productos"])


@router.post("/", response_model=ProductoRead)
def create_item(data: ProductoCreate, session: Session = Depends(get_session)):
    item = Producto(**data.dict())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/", response_model=List[ProductoRead])
def list_items(session: Session = Depends(get_session)):
    statement = select(Producto)
    return session.exec(statement).all()


@router.get("/{item_id}", response_model=ProductoRead)
def get_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Producto, item_id)
    if not item:
        raise HTTPException(404, "Producto no encontrado")
    return item


@router.put("/{item_id}", response_model=ProductoRead)
def update_item(item_id: int, data: ProductoCreate, session: Session = Depends(get_session)):
    item = session.get(Producto, item_id)
    if not item:
        raise HTTPException(404, "Producto no encontrado")
    for k, v in data.dict().items():
        setattr(item, k, v)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Producto, item_id)
    if not item:
        raise HTTPException(404, "Producto no encontrado")
    session.delete(item)
    session.commit()
    return {"message": "Producto eliminado correctamente"}
