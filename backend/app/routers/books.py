from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_admin
from ..models import Book
from ..schemas import BookCreate, BookOut

router = APIRouter(prefix="/books", tags=["Books"])


@router.get("", response_model=list[BookOut])
def list_books(
    q: str | None = None,
    category_id: int | None = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    stmt = select(Book).order_by(Book.id.desc()).limit(limit)
    if q:
        stmt = stmt.where(or_(Book.title.ilike(f"%{q}%"), Book.author.ilike(f"%{q}%"), Book.isbn.ilike(f"%{q}%")))
    if category_id:
        stmt = stmt.where(Book.category_id == category_id)
    return list(db.scalars(stmt).all())


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    return book


@router.post("", response_model=BookOut, status_code=201)
def create_book(payload: BookCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.scalar(select(Book).where(Book.isbn == payload.isbn)):
        raise HTTPException(409, "ISBN already exists")
    book = Book(**payload.model_dump())
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.put("/{book_id}", response_model=BookOut)
def update_book(book_id: int, payload: BookCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    for key, value in payload.model_dump().items():
        setattr(book, key, value)
    db.commit()
    db.refresh(book)
    return book


@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted"}
