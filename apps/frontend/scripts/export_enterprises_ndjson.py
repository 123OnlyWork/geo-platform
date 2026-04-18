# apps/frontend/scripts/export_enterprises_ndjson.py
# pip install psycopg2-binary

import json
import os
import psycopg2

DB = {
    "host": "localhost",
    "port": 5432,
    "dbname": "osm",
    "user": "postgres",
    "password": "Egor150101"
}

OUT = "public/data/enterprises.ndjson"
BATCH_SIZE = 5000

SQL = """
SELECT
  osm_id,
  name,
  place,
  population,
  amenity,
  shop,
  tourism,
  office,
  craft,
  landuse,
  industrial,
  man_made,
  power,
  "natural",
  barrier,
  tags,
  ST_X(way) AS x,
  ST_Y(way) AS y
FROM public.planet_osm_point
WHERE
  amenity IS NOT NULL
  OR shop IS NOT NULL
  OR tourism IS NOT NULL
  OR office IS NOT NULL
  OR craft IS NOT NULL
  OR industrial IS NOT NULL
  OR power IS NOT NULL
ORDER BY osm_id;
"""

def parse_population(v):
    if v is None:
        return 0
    s = str(v).replace(" ", "").replace(",", "")
    try:
        return int(s)
    except:
        return 0

def clean(v):
    return None if v is None else v

def main():
    os.makedirs("public/data", exist_ok=True)

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()
    cur.execute(SQL)
    cols = [d[0] for d in cur.description]

    total = 0
    with open(OUT, "w", encoding="utf-8") as f:
        while True:
            rows = cur.fetchmany(BATCH_SIZE)
            if not rows:
                break

            for row in rows:
                r = dict(zip(cols, row))

                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [float(r["x"]), float(r["y"])]
                    },
                    "properties": {
                        "osm_id": r["osm_id"],
                        "name": clean(r["name"]),
                        "place": clean(r["place"]),
                        "population": parse_population(r["population"]),
                        "amenity": clean(r["amenity"]),
                        "shop": clean(r["shop"]),
                        "tourism": clean(r["tourism"]),
                        "office": clean(r["office"]),
                        "craft": clean(r["craft"]),
                        "landuse": clean(r["landuse"]),
                        "industrial": clean(r["industrial"]),
                        "man_made": clean(r["man_made"]),
                        "power": clean(r["power"]),
                        "natural": clean(r["natural"]),
                        "barrier": clean(r["barrier"])
                    }
                }
                f.write(json.dumps(feature, ensure_ascii=False) + "\n")
                total += 1

            print(f"processed: {total}")

    cur.close()
    conn.close()
    print(f"saved: {OUT}, rows: {total}")

if __name__ == "__main__":
    main()