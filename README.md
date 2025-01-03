# 用戶評論分析平台

這是一個基於 Next.js 開發的用戶評論分析平台，專門用於分析和視覺化用戶評論數據。本專案整合了自然語言處理和機器學習技術，能夠自動化處理大量文本數據，並生成深入的分析洞察。

## 功能特點

### 數據處理
- 支援多種檔案格式（CSV、XLSX、XLS）
- 自動編碼識別（UTF-8、Big5）
- 智能欄位匹配
- 大檔案處理優化

### 分析功能
- 情感分析
  - 正面/負面/中性情緒識別
  - 情感趨勢追蹤
- 關鍵詞提取
  - 自動識別重要詞彙
  - 詞頻統計
- 分類分析
  - 自動評論分類
  - 類別分布統計

### 視覺化
- 互動式圖表
  - 情感分布圓餅圖
  - 關鍵詞統計條形圖
  - 評分分布趨勢圖
  - 月度趨勢分析圖
- 動態文字雲
  - 關鍵詞視覺化展示
  - 自適應佈局

### AI 洞察
- 整合 Google Gemini AI
- 自動生成分析報告
- 提供改進建議
- 識別關鍵問題

## 技術架構

- **前端框架**: Next.js 14
- **UI 框架**: Tailwind CSS
- **圖表庫**: Recharts
- **AI 模型**: Google Gemini-1.5-pro
- **數據處理**: XLSX, CSV-Parse
- **視覺化**: D3.js

## 環境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Google Gemini API 金鑰
