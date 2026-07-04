"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PACE_PRESETS, type PaceParams, type PosterData } from "@/lib/types";

interface Props {
  poster: PosterData;
  presetKey: string;
  params: PaceParams;
  onPosterChange: (patch: Partial<PosterData>, recomputeTime?: boolean) => void;
  onPresetChange: (key: string) => void;
  onParamsChange: (params: PaceParams) => void;
}

export function StatsForm({ poster, presetKey, params, onPosterChange, onPresetChange, onParamsChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="距離 (km)" id="distance">
          <Input
            id="distance"
            value={poster.distanceKm}
            onChange={(e) => onPosterChange({ distanceKm: e.target.value }, true)}
          />
        </Field>
        <Field label="總爬升 (m)" id="elevation">
          <Input
            id="elevation"
            value={poster.elevationM}
            onChange={(e) => onPosterChange({ elevationM: e.target.value }, true)}
          />
        </Field>
      </div>

      <Field label="預估時間（自動計算，可手改）" id="time">
        <Input
          id="time"
          value={poster.timeText}
          onChange={(e) => onPosterChange({ timeText: e.target.value })}
        />
      </Field>

      <Field label="騎乘強度" id="pace">
        <Select value={presetKey} onValueChange={onPresetChange}>
          <SelectTrigger id="pace" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PACE_PRESETS).map(([key, p]) => (
              <SelectItem key={key} value={key}>
                {p.label}（{p.params.flatSpeed} km/h・爬升 {p.params.climbRate} m/h）
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between px-2 text-muted-foreground">
            進階時間參數
            <ChevronsUpDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <NumField label="平路 km/h" value={params.flatSpeed} onChange={(v) => onParamsChange({ ...params, flatSpeed: v })} />
            <NumField label="爬升 m/h" value={params.climbRate} onChange={(v) => onParamsChange({ ...params, climbRate: v })} />
            <NumField label="休息 分/hr" value={params.restPerHour} onChange={(v) => onParamsChange({ ...params, restPerHour: v })} />
          </div>
          <p className="pt-2 text-xs text-muted-foreground">
            時間 = 距離÷平路均速 + 爬升÷爬升速率，再加每小時休息與 15 分鐘集合緩衝。
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (isFinite(v) && v > 0) onChange(v);
        }}
      />
    </div>
  );
}
