import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type { Keyword } from '@/types/feedback';

// 用於驗證環境配置的函數
function validateEnvironment() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return process.env.GEMINI_API_KEY;
}

// 驗證請求數據的函數
function validateRequestData(data: any) {
  if (!data) {
    throw new Error('Request data is missing');
  }

  if (!data.keywords || !Array.isArray(data.keywords)) {
    throw new Error('Invalid or missing keywords data');
  }

  const requiredFields = [
    'totalFeedbacks',
    'averageRating',
    'positiveRatio',
    'neutralRatio',
    'negativeRatio'
  ];

  for (const field of requiredFields) {
    if (typeof data[field] === 'undefined') {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return data;
}

// 生成提示詞的函數
function generatePrompt(data: any) {
  const currentDate = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `請根據以下數據生成一份深入的分析報告，並遵循指定的格式要求：

報告日期：${currentDate}

分析數據：
- 總回饋數量：${data.totalFeedbacks}
- 平均評分：${data.averageRating}
- 正面評價比例：${(data.positiveRatio * 100).toFixed(1)}%
- 中性評價比例：${(data.neutralRatio * 100).toFixed(1)}%
- 負面評價比例：${(data.negativeRatio * 100).toFixed(1)}%

關鍵詞出現頻率（前20名）：
${data.keywords.map((k: Keyword) => `${k.word}: ${k.count}次`).join('\n')}

請依照以下格式生成分析報告：

**整體趨勢分析**
1. [趨勢觀察點1]
2. [趨勢觀察點2]
3. [趨勢觀察點3]

**關鍵議題分析**
1. [主要議題1]
2. [主要議題2]
3. [主要議題3]

**問題與風險**
1. [問題點1]
2. [問題點2]
3. [問題點3]

**改進建議**
1. [建議1]
2. [建議2]
3. [建議3]

**優先執行事項**
1. [優先項目1]
2. [優先項目2]
3. [優先項目3]

請注意：
1. 每個分析點都需要具體的數據支持
2. 使用繁體中文
3. 保持專業、具體且有洞察力
4. 不要使用項目符號(*)，請使用數字列表
5. 確保內容清晰易讀，重點突出`;
}

// Gemini API 配置
const GEMINI_CONFIG = {
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
    topK: 40,
    topP: 0.95,
  }
} as const;

// 主要的處理函數
export async function POST(request: Request) {
  // 初始化日誌對象
  const logs = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelEnvironment: process.env.VERCEL_ENV,
  };

  try {
    console.log('Starting request processing:', logs);

    // 驗證環境變數
    const apiKey = validateEnvironment();
    console.log('Environment validated, API key present:', !!apiKey);

    // 解析請求數據
    const requestData = await request.json();
    console.log('Request data received');

    // 驗證請求數據
    const validatedData = validateRequestData(requestData);
    console.log('Request data validated');

    // 初始化 Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(GEMINI_CONFIG);
    console.log('Gemini model initialized with config:', GEMINI_CONFIG);

    // 生成提示詞
    const prompt = generatePrompt(validatedData);
    console.log('Prompt generated, length:', prompt.length);

    // 調用 Gemini API
    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    
    if (!result?.response) {
      throw new Error('Invalid response from Gemini API');
    }

    const text = result.response.text();
    
    if (!text?.length) {
      throw new Error('Empty response from Gemini API');
    }

    console.log('Successfully generated response, length:', text.length);

    // 返回成功結果
    return NextResponse.json({ 
      analysis: text,
      metadata: {
        generatedAt: new Date().toISOString(),
        promptLength: prompt.length,
        responseLength: text.length
      }
    });

  } catch (error) {
    // 詳細的錯誤日誌
    const errorDetails = {
      ...logs,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined
      }
    };

    console.error('Error in API route:', errorDetails);

    // 返回錯誤響應
    return NextResponse.json({
      error: '生成分析時發生錯誤',
      details: errorDetails.error.message,
      timestamp: errorDetails.timestamp
    }, {
      status: 500
    });
  }
}