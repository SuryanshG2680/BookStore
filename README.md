# PageTurn Bookstore

A clean full-stack bookstore starter built with:

- FastAPI + SQLAlchemy
- PostgreSQL
- Alembic
- JWT authentication
- React + Vite
- Customer and admin roles
- Books, cart, checkout, orders and inventory

## Requirements

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

## 1. Create the database

```sql
CREATE DATABASE bookstore_db;
```

## 2. Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

## 3. Frontend

Open another terminal:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend: http://localhost:5173

## Seed accounts

Admin:
- admin@example.com
- Admin123!

Customer:
- alex@example.com
- Customer123!

Change these credentials before using the project outside local development.
