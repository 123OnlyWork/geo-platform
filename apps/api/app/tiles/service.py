from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

class TileService:
    # mapping layer -> (table, selected_columns)
    LAYER_MAP = {
        "cities": ("planet_osm_point", "p.name, p.place"),
        "places": ("planet_osm_point", "p.osm_id, p.name, p.place"),
        "roads": ("planet_osm_line", "p.osm_id, p.highway"),
        "railways": ("planet_osm_line", "p.osm_id, p.railway"),
        "water": ("planet_osm_polygon", "p.osm_id, p.waterway"),
        "landuse": ("planet_osm_polygon", "p.osm_id, p.landuse"),
        "buildings": ("planet_osm_polygon", "p.osm_id, p.building"),
    }

    async def get_tile(self, z: int, x: int, y: int, layer: str, session: AsyncSession):
        layer_key = layer if layer in self.LAYER_MAP else "cities"
        table, cols = self.LAYER_MAP[layer_key]

        sql = text(f"""
        WITH bounds AS (
            SELECT ST_TileEnvelope(:z, :x, :y) AS geom
        ),
        mvtgeom AS (
            SELECT
                ST_AsMVTGeom(
                    ST_Transform(p.way, 3857),
                    bounds.geom,
                    4096,
                    256,
                    true
                ) AS geom,
                {cols}
            FROM {table} p, bounds
            WHERE
                p.way IS NOT NULL
                AND ST_Intersects(ST_Transform(p.way, 3857), bounds.geom)
        )
        SELECT ST_AsMVT(mvtgeom, :layer, 4096, 'geom')
        FROM mvtgeom;
        """)

        result = await session.execute(sql, {
            "z": z,
            "x": x,
            "y": y,
            "layer": layer_key
        })

        tile = result.scalar()
        if tile is None:
            return b""
        return tile