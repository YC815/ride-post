"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseGpx } from "@/lib/gpx";
import type { RouteData } from "@/lib/types";

interface Props {
  route: RouteData | null;
  onRoute: (route: RouteData) => void;
}

export function RouteInput({ route, onRoute }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadStrava() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/strava", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "讀取失敗");
      const data = parseGpx(body.gpx);
      onRoute({ ...data, name: body.name || data.name });
    } catch (e) {
      setError(e instanceof Error ? e.message : "讀取失敗");
    } finally {
      setLoading(false);
    }
  }

  async function loadFile(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      onRoute(parseGpx(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "GPX 解析失敗");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="strava-url">Strava 路線連結</Label>
        <div className="flex gap-2">
          <Input
            id="strava-url"
            placeholder="https://www.strava.com/routes/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && url && loadStrava()}
          />
          <Button onClick={loadStrava} disabled={!url || loading}>
            {loading ? "讀取中…" : "讀取"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="gpx-file">或上傳 GPX 檔</Label>
        <Input
          id="gpx-file"
          ref={fileRef}
          type="file"
          accept=".gpx,application/gpx+xml"
          onChange={(e) => loadFile(e.target.files?.[0])}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {route && (
        <p className="text-sm text-muted-foreground">
          已載入：{route.name || "未命名路線"}（{route.distanceKm} km／爬升 {route.elevationM} m）
        </p>
      )}
    </div>
  );
}
