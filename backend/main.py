from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import master_data, hr, inventory, orders, accounting, production, dashboard, auth
from database import engine, Base, SessionLocal
# Import all model modules so Base.metadata knows about them
from models import auth as auth_model
from models import hr as hr_model
from models import master_data as master_data_model
from models import inventory as inventory_model
from models import orders as orders_model
from models import accounting as accounting_model
from models import production as production_model

from routers.auth import get_password_hash
from sqlalchemy import select

app = FastAPI(
    title="OrlitERP API",
    description="API for OrlitERP System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

import os

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
# Add wildcard support for quick sharing if specified
if "*" in origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed admin user if not present
    async with SessionLocal() as session:
        result = await session.execute(select(auth_model.User).where(auth_model.User.username == "admin"))
        admin_user = result.scalars().first()
        if not admin_user:
            hashed = get_password_hash("admin123")
            new_admin = auth_model.User(
                username="admin",
                email="admin@example.com",
                hashed_password=hashed,
                role="admin",
            )
            session.add(new_admin)
            await session.commit()

# Include routers
from fastapi import APIRouter

# Create API v1 router
api_v1_router = APIRouter(prefix="/api/v1")

# Include routers into v1
api_v1_router.include_router(master_data.router)
api_v1_router.include_router(hr.router)
api_v1_router.include_router(inventory.router)
api_v1_router.include_router(orders.router)
api_v1_router.include_router(accounting.router)
api_v1_router.include_router(production.router)
api_v1_router.include_router(dashboard.router)
api_v1_router.include_router(auth.router)

app.include_router(api_v1_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to OrlitERP API"}
