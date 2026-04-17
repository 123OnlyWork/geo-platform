from app.core.database import get_conn

class PointsRepo:

    def fetch_bbox(self, bbox):
        conn = get_conn()
        cur = conn.cursor()

        cur.execute("""
            SELECT osm_id, name, ST_AsGeoJSON(way)
            FROM planet_osm_point
            WHERE way && ST_MakeEnvelope(%s,%s,%s,%s,3857)
            LIMIT 1000
        """, bbox)

        return cur.fetchall()