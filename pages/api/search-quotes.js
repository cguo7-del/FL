import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST请求' });
  }

  try {
    const { question, strategy_category } = req.body;

    if (!question || !strategy_category) {
      return res.status(400).json({ error: '缺少必要参数：question 和 strategy_category' });
    }

    console.log('收到搜索请求:', { question, strategy_category });

    // 步骤1: 根据用户选定的方向从Supabase选择书籍
    const selectedBook = await selectBookByStrategy(strategy_category);
    if (!selectedBook) {
      return res.status(404).json({ error: '未找到对应策略的书籍' });
    }

    console.log('选中的书籍:', selectedBook.book_name);

    // 步骤2: 用AI搜索该书籍中回答用户问题的1-3句原文
    const originalText = await searchOriginalTextWithAI(selectedBook.book_name, question);
    if (!originalText) {
      return res.status(500).json({ 
        error: '未能找到相关原文',
        quote: '智者顺时而谋，愚者逆势而动。',
        bookName: selectedBook.book_name,
        chapterName: '经典智慧',
        source: `${selectedBook.book_name}·经典智慧`,
        fromNetworkSearch: false
      });
    }

    console.log('找到的原文:', originalText);

    // 步骤3: 根据原文用AI搜索对应的章节名称
    const chapterName = await searchChapterNameWithAI(selectedBook.book_name, originalText);
    
    console.log('识别的章节名:', chapterName);

    return res.status(200).json({
      quote: originalText,
      bookName: selectedBook.book_name,
      chapterName: chapterName || '未知章节',
      source: `${selectedBook.book_name}·${chapterName || '未知章节'}`,
      searchQuery: question,
      fromNetworkSearch: true,
      strategy_category: strategy_category
    });

  } catch (error) {
    console.error('搜索引用失败:', error);
    return res.status(500).json({ 
      error: '搜索服务暂时不可用',
      quote: '智者顺时而谋，愚者逆势而动。',
      bookName: '智慧经典',
      chapterName: '第一章',
      source: '智慧经典·第一章',
      fromNetworkSearch: false
    });
  }
}

// 根据策略类别从Supabase选择书籍
async function selectBookByStrategy(strategy_category) {
  try {
    const { data: books, error } = await supabase
      .from('book_library')
      .select('*')
      .eq('strategy_category', strategy_category);

    if (error) {
      console.error('查询书籍失败:', error);
      return null;
    }

    if (!books || books.length === 0) {
      console.log('未找到对应策略的书籍:', strategy_category);
      return null;
    }

    // 随机选择一本书
    const randomIndex = Math.floor(Math.random() * books.length);
    return books[randomIndex];
  } catch (error) {
    console.error('选择书籍时出错:', error);
    return null;
  }
}

// 用AI搜索书籍中回答用户问题的原文
async function searchOriginalTextWithAI(bookName, question) {
  try {
    // 构建搜索查询
    const searchQuery = `请从《${bookName}》中找出能够回答"${question}"这个问题的1-3句经典原文，要求：1. 必须是该书的原文内容；2. 内容要与问题高度相关；3. 返回格式为纯文本，不要解释`;
    
    console.log('AI搜索原文查询:', searchQuery);

    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-3dd5328db9d44d9cb4e6e7df02ee4b2d'
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
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message.content && data.choices[0].message.content.length > 10) {
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
async function searchChapterNameWithAI(bookName, originalText) {
  try {
    const searchQuery = `这段原文"${originalText}"出自《${bookName}》的哪个章节？请只返回章节名称，不要其他解释`;
    
    console.log('AI搜索章节名查询:', searchQuery);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-3dd5328db9d44d9cb4e6e7df02ee4b2d'
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
      return await searchChapterNameFallback(bookName, originalText);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message.content) {
      const chapterName = extractChapterName(data.choices[0].message.content);
      if (chapterName) {
        return chapterName;
      }
    }

    return await searchChapterNameFallback(bookName, originalText);

  } catch (error) {
    console.error('AI搜索章节名失败:', error);
    return await searchChapterNameFallback(bookName, originalText);
  }
}

// 备用方案：从数据库获取章节名
async function searchChapterNameFallback(bookName, originalText) {
  try {
    const { data: books, error } = await supabase
      .from('book_library')
      .select('*')
      .eq('book_name', bookName);

    if (error || !books || books.length === 0) {
      return '经典篇章';
    }

    // 尝试在章节内容中找到匹配的原文
    for (const book of books) {
      if (book.chapter_content && book.chapter_content.includes(originalText.substring(0, 10))) {
        return book.chapter_name || '经典篇章';
      }
    }

    // 如果没找到匹配，返回第一个章节名
    return books[0].chapter_name || '经典篇章';
  } catch (error) {
    console.error('备用章节名搜索失败:', error);
    return '经典篇章';
  }
}

// 从搜索结果中提取原文
function extractOriginalText(content, bookName) {
  if (!content) return null;
  
  // 移除HTML标签和多余空白
  let text = content.replace(/<[^>]*>/g, '').trim();
  
  // 移除数字序号（如"1. "、"2. "等）
  text = text.replace(/^\d+\.\s*/gm, '');
  
  // 移除解释性文字和括号内容
  text = text.replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '');
  text = text.replace(/此句[^。]*。?/g, '').replace(/这句话[^。]*。?/g, '');
  text = text.replace(/出自[^。]*。?/g, '').replace(/来源[^。]*。?/g, '');
  
  // 移除书名信息，避免在source中重复显示书名
  if (bookName) {
    const bookNameRegex = new RegExp(`《?${bookName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}》?[·\s]*`, 'gi');
    text = text.replace(bookNameRegex, '');
  }
  
  // 查找纯净的古文句子
  const sentences = text.split(/[。！？；]/).filter(s => s.length > 5 && s.length < 50);
  
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    // 优先选择古典文本风格的句子
    if (isClassicalText(cleanSentence) && !cleanSentence.includes('《') && !cleanSentence.includes('篇')) {
      return cleanSentence;
    }
  }
  
  // 如果没找到古典句子，返回第一个合适长度的句子
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    if (cleanSentence.length >= 10 && cleanSentence.length <= 30 && !cleanSentence.includes('《')) {
      return cleanSentence;
    }
  }
  
  // 最后备选：返回第一句
  return sentences.length > 0 ? sentences[0].trim() : null;
}

// 从章节名搜索结果中提取章节名
function extractChapterName(content) {
  if (!content) return null;
  
  const text = content.replace(/<[^>]*>/g, '').trim();
  
  // 常见的章节名模式
  const patterns = [
    /第[一二三四五六七八九十\d]+章[：:]?([^，。！？；]+)/,
    /第[一二三四五六七八九十\d]+篇[：:]?([^，。！？；]+)/,
    /([^，。！？；]{2,10})[章篇]/,
    /《[^》]+》([^，。！？；]{2,15})/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] ? match[1].trim() : match[0].trim();
    }
  }
  
  // 如果没有匹配到模式，尝试提取短语
  const words = text.split(/[，。！？；\s]+/).filter(w => w.length >= 2 && w.length <= 8);
  if (words.length > 0) {
    return words[0];
  }
  
  return null;
}

// 从章节内容中提取相关句子
function extractRelevantSentences(content, question) {
  if (!content) return [];
  
  const sentences = content.split(/[。！？；]/).filter(s => s.length > 5);
  const questionKeywords = extractKeywords(question);
  
  const relevantSentences = sentences.filter(sentence => {
    return questionKeywords.some(keyword => sentence.includes(keyword));
  }).slice(0, 3);
  
  return relevantSentences.length > 0 ? relevantSentences : sentences.slice(0, 2);
}

// 提取问题关键词
function extractKeywords(question) {
  // 移除常见的疑问词和助词
  const stopWords = ['如何', '怎么', '什么', '为什么', '哪个', '哪些', '应该', '可以', '能够', '的', '了', '吗', '呢', '吧'];
  const words = question.split(/[\s，。！？；]+/).filter(word => 
    word.length >= 2 && !stopWords.includes(word)
  );
  return words;
}

// 判断是否为古典文本
function isClassicalText(text) {
  const classicalPatterns = [
    /[之乎者也矣焉]/,
    /[君子小人]/,
    /[天下国家]/,
    /[道德仁义]/,
    /[智勇仁]/
  ];
  
  return classicalPatterns.some(pattern => pattern.test(text));
}