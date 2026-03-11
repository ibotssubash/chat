import asyncio
from app.db.database import engine
from app.crud.user import user_crud
from sqlalchemy.ext.asyncio import AsyncSession

async def check_users():
    """Check existing users in the database"""
    async with AsyncSession(engine) as db:
        users = await user_crud.get_users(db, limit=10)
        print(f"Found {len(users)} users in database:")
        for user in users:
            print(f"  - ID: {user.id}, Username: {user.username}, Email: {user.email}")

if __name__ == "__main__":
    asyncio.run(check_users())
