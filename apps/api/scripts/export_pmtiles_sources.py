from __future__ import annotations

import json
import os
from pathlib import Path

import psycopg2
from psycopg2.extras import RealDictCursor

OUTPUT_DIR = Path("../../apps/frontend/public/pmtiles_src").resolve()
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

DB_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "port": int(os.getenv("POSTGRES_PORT", "5432")),
    "dbname": os.getenv("POSTGRES_DB", "osm"),
    "user": os.getenv("POSTGRES_USER", "postgres"),
    "password": os.getenv("POSTGRES_PASSWORD", "Egor150101"),
}


QUERIES = {
    "places.geojson": """
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(json_agg(feature), '[]'::json)
        ) AS geojson
        FROM (
            SELECT json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_Transform(way, 3857))::json,
                'properties', json_build_object(
                    'osm_id', osm_id,
                    'name', name,
                    'place', place,
                    'population', population
                )
            ) AS feature
            FROM planet_osm_point
            WHERE way IS NOT NULL
              AND place IN ('city', 'town', 'village')
        ) t;
    """,
    "roads.geojson": """
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(json_agg(feature), '[]'::json)
        ) AS geojson
        FROM (
            SELECT json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_Transform(way, 3857))::json,
                'properties', json_build_object(
                    'osm_id', osm_id,
                    'name', name,
                    'highway', highway
                )
            ) AS feature
            FROM planet_osm_roads
            WHERE way IS NOT NULL
              AND highway IS NOT NULL
        ) t;
    """,
    "railways.geojson": """
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(json_agg(feature), '[]'::json)
        ) AS geojson
        FROM (
            SELECT json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_Transform(way, 3857))::json,
                'properties', json_build_object(
                    'osm_id', osm_id,
                    'name', name,
                    'railway', railway
                )
            ) AS feature
            FROM planet_osm_line
            WHERE way IS NOT NULL
              AND railway IS NOT NULL
        ) t;
    """,
}


def main() -> None:
    with psycopg2.connect(**DB_CONFIG) as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            for filename, sql in QUERIES.items():
                print(f"Exporting {filename}...")
                cur.execute(sql)
                row = cur.fetchone()
                data = row["geojson"] if row and row["geojson"] else {
                    "type": "FeatureCollection",
                    "features": [],
                }

                out_path = OUTPUT_DIR / filename
                out_path.write_text(
                    json.dumps(data, ensure_ascii=False),
                    encoding="utf-8",
                )
                print(f"Saved: {out_path}")


if __name__ == "__main__":
    main()