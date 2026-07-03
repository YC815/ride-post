# 約騎海報產生器

把 GPX 檔或 Strava 路線連結變成 Instagram 4:5（1080×1350，實際輸出 2160×2700）的約騎招募海報。

## 使用

```bash
npm run build
npm start
```

打開 http://localhost:3000：

- **路線模式**：貼 Strava 路線連結或上傳 GPX → 自動算出距離、爬升、預估時間（含休息），地圖（繁中地標）+ 海拔剖面
- **無路線模式**：選漸層背景或上傳圖片，手動輸入數據
- 標題、副標、文案、備註、數據全部可編輯；深色／淺色主題可切換，可一鍵匯出兩種版本

## 預估時間公式

```
騎乘時間 = 距離 ÷ 平路均速 + 爬升 ÷ 爬升速率
總時間   = 騎乘時間 + 騎乘小時數 × 每小時休息 + 15 分鐘集合緩衝（取整到 15 分鐘）
```

強度預設：輕鬆（18 km/h・400 m/h・休 15 分/hr）／一般（22・500・12）／進階（26・650・8），可在「進階時間參數」微調。

## Strava 連結功能的一次性設定

1. 到 <https://www.strava.com/settings/api> 建立 API 應用程式（Authorization Callback Domain 填 `localhost`）
2. 跑 `node scripts/strava-setup.mjs`，照指示完成授權
3. 把腳本印出的三行存成 `.env.local`，重啟伺服器

沒設定也能用：改用 Strava 路線頁右側「匯出 GPX」下載後上傳即可。

## 技術

Next.js App Router／MapLibre GL + OpenFreeMap（免金鑰向量圖磚，地標強制繁中）／html-to-image 匯出。地圖資料 © OpenStreetMap 貢獻者。
