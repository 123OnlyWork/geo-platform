from pydantic import BaseModel


class MapLayerInfo(BaseModel):
    key: str
    label: str
    minZoom: int | None = None
    maxZoom: int | None = None


class MapMetaResponse(BaseModel):
    tileUrl: str
    layers: list[MapLayerInfo]
    center: tuple[float, float]
    zoom: int
    minZoom: int
    maxZoom: int