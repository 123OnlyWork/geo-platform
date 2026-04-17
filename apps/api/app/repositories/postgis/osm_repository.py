from sqlalchemy import text

class OSMRepository:

    def __init__(self, db):
        self.db = db


    async def get_cities(self):

        query = text("""
        SELECT json_build_object(
         'type','FeatureCollection',
         'features', json_agg(
           json_build_object(
             'type','Feature',
             'geometry', ST_AsGeoJSON(way)::json,
             'properties', json_build_object(
               'name', name,
               'place', place,
               'population', population
             )
           )
         )
        )
        FROM planet_osm_point
        WHERE place IN ('city','town','village')
        """)

        result = await self.db.execute(query)
        return result.scalar()


    async def get_roads(self):

        query = text("""
        SELECT json_build_object(
         'type','FeatureCollection',
         'features', json_agg(
           json_build_object(
             'type','Feature',
             'geometry', ST_AsGeoJSON(way)::json,
             'properties', json_build_object(
               'name', name,
               'type', highway
             )
           )
         )
        )
        FROM planet_osm_roads
        WHERE highway IS NOT NULL
        LIMIT 10000
        """)

        result = await self.db.execute(query)
        return result.scalar()