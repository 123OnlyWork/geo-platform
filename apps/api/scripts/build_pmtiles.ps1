$ErrorActionPreference = "Stop"

Write-Host "1. Export GeoJSON from PostGIS"
python scripts/export_pmtiles_sources.py
if ($LASTEXITCODE -ne 0) {
    throw "GeoJSON export failed"
}

Write-Host "2. Create PMTiles output directory"
New-Item -ItemType Directory -Force ..\frontend\public\pmtiles | Out-Null

Set-Location ..\..

Write-Host "3. Build places.pmtiles"
docker run --rm `
  -v "${PWD}\apps\frontend\public:/work" `
  ghcr.io/felt/tippecanoe:latest `
  tippecanoe `
  -o /work/pmtiles/places.pmtiles `
  -l places `
  -zg `
  --projection=EPSG:3857 `
  /work/pmtiles_src/places.geojson

Write-Host "4. Build roads.pmtiles"
docker run --rm `
  -v "${PWD}\apps\frontend\public:/work" `
  ghcr.io/felt/tippecanoe:latest `
  tippecanoe `
  -o /work/pmtiles/roads.pmtiles `
  -l roads `
  -zg `
  --projection=EPSG:3857 `
  /work/pmtiles_src/roads.geojson

Write-Host "5. Build railways.pmtiles"
docker run --rm `
  -v "${PWD}\apps\frontend\public:/work" `
  ghcr.io/felt/tippecanoe:latest `
  tippecanoe `
  -o /work/pmtiles/railways.pmtiles `
  -l railways `
  -zg `
  --projection=EPSG:3857 `
  /work/pmtiles_src/railways.geojson

Write-Host "Done"