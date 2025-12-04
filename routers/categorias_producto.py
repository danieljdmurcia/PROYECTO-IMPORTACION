from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import CategoriaProducto
from schemas import CategoriaProductoCreate, CategoriaProductoRead


router = APIRouter(prefix="/categorias-producto", tags=["categorias_producto"])


@router.post("/", response_model=CategoriaProductoRead)
def create_item(data: CategoriaProductoCreate, session: Session = Depends(get_session)):
    item = CategoriaProducto(**data.dict())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/", response_model=List[CategoriaProductoRead])
def list_items(session: Session = Depends(get_session)):
    statement = select(CategoriaProducto)
    return session.exec(statement).all()


@router.get("/{item_id}", response_model=CategoriaProductoRead)
def get_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(CategoriaProducto, item_id)
    if not item:
        raise HTTPException(404, "CategoriaProducto no encontrado")
    return item


@router.put("/{item_id}", response_model=CategoriaProductoRead)
def update_item(item_id: int, data: CategoriaProductoCreate, session: Session = Depends(get_session)):
    item = session.get(CategoriaProducto, item_id)
    if not item:
        raise HTTPException(404, "CategoriaProducto no encontrado")
    for k, v in data.dict().items():
        setattr(item, k, v)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(CategoriaProducto, item_id)
    if not item:
        raise HTTPException(404, "CategoriaProducto no encontrado")
    session.delete(item)
    session.commit()
    return {"message": "CategoriaProducto eliminado correctamente"}
