'use client';

import { useState, useRef } from 'react';
import type { AnalysisResult } from '@/types/feedback';
import Image from "next/image";
import { SentimentPieChart } from './components/charts/SentimentPieChart';
import { KeywordsBarChart } from './components/charts/KeywordsBarChart';
import { WordCloud } from './components/charts/WordCloud';
import { MonthlyTrendChart, RatingDistributionChart } from './components/charts/TrendChart';
import { CategoryBarChart } from './components/charts/CategoryBarChart';

// 自定義 Logo SVG 組件 - AI 字樣
const LogoSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <g transform="scale(0.213333)">
      <rect width="150" height="150" fill="#F9F9F9"/>    
      {/* 中間大四角星 */}
      <path d="M96.1375 51.2609C101.308 50.3007 104.299 47.2723 105.149 42.1759C105.684 47.0877 109.432 50.633 114.086 51.2239C108.971 52.1657 105.961 55.1755 105.112 60.3273C104.853 57.9822 103.93 55.9141 102.268 54.2153C100.569 52.5165 98.5195 51.5563 96.1375 51.2609Z" fill="currentColor"/>
      {/* 左上小四角星 */}
      <path d="M37.3222 78.0925C59.6985 73.9369 72.6448 60.8307 76.3209 38.7741C78.6385 60.0316 94.8613 75.3753 115 77.9326C92.8634 82.0083 79.8372 95.0345 76.1611 117.331C75.0423 107.182 71.0465 98.2312 63.8541 90.8789C56.5019 83.5267 47.6313 79.3711 37.3222 78.0925Z" fill="currentColor"/>
      {/* 右上小四角星 */}
      <path d="M35 44.7824C41.8937 43.5022 45.8822 39.4644 47.0148 32.6692C47.7288 39.2182 52.7267 43.9453 58.931 44.7332C52.1112 45.9888 48.0981 50.002 46.9655 56.8711C46.6208 53.7443 45.3898 50.9868 43.174 48.7217C40.9089 46.4566 38.176 45.1764 35 44.7824Z" fill="currentColor"/>
    </g>
  </svg>
);

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 計算總頁數
  const totalPages = analysisResult ? Math.ceil(analysisResult.feedbacks.length / itemsPerPage) : 0;

  // 獲取當前頁的數據
  const getCurrentPageData = () => {
    if (!analysisResult) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return analysisResult.feedbacks.slice(startIndex, startIndex + itemsPerPage);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      // 檢查檔案類型
      if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
        alert('請上傳 .csv, .xlsx 或 .xls 格式的檔案');
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // 清除無效的選擇
        }
        return;
      }
      // 檢查檔案大小（例如限制在 10MB 以內）
      if (file.size > 10 * 1024 * 1024) {
        alert('檔案大小不能超過 10MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // 清除無效的選擇
        }
        return;
      }
      console.log('File selected:', file.name);
      setFile(file);
      // 重置分析相關的狀態
      setAnalysisResult(null);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '分析請求失敗');
      }

      if (!result.success || !result.data) {
        throw new Error('數據格式錯誤');
      }

      setAnalysisResult(result.data);
      setUploadStatus('success');
    } catch (error: any) {
      console.error('分析過程出錯:', error);
      setUploadStatus('error');
      setErrorMessage(error?.message || '未知錯誤');
      alert(error?.message || '分析過程發生錯誤，請檢查文件格式是否正確');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      // 檢查檔案類型
      if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
        alert('請上傳 .csv, .xlsx 或 .xls 格式的檔案');
        return;
      }
      // 檢查檔案大���
      if (file.size > 10 * 1024 * 1024) {
        alert('檔案大小不能超過 10MB');
        return;
      }
      setFile(file);
      // 重置分析相關的狀態
      setAnalysisResult(null);
      setUploadStatus('idle');
      setErrorMessage('');
      // 清除 input 的值，確保可以重新選擇相同檔案
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      // 清除當前的值，這樣即使選擇相同的檔案也會觸發 onChange 事件
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // 添加新的 state 來存儲 AI 分析結果
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // 替換原來的 downloadReport 函數
  const generateInsights = async () => {
    if (!analysisResult) return;
    
    setIsGeneratingInsights(true);
    try {
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: analysisResult.keywords,
          totalFeedbacks: analysisResult.summary.totalCount,
          averageRating: analysisResult.summary.averageRating,
          positiveRatio: analysisResult.summary.positiveRatio,
          neutralRatio: analysisResult.summary.neutralRatio,
          negativeRatio: analysisResult.summary.negativeRatio,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('生成分析時發生錯誤:', error);
      alert('生成分析時發生錯誤，請稍後再試');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50">
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <LogoSVG />
            <span className="ml-3 text-2xl font-bold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              用戶評論分析平台 (Beta版)
            </span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* 使用說明區塊 */}
        <section className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">使用說明</h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>1. 上包含用戶評論的CSV或Excel檔案（僅支援.csv、.xlsx、.xls格式）</p>
                <p>2. 檔案第一列應為欄位標題，至少需包含一個評論內容欄位</p>
                <p>3. 系統將自動分析評論內容，生成以下分析結果：</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>評論分類與情感傾向</li>
                  <li>關鍵詞提取與統計</li>
                  <li>文字雲視覺化</li>
                  <li>整體情感分布分析</li>
                </ul>
                <p>4. 分析完成後可生成詳細洞察報告</p>
              </div>
            </div>
          </div>
        </section>

        {/* 檔案上傳區域 */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">上傳檔案</h2>
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileUpload}
            />
            {file ? (
              <div className="space-y-2">
                <svg className="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-600 dark:text-gray-300">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  點擊重新選擇檔案
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  拖放CSV或Excel檔案到此處
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  或點擊選擇檔案
                </p>
              </>
            )}
          </div>
        </section>

        {/* 分析按鈕 */}
        <section className="mb-8 flex justify-center">
          <button 
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>分析中...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>開始分析</span>
              </>
            )}
          </button>
        </section>

        {/* 分析結果預覽 */}
        {analysisResult && (
          <section className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold">分析結果預覽</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-32">日期</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">評論內容</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-24">評分</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-32">裝置</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-32">分類</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-32">情感</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-48">關鍵詞</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {getCurrentPageData().map((feedback, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{feedback.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{feedback.content}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{feedback.rating}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{feedback.device}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {feedback.category.split(/[,，]/).map((category, cidx) => (
                            <span 
                              key={cidx} 
                              className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                              >
                              {category.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          feedback.sentiment.includes('正面') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          feedback.sentiment.includes('負面') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {feedback.sentiment}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {feedback.keywords.map((keyword, kidx) => (
                            <span 
                              key={kidx} 
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* 分頁控制 */}
              <div className="mt-4 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                >
                  上一頁
                </button>
                <span className="text-sm text-gray-600">
                  第 {currentPage} 頁，共 {totalPages} 頁
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                >
                  下一頁
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 數據分析圖表 */}
        {analysisResult && (
          <section id="analysis-report" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 分析摘要 */}
            <div id="analysis-summary" className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">分析摘要</h2>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">總評論數</p>
                  <p className="text-2xl font-semibold">{analysisResult.summary.totalCount || 0}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">正面評價比例</p>
                  <p className="text-2xl font-semibold">
                    {(analysisResult.summary.positiveRatio * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">中性評價比例</p>
                  <p className="text-2xl font-semibold">
                    {(analysisResult.summary.neutralRatio * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">負面評價比例</p>
                  <p className="text-2xl font-semibold">
                    {(analysisResult.summary.negativeRatio * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">平均用戶評分</p>
                  <p className="text-2xl font-semibold">
                    {analysisResult.summary.averageRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* 評論趨勢分析 */}
            <div id="trend-analysis" className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">評論趨勢分析</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="aspect-[3/2] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  {analysisResult && <MonthlyTrendChart data={analysisResult.feedbacks} />}
                </div>
                <div className="aspect-[3/2] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  {analysisResult && <RatingDistributionChart data={analysisResult.feedbacks} />}
                </div>
              </div>
            </div>

            {/* 情感分析和分類統計 */}
            <div id="sentiment-category" className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                <div id="sentiment-chart" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">情感分析</h2>
                  <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    {analysisResult && <SentimentPieChart data={analysisResult.feedbacks} />}
                  </div>
                </div>

                <div id="category-chart" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">分類統計</h2>
                  <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    {analysisResult && <CategoryBarChart data={analysisResult.feedbacks} />}
                  </div>
                </div>
              </div>
            </div>

            {/* 關鍵詞統計和評分分布 */}
            <div id="keywords-rating" className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                <div id="keywords-chart" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">關鍵詞統計 (前20名)</h2>
                  <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    {analysisResult && <KeywordsBarChart keywords={analysisResult.keywords} />}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">評分分布詳情</h2>
                  <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    {analysisResult && (
                      <div className="w-full h-full flex items-center">
                        <table className="w-full">
                          <thead className="border-b border-gray-200 dark:border-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">評分</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">評論數</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">佔比</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {Array.from({ length: 5 }, (_, i) => {
                              const rating = 5 - i;
                              const count = analysisResult.feedbacks.filter(f => Math.floor(f.rating) === rating).length;
                              const percentage = (count / analysisResult.feedbacks.length * 100).toFixed(1);
                              
                              return (
                                <tr key={rating} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center">
                                      <span className="mr-2">{rating}</span>
                                      <svg 
                                        className="w-5 h-5 text-yellow-400" 
                                        fill="currentColor" 
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                    {count.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                    {percentage}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="border-t border-gray-200 dark:border-gray-700">
                            <tr>
                              <td className="px-4 py-3 font-medium">總計</td>
                              <td className="px-4 py-3 font-medium">
                                {analysisResult.feedbacks.length.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 font-medium">100%</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 文字雲 */}
            <div id="word-cloud" className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">文字雲分布</h2>
              <div className="aspect-[2/1] bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                {analysisResult && <WordCloud keywords={analysisResult.keywords} />}
              </div>
              <div className="flex flex-col items-center">
                <button
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center space-x-2 transition-colors disabled:opacity-50"
                  onClick={generateInsights}
                  disabled={isGeneratingInsights}
                >
                  {isGeneratingInsights ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>生成分析中...</span>
                    </>
                  ) : (
                    <>
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      <span>生成洞察分析</span>
                    </>
                  )}
                </button>
                
                {aiAnalysis && (
                  <div className="mt-6 w-full bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">AI 洞察分析結果</h3>
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                      {aiAnalysis}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
