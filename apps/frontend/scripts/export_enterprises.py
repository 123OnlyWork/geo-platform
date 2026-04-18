# apps/frontend/scripts/export_enterprises.py
# исправлено: для server-side cursor description может быть None сразу после execute,
# поэтому сначала делаем отдельный COUNT, потом обычный cursor с fetchmany

import json
import psycopg2
import time
import os

DB = {
    "host": "localhost",
    "port": 5432,
    "dbname": "osm",
    "user": "postgres",
    "password": "Egor150101"
}

OUT = "public/data/enterprises.json"
BATCH_SIZE = 5000

WHERE_SQL = """
WHERE
  amenity IS NOT NULL
  OR shop IS NOT NULL
  OR tourism IS NOT NULL
  OR office IS NOT NULL
  OR craft IS NOT NULL
  OR industrial IS NOT NULL
  OR power IS NOT NULL
"""

SQL = f"""
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
{WHERE_SQL}
ORDER BY osm_id;
"""

COUNT_SQL = f"""
SELECT COUNT(*)
FROM public.planet_osm_point
{WHERE_SQL};
"""

def parse_population(v):
    if v is None:
        return 0
    s = str(v).replace(" ", "").replace(",", "")
    try:
        return int(s)
    except:
        return 0

def main():
    start = time.time()
    os.makedirs("public/data", exist_ok=True)

    print("[1/6] подключение к БД...")
    conn = psycopg2.connect(**DB)

    print("[2/6] подсчет строк...")
    with conn.cursor() as count_cur:
        count_cur.execute(COUNT_SQL)
        total_rows = count_cur.fetchone()[0]
    print(f"  всего строк: {total_rows}")

    print("[3/6] выполнение запроса...")
    cur = conn.cursor()
    cur.execute(SQL)
    cols = [d[0] for d in cur.description]

    print("[4/6] обработка данных...")
    data = []
    total = 0

    while True:
        rows = cur.fetchmany(BATCH_SIZE)
        if not rows:
            break

        for row in rows:
            r = dict(zip(cols, row))
            data.append({
                "osm_id": r["osm_id"],
                "name": r["name"],
                "place": r["place"],
                "population": parse_population(r["population"]),
                "amenity": r["amenity"],
                "shop": r["shop"],
                "tourism": r["tourism"],
                "office": r["office"],
                "craft": r["craft"],
                "landuse": r["landuse"],
                "industrial": r["industrial"],
                "man_made": r["man_made"],
                "power": r["power"],
                "natural": r["natural"],
                "barrier": r["barrier"],
                "tags": r["tags"],
                "coords": [float(r["x"]), float(r["y"])]
            })

        total += len(rows)
        pct = round((total / total_rows) * 100, 1) if total_rows else 100
        print(f"  обработано: {total}/{total_rows} ({pct}%)")

    print("[5/6] закрытие соединения...")
    cur.close()
    conn.close()

    print("[6/6] сохранение файла...")
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    print(f"\nГОТОВО:")
    print(f"  файл: {OUT}")
    print(f"  строк: {len(data)}")
    print(f"  время: {round(time.time() - start, 2)} сек")

if __name__ == "__main__":
    main()