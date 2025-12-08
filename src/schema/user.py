from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class UserResponse(BaseModel):
    uuid: UUID
    name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

