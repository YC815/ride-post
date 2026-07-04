"use client";

import {
  Activity,
  MapPin,
  MessageSquareText,
  Palette,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { PaceParams, PosterData, RouteData } from "@/lib/types";
import { RouteInput } from "./RouteInput";
import { StatsForm } from "./StatsForm";
import { StyleControls } from "./StyleControls";

interface Props {
  poster: PosterData;
  route: RouteData | null;
  presetKey: string;
  params: PaceParams;
  exporting: boolean;
  onPosterChange: (patch: Partial<PosterData>, recomputeTime?: boolean) => void;
  onRoute: (route: RouteData) => void;
  onPresetChange: (key: string) => void;
  onParamsChange: (params: PaceParams) => void;
  onExport: () => void;
  onExportAll: () => void;
}

export function ControlPanel(props: Props) {
  const { poster, onPosterChange, exporting } = props;

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* 頁首 */}
      <header className="shrink-0 border-b bg-sidebar px-5 py-4">
        <h1 className="text-base font-semibold tracking-tight">約騎海報產生器</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          把 GPX／Strava 路線變成 IG 招募海報
        </p>
      </header>

      {/* 可捲動內容 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4">
          <Tabs
            value={poster.mode}
            onValueChange={(v) => onPosterChange({ mode: v as PosterData["mode"] })}
          >
            <TabsList className="w-full">
              <TabsTrigger value="route" className="flex-1">路線模式</TabsTrigger>
              <TabsTrigger value="no-route" className="flex-1">無路線模式</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-2 divide-y">
          {poster.mode === "route" && (
            <Section icon={MapPin} title="路線來源">
              <RouteInput route={props.route} onRoute={props.onRoute} />
            </Section>
          )}

          <Section icon={Users} title="集合資訊">
            <div className="flex flex-col gap-3">
              <Field id="title" label="標題">
                <Input id="title" value={poster.title} onChange={(e) => onPosterChange({ title: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field id="meet-time" label="集合時間">
                  <Input
                    id="meet-time"
                    placeholder="7/12（六）6:30"
                    value={poster.meetTime}
                    onChange={(e) => onPosterChange({ meetTime: e.target.value })}
                  />
                </Field>
                <Field id="meet-place" label="集合地點">
                  <Input
                    id="meet-place"
                    placeholder="捷運劍南路站 2 號出口"
                    value={poster.meetPlace}
                    onChange={(e) => onPosterChange({ meetPlace: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section icon={MessageSquareText} title="文案">
            <div className="flex flex-col gap-3">
              <Field id="caption" label="文案列">
                <Input id="caption" value={poster.caption} onChange={(e) => onPosterChange({ caption: e.target.value })} />
              </Field>
              <Field id="notes" label="備註（可多行，選填）">
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="例：自備補給・雨備取消・新手友善"
                  value={poster.notes}
                  onChange={(e) => onPosterChange({ notes: e.target.value })}
                />
              </Field>
            </div>
          </Section>

          <Section icon={Activity} title="數據與時間">
            <StatsForm
              poster={poster}
              presetKey={props.presetKey}
              params={props.params}
              onPosterChange={onPosterChange}
              onPresetChange={props.onPresetChange}
              onParamsChange={props.onParamsChange}
            />
          </Section>

          <Section icon={Palette} title="樣式">
            <StyleControls poster={poster} onChange={onPosterChange} />
          </Section>
        </div>
      </div>

      {/* 匯出列 */}
      <div className="flex flex-col gap-2 border-t bg-sidebar p-4">
        <Button size="lg" onClick={props.onExport} disabled={exporting}>
          {exporting ? "匯出中…" : "匯出 PNG"}
        </Button>
        {poster.mode === "route" && (
          <Button size="lg" variant="outline" onClick={props.onExportAll} disabled={exporting}>
            匯出全部版本（深＋淺）
          </Button>
        )}
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 px-5 py-5">
      <h2 className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
