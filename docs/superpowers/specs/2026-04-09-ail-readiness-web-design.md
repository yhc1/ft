# AIL Readiness Assessment Web Presentation — Design Spec

**Date:** 2026-04-09  
**Context:** 將現有的 AIL Readiness Assessment PDF 轉為互動式網頁，供會議導讀及客戶自讀使用。

---

## 使用情境

- **主要場景：** 顧問與客戶在會議中一起看，顧問主導導讀流程
- **次要場景：** 會議結束後客戶拿回去自行閱讀，可以自己操作互動功能

---

## 整體版面

**側邊欄 + 內容區** 布局：

- 左側：固定側邊欄
  - 頂部：「Readiness Check」入口按鈕（最顯眼）
  - 下方：9 個 dimension 清單，各帶顏色指示（見下方說明）
- 右側：對應的內容區

---

## Readiness Check 頁面

側邊欄頂部的獨立入口，會議開始時的第一站。

### 上半部：Prerequisites 勾選清單

- 列出所有 prerequisites 的去重全域清單（tag 形式）
- 客戶勾選他們目前擁有的資料/資源
- 勾選即時觸發下方矩陣更新，同時更新側邊欄各 dimension 的顏色指示

### 下半部：Use Case × Prerequisite 矩陣

| Use Case | Prereq 1 | Prereq 2 | Prereq 3 | ... | Ready? |
|---|---|---|---|---|---|
| Automated Fact-Checking | ● | ● | – | ... | ✓ |
| Image-Based Identity Verification | – | ● | ✗ | ... | ✗ |

- 每列：一個 use case（所有 9 個 dimensions 的 use cases 全部列出）
- 每欄：該 use case 所需的 prerequisite（● = 需要且已有，✗ = 需要且沒有，– = 不需要）
- 最後一欄：整體就緒狀態（綠✓ = 所有需要的都有，紅✗ = 有缺）

### 側邊欄顏色指示（勾選後同步更新）

- 🟢 綠：該 dimension 所有 use cases 全部 ready
- 🟡 橙：部分 use cases ready
- 🔴 紅：沒有任何 use cases ready

---

## 各 Dimension 頁面

點擊側邊欄進入，共 9 個：

1. Investigative Reporting
2. Interactive Data Visualization
3. Fact Checking
4. Content Optimisation
5. Publishing & Platform Promotion
6. Personalised Recommendations & Interaction
7. Advertising
8. Subscription Growth
9. User Retention & Lifetime Value

### 頁面結構（由上到下）

**1. Prerequisites**
- 編號清單，含子項目
- 無互動，純展示

**2. Modelling Processes & Model Outputs**
- 表格：Use Case / Required Data / Modelling Process / Model Output / Reference Case
- Reference Case 欄：純文字，不可互動

**3. Technical Assessments（預設折疊）**
- 視覺上以虛線與上方內容分隔
- 顯示標題 + 展開按鈕
- 點擊後展開完整內容（各評估點：粗體標題 + 說明段落）
- 會議中自然略過，客戶自讀時自行展開

---

## Foundational Requirements

PDF 第一頁有跨所有 dimensions 的基礎要求（Data Accessibility、System Interoperability）。

放置位置：**側邊欄獨立靜態頁面**，位於「Readiness Check」下方、9 個 dimensions 清單上方。讓客戶在會議開始時先了解基礎前提，再進行 Readiness Check。

---

## 技術方向（待 writing-plans 階段決定細節）

- 純前端靜態網頁（HTML / CSS / JavaScript），不需要後端
- 勾選狀態存於 localStorage，客戶重新開啟時保留上次勾選結果
- 資料從 JSON 檔案讀取（方便日後更新內容不需改程式碼）
