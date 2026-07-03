"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getMapStyle } from "@/lib/map-style";
import type { RoutePoint, Theme } from "@/lib/types";

export interface FitPadding {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface Props {
  points: RoutePoint[];
  theme: Theme;
  accentColor: string;
  /** 路線在畫面中要避開文字遮罩區的留白 */
  fitPadding: FitPadding;
  onReadyChange?: (ready: boolean) => void;
}

function routeGeoJson(points: RoutePoint[]): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: points.map((p) => [p.lon, p.lat]) },
  };
}

function endpointGeoJson(points: RoutePoint[]): GeoJSON.FeatureCollection {
  const mk = (p: RoutePoint, kind: string): GeoJSON.Feature => ({
    type: "Feature",
    properties: { kind },
    geometry: { type: "Point", coordinates: [p.lon, p.lat] },
  });
  return {
    type: "FeatureCollection",
    features: [mk(points[points.length - 1], "end"), mk(points[0], "start")],
  };
}

export function RouteMap({ points, theme, accentColor, fitPadding, onReadyChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const pointsRef = useRef(points);
  const accentRef = useRef(accentColor);
  const readyRef = useRef(onReadyChange);
  const paddingRef = useRef(fitPadding);
  useEffect(() => {
    pointsRef.current = points;
    accentRef.current = accentColor;
    readyRef.current = onReadyChange;
    paddingRef.current = fitPadding;
  });

  // 建立地圖（主題變更時整個重建，消除 setStyle 後補層的特殊情況）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let map: maplibregl.Map | null = null;
    readyRef.current?.(false);

    getMapStyle(theme)
      .then((style) => {
        if (cancelled || !containerRef.current) return;
        map = new maplibregl.Map({
          container: containerRef.current,
          style,
          attributionControl: false,
          canvasContextAttributes: { preserveDrawingBuffer: true },
          pixelRatio: 2,
          fadeDuration: 0,
        });
        mapRef.current = map;

        map.on("load", () => {
          if (!map) return;
          addRoute(map, pointsRef.current, accentRef.current);
          fitRoute(map, pointsRef.current, paddingRef.current);
        });
        map.on("idle", () => readyRef.current?.(true));
      })
      .catch((e) => console.error("map style error", e));

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [theme]);

  // 路線 / 端點資料更新
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("route") as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    src.setData(routeGeoJson(points));
    (map.getSource("route-ends") as maplibregl.GeoJSONSource).setData(endpointGeoJson(points));
    fitRoute(map, points, paddingRef.current);
  }, [points]);

  // accent 顏色更新
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("route-line")) return;
    map.setPaintProperty("route-line", "line-color", accentColor);
    map.setPaintProperty("route-glow", "line-color", accentColor);
    map.setPaintProperty("route-start", "circle-color", accentColor);
    map.setPaintProperty("route-end", "circle-stroke-color", accentColor);
  }, [accentColor]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}

function addRoute(map: maplibregl.Map, points: RoutePoint[], accent: string) {
  map.addSource("route", { type: "geojson", data: routeGeoJson(points) });
  map.addSource("route-ends", { type: "geojson", data: endpointGeoJson(points) });

  map.addLayer({
    id: "route-glow",
    type: "line",
    source: "route",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": accent, "line-width": 24, "line-opacity": 0.25, "line-blur": 10 },
  });
  map.addLayer({
    id: "route-casing",
    type: "line",
    source: "route",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#FFFFFF", "line-width": 12 },
  });
  map.addLayer({
    id: "route-line",
    type: "line",
    source: "route",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": accent, "line-width": 7 },
  });
  map.addLayer({
    id: "route-end",
    type: "circle",
    source: "route-ends",
    filter: ["==", ["get", "kind"], "end"],
    paint: {
      "circle-radius": 12,
      "circle-color": "#FFFFFF",
      "circle-stroke-color": accent,
      "circle-stroke-width": 5,
    },
  });
  map.addLayer({
    id: "route-start",
    type: "circle",
    source: "route-ends",
    filter: ["==", ["get", "kind"], "start"],
    paint: {
      "circle-radius": 12,
      "circle-color": accent,
      "circle-stroke-color": "#FFFFFF",
      "circle-stroke-width": 5,
    },
  });
}

function fitRoute(map: maplibregl.Map, points: RoutePoint[], padding: FitPadding) {
  if (points.length < 2) return;
  const bounds = new maplibregl.LngLatBounds();
  for (const p of points) bounds.extend([p.lon, p.lat]);
  map.fitBounds(bounds, { padding, animate: false });
}
