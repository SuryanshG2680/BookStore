from decimal import Decimal

from sqlalchemy import select

from .database import SessionLocal
from .models import Book, Cart, Category, User
from .security import hash_password


def seed():
    db = SessionLocal()
    try:
        admin = db.scalar(select(User).where(User.email == "admin@example.com"))
        if not admin:
            admin = User(
                name="Administrator",
                email="admin@example.com",
                password_hash=hash_password("Admin123!"),
                role="admin",
            )
            db.add(admin)

        customer = db.scalar(select(User).where(User.email == "alex@example.com"))
        if not customer:
            customer = User(
                name="Alex Reader",
                email="alex@example.com",
                password_hash=hash_password("Customer123!"),
                role="customer",
            )
            db.add(customer)
            db.flush()
            db.add(Cart(user_id=customer.id))

        category = db.scalar(select(Category).where(Category.name == "Fiction"))
        if not category:
            category = Category(name="Fiction", description="Novels and fiction")
            db.add(category)
            db.flush()

        if not db.scalar(select(Book).where(Book.isbn == "9780000000001")):
            db.add(Book(
                title="The Midnight Library",
                author="Matt Haig",
                isbn="9780000000001",
                description="A sample seeded book.",
                price=Decimal("499.00"),
                discount=Decimal("10"),
                stock=20,
                category_id=category.id,
            ))
        if not db.scalar(select(Book).where(Book.isbn == "9780000000002")):
            db.add(Book(
                title="Atomic Habits",
                author="James Clear",
                isbn="9780000000002",
                description="A sample seeded book.",
                price=Decimal("599.00"),
                discount=Decimal("5"),
                stock=15,
                category_id=category.id,
            ))

        db.commit()
        print("Seed completed.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
