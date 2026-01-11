
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
import os

# Try default postgres local connection
database_url = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"

async def test_connection():
    try:
        engine = create_async_engine(database_url)
        async with engine.connect() as conn:
            print("Successfully connected to Postgres!")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
