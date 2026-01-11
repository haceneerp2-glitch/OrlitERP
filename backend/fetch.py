from sqlalchemy import text
import asyncio

# Function to get all data from a table
async def get_all_users():
    async with SessionLocal() as session:
        # Raw SQL query
        result = await session.execute(text("SELECT * FROM \"user\""))
        # Fetch all rows
        users = result.fetchall()
        return users

# Example usage
async def main():
    users = await get_all_users()
    for user in users:
        print(user)

# Run the async main
if __name__ == "__main__":
    asyncio.run(main())
