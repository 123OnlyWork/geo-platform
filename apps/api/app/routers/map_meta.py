from fastapi import APIRouter

from app.core.config import settings
from app.schemas.map_meta import MapMetaResponse
from app.services.map_meta import get_map_meta

router = APIRouter(prefix="/api/map", tags=["map"])


@router.get("/meta", response_model=MapMetaResponse)
def read_map_meta():
    return get_map_meta(settings.tile_base_url)