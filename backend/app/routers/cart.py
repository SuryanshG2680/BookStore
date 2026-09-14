from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..deps import get_current_user
from ..models import Book, Cart, CartItem, User
from ..schemas import CartItemCreate, CartItemUpdate, CartOut

router = APIRouter(prefix="/cart", tags=["Cart"])


def get_cart(user: User, db: Session) -> Cart:
    cart = db.scalar(select(Cart).options(joinedload(Cart.items).joinedload(CartItem.book)).where(Cart.user_id == user.id))
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@router.get("", response_model=CartOut)
def read_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_cart(user, db)


@router.post("/items", response_model=CartOut)
def add_item(payload: CartItemCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    book = db.get(Book, payload.book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    if payload.quantity > book.stock:
        raise HTTPException(400, "Not enough stock")
    cart = get_cart(user, db)
    item = db.scalar(select(CartItem).where(CartItem.cart_id == cart.id, CartItem.book_id == book.id))
    if item:
        if item.quantity + payload.quantity > book.stock:
            raise HTTPException(400, "Not enough stock")
        item.quantity += payload.quantity
    else:
        cart.items.append(CartItem(book_id=book.id, quantity=payload.quantity))
    db.commit()
    return get_cart(user, db)


@router.put("/items/{item_id}", response_model=CartOut)
def update_item(item_id: int, payload: CartItemUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = get_cart(user, db)
    item = db.scalar(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id))
    if not item:
        raise HTTPException(404, "Cart item not found")
    if payload.quantity > item.book.stock:
        raise HTTPException(400, "Not enough stock")
    item.quantity = payload.quantity
    db.commit()
    return get_cart(user, db)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = get_cart(user, db)
    item = db.scalar(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id))
    if not item:
        raise HTTPException(404, "Cart item not found")
    db.delete(item)
    db.commit()
    return get_cart(user, db)


@router.delete("", response_model=CartOut)
def clear_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = get_cart(user, db)
    for item in list(cart.items):
        db.delete(item)
    db.commit()
    return get_cart(user, db)
