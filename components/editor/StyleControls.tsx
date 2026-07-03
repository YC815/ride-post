"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACCENTS, FORMATS, GRADIENT_PRESETS, type PosterData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  poster: PosterData;
  onChange: (patch: Partial<PosterData>) => void;
}

export function StyleControls({ poster, onChange }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label>輸出比例</Label>
        <Tabs value={poster.format} onValueChange={(v) => onChange({ format: v as PosterData["format"] })}>
          <TabsList className="w-full">
            {Object.entries(FORMATS).map(([key, f]) => (
              <TabsTrigger key={key} value={key} className="flex-1">{f.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {poster.format === "story" && (
          <p className="text-xs text-muted-foreground">
            限動上下各 250px 會被 IG 介面蓋住，版面已自動避開；預覽的藍色虛線不會匯出。
          </p>
        )}
      </div>
      {poster.mode === "route" && (
        <div className="flex flex-col gap-2">
          <Label>主題</Label>
          <Tabs value={poster.theme} onValueChange={(v) => onChange({ theme: v as PosterData["theme"] })}>
            <TabsList className="w-full">
              <TabsTrigger value="dark" className="flex-1">深色電影感</TabsTrigger>
              <TabsTrigger value="light" className="flex-1">淺色清爽</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>強調色</Label>
        <div className="flex gap-3">
          {Object.entries(ACCENTS).map(([key, a]) => (
            <button
              key={key}
              type="button"
              title={a.label}
              aria-label={`強調色：${a.label}`}
              onClick={() => onChange({ accent: key })}
              className={cn(
                "size-9 rounded-full border-2 transition-transform",
                poster.accent === key ? "scale-110 border-foreground" : "border-transparent"
              )}
              style={{ background: a.color }}
            />
          ))}
        </div>
      </div>

      {poster.mode === "no-route" && (
        <>
          <div className="flex flex-col gap-2">
            <Label>背景漸層</Label>
            <div className="flex gap-3">
              {Object.entries(GRADIENT_PRESETS).map(([key, g]) => (
                <button
                  key={key}
                  type="button"
                  title={g.label}
                  aria-label={`背景：${g.label}`}
                  onClick={() => onChange({ bgPreset: key, bgImage: null })}
                  className={cn(
                    "h-12 flex-1 rounded-md border-2 transition-transform",
                    poster.bgPreset === key && !poster.bgImage ? "scale-105 border-foreground" : "border-transparent"
                  )}
                  style={{ background: `linear-gradient(160deg, ${g.from}, ${g.to})` }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bg-image">或上傳背景圖片</Label>
            <Input
              id="bg-image"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onChange({ bgImage: reader.result as string });
                reader.readAsDataURL(file);
              }}
            />
            {poster.bgImage && (
              <button
                type="button"
                className="self-start text-sm text-muted-foreground underline"
                onClick={() => onChange({ bgImage: null })}
              >
                移除圖片，改用漸層
              </button>
            )}
          </div>
        </>
      )}

      {poster.mode === "route" && (
        <div className="flex items-center justify-between">
          <Label htmlFor="show-profile">顯示海拔剖面圖</Label>
          <Switch
            id="show-profile"
            checked={poster.showProfile}
            onCheckedChange={(v) => onChange({ showProfile: v })}
          />
        </div>
      )}
    </div>
  );
}
