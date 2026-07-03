#!/usr/bin/env node
// 一次性 Strava OAuth 授權腳本：換取 refresh token 供 .env.local 使用
// 前置：到 https://www.strava.com/settings/api 建立 API 應用程式
//（Authorization Callback Domain 填 localhost）

import { createInterface } from "node:readline/promises";

const rl = createInterface({ input: process.stdin, output: process.stdout });

const clientId = (await rl.question("Client ID: ")).trim();
const clientSecret = (await rl.question("Client Secret: ")).trim();

const authUrl =
  `https://www.strava.com/oauth/authorize?client_id=${clientId}` +
  `&redirect_uri=http://localhost/exchange_token&response_type=code` +
  `&approval_prompt=force&scope=read,read_all`;

console.log("\n1. 用瀏覽器打開下面的網址並按「授權」：\n");
console.log(`   ${authUrl}\n`);
console.log("2. 授權後會跳轉到打不開的 localhost 頁面——這是正常的。");
console.log("   把網址列裡 code= 後面那串複製下來（& 之前）。\n");

const code = (await rl.question("Authorization code: ")).trim();
rl.close();

const res = await fetch("https://www.strava.com/oauth/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
  }),
});

if (!res.ok) {
  console.error(`\n交換失敗（${res.status}）：${await res.text()}`);
  process.exit(1);
}

const body = await res.json();
console.log("\n成功！把下面三行存成專案根目錄的 .env.local，然後重啟伺服器：\n");
console.log(`STRAVA_CLIENT_ID=${clientId}`);
console.log(`STRAVA_CLIENT_SECRET=${clientSecret}`);
console.log(`STRAVA_REFRESH_TOKEN=${body.refresh_token}`);
