import type {
  ExpressionSpecification,
  LayerSpecification,
  StyleSpecification,
} from "maplibre-gl";
import type { Theme } from "./types";

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/** 強制地標使用繁體中文，無中文名時退回當地語言名稱 */
const ZH_NAME = [
  "coalesce",
  ["get", "name:zh-Hant"],
  ["get", "name:zh"],
  ["get", "name"],
] as unknown as ExpressionSpecification;

/** 深色主題調色盤：深藍灰調 */
const DARK = {
  bg: "#111722",
  water: "#0B1B2A",
  green: "#141F19",
  fill: "#161D28",
  roadMajor: "#46536B",
  roadMinor: "#2A3446",
  casing: "#0B0F16",
  boundary: "#37425C",
  text: "#93A0B4",
  halo: "#111722",
} as const;

function isMajorRoad(id: string): boolean {
  return /motorway|trunk|primary|major|highway/.test(id) && !/minor|service|path/.test(id);
}

function darkify(layer: LayerSpecification): void {
  const id = layer.id.toLowerCase();
  const paint = ((layer.paint ?? {}) as Record<string, unknown>);
  layer.paint = paint as never;

  switch (layer.type) {
    case "background":
      paint["background-color"] = DARK.bg;
      break;
    case "fill":
      delete paint["fill-pattern"];
      if (/water/.test(id)) paint["fill-color"] = DARK.water;
      else if (/park|green|wood|grass|landcover|cemetery|pitch|garden/.test(id))
        paint["fill-color"] = DARK.green;
      else paint["fill-color"] = DARK.fill;
      delete paint["fill-outline-color"];
      break;
    case "line":
      if (/boundary|admin/.test(id)) paint["line-color"] = DARK.boundary;
      else if (/casing/.test(id)) paint["line-color"] = DARK.casing;
      else if (isMajorRoad(id)) paint["line-color"] = DARK.roadMajor;
      else paint["line-color"] = DARK.roadMinor;
      break;
    case "symbol":
      paint["text-color"] = DARK.text;
      paint["text-halo-color"] = DARK.halo;
      break;
    default:
      break;
  }
}

export async function getMapStyle(theme: Theme): Promise<StyleSpecification> {
  const res = await fetch(STYLE_URL);
  if (!res.ok) throw new Error("無法載入地圖樣式");
  const style = (await res.json()) as StyleSpecification;

  for (const layer of style.layers) {
    if (layer.type === "symbol") {
      const layout = (layer.layout ?? {}) as Record<string, unknown>;
      if (layout["text-field"]) layout["text-field"] = ZH_NAME;
      layer.layout = layout as never;
    }
    if (theme === "dark") darkify(layer);
  }
  return style;
}
