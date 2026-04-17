from fastapi import APIRouter, Response, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import time
import os
import httpx

from .service import TileService
from app.cache.redis_cache import RedisCache
from database.session import SessionLocal

# Optional Prometheus metrics (install prometheus_client to enable)
try:
    from prometheus_client import Counter, Histogram
    TILE_REQUESTS = Counter("tile_requests_total", "Total tile requests", ["layer", "from_cache"])
    TILE_LATENCY = Histogram("tile_request_duration_seconds", "Tile request duration", ["layer"])
    METRICS_ENABLED = True
except Exception:
    METRICS_ENABLED = False

router = APIRouter()
service = TileService()
cache = RedisCache()
logger = logging.getLogger("tiles")

TEGOLA_URL = os.environ.get("TEGOLA_URL", "http://tileserver:8080")
TILE_SOURCE = os.environ.get("TILE_SOURCE", "fastapi")  # options: 'fastapi' (default), 'tegola' (proxy)

@router.get("/maps/map/{z}/{x}/{y}.pbf")
async def get_map_tile(
    z: int,
    x: int,
    y: int,
    layer: str = Query("cities"),
    session: AsyncSession = Depends(SessionLocal),
):
    start_total = time.time()
    key = f"tile:{layer}:{z}:{x}:{y}"
    tile = None
    from_cache = False

    # try cache
    try:
        cached = await cache.get(key)
        if cached:
            tile = cached
            from_cache = True
    except Exception as e:
        logger.warning("redis get failed: %s", e)

    if tile:
        duration = time.time() - start_total
        logger.info("tile cache hit z=%s x=%s y=%s layer=%s size=%d dur=%.3f", z, x, y, layer, len(tile), duration)
        if METRICS_ENABLED:
            TILE_REQUESTS.labels(layer, "true").inc()
        return Response(content=tile, media_type="application/x-protobuf", headers={"Access-Control-Allow-Origin": "*"})

    # If configured to use Tegola, proxy the request
    tile = None
    if TILE_SOURCE.lower() == "tegola":
        url = f"{TEGOLA_URL}/maps/map/{z}/{x}/{y}.pbf"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url)
            if resp.status_code == 200:
                tile = resp.content
            else:
                logger.warning("tegola request failed %s -> %s", url, resp.status_code)
        except Exception as e:
            logger.exception("tegola proxy error: %s", e)

    # If not proxied or proxy failed, generate tile from PostGIS
    if tile is None:
        gen_start = time.time()
        tile = await service.get_tile(z, x, y, layer=layer, session=session)
        gen_dur = time.time() - gen_start
        if METRICS_ENABLED:
            TILE_LATENCY.labels(layer).observe(gen_dur)

    # cache result (best-effort)
    if tile:
        try:
            await cache.set(key, tile)
        except Exception as e:
            logger.warning("redis set failed: %s", e)

    total_dur = time.time() - start_total
    size = len(tile) if tile else 0
    logger.info("tile z=%s x=%s y=%s layer=%s size=%d from_cache=%s dur=%.3f", z, x, y, layer, size, from_cache, total_dur)
    if METRICS_ENABLED:
        TILE_REQUESTS.labels(layer, str(from_cache)).inc()

    return Response(content=tile or b"", media_type="application/x-protobuf", headers={"Access-Control-Allow-Origin": "*"})


# Backwards compatibility (old route)
@router.get("/tiles/{z}/{x}/{y}.pbf")
async def old_tiles_route(z: int, x: int, y: int, session: AsyncSession = Depends(SessionLocal)):
    return await get_map_tile(z, x, y, layer="cities", session=session)