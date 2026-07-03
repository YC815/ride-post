import type { RouteData, RoutePoint } from "./types";

const R = 6371000;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** window-5 移動平均，消除高度計雜訊，避免爬升灌水 */
function smooth(values: number[], window = 5): number[] {
  const half = Math.floor(window / 2);
  return values.map((_, i) => {
    const seg = values.slice(Math.max(0, i - half), i + half + 1);
    return seg.reduce((s, v) => s + v, 0) / seg.length;
  });
}

export function parseGpx(xml: string): RouteData {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("GPX 格式錯誤，無法解析");
  }

  let ptEls = Array.from(doc.querySelectorAll("trkpt"));
  if (ptEls.length === 0) ptEls = Array.from(doc.querySelectorAll("rtept"));
  if (ptEls.length < 2) {
    throw new Error("GPX 內找不到路線點（trkpt / rtept）");
  }

  const name =
    doc.querySelector("trk > name")?.textContent?.trim() ||
    doc.querySelector("metadata > name")?.textContent?.trim() ||
    "";

  const raw = ptEls.map((el) => ({
    lat: parseFloat(el.getAttribute("lat") ?? "0"),
    lon: parseFloat(el.getAttribute("lon") ?? "0"),
    ele: parseFloat(el.querySelector("ele")?.textContent ?? "0"),
  }));

  const smoothed = smooth(raw.map((p) => p.ele));
  const points: RoutePoint[] = [];
  let dist = 0;
  for (let i = 0; i < raw.length; i++) {
    if (i > 0) dist += haversine(raw[i - 1].lat, raw[i - 1].lon, raw[i].lat, raw[i].lon);
    points.push({ lat: raw[i].lat, lon: raw[i].lon, ele: smoothed[i], dist });
  }

  let gain = 0;
  for (let i = 1; i < points.length; i++) {
    const d = points[i].ele - points[i - 1].ele;
    if (d > 0) gain += d;
  }

  const eles = points.map((p) => p.ele);
  return {
    name,
    points,
    distanceKm: Math.round((dist / 1000) * 10) / 10,
    elevationM: Math.round(gain),
    minEle: Math.min(...eles),
    maxEle: Math.max(...eles),
  };
}
