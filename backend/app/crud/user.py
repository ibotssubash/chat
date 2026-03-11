from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password


class UserCRUD:
    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> User | None:
        result = await db.execute(select(User).filter(User.id == user_id))
        return result.scalar_one_or_none()
    
    async def get_user_by_username(self, db: AsyncSession, username: str) -> User | None:
        result = await db.execute(select(User).filter(User.username == username))
        return result.scalar_one_or_none()
    
    async def get_user_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalar_one_or_none()
    
    async def get_users(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> list[User]:
        result = await db.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all()
    
    async def create_user(self, db: AsyncSession, user: UserCreate) -> User:
        hashed_password = get_password_hash(user.password)
        db_user = User(
            username=user.username,
            email=user.email,
            password_hash=hashed_password
        )
        db.add(db_user)
        try:
            await db.commit()
            await db.refresh(db_user)
            return db_user
        except IntegrityError:
            await db.rollback()
            raise ValueError("Username or email already exists")
    
    async def authenticate_user(self, db: AsyncSession, username: str, password: str) -> User | None:
        user = await self.get_user_by_username(db, username)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user


user_crud = UserCRUD()
