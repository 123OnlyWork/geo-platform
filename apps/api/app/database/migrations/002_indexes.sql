CREATE INDEX IF NOT EXISTS idx_point_geom ON planet_osm_point USING GIST (way);
CREATE INDEX IF NOT EXISTS idx_line_geom ON planet_osm_line USING GIST (way);
CREATE INDEX IF NOT EXISTS idx_poly_geom ON planet_osm_polygon USING GIST (way);