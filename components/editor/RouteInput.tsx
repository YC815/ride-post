"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseGpx } from "@/lib/gpx";
import type { RouteData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  route: RouteData | null;
  onRoute: (route: RouteData) => void;
}

export function RouteInput({ route, onRoute }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
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
        <Label htmlFor="strava-url" className="text-muted-foreground">Strava 路線連結</Label>
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
        <Label className="text-muted-foreground">或上傳 GPX 檔</Label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            loadFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center transition-colors",
            "hover:border-ring hover:bg-accent/50",
            dragOver ? "border-ring bg-accent" : "border-input"
          )}
        >
          <FileUp className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium">拖曳 GPX 到此，或點擊選擇</span>
          <span className="text-xs text-muted-foreground">支援 .gpx 檔案</span>
        </button>
        <Input
          ref={fileRef}
          type="file"
          accept=".gpx,application/gpx+xml"
          className="hidden"
          onChange={(e) => loadFile(e.target.files?.[0])}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {route && (
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{route.name || "未命名路線"}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {route.distanceKm} km · 爬升 {route.elevationM} m
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
