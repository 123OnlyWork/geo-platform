from pydantic import BaseModel

class Tile(BaseModel):
    z: int
    x: int
    y: int