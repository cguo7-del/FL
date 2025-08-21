// Cloudflare Pages Function for search-quotes API
import { createClient } from '@supabase/supabase-js';

// 使用环境变量配置Supabase
const getSupabaseClient = (env) => {
  const supabaseUrl = env.SUPABASE_URL || 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
  const supabaseKey = env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTAzMDQsImV4cCI6MjA3MDcyNjMwNH0.g_HmFQQiuGW2TZRzZ5gqCj098DZy6iwn_xQAE6kEUEI';
  return createClient(supabaseUrl, supabaseKey);
};

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { question, strategy_category } = await request.json();

    if (!question || !strategy_category) {
      return new Response(JSON.stringify({ error: '缺少必要参数：question 和 strategy_category' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('收到搜索请求:', { question, strategy_category });

    // 获取Supabase客户端
    const supabase = getSupabaseClient(env);

    // 步骤1: 根据用户选定的方向从Supabase选择书籍
    const selectedBook = await selectBookByStrategy(strategy_category, supabase);
    if (!selectedBook) {
      return new Response(JSON.stringify({ error: '未找到对应策略的书籍' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('选中的书籍:', selectedBook.book_name);

    // 步骤2: 用AI搜索该书籍中回答用户问题的1-3句原文
    const originalText = await searchOriginalTextWithAI(selectedBook.book_name, question, env);
    if (!originalText) {
      return new Response(JSON.stringify({ 
        error: '未能找到相关原文',
        quote: '智者顺时而谋，愚者逆势而动。',
        bookName: selectedBook.book_name,
        chapterName: '经典智慧',
        source: `${selectedBook.book_name}·经典智慧`,
        fromNetworkSearch: false
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('找到的原文:', originalText);

    // 步骤3: 根据原文用AI搜索对应的章节名称
    const chapterName = await searchChapterNameWithAI(selectedBook.book_name, originalText, env, supabase);
    
    console.log('识别的章节名:', chapterName);

    return new Response(JSON.stringify({
      quote: originalText,
      bookName: selectedBook.book_name,
      chapterName: chapterName || '未知章节',
      source: `${selectedBook.book_name}·${chapterName || '未知章节'}`,
      searchQuery: question,
      fromNetworkSearch: false
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('搜索引文时发生错误:', error);
    return new Response(JSON.stringify({ 
      error: '服务器内部错误',
      quote: '智者顺时而谋，愚者逆势而动。',
      bookName: '经典智慧',
      chapterName: '通用策略',
      source: '经典智慧·通用策略',
      fromNetworkSearch: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 根据策略类别选择书籍
async function selectBookByStrategy(strategy_category, supabase) {
  try {
    const { data: books, error } = await supabase
      .from('book_library')
      .select('*')
      .eq('strategy_category', strategy_category)
      .limit(1);

    if (error) {
      console.error('数据库查询错误:', error);
      return null;
    }

    if (!books || books.length === 0) {
      console.log('未找到对应策略的书籍，使用默认书籍');
      // 如果没有找到对应策略的书籍，返回一个默认书籍
      const { data: defaultBooks, error: defaultError } = await supabase
        .from('book_library')
        .select('*')
        .limit(1);
      
      return defaultBooks && defaultBooks.length > 0 ? defaultBooks[0] : null;
    }

    return books[0];
  } catch (error) {
    console.error('选择书籍时发生错误:', error);
    return null;
  }
}

// 用AI搜索原文
async function searchOriginalTextWithAI(bookName, question, env) {
  try {
    const searchQuery = `请从《${bookName}》中找出能够回答"${question}"这个问题的1-3句经典原文，要求：1. 必须是该书的原文内容；2. 内容要与问题高度相关；3. 返回格式为纯文本，不要解释`;
    
    console.log('AI搜索原文查询:', searchQuery);

    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY || 'sk-3dd5328db9d44d9cb4e6e7df02ee4b2d'}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'user',
          content: searchQuery
        }],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      console.log('DeepSeek API调用失败，尝试备用方案');
      return await searchOriginalTextFallback(bookName, question);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      // 提取原文内容
      const originalText = extractOriginalText(content, bookName);
      
      if (originalText && originalText.length > 10) {
        return originalText;
      }
    }

    // 如果API结果不理想，使用备用方案
    return await searchOriginalTextFallback(bookName, question);

  } catch (error) {
    console.error('AI搜索原文失败:', error);
    return await searchOriginalTextFallback(bookName, question);
  }
}

// 备用方案：从数据库内容中搜索原文
async function searchOriginalTextFallback(bookName, question) {
  try {
    const { data: books, error } = await supabase
      .from('book_library')
      .select('*')
      .eq('book_name', bookName)
      .limit(1);

    if (error || !books || books.length === 0) {
      return null;
    }

    const book = books[0];
    if (!book.chapter_content) {
      return null;
    }

    // 从章节内容中提取相关句子
    const sentences = extractRelevantSentences(book.chapter_content, question);
    if (sentences.length > 0) {
      return sentences.slice(0, 3).join('，');
    }

    return null;
  } catch (error) {
    console.error('备用搜索失败:', error);
    return null;
  }
}

// 用AI搜索章节名称
async function searchChapterNameWithAI(bookName, originalText, env, supabase) {
  try {
    const searchQuery = `这段原文"${originalText}"出自《${bookName}》的哪个章节？请只返回章节名称，不要其他解释`;
    
    console.log('AI搜索章节名查询:', searchQuery);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY || 'sk-3dd5328db9d44d9cb4e6e7df02ee4b2d'}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'user',
          content: searchQuery
        }],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
    });

    if (!response.ok) {
      return await searchChapterNameFallback(bookName, originalText, supabase);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      const chapterName = extractChapterName(content);
      if (chapterName) {
        return chapterName;
      }
    }

    return await searchChapterNameFallback(bookName, originalText, supabase);

  } catch (error) {
    console.error('AI搜索章节名失败:', error);
    return await searchChapterNameFallback(bookName, originalText, supabase);
  }
}

// 备用方案：从数据库获取章节名
async function searchChapterNameFallback(bookName, originalText, supabase) {
  try {
    const { data: books, error } = await supabase
      .from('book_library')
      .select('*')
      .eq('book_name', bookName)
      .limit(1);

    if (error || !books || books.length === 0) {
      return '经典智慧';
    }

    const book = books[0];
    return book.chapter_name || '经典智慧';
  } catch (error) {
    console.error('备用章节名搜索失败:', error);
    return '经典智慧';
  }
}

// 从AI响应中提取原文
function extractOriginalText(content, bookName) {
  if (!content) return null;
  
  // 移除常见的AI回复前缀
  let text = content.replace(/^(以下是|根据|从《.*?》中找到的相关原文[:：]?|相关原文[:：]?)/i, '');
  
  // 移除编号（如"1. "、"2. "、"一、"、"二、"等）- 包括开头和文本中间的编号
  text = text.replace(/^\d+[.、]\s*/gm, '');
  text = text.replace(/^[一二三四五六七八九十][、.]\s*/gm, '');
  // 移除文本中间的编号（如"1，"、"2，"、"1."、"2."等）
  text = text.replace(/\d+[，,.]\s*/g, '');
  text = text.replace(/[一二三四五六七八九十][，,.]\s*/g, '');
  
  // 移除出处信息（如"——《韩非子·难二》"、"出自《韩非子》"等）
  text = text.replace(/——《.*?》.*?$/gm, '');
  text = text.replace(/出自《.*?》.*?$/gm, '');
  text = text.replace(/来源[:：]《.*?》.*?$/gm, '');
  text = text.replace(/（《.*?》）/g, '');
  text = text.replace(/\(《.*?》\)/g, '');
  
  // 移除引号
  text = text.replace(/^[""'']|[""'']$/g, '');
  
  // 移除多余的空白字符和换行
  text = text.replace(/\s+/g, '').trim();
  
  // 如果文本太短或太长，可能不是有效的原文
  if (text.length < 5 || text.length > 500) {
    return null;
  }
  
  // 检查是否包含明显的现代词汇（可能不是古典原文）
  const modernWords = ['网络', '电脑', '手机', '互联网', '科技', '现代', '当今', '如今'];
  const hasModernWords = modernWords.some(word => text.includes(word));
  
  if (hasModernWords) {
    return null;
  }
  
  // 检查是否是经典文言文风格
  if (isClassicalText(text)) {
    return text;
  }
  
  return text;
}

// 从AI响应中提取章节名
function extractChapterName(content) {
  if (!content) return null;
  
  // 移除常见的AI回复前缀和后缀
  let chapterName = content.replace(/^(这段原文出自|出自|来自|属于)/, '');
  chapterName = chapterName.replace(/[章节篇卷]$/, '');
  chapterName = chapterName.replace(/^[《》""'']|[《》""'']$/g, '');
  chapterName = chapterName.trim();
  
  // 如果章节名太长，可能包含了多余信息
  if (chapterName.length > 20) {
    // 尝试提取第一个可能的章节名
    const match = chapterName.match(/^([^，。；！？\s]{2,10})[章节篇卷]?/);
    if (match) {
      chapterName = match[1];
    } else {
      chapterName = chapterName.substring(0, 10);
    }
  }
  
  return chapterName || null;
}

// 从章节内容中提取相关句子
function extractRelevantSentences(content, question) {
  if (!content) return [];
  
  const keywords = extractKeywords(question);
  const sentences = content.split(/[。！？；]/).filter(s => s.trim().length > 5);
  
  const relevantSentences = sentences.filter(sentence => {
    return keywords.some(keyword => sentence.includes(keyword));
  });
  
  return relevantSentences.slice(0, 3);
}

// 从问题中提取关键词
function extractKeywords(question) {
  // 简单的关键词提取，移除常见的停用词
  const stopWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
  const words = question.replace(/[？！。，；：]/g, '').split('').filter(word => 
    word.length > 1 && !stopWords.includes(word)
  );
  return words.slice(0, 5);
}

// 检查是否是古典文本风格
function isClassicalText(text) {
  const classicalPatterns = [
    /[之乎者也矣焉]/,
    /[君子小人]/,
    /[天下国家]/,
    /[道德仁义]/,
    /[圣贤智者]/
  ];
  
  return classicalPatterns.some(pattern => pattern.test(text));
}

export async function onRequest(context) {
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }
  
  return new Response('Method not allowed', { status: 405 });
}