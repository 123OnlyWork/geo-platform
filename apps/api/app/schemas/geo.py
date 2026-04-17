from pydantic import BaseModel

class BBox(BaseModel):
    minx: float
    miny: float
    maxx: float
    maxy: float