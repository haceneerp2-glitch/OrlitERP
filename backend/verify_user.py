import asyncio
from sqlalchemy import select
from database import SessionLocal
from models.auth import User
from routers.auth import get_password_hash

async def check_admin():
    async with SessionLocal() as session:
        result = await session.execute(select(User).where(User.username == "admin"))
        user = result.scalars().first()
        if user:
            print(f"User found: {user.username}, Role: {user.role}")
        else:
            print("User 'admin' NOT found.")

if __name__ == "__main__":
    asyncio.run(check_admin())
