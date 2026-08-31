# Good Card｜御褒美集印帳

給固定兩人使用的私人集點卡 PWA。持有者可以在手機上查看一張黑金御朱印帳風格的 3D 卡片；每完成一次卡片外的任務，由授印者增加一枚 `💮`。每張卡固定十枚章，卡片本身只呈現集點進度，不顯示任務或獎勵內容。

目前版本是可部署的純靜態展示版，尚未連接後端，也沒有授印管理功能。

## 目前完成的功能

### 3D 卡片

- CSS 3D 正反面卡片，不依賴 Three.js。
- 以多層圓角結構呈現 12px 厚度與暗金色側邊。
- 支援滑鼠與觸控上下、左右拖曳。
- 拖曳放開後具有慣性與自然減速。
- 點擊、Enter 或 Space 可以翻面。
- 動態金色反光會跟隨拖曳位置與卡片角度。
- 開場旋轉一圈後停在正面；使用者開始操作時會立即取得控制權。

### 集點卡內容

- 黑金御朱印帳視覺。
- 使用 `Yuji Syuku` 與 `Noto Serif JP` 日文字體。
- 每張卡固定十個位置，已獲得的章顯示為 `💮`。
- 自動計算並顯示章數、剩餘章數與日文數字。
- 正面顯示集點進度，背面顯示卡號、持有者與授印者。
- 卡片內容由 `CardData` 驅動，不再寫死於元件。

### 動畫與使用體驗

- 第一次使用會顯示左右滑動提示，成功拖曳後不再顯示。
- 使用 `localStorage` 記錄每張卡上次已看過的章數。
- 收到新章時會播放落印、回彈與朱紅墨圈動畫。
- 一次增加多枚章時會依序播放。
- 第十枚章會觸發「満願成就」、十枚同步金色發光、自動翻面與背面滿願印動畫。
- 若使用者已開始操作，不會強制自動翻面。

### 手機與穩定性

- 使用 `100svh` 與 iPhone safe-area，避免瀏海及 Home Indicator 遮住內容。
- 卡片尺寸會同時依畫面寬度與高度調整。
- 支援低高度與橫向螢幕。
- 頁面進入背景時暫停 `requestAnimationFrame`，回到前景後重新同步時間。
- 支援 `prefers-reduced-motion`，減少動態偏好下會停用非必要動畫。
- 提供日文載入骨架、錯誤訊息與重試畫面。

### PWA

- 可由 iPhone Safari「分享 → 加入主畫面」。
- 使用 standalone 模式，從桌面開啟時不顯示 Safari 網址列。
- 提供黑金「印」圖示、Apple Touch Icon、theme color 與啟動背景色。
- production build 會註冊 Service Worker。
- 首頁採網路優先策略，斷線時回退到快取。
- 同源 CSS、JavaScript 與圖示採快取優先策略。
- 開發模式不註冊 Service Worker，避免舊快取干擾 HMR。

## 技術

- React 19
- TypeScript 6
- Vite 8
- React Compiler
- CSS 3D Transforms
- Pointer Events
- Web App Manifest
- Service Worker / Cache API
- pnpm

目前沒有 UI、3D、路由或狀態管理套件。

## 開始開發

需求：Node.js 22 以上與 pnpm。

```bash
pnpm install
pnpm dev
```

預設開發網址：

```text
http://localhost:5173
```

其他指令：

```bash
pnpm lint
pnpm build
pnpm preview
```

`pnpm preview` 可用來檢查 production build。Service Worker 只會在 production 模式註冊。

## 專案結構

```text
public/
├── app-icon.svg
├── icons/
├── manifest.webmanifest
└── sw.js

src/
├── components/
│   ├── Card.tsx
│   ├── CardFront.tsx
│   ├── CardBack.tsx
│   ├── CardEdges.tsx
│   ├── StampGrid.tsx
│   ├── Stamp.tsx
│   ├── CardLoading.tsx
│   └── CardError.tsx
├── data/
│   └── cards.ts
├── services/
│   └── loadCard.ts
├── types/
│   └── card.ts
├── utils/
│   └── formatJapaneseNumber.ts
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

## 卡片資料

目前靜態資料位於 `src/data/cards.ts`，結構定義位於 `src/types/card.ts`。

```ts
type StampData = {
  id: string;
  awardedAt: string;
};

type CardData = {
  id: string;
  serialNumber: number;
  label: string;
  title: string;
  ownerName: string;
  issuerName: string;
  totalStamps: 10;
  stamps: StampData[];
  themeId: "black-gold";
  createdAt: string;
  completedAt: string | null;
};
```

章數由 `stamps.length` 計算，不另外保存 `stampCount`、剩餘章數或完成狀態，避免資料互相矛盾。

若要測試不同進度，可以在 `cards.ts` 增減 `stamps`。正式部署前請確認測試章已移除。

## 靜態部署

Zeabur 或其他靜態託管平台可使用：

```text
Build Command: pnpm build
Output Directory: dist
```

PWA 與 Service Worker 必須在 HTTPS 或 localhost 環境運作。部署完成後，使用 iPhone Safari 開啟網址，再選擇「分享 → 加入主畫面」。

每次修改 Service Worker 的快取規則或需要強制淘汰舊快取時，請更新 `public/sw.js`：

```js
const cacheName = "good-card-v2";
```

## 目前限制

- 卡片資料仍編譯在前端程式中，修改章數後需要重新部署。
- 沒有登入、身份驗證或權限控制。
- 沒有後端 API 與資料庫。
- 沒有授印、撤回或建立新卡的管理頁。
- `localStorage` 只記錄查看狀態，不負責同步卡片資料。
- Google Fonts 需要網路；離線時會使用系統日文字體 fallback。
- Service Worker 目前只處理靜態資源，不快取未來的 API 資料。

## 未來規劃

### 後端與同步

- 在 Zeabur 部署 API 與資料庫。
- 前端、後台與 API 使用同一網域。
- 後端採用 Node.js API，資料庫使用 PostgreSQL。
- 由後端保存卡片、每枚章與授印時間。
- 查看頁自動同步最新章數。
- 設計 API 的快取、離線與重新整理策略。

### 私人查看頁

- 使用專屬且難猜的查看連結，例如 `/card/:token`；token 綁定整個收藏，而不是單張卡片。
- 建立下一張卡後仍沿用原本的私人連結，並能查看目前卡片與所有歷史卡片。
- 授印者可以重新產生查看 token，使舊連結失效。
- 對方只能查看、旋轉與收藏卡片。
- 加入卡片不存在、連結失效與網路錯誤狀態。

### 授印管理頁

- 建立受身份驗證保護的 `/admin`。
- 系統固定只有一位授印者／管理者，不提供公開註冊。
- 授印者可以增加一枚章。
- 只能撤回目前進行中卡片的最後一枚誤蓋章。
- 集滿十枚後，由授印者選擇主題並手動建立下一張卡。
- 建立下一張卡時，卡號自動遞增，持有者、授印者、標籤與標題沿用不變。
- 新卡建立後，上一張卡永久鎖定，不再允許授印或撤回。
- 同一時間只能有一張進行中的卡片。
- 管理頁與查看頁共用同一個唯讀 `Card` 元件。

### 多卡收藏

- 保留已滿願的舊卡。
- 建立卡片收藏列表與選擇介面。
- 收藏列表使用靜態縮圖，只有選中的卡片執行 3D 動畫。
- 每張卡各自保存 `themeId`，讓歷史卡片保留原本的視覺主題。

### 內建主題

第一版規劃三個由程式定義的主題，資料庫只保存 `themeId`：

- `black-gold`：目前的黑金御朱印帳。
- `vermilion-ivory`：朱紅與象牙白，呈現傳統印章與和紙感。
- `indigo-silver`：藍染與銀色，呈現沉靜的夜色感。

三個主題共用相同的卡片元件、尺寸、版面、章位、手勢與動畫；主題只調整底色、紋理、邊框、側邊、文字、空章格、反光與滿願效果。建立新卡時可重複選擇曾使用過的主題。

### 後續品質

- 將 Google Fonts 改為自託管，改善離線與載入穩定性。
- 加入單元測試與互動測試。
- 使用真實 iPhone 測試安裝、safe-area、觸控慣性與離線模式。
- 視需求加入錯誤監控與基本使用分析。

## 產品原則

- 卡片只呈現集點結果，不顯示任務。
- 查看頁不提供授印操作。
- 系統固定只有一位授印者，只有授印者能增加或撤回章。
- 每張卡固定十枚章。
- 私人查看連結屬於整個收藏，建立新卡時不需更換連結。
- 滿願後保留舊卡，由授印者選擇主題並手動建立下一張。
- 建立下一張卡後，舊卡永久鎖定。
