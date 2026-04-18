from sqlalchemy import text
from sqlalchemy.orm import Session


def get_places_geojson(db: Session, limit: int = 1000) -> dict:
    query = text("""
        SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(jsonb_agg(feature), '[]'::jsonb)
        ) AS geojson
        FROM (
            SELECT jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_Transform(way, 3857))::jsonb,
                'properties', jsonb_build_object(
                    'osm_id', osm_id,
                    'name', name,
                    'place', place,
                    'population', population
                )
            ) AS feature
            FROM planet_osm_point
            WHERE way IS NOT NULL
              AND (
                    name IS NOT NULL
                    OR place IS NOT NULL 
                  )
              AND population IS NOT NULL  AND place ='city'
            LIMIT :limit
        ) t;
    """)

    result = db.execute(query, {"limit": limit}).scalar()
    return result if result else {"type": "FeatureCollection", "features": []}