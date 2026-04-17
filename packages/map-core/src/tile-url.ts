export function buildTileUrl(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/$/, "");
  return `${normalized}/maps/map/{z}/{x}/{y}.pbf`;
}