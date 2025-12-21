from pydantic import BaseModel


class CategoryResponse(BaseModel):
    uuid: str
    name: str

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str

