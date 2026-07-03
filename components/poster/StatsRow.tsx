interface StatItem {
  label: string;
  value: string;
  unit?: string;
}

interface Props {
  items: StatItem[];
  labelColor: string;
  valueColor: string;
  /** 置中放大版（無路線模式） */
  centered?: boolean;
}

export function StatsRow({ items, labelColor, valueColor, centered = false }: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: centered ? "center" : "space-between",
        gap: centered ? 72 : 24,
      }}
    >
      {items.map((it) => {
        const long = it.value.length > 5;
        return (
          <div
            key={it.label}
            style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: centered ? "center" : "flex-start" }}
          >
            <div style={{ fontSize: 25, fontWeight: 500, letterSpacing: 2, color: labelColor }}>
              {it.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, whiteSpace: "nowrap" }}>
              <span
                style={{
                  fontSize: long ? 46 : 64,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: valueColor,
                  fontFamily: "var(--font-inter), var(--font-noto), sans-serif",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: -1,
                }}
              >
                {it.value || "—"}
              </span>
              {it.unit && (
                <span style={{ fontSize: 29, fontWeight: 700, color: labelColor }}>{it.unit}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
