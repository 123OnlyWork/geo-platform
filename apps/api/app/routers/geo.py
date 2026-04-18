from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.geo_service import get_places_geojson

router = APIRouter(prefix="/api/geo", tags=["geo"])


@router.get("/places")
def get_places(
    limit: int = Query(default=1000, ge=1, le=10000),
    db: Session = Depends(get_db),
):
    return get_places_geojson(db, limit=limit)