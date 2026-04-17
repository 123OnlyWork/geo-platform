import { useState } from "react";

export function useViewport() {
  const [viewport, setViewport] = useState({
    lat: 55.7558,
    lng: 37.6173,
    zoom: 10
  });

  return { viewport, setViewport };
}