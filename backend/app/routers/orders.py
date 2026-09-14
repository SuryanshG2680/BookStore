from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..deps import get_current_user
from ..models import Cart, CartItem, Order, OrderItem, User, Book
from ..schemas import CheckoutRequest, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut, status_code=201)
def checkout(payload: CheckoutRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.scalar(select(Cart).options(joinedload(Cart.items).joinedload(CartItem.book)).where(Cart.user_id == user.id))
    if not cart or not cart.items:
        raise HTTPException(400, "Cart is empty")

    total = Decimal("0")
    order = Order(
        user_id=user.id,
        total_amount=0,
        status="confirmed",
        payment_status="pending",
        shipping_name=payload.shipping_name,
        shipping_phone=payload.shipping_phone,
        shipping_address=payload.shipping_address,
    )
    db.add(order)

    for item in cart.items:
        book = item.book
        if item.quantity > book.stock:
            db.rollback()
            raise HTTPException(400, f"Not enough stock for {book.title}")
        price = book.price * (Decimal("100") - book.discount) / Decimal("100")
        total += price * item.quantity
        book.stock -= item.quantity
        order.items.append(OrderItem(book_id=book.id, title=book.title, quantity=item.quantity, price=price))
        db.delete(item)

    order.total_amount = total
    db.commit()
    db.refresh(order)
    return db.scalar(select(Order).options(joinedload(Order.items)).where(Order.id == order.id))


@router.get("", response_model=list[OrderOut])
def list_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list(db.scalars(select(Order).options(joinedload(Order.items)).where(Order.user_id == user.id).order_by(Order.id.desc())).unique().all())


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.scalar(select(Order).options(joinedload(Order.items)).where(Order.id == order_id, Order.user_id == user.id))
    if not order:
        raise HTTPException(404, "Order not found")
    return order


@router.put("/{order_id}/cancel")
def cancel_order(order_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.scalar(select(Order).options(joinedload(Order.items)).where(Order.id == order_id, Order.user_id == user.id))
    if not order:
        raise HTTPException(404, "Order not found")
    if order.status not in {"pending", "confirmed"}:
        raise HTTPException(400, "Order cannot be cancelled")
    order.status = "cancelled"

    for item in order.items:
        book = db.get(Book, item.book_id)
        if book:
            book.stock += item.quantity

    db.commit()
    return {"message": "Order cancelled"}
