import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type { Keyword } from '@/types/feedback';

// 直接使用 process.env
const apiKey = process.env.GEMINI_API_KEY;

// 增強錯誤日誌
console.log('環境檢查:', {
  NODE_ENV: process.env.NODE_ENV,
  apiKeyExists: !!apiKey,
  apiKeyLength: apiKey?.length || 0
});

if (!apiKey) {
  console.error('API Key 未設置');
  throw new Error('Gemini API Key 未設置');
}

if (apiKey.length < 10) {
  console.error('API Key 長度不正確');
  throw new Error('Gemini API Key 格式不正確');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    
    // 驗證必要的數據是否存在
    if (!requestData.keywords || !Array.isArray(requestData.keywords)) {
      return NextResponse.json(
        { error: '無效的關鍵詞數據' },
        { status: 400 }
      );
    }

    if (typeof requestData.totalFeedbacks === 'undefined' ||
        typeof requestData.averageRating === 'undefined' ||
        typeof requestData.positiveRatio === 'undefined' ||
        typeof requestData.neutralRatio === 'undefined' ||
        typeof requestData.negativeRatio === 'undefined') {
      return NextResponse.json(
        { error: '缺少必要的統計數據' },
        { status: 400 }
      );
    }
    
    console.log('Request data:', requestData);
    
    const { 
      keywords, 
      totalFeedbacks, 
      averageRating,
      positiveRatio,
      neutralRatio,
      negativeRatio 
    } = requestData;
    
    const currentDate = new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const prompt = `請根據以下數據生成一份深入的分析報告，並遵循指的格式要求：

報告日期：${currentDate}

分析數據：
- 總回饋數量：${totalFeedbacks}
- 平均評分：${averageRating}
- 正面評價比例：${(positiveRatio * 100).toFixed(1)}%
- 中性評價比例：${(neutralRatio * 100).toFixed(1)}%
- 負面評價比例：${(negativeRatio * 100).toFixed(1)}%

關鍵詞出現頻率（前20名）：
${keywords.map((k: Keyword) => `${k.word}: ${k.count}次`).join('\n')}

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

    console.log('Prompt:', prompt);
    console.log('Model configuration:', {
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    console.log('API Key loaded:', !!process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topK: 40,
        topP: 0.95,
      }
    });

    // 添加安全檢查
    if (!prompt || prompt.length === 0) {
      throw new Error('提示詞不能為空');
    }

    try {
      // 使用 safety settings 的正確方式
      const result = await model.generateContent(prompt);
      
      if (!result || !result.response) {
        throw new Error('API 返回結果無效');
      }

      const text = result.response.text();
      
      if (!text || text.length === 0) {
        throw new Error('生成的文本為空');
      }

      console.log('生成的文本長度:', text.length);
      return NextResponse.json({ analysis: text });
      
    } catch (apiError: unknown) {
      console.error('Gemini API 調用錯誤:', apiError);
      const errorMessage = apiError instanceof Error ? apiError.message : '未知的 API 錯誤';
      throw new Error(`Gemini API 錯誤: ${errorMessage}`);
    }
    
  } catch (error: unknown) {
    console.error('錯誤類型:', typeof error);
    console.error('錯誤內容:', error);
    
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    const errorStack = error instanceof Error ? error.stack : '無堆棧信息';
    
    console.error('錯誤信息:', errorMessage);
    console.error('錯誤堆棧:', errorStack);

    return NextResponse.json(
      { 
        error: '生成分析時發生錯誤',
        details: errorMessage,
        type: typeof error
      },
      { status: 500 }
    );
  }
} 