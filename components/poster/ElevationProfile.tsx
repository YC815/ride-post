import type { RoutePoint } from "@/lib/types";

interface Props {
  points: RoutePoint[];
  height: number;
  lineColor: string;
  fillColor: string;
}

const WIDTH = 952;
const BUCKETS = 220;

/** 依距離降採樣（每桶取最大值以保留峰頂），輸出 SVG 面積圖 */
export function ElevationProfile({ points, height, lineColor, fillColor }: Props) {
  if (points.length < 2) return null;

  const total = points[points.length - 1].dist;
  const buckets: number[] = new Array(BUCKETS).fill(-Infinity);
  for (const p of points) {
    const i = Math.min(BUCKETS - 1, Math.floor((p.dist / total) * BUCKETS));
    if (p.ele > buckets[i]) buckets[i] = p.ele;
  }
  // 補洞：空桶取前一桶值
  for (let i = 0; i < BUCKETS; i++) {
    if (buckets[i] === -Infinity) buckets[i] = i > 0 ? buckets[i - 1] : points[0].ele;
  }

  const min = Math.min(...buckets);
  const max = Math.max(...buckets);
  const range = Math.max(max - min, 80);
  const padTop = 34; // 留給最高點標記
  const y = (ele: number) => padTop + (1 - (ele - min) / range) * (height - padTop);
  const x = (i: number) => (i / (BUCKETS - 1)) * WIDTH;

  const line = buckets.map((e, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(e).toFixed(1)}`).join(" ");
  const area = `${line} L${WIDTH},${height} L0,${height} Z`;
  const gid = `elev-fill-${lineColor.replace(/[^a-zA-Z0-9]/g, "")}`;

  // 最高點標記：靠邊時調整錨點避免出界
  const peakI = buckets.indexOf(max);
  const peakX = x(peakI);
  const peakAnchor = peakI < BUCKETS * 0.12 ? "start" : peakI > BUCKETS * 0.88 ? "end" : "middle";

  return (
    <svg width={WIDTH} height={height} viewBox={`0 0 ${WIDTH} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity={0.35} />
          <stop offset="100%" stopColor={fillColor} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={lineColor} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={peakX} cy={y(max)} r={5} fill={lineColor} />
      <text
        x={peakX}
        y={y(max) - 14}
        textAnchor={peakAnchor}
        fill={lineColor}
        style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-inter), var(--font-noto), sans-serif" }}
      >
        {Math.round(max)} m
      </text>
      <text
        x={4}
        y={height - 8}
        textAnchor="start"
        fill={lineColor}
        opacity={0.65}
        style={{ fontSize: 20, fontWeight: 600, fontFamily: "var(--font-inter), var(--font-noto), sans-serif" }}
      >
        {Math.round(min)} m
      </text>
    </svg>
  );
}
