CITIES_SQL = """
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
        p.name,
        p.place,
        p.population
    FROM planet_osm_point p
    CROSS JOIN bounds
    WHERE
        p.way && ST_Transform(bounds.geom, 4326)
        AND p.name IS NOT NULL
)
SELECT ST_AsMVT(mvtgeom, 'cities', 4096, 'geom');
"""