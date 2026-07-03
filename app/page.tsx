"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ControlPanel } from "@/components/editor/ControlPanel";
import { Poster } from "@/components/poster/Poster";
import { exportPosterPng, waitFor } from "@/lib/export";
import { estimateRideTime } from "@/lib/time";
import {
  DEFAULT_POSTER,
  FORMATS,
  PACE_PRESETS,
  type PaceParams,
  type PosterData,
  type RouteData,
  type Theme,
} from "@/lib/types";

export default function Home() {
  const [poster, setPoster] = useState<PosterData>(DEFAULT_POSTER);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [presetKey, setPresetKey] = useState("normal");
  const [params, setParams] = useState<PaceParams>(PACE_PRESETS.normal.params);
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(0.4);
  const mapReadyRef = useRef(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // 預覽縮放：讓海報塞進右側可視區
  const { w: posterW, h: posterH } = FORMATS[poster.format];
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () =>
      setScale(Math.min((el.clientWidth - 48) / posterW, (el.clientHeight - 48) / posterH));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [posterW, posterH]);

  const recompute = useCallback((p: PosterData, pr: PaceParams): string => {
    const d = parseFloat(p.distanceKm);
    const e = parseFloat(p.elevationM) || 0;
    return estimateRideTime(d, e, pr) || p.timeText;
  }, []);

  const handlePosterChange = useCallback(
    (patch: Partial<PosterData>, recomputeTime = false) => {
      setPoster((prev) => {
        const next = { ...prev, ...patch };
        if (recomputeTime) next.timeText = recompute(next, params);
        return next;
      });
    },
    [params, recompute]
  );

  const handleRoute = useCallback(
    (rd: RouteData) => {
      setRoute(rd);
      setPoster((prev) => {
        const next: PosterData = {
          ...prev,
          mode: "route",
          title: rd.name || prev.title,
          distanceKm: String(rd.distanceKm),
          elevationM: String(rd.elevationM),
        };
        next.timeText = recompute(next, params);
        return next;
      });
    },
    [params, recompute]
  );

  const handleParamsChange = useCallback(
    (pr: PaceParams) => {
      setParams(pr);
      setPoster((prev) => ({ ...prev, timeText: recompute(prev, pr) }));
    },
    [recompute]
  );

  const handlePresetChange = useCallback(
    (key: string) => {
      const preset = PACE_PRESETS[key];
      if (!preset) return;
      setPresetKey(key);
      setParams(preset.params);
      setPoster((prev) => ({ ...prev, timeText: recompute(prev, preset.params) }));
    },
    [recompute]
  );

  const onMapReady = useCallback((ready: boolean) => {
    mapReadyRef.current = ready;
  }, []);

  const exportOne = useCallback(async () => {
    const node = document.getElementById("poster-root");
    if (!node) return;
    setExporting(true);
    try {
      await exportPosterPng(node, `${poster.title || "約騎海報"}-${poster.format}-${poster.theme}`);
    } finally {
      setExporting(false);
    }
  }, [poster.title, poster.theme, poster.format]);

  const exportAll = useCallback(async () => {
    const node = document.getElementById("poster-root");
    if (!node) return;
    setExporting(true);
    const original = poster.theme;
    try {
      for (const theme of ["dark", "light"] as Theme[]) {
        mapReadyRef.current = false;
        setPoster((prev) => ({ ...prev, theme }));
        await waitFor(() => mapReadyRef.current);
        await new Promise((r) => setTimeout(r, 400));
        await exportPosterPng(node, `${poster.title || "約騎海報"}-${poster.format}-${theme}`);
      }
    } finally {
      setPoster((prev) => ({ ...prev, theme: original }));
      setExporting(false);
    }
  }, [poster.theme, poster.title, poster.format]);

  return (
    <div className="flex h-screen w-full">
      <aside className="h-full w-[400px] shrink-0 border-r bg-background">
        <ControlPanel
          poster={poster}
          route={route}
          presetKey={presetKey}
          params={params}
          exporting={exporting}
          onPosterChange={handlePosterChange}
          onRoute={handleRoute}
          onPresetChange={handlePresetChange}
          onParamsChange={handleParamsChange}
          onExport={exportOne}
          onExportAll={exportAll}
        />
      </aside>

      <main
        ref={previewRef}
        className="flex h-full flex-1 items-center justify-center overflow-hidden bg-neutral-200/70"
      >
        <div style={{ width: posterW * scale, height: posterH * scale }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <Poster data={poster} route={route} onMapReady={onMapReady} />
          </div>
        </div>
      </main>
    </div>
  );
}
