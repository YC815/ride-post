"use client";

import {
  ACCENTS,
  FORMATS,
  GRADIENT_PRESETS,
  STORY_SAFE,
  type PosterData,
  type RouteData,
} from "@/lib/types";
import { ElevationProfile } from "./ElevationProfile";
import { RouteMap, type FitPadding } from "./RouteMap";
import { StatsRow } from "./StatsRow";

const M = 64; // 左右安全邊距

/** 各比例的版面參數：story 上下避開 IG 系統介面遮擋區 */
const LAYOUT = {
  post: {
    topInset: M,
    bottomInset: 54,
    darkFit: { top: 400, bottom: 620, left: 110, right: 110 } as FitPadding,
    topScrimH: 500,
    bottomScrimH: 700,
    lightMapH: 640,
    lightPanelPad: "40px 64px 46px",
    noRouteInset: "88px 64px 72px",
  },
  story: {
    topInset: STORY_SAFE + 30,
    bottomInset: STORY_SAFE + 30,
    darkFit: { top: 660, bottom: 880, left: 110, right: 110 } as FitPadding,
    topScrimH: 760,
    bottomScrimH: 980,
    lightMapH: 1010,
    lightPanelPad: "44px 64px 274px",
    noRouteInset: "292px 64px 292px",
  },
} as const;

interface Props {
  data: PosterData;
  route: RouteData | null;
  onMapReady?: (ready: boolean) => void;
}

export function Poster({ data, route, onMapReady }: Props) {
  const accent = ACCENTS[data.accent]?.color ?? ACCENTS.orange.color;
  const { w, h } = FORMATS[data.format];

  return (
    <div
      id="poster-root"
      style={{
        width: w,
        height: h,
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-noto), sans-serif",
        background: "#111722",
      }}
    >
      {data.mode === "route" ? (
        route ? (
          data.theme === "dark" ? (
            <RouteDark data={data} route={route} accent={accent} onMapReady={onMapReady} />
          ) : (
            <RouteLight data={data} route={route} accent={accent} onMapReady={onMapReady} />
          )
        ) : (
          <Placeholder />
        )
      ) : (
        <NoRoute data={data} accent={accent} />
      )}
      {data.format === "story" && <StorySafeGuide h={h} />}
    </div>
  );
}

/* ---------- 深色主題：地圖全幅背景 ---------- */

function RouteDark({ data, route, accent, onMapReady }: Props & { route: RouteData; accent: string }) {
  const L = LAYOUT[data.format];
  return (
    <>
      <RouteMap
        key={data.format}
        points={route.points}
        theme="dark"
        accentColor={accent}
        fitPadding={L.darkFit}
        onReadyChange={onMapReady}
      />
      <Scrim direction="bottom" height={L.topScrimH} strength={0.88} />
      <Scrim direction="top" height={L.bottomScrimH} strength={0.92} />

      <div style={{ position: "absolute", top: L.topInset, left: M, right: M }}>
        <Header data={data} color="#FFFFFF" subColor="rgba(255,255,255,0.92)" accent={accent} />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: L.bottomInset,
          left: M,
          right: M,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {data.showProfile && (
          <ElevationProfile points={route.points} height={190} lineColor="rgba(255,255,255,0.92)" fillColor="#FFFFFF" />
        )}
        <StatsRow items={statItems(data)} labelColor="rgba(255,255,255,0.62)" valueColor="#FFFFFF" />
        <Caption text={data.caption} accent={accent} color="#FFFFFF" />
        <Notes text={data.notes} color="rgba(255,255,255,0.55)" />
      </div>

      <Credit color="rgba(255,255,255,0.4)" />
    </>
  );
}

/* ---------- 淺色主題：上地圖、下卡片 ---------- */

function RouteLight({ data, route, accent, onMapReady }: Props & { route: RouteData; accent: string }) {
  const L = LAYOUT[data.format];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ position: "relative", height: L.lightMapH, flexShrink: 0 }}>
        <RouteMap
          key={data.format}
          points={route.points}
          theme="light"
          accentColor={accent}
          fitPadding={{ top: 90, bottom: 90, left: 90, right: 90 }}
          onReadyChange={onMapReady}
        />
        <Credit color="rgba(0,0,0,0.38)" />
      </div>
      <div
        style={{
          flex: 1,
          background: "#FAF9F7",
          padding: L.lightPanelPad,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 18,
        }}
      >
        <Header data={data} color="#1A1A1A" subColor="#1A1A1A" accent={accent} />
        {data.showProfile && (
          <ElevationProfile points={route.points} height={150} lineColor={accent} fillColor={accent} />
        )}
        <StatsRow items={statItems(data)} labelColor="rgba(0,0,0,0.5)" valueColor="#1A1A1A" />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Caption text={data.caption} accent={accent} color="#1A1A1A" />
          <Notes text={data.notes} color="rgba(0,0,0,0.5)" />
        </div>
      </div>
    </div>
  );
}

/* ---------- 無路線模式：漸層 / 圖片背景 ---------- */

function NoRoute({ data, accent }: { data: PosterData; accent: string }) {
  const g = GRADIENT_PRESETS[data.bgPreset] ?? GRADIENT_PRESETS.night;
  const { w, h } = FORMATS[data.format];
  return (
    <>
      {data.bgImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.bgImage}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <Scrim direction="bottom" height={h * 0.42} strength={0.8} />
          <Scrim direction="top" height={h * 0.52} strength={0.88} />
        </>
      ) : (
        <>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${g.from} 0%, ${g.to} 100%)` }} />
          <ContourPattern w={w} h={h} />
        </>
      )}

      <div
        style={{
          position: "absolute",
          inset: LAYOUT[data.format].noRouteInset,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Header data={data} color="#FFFFFF" subColor="rgba(255,255,255,0.92)" accent={accent} />
        <div style={{ display: "flex", flexDirection: "column", gap: 56, alignItems: "center" }}>
          <div style={{ width: 72, height: 6, background: accent, borderRadius: 3 }} />
          <StatsRow items={statItems(data)} labelColor="rgba(255,255,255,0.62)" valueColor="#FFFFFF" centered />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center", textAlign: "center" }}>
          <Caption text={data.caption} accent={accent} color="#FFFFFF" centered />
          <Notes text={data.notes} color="rgba(255,255,255,0.55)" centered />
        </div>
      </div>
    </>
  );
}

/* ---------- 共用區塊 ---------- */

function statItems(data: PosterData) {
  return [
    { label: "距離", value: data.distanceKm, unit: "km" },
    { label: "總爬升", value: data.elevationM, unit: "m" },
    { label: "預估時間", value: data.timeText },
  ];
}

function Header({ data, color, subColor, accent }: {
  data: PosterData; color: string; subColor: string; accent: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div style={{ fontSize: 74, fontWeight: 900, lineHeight: 1.18, letterSpacing: -1, color }}>
        {data.title}
      </div>
      {(data.meetTime || data.meetPlace) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            borderLeft: `8px solid ${accent}`,
            paddingLeft: 22,
          }}
        >
          <MeetRow label="集合時間" value={data.meetTime} accent={accent} color={subColor} />
          <MeetRow label="集合地點" value={data.meetPlace} accent={accent} color={subColor} />
        </div>
      )}
    </div>
  );
}

function MeetRow({ label, value, accent, color }: {
  label: string; value: string; accent: string; color: string;
}) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
      <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4, color: accent, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 35, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</span>
    </div>
  );
}

function Caption({ text, accent, color, centered = false }: {
  text: string; accent: string; color: string; centered?: boolean;
}) {
  if (!text) return null;
  return (
    <div style={{ fontSize: 34, fontWeight: 700, color, textAlign: centered ? "center" : "left" }}>
      <span style={{ color: accent }}>「</span>
      {text}
      <span style={{ color: accent }}>」</span>
    </div>
  );
}

function Notes({ text, color, centered = false }: { text: string; color: string; centered?: boolean }) {
  if (!text) return null;
  return (
    <div
      style={{
        fontSize: 23,
        fontWeight: 400,
        color,
        whiteSpace: "pre-wrap",
        lineHeight: 1.5,
        textAlign: centered ? "center" : "left",
      }}
    >
      {text}
    </div>
  );
}

function Credit({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", bottom: 10, right: 16, fontSize: 16, color, zIndex: 5 }}>
      地圖資料 © OpenStreetMap
    </div>
  );
}

function Scrim({ direction, height, strength }: { direction: "top" | "bottom"; height: number; strength: number }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    height,
    pointerEvents: "none",
  };
  if (direction === "top") {
    style.bottom = 0;
    style.background = `linear-gradient(to top, rgba(5,8,14,${strength}) 0%, rgba(5,8,14,${strength}) 22%, rgba(5,8,14,${strength * 0.6}) 55%, transparent 100%)`;
  } else {
    style.top = 0;
    style.background = `linear-gradient(to bottom, rgba(5,8,14,${strength}) 0%, rgba(5,8,14,${strength * 0.45}) 50%, transparent 100%)`;
  }
  return <div style={style} />;
}

/** 限動安全區輔助線：只在預覽顯示，匯出時由 export filter 排除 */
function StorySafeGuide({ h }: { h: number }) {
  const line: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    borderTop: "3px dashed rgba(56,189,248,0.65)",
  };
  return (
    <div data-export-exclude style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
      <div style={{ ...line, top: STORY_SAFE }} />
      <div style={{ ...line, top: h - STORY_SAFE }} />
      <div
        style={{
          position: "absolute",
          top: STORY_SAFE + 10,
          right: 16,
          fontSize: 22,
          color: "rgba(56,189,248,0.85)",
        }}
      >
        ↑ IG 系統介面遮擋區（不會匯出這條線）
      </div>
    </div>
  );
}

function Placeholder() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.45)",
        fontSize: 34,
        background: "linear-gradient(160deg, #131A26 0%, #1B2434 100%)",
      }}
    >
      上傳 GPX 或貼上 Strava 路線連結
    </div>
  );
}

/** 等高線紋理：兩組同心橢圓，白色 6% 疊在漸層上保持質感 */
function ContourPattern({ w, h }: { w: number; h: number }) {
  const groups = [
    { cx: w * 0.28, cy: h * 0.76, rot: -18 },
    { cx: w * 0.81, cy: h * 0.19, rot: 24 },
  ];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
      {groups.map((g, gi) => (
        <g key={gi} transform={`rotate(${g.rot} ${g.cx} ${g.cy})`}>
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse
              key={i}
              cx={g.cx}
              cy={g.cy}
              rx={70 + i * 78 + (i % 3) * 14}
              ry={44 + i * 58 + ((i + 1) % 3) * 10}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={2}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
