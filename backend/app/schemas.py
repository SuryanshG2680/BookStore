from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8)
    phone: str | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    phone: str | None
    role: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    description: str | None = None
    price: Decimal
    discount: Decimal = Decimal("0")
    stock: int = Field(ge=0)
    cover_image: str | None = None
    category_id: int | None = None


class BookCreate(BookBase):
    pass


class BookOut(BookBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class CartItemCreate(BaseModel):
    book_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemOut(BaseModel):
    id: int
    quantity: int
    book: BookOut
    model_config = ConfigDict(from_attributes=True)


class CartOut(BaseModel):
    id: int
    items: list[CartItemOut]
    model_config = ConfigDict(from_attributes=True)


class CheckoutRequest(BaseModel):
    shipping_name: str
    shipping_phone: str
    shipping_address: str


class OrderItemOut(BaseModel):
    title: str
    quantity: int
    price: Decimal
    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: int
    total_amount: Decimal
    status: str
    payment_status: str
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    created_at: datetime
    items: list[OrderItemOut]
    model_config = ConfigDict(from_attributes=True)
