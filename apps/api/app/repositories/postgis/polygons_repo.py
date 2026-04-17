from app.core.database import get_conn

class PolygonsRepo:

    def fetch_bbox(self, bbox):
        conn = get_conn()
        cur = conn.cursor()

        cur.execute("""
            SELECT osm_id, building, ST_AsGeoJSON(way)
            FROM planet_osm_polygon
            WHERE way && ST_MakeEnvelope(%s,%s,%s,%s,3857)
        """, bbox)

        return cur.fetchall()