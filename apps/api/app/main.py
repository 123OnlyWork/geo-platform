from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from app.tiles.router import router as tiles_router

# Optional Prometheus scraping endpoint
try:
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
    PROMETHEUS_ENABLED = True
except Exception:
    PROMETHEUS_ENABLED = False

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/metrics")
def metrics():
    if PROMETHEUS_ENABLED:
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
    return Response(content=b"", media_type="text/plain")

app.include_router(tiles_router)