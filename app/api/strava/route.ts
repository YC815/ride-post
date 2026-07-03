import { NextResponse } from "next/server";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
    }),
  });
  if (!res.ok) {
    throw new Error("Strava 授權失敗，請確認 .env.local 的憑證是否正確");
  }
  const body = (await res.json()) as { access_token: string; expires_at: number };
  cachedToken = { token: body.access_token, expiresAt: body.expires_at * 1000 };
  return body.access_token;
}

export async function POST(req: Request) {
  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  const input = String(url ?? "").trim();
  const match = input.match(/routes\/(\d+)/) ?? input.match(/^(\d{5,})$/);
  if (!match) {
    return NextResponse.json({ error: "無法從連結解析出路線 ID" }, { status: 400 });
  }

  if (!process.env.STRAVA_CLIENT_ID || !process.env.STRAVA_CLIENT_SECRET || !process.env.STRAVA_REFRESH_TOKEN) {
    return NextResponse.json(
      { error: "Strava API 未設定：請依 README 建立 .env.local 並重啟" },
      { status: 501 }
    );
  }

  try {
    const token = await getAccessToken();
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    const id = match[1];

    const [metaRes, gpxRes] = await Promise.all([
      fetch(`https://www.strava.com/api/v3/routes/${id}`, auth),
      fetch(`https://www.strava.com/api/v3/routes/${id}/export_gpx`, auth),
    ]);

    if (!gpxRes.ok) {
      const msg =
        gpxRes.status === 404
          ? "找不到路線：確認連結正確，且路線為公開（或屬於你授權的帳號）"
          : `Strava 回應 ${gpxRes.status}，稍後再試`;
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const meta = metaRes.ok ? ((await metaRes.json()) as { name?: string }) : {};
    return NextResponse.json({ name: meta.name ?? "", gpx: await gpxRes.text() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Strava 讀取失敗" },
      { status: 502 }
    );
  }
}
