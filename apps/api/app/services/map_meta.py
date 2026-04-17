from app.schemas.map_meta import MapLayerInfo, MapMetaResponse


def get_map_meta(tile_base_url: str) -> MapMetaResponse:
    normalized = tile_base_url.rstrip("/")

    return MapMetaResponse(
        tileUrl=f"{normalized}/maps/map/{{z}}/{{x}}/{{y}}.pbf",
        layers=[
            MapLayerInfo(key="roads", label="Roads", minZoom=0, maxZoom=22),
            MapLayerInfo(key="water", label="Water", minZoom=0, maxZoom=22),
            MapLayerInfo(key="buildings", label="Buildings", minZoom=0, maxZoom=22),
            MapLayerInfo(key="places", label="Places", minZoom=0, maxZoom=22),
        ],
        center=(55.751244, 37.618423),
        zoom=10,
        minZoom=0,
        maxZoom=22,
    )