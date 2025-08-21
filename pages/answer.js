import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Answer.module.css'
import { dbOperations } from '../lib/supabase'

export default function Answer() {
  const router = useRouter()
  const { question, strategies } = router.query
  const [answer, setAnswer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    if (question) {
      // 启动进度条动画
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev // 最多到90%，等API完成
          return prev + 1
        })
      }, 100) // 每100ms增加1%
      
      generateAnswer().finally(() => {
        // API完成后，快速完成进度条
        clearInterval(progressInterval)
        setLoadingProgress(100)
        setTimeout(() => {
          setIsLoading(false)
        }, 200) // 让用户看到100%
      })
      
      return () => clearInterval(progressInterval)
     }
   }, [question])

  const generateAnswer = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 解析选择的方略经纬
      const selectedStrategies = strategies ? strategies.split(',') : []
      
      // 从数据库获取相关书籍内容
      let books = []
      if (selectedStrategies && selectedStrategies.length > 0) {
        // 如果选择了策略，根据策略筛选书籍
        const { data, error } = await dbOperations.supabase
          .from('book_library')
          .select('*')
          .in('strategy_category', selectedStrategies)
        
        if (error) {
          console.error('查询书籍数据失败:', error)
          books = []
        } else {
          books = data || []
        }
      } else {
        // 如果没有选择策略，获取所有书籍
        const { data, error } = await dbOperations.supabase
          .from('book_library')
          .select('*')
        
        if (error) {
          console.error('查询书籍数据失败:', error)
          books = []
        } else {
          books = data || []
        }
      }
      
      // 生成结构化答案
      const structuredAnswer = await generateStructuredAnswer(question, books, selectedStrategies)
      
      setAnswer(structuredAnswer)
    } catch (error) {
      console.error('生成答案失败:', error)
      setError('生成答案时出现错误，请稍后重试。')
    }
  }

  const generateStructuredAnswer = async (question, books, strategies) => {
    // 随机选择一本书作为引用
    const randomBook = books && books.length > 0 ? books[Math.floor(Math.random() * books.length)] : null
    
    // 调试：打印randomBook的结构
    console.log('调试 - randomBook对象:', randomBook)
    console.log('调试 - randomBook字段:', randomBook ? Object.keys(randomBook) : 'null')
    
    // 通过网络搜索获取原文内容
    const getOriginalText = async (book) => {
      console.log('调试 - getOriginalText收到的book:', book)
      console.log('调试 - book.book_name:', book ? book.book_name : 'book为null')
      console.log('调试 - book.书籍名称:', book ? book.书籍名称 : 'book为null')
      
      if (!book || (!book.book_name && !book.书籍名称)) {
        console.log('调试 - 使用默认文本，原因：', !book ? 'book为null' : '书籍名称字段为空')
        return {
          text: "智者顺时而谋，愚者逆势而动。",
          bookName: "古代典籍",
          chapterName: "第一章"
        }
      }
      // 使用网络搜索获取相关原文片段
      const quote = await selectIntelligentQuote(question, book)
      console.log('调试 - selectIntelligentQuote返回:', quote)
      return quote
    }
    
    const getBookSource = (quoteData) => {
      if (!quoteData || !quoteData.bookName) {
        return "《古代典籍·第一章》"
      }
      // 显示书籍名称和章节名称
      return `《${quoteData.bookName}·${quoteData.chapterName || '经典篇章'}》`
    }
    
    // 调用大语言模型生成答案内容
    try {
      const prompt = `请基于以下信息生成一个结构化的智慧解答：

用户问题：${question}

选择的方略经纬：${strategies && strategies.length > 0 ? strategies.join('、') : '无特定方向'}

引用书籍：${randomBook ? `《${randomBook.book_name}》` : '古代典籍'}
书籍内容：${randomBook ? randomBook.chapter_content : '古代智慧典籍'}

请按照以下结构生成答案，每部分都要有实质性内容，不要使用模板化语言：

1. 探源部分：
   - 从书籍中提取1-3句相关原文
   - 深层分析用户问题背后的真实困扰（使用第二人称）

2. 析局部分：
   - 基于古籍智慧的逻辑分析
   - 相关的历史典故或案例

3. 行策部分：
   - 核心策略建议
   - 具体可操作的方法
   - 风险提醒和注意事项

请确保内容原创、深度、实用，体现古代智慧在现代问题中的应用。`

      // 这里应该调用实际的大语言模型API
      // 由于没有配置API，暂时使用基于书籍内容的智能生成
      
      // 先获取原文数据
      const originalTextData = await getOriginalText(randomBook);
      
      // 传入原文数据生成智能答案
      const generatedAnswer = await generateIntelligentAnswer(question, randomBook, strategies, originalTextData.text)
      
      // 生成问题重新表述和深层分析
      const exploreSourceContent = await generateExploreSourceContent(question, randomBook)
      
      return {
        探源: {
          原文: originalTextData.text,
          出处: getBookSource(originalTextData),
          问题转述: exploreSourceContent.rephrased,
          深层分析: exploreSourceContent.deepAnalysis
        },
        析局: {
          逻辑分析: generatedAnswer.logicAnalysis,
          历史案例: generatedAnswer.historicalCase
        },
        行策: {
          核心策略: generatedAnswer.coreStrategy,
          具体方法: generatedAnswer.detailedMethod,
          风险提醒: generatedAnswer.riskWarning
        }
      }
    } catch (error) {
      console.error('生成答案内容失败:', error)
      // 如果生成失败，返回基础结构
      const originalTextData = await getOriginalText(randomBook);
      
      return {
        探源: {
          原文: originalTextData.text,
          出处: getBookSource(originalTextData),
          问题转述: question,
          深层分析: "您的问题反映了在复杂情况下寻求最佳解决方案的智慧需求。"
        },
        析局: {
          逻辑分析: "古人智慧告诉我们，面对挑战时需要深入分析局势，找到关键要素。",
          历史案例: "历史上许多智者都曾面临类似挑战，他们的经验值得我们借鉴。"
        },
        行策: {
          核心策略: "基于古代智慧，建议采用稳健而灵活的策略。",
          具体方法: "具体实施时，需要结合实际情况，循序渐进地推进。",
          风险提醒: "在执行过程中，需要时刻保持警觉，及时调整策略。"
        }
      }
    }
  }
  
  // DeepSeek API调用函数（移除超时限制）
  const callDeepSeekAPI = async (prompt) => {
    try {
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        console.error('API调用失败:', response.status, response.statusText);
        throw new Error(`API调用失败: ${response.status}`);
      }

      const data = await response.json();
      return data.content || '生成内容失败';

    } catch (error) {
      console.error('DeepSeek API调用错误:', error);
      
      // 回退到本地智能生成
      if (prompt.includes('问题概况')) {
        return '这是一个关于策略决策的重要问题，需要综合考虑多个因素来制定最佳方案。';
      } else if (prompt.includes('核心分析')) {
        return '通过深入分析问题的本质和关键要素，我们可以找到解决问题的核心路径。';
      } else if (prompt.includes('历史案例')) {
        return '历史上类似的情况告诉我们，成功的关键在于准确判断形势并采取适当的行动。';
      } else if (prompt.includes('逻辑分析')) {
        return '从逻辑角度分析，我们需要理清因果关系，找出问题的根源和解决方案。';
      } else if (prompt.includes('高能摘要')) {
        return '核心要点：抓住关键机会，制定明确策略，果断执行行动计划。';
      } else if (prompt.includes('详细方法')) {
        return '具体实施步骤：1. 深入调研分析 2. 制定行动方案 3. 分步骤执行 4. 持续优化调整';
      } else if (prompt.includes('风险示警')) {
        return '需要注意的风险：时机把握、资源配置、执行力度等关键因素可能影响最终效果。';
      }
      
      return '智能分析生成中，请稍候...';
    }
  };

// 本地智能内容生成（基于关键词和模式匹配）
const generateLocalIntelligentContent = (prompt) => {
  const question = prompt.match(/用户问题："([^"]+)"/)?.[1] || '';
  const book = prompt.match(/古籍：《([^》]+)》/)?.[1] || '';
  const strategy = prompt.match(/方略经纬：([^\n]+)/)?.[1] || '';
  
  // 问题关键词分析
  const keywords = {
    '管理': ['领导力', '团队协作', '决策制定', '沟通协调'],
    '决策': ['权衡利弊', '风险评估', '时机把握', '信息收集'],
    '竞争': ['差异化', '核心优势', '市场定位', '战略布局'],
    '团队': ['凝聚力', '分工协作', '激励机制', '文化建设'],
    '挑战': ['应对策略', '化危为机', '创新突破', '持续改进'],
    '策略': ['系统规划', '分步实施', '资源配置', '效果评估']
  };
  
  // 历史案例库
  const historicalCases = {
    '管理': '春秋时期，管仲辅佐齐桓公，面对内忧外患，不急于求成，而是先稳内政、后图霸业，最终成就一代霸主。其智慧在于急事缓做，缓事急做。',
    '决策': '战国时期，赵武灵王面临胡服骑射的重大决策时，明知会遭到保守派反对，但他通过逐步试点、示范效果的方式，最终说服了朝野上下。',
    '竞争': '三国时期，诸葛亮在与司马懿的较量中，深知正面对抗不利，于是采用以逸待劳的策略，通过空城计等智谋，在实力不足的情况下仍能与强敌周旋。',
    '团队': '汉初，刘邦能够统一天下，关键在于他善于团结各方人才，对张良用其智，对韩信用其勇，对萧何用其能，让每个人都能发挥所长。',
    '挑战': '明朝时期，于谦在土木堡之变后临危受命，面对瓦剌大军的压境的危局，他没有慌乱，而是冷静分析形势，调动一切可用资源，最终成功保卫了北京。',
    '策略': '孙武在《孙子兵法》中提出兵者，诡道也，强调策略的灵活性和适应性，根据不同情况采用不同的战术，这一思想至今仍有重要指导意义。'
  };
  
  // 根据prompt类型生成不同内容
  if (prompt.includes('概况用户问题') || prompt.includes('真实困扰')) {
    const mainKeyword = Object.keys(keywords).find(k => question.includes(k)) || '决策';
    return `问题核心在于${mainKeyword}困境，需要在复杂环境中找到最优解。真实困扰是如何平衡各方利益，既要达成目标又要控制风险。`;
  }
  
  if (prompt.includes('简要拆解') || prompt.includes('核心逻辑')) {
    const bookWisdom = book ? `《${book}》强调` : '古籍智慧指出';
    return `${bookWisdom}顺势而为的重要性，核心在于把握时机与人心，先谋而后动，以智取胜。`;
  }
  
  if (prompt.includes('历史案例') || prompt.includes('真实历史')) {
    const mainKeyword = Object.keys(historicalCases).find(k => question.includes(k)) || '管理';
    return historicalCases[mainKeyword];
  }
  
  if (prompt.includes('高能摘要') || prompt.includes('核心策略')) {
    return '先稳后进，以静制动。明确目标，分步实施，借势而为，化危为机。';
  }
  
  if (prompt.includes('详细给出解决方法')) {
    return '第一步：明确目标，理清思路。第二步：分析现状，找准问题根源。第三步：制定计划，分步实施。第四步：调动资源，凝聚力量。第五步：持续跟进，及时调整。关键在于稳扎稳打，步步为营。';
  }
  
  if (prompt.includes('风险') || prompt.includes('示警')) {
    return '切忌急功近利，欲速则不达。过程中需防范利益冲突，保持初心不变。';
  }
  
  if (prompt.includes('经典语录') || prompt.includes('语录')) {
    const quotes = ['知己知彼，百战不殆', '兵者，诡道也', '上兵伐谋，其次伐交', '善战者，求之于势', '智者顺时而谋，愚者逆势而动'];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  
  return '古人云："智者顺时而谋，愚者逆势而动。"关键在于把握时机，顺势而为。';
};

  // 生成探源部分内容：问题重新表述和深层分析
  const generateExploreSourceContent = async (question, book) => {
    try {
      // 使用大语言模型重新表述问题并分析深层困扰
      const prompt = `请对以下用户问题进行重新表述和深层分析：

用户问题：${question}

要求：
1. 首先用一句话重新表述用户的问题，让这个问题看起来更加简洁直接一针见血
2. 然后分析用户背后的真实困扰，用第二人称增强互动感
3. 整体内容放在一段中，不要分开
4. 不要使用破折号（—）等符号
5. 参考示例风格："老板总是把棘手的项目推给你，你应该怎么办？你担心的不是任务本身，而是接了之后搞砸，被老板当成背锅侠，同时失去在团队的信任和话语权。你真正想知道的是，既不能硬拒绝，又不想做无谓牺牲，该如何两全？"

请直接返回重新表述的问题和深层分析内容，不要添加其他说明。`;
      
      // 尝试调用DeepSeek API
      const apiResponse = await callDeepSeekAPI(prompt);
      
      if (apiResponse && apiResponse !== '智能分析生成中，请稍候...' && !apiResponse.includes('生成内容失败')) {
        // API调用成功，解析返回内容
        const content = apiResponse.trim();
        
        // 尝试分离重新表述的问题和深层分析
        const sentences = content.split(/[？?]/)
        if (sentences.length >= 2) {
          const rephrased = sentences[0] + '？'
          const deepAnalysis = sentences.slice(1).join('？').replace(/^[？?]/, '').trim()
          
          return {
            rephrased: rephrased,
            deepAnalysis: deepAnalysis || content
          }
        }
        
        // 如果无法分离，将整体内容作为深层分析，问题转述使用原问题
        return {
          rephrased: question,
          deepAnalysis: content
        }
      }
      
      // API调用失败，使用本地智能生成
      return generateLocalExploreContent(question)
      
    } catch (error) {
      console.error('生成探源内容失败:', error)
      return generateLocalExploreContent(question)
    }
  }
  
  // 本地探源内容生成
  const generateLocalExploreContent = (question) => {
    // 分析问题类型和关键词
    const problemTypes = {
      '工作': ['职场', '同事', '老板', '项目', '任务', '升职', '跳槽'],
      '管理': ['团队', '下属', '领导', '决策', '管理', '协调'],
      '人际': ['朋友', '家人', '关系', '沟通', '矛盾', '冲突'],
      '选择': ['选择', '决定', '犹豫', '纠结', '方向', '道路'],
      '困难': ['困难', '挫折', '失败', '压力', '焦虑', '迷茫']
    }
    
    let problemType = '困难'
    for (const [type, keywords] of Object.entries(problemTypes)) {
      if (keywords.some(keyword => question.includes(keyword))) {
        problemType = type
        break
      }
    }
    
    // 根据问题类型生成重新表述和深层分析
    const templates = {
      '工作': {
        rephrased: `${question.replace(/[？?]$/, '')}，你该如何应对？`,
        deepAnalysis: '你担心的不只是眼前的问题，而是这件事可能影响你在职场中的地位和发展。你真正想知道的是，如何在维护自己利益的同时，又不破坏与同事和上级的关系。'
      },
      '管理': {
        rephrased: `面对${question.replace(/[？?]$/, '')}的情况，你应该怎么处理？`,
        deepAnalysis: '你的困扰不在于不知道该做什么，而在于如何平衡各方利益，既要达成目标，又要维护团队和谐。你真正需要的是一套既有效又不伤和气的解决方案。'
      },
      '人际': {
        rephrased: `${question.replace(/[？?]$/, '')}，你该如何处理这种关系？`,
        deepAnalysis: '你在意的不是对错，而是如何在坚持自己原则的同时，不伤害彼此的感情。你真正想要的是既能解决问题，又能维护关系的双赢方案。'
      },
      '选择': {
        rephrased: `面临${question.replace(/[？?]$/, '')}的选择，你该如何决定？`,
        deepAnalysis: '你的纠结不在于选项本身，而在于担心选错了方向会后悔。你真正需要的是一个清晰的判断标准，让你能够坚定地做出选择并承担结果。'
      },
      '困难': {
        rephrased: `遇到${question.replace(/[？?]$/, '')}的困难，你该怎么办？`,
        deepAnalysis: '你的焦虑不只是来自困难本身，更来自对未知结果的担忧。你真正想要的是一种面对困难的勇气和方法，让你能够从容应对各种挑战。'
      }
    }
    
    const template = templates[problemType] || templates['困难']
    
    return {
      rephrased: template.rephrased,
      deepAnalysis: template.deepAnalysis
    }
  }

  // 基于书籍内容的智能答案生成函数（优化并行处理）
  const generateIntelligentAnswer = async (question, book, strategies, originalText) => {
    try {
      const bookTitle = book ? book.book_name : '古代典籍';
      const strategiesText = strategies && strategies.length > 0 
        ? strategies.join('、') 
        : '综合智慧';
      
      // 生成问题概况和真实困扰分析
      const analysisPrompt = `用户问题："${question}"
参考古籍：${bookTitle}
方略经纬：${strategiesText}

请简洁概况用户问题的核心，并分析用户背后的真实困扰。要求：
1. 用1-2句话概括问题核心
2. 用1-2句话分析真实困扰
3. 语言简洁有力，直击要害`;
      
      // 先生成逻辑分析，然后基于逻辑分析生成历史案例
      const logicAnalysis = await generateLogicAnalysis(question, book, strategies, originalText);
      
      // 并行调用其他API，无超时限制
      const promises = [
        callDeepSeekAPI(analysisPrompt),
        Promise.resolve(logicAnalysis), // 已经生成的逻辑分析
        generateRelevantHistoricalCase(question, book, originalText, logicAnalysis),
        generateCoreStrategy(question, book, strategies, originalText, logicAnalysis),
        generateDetailedMethod(question, book, strategies, originalText, logicAnalysis),
        generateRiskWarning(question, book, originalText, logicAnalysis)
      ];
      
      // 使用Promise.allSettled确保即使部分失败也能继续，无时间限制
      const results = await Promise.allSettled(promises);
      
      // 提取结果，失败的使用默认值
      const [
        deepAnalysisResult,
        logicAnalysisResult,
        historicalCaseResult,
        coreStrategyResult,
        detailedMethodResult,
        riskWarningResult
      ] = results;
      
      return {
        deepAnalysis: deepAnalysisResult.status === 'fulfilled' 
          ? deepAnalysisResult.value 
          : '问题核心在于决策困境，真实困扰是缺乏明确方向。',
        logicAnalysis: logicAnalysisResult.status === 'fulfilled' 
          ? logicAnalysisResult.value 
          : '古籍智慧指引方向，核心在于顺势而为。',
        historicalCase: historicalCaseResult.status === 'fulfilled' 
          ? historicalCaseResult.value 
          : '春秋时期，管仲辅佐齐桓公，面对内忧外患，不急于求成，而是先稳内政、后图霸业，最终成就一代霸主。',
        coreStrategy: coreStrategyResult.status === 'fulfilled' 
          ? coreStrategyResult.value 
          : '先稳后进，以静制动。明确目标，分步实施，借势而为，化危为机。',
        detailedMethod: detailedMethodResult.status === 'fulfilled' 
          ? detailedMethodResult.value 
          : '第一步：明确目标，理清思路。第二步：分析现状，找准问题根源。第三步：制定计划，分步实施。',
        riskWarning: riskWarningResult.status === 'fulfilled' 
          ? riskWarningResult.value 
          : '切忌急功近利，欲速则不达。过程中需防范利益冲突，保持初心不变。'
      };
    } catch (error) {
      console.error('生成智能答案时出错:', error);
      // 如果生成过程出错，返回默认内容
      return {
        deepAnalysis: '问题核心在于决策困境，真实困扰是缺乏明确方向。',
        logicAnalysis: '古籍智慧指引方向，核心在于顺势而为。',
        historicalCase: '春秋时期，管仲辅佐齐桓公，面对内忧外患，不急于求成，而是先稳内政、后图霸业，最终成就一代霸主。',
        coreStrategy: '先稳后进，以静制动。明确目标，分步实施，借势而为，化危为机。',
        detailedMethod: '第一步：明确目标，理清思路。第二步：分析现状，找准问题根源。第三步：制定计划，分步实施。',
        riskWarning: '切忌急功近利，欲速则不达。过程中需防范利益冲突，保持初心不变。'
      };
    }
  }
  
  // 提取问题关键词
  const extractKeywords = (question) => {
    const keywords = []
    if (question.includes('管理') || question.includes('领导')) keywords.push('管理')
    if (question.includes('决策') || question.includes('选择')) keywords.push('决策')
    if (question.includes('竞争') || question.includes('对手')) keywords.push('竞争')
    if (question.includes('团队') || question.includes('合作')) keywords.push('团队')
    if (question.includes('困难') || question.includes('挑战')) keywords.push('困难')
    if (question.includes('策略') || question.includes('方法')) keywords.push('策略')
    return keywords
  }
  
  // 生成书中逻辑拆解
  const generateLogicAnalysis = async (question, book, strategies, originalText) => {
    if (!originalText) return '子女应主动关怀父母，这是为人子女的根本责任。';
    
    const logicPrompt = `原文："${originalText}"
用户问题："${question}"

请用1-2句话简要拆解这段原文的核心逻辑，要求：
1. 直接从核心逻辑开始，不要加"原文核心是"、"这段话说的是"等开头
2. 语言简洁有力，现代化表达
3. 与用户问题紧密相关
4. 不要使用破折号等符号
5. 用现代语言重新表达古文的智慧

参考示例格式："子女应主动关怀父母，冬季保暖夏季清凉，晚上安顿早上问安。这提醒你假期选择：拓宽视野固然重要，但亲情陪伴是为人子女的根本责任。"`;
    
    const logic = await callDeepSeekAPI(logicPrompt);
    return logic || '子女应主动关怀父母，这是为人子女的根本责任，把握时机与人心。';
  }
  
  // 生成历史案例
  const generateRelevantHistoricalCase = async (question, book, originalText, logicAnalysis) => {
    const casePrompt = `原文："${originalText}"
核心逻辑：${logicAnalysis}
用户问题："${question}"

请提供一个简短、生动、有画面感的真实历史案例来侧面论证这个核心逻辑。要求：
1. 必须是真实的历史人物和事件，不能虚构
2. 与原文的核心逻辑高度相关，能够印证这个智慧
3. 语言生动有画面感，有具体的人物、时间、地点、行为细节
4. 控制在80-120字之间
5. 不要使用破折号、引号等符号
6. 突出智慧策略的巧妙运用和效果
7. 要有具体的历史背景和结果

参考示例格式：明成祖永乐年间，建文旧臣方孝孺被朱棣派去劝降南方叛军，他并不急着传旨，而是要求叛军面见皇帝，把时间拖到朱棣亲自带兵赶来。叛军以为有谈判机会，松懈戒备，结果被朱棣突袭全歼`;
    
    const historicalCase = await callDeepSeekAPI(casePrompt);
    return historicalCase || '春秋时期，管仲辅佐齐桓公，面对内忧外患，不急于求成，而是先稳内政、后图霸业，最终成就一代霸主。其智慧在于急事缓做，缓事急做。';
  }
  
  // 生成核心策略（高能摘要）
  const generateCoreStrategy = async (question, book, strategies, originalText, logicAnalysis) => {
    const strategiesText = strategies && strategies.length > 0 
      ? strategies.join('、') 
      : '综合智慧';
    
    const strategyPrompt = `用户问题："${question}"
原文："${originalText}"
逻辑分析："${logicAnalysis}"
方略经纬：${strategiesText}

请给出一个快准狠的高能摘要答案，作为解决问题的核心策略。要求：
1. 用1-2句话给出直接有效的解决方案
2. 语言简洁有力，直击要害
3. 基于原文和逻辑分析的智慧
4. 控制在60字以内
5. 参考示例："所以，如果老板把高风险项目甩给你，先别急着全盘接，让他亲自站台背书，你只做执行的刀，责任在他。"`;
    
    const coreStrategy = await callDeepSeekAPI(strategyPrompt);
    return coreStrategy || '先稳后进，以静制动。明确目标，分步实施，借势而为，化危为机。';
  }
  
  // 生成详细解决方法
  const generateDetailedMethod = async (question, book, strategies, originalText, logicAnalysis) => {
    const strategiesText = strategies && strategies.length > 0 
      ? strategies.join('、') 
      : '综合智慧';
    
    const methodPrompt = `用户问题："${question}"
原文："${originalText}"
逻辑分析："${logicAnalysis}"
方略经纬：${strategiesText}

请用第二人称详细说明具体的解决方法，要求：
1. 使用第二人称（你），有画面感和代入感
2. 不要列步骤一二三四，要自然流畅的叙述
3. 具体可操作，有细节描述
4. 基于原文智慧和逻辑分析
5. 控制在200-300字
6. 直接给出具体方法，不要包含任何改写说明、格式说明或元描述
7. 参考示例风格："你可以笑着抛个球：'这个项目牵涉到好几个部门，您帮我们定个方向吧。'老板一听，自然就站到台前成了'项目主人'。之后每次开关键会议，你都先请他开场定调，而你在一旁安静记录细节、补位执行——这样，大家心里都默认，他是最终拍板的人。在项目推进的过程中，任何一点风险，你都第一时间写成邮件或会议纪要抄送老板，让证据落在纸面上，也给自己留条后路。与此同时，你还可以刻意创造一些可见的小成绩——比如提前交付一个阶段成果、或者悄悄解决一个老大难问题——让大家记住你的价值，但不要抢风头，也不要急着当"全能救世主"。"`;
    
    const detailedMethod = await callDeepSeekAPI(methodPrompt);
    return detailedMethod || `你可以先主动找对方沟通，了解真实想法和顾虑。在交流过程中，保持开放的心态，认真倾听对方的观点。然后寻找双方的共同利益点，从这个角度提出解决方案。同时，你要展现出诚意和耐心，让对方感受到你的善意。关键在于以诚待人，以理服人。`;
  }
  
  // 生成风险示警
  const generateRiskWarning = async (question, book, originalText, logicAnalysis) => {
    const warningPrompt = `用户问题："${question}"
原文："${originalText}"
逻辑分析："${logicAnalysis}"

请给出1-2句话的风险提醒，说明用这个方法需要注意的方向。要求：
1. 基于原文智慧和逻辑分析
2. 指出关键风险点和注意事项
3. 语言温和但有警示作用，用类似"不过..."开头，避免"需警惕"等生硬表达
4. 控制在80字以内
5. 可以引用历史教训作为反面例子
6. 直接给出风险提醒，不要包含任何改写说明、格式说明或元描述
7. 参考示例："不过要记住，这不是'甩锅不干'。北宋末年王安石误判局势，对辽军挑衅一味按兵不动，结果士气崩溃，丢了燕云十六州。把责任上移的前提，是你自己也要在执行中贡献成果，否则你会被看成推卸责任。"`;
    
    const riskWarning = await callDeepSeekAPI(warningPrompt);
    return riskWarning || '不过切忌急功近利，欲速则不达。过程中需防范利益冲突，保持初心不变。';
  }
  
  // 智能选择引用
  // 通过网络搜索获取书籍原文片段
  const searchBookQuotes = async (question, strategy_category) => {
    try {
      // 调用新的后端搜索API
      const response = await fetch('/api/search-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: question,
          strategy_category: strategy_category
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.quote && data.quote.length > 5) {
          return {
            text: data.quote,
            source: `${data.bookName}·${data.chapterName}`,
            bookName: data.bookName,
            chapterName: data.chapterName,
            fromNetworkSearch: data.fromNetworkSearch
          };
        }
      }
    } catch (error) {
      console.error('网络搜索失败:', error);
    }
    
    // 搜索失败时的备用方案
    return {
      text: '智者顺时而谋，愚者逆势而动。',
      source: '智慧经典·第一章',
      bookName: '智慧经典',
      chapterName: '第一章',
      fromNetworkSearch: false
    };
  }

  const selectIntelligentQuote = async (question, book) => {
    if (!book || (!book.book_name && !book.书籍名称)) {
      return { text: '智者顺时而谋，愚者逆势而动。', source: '古代智慧' };
    }
    
    // 使用网络搜索获取原文片段，传递策略类别
    return await searchBookQuotes(question, book.strategy_category);
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} data-progress={`${loadingProgress}%`}></div>
          <p>方略近在眼前...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>生成答案时出现错误</h2>
          <p>{error}</p>
          <button onClick={() => router.back()} className={styles.backButton}>
            返回重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.brand} onClick={() => router.push('/')} style={{cursor: 'pointer'}}>方略 Fanglue</div>
        <div className={styles.navLinks}>
          <button className={styles.authBtn}>注册/登录</button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        {answer && (
          <article className={styles.answerContainer}>
            {/* 探源部分 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <img src="/icons/explore-source.svg" alt="探源" className={styles.sectionIcon} />
                探源
              </h2>
              <blockquote className={styles.quote}>
                <p className={styles.quoteText}>"{answer.探源.原文}"</p>
                <cite className={styles.quoteSource}>-{answer.探源.出处}</cite>
              </blockquote>
              <div className={styles.analysis}>
                <p>{answer.探源.深层分析}</p>
              </div>
            </section>

            {/* 析局部分 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <img src="/icons/analyze-situation.svg" alt="析局" className={styles.sectionIcon} />
                析局
              </h2>
              <p className={styles.logicAnalysis}>{answer.析局.逻辑分析}</p>
              <aside className={styles.historicalCase}>
                <p className={styles.caseText}>{answer.析局.历史案例}</p>
              </aside>
            </section>

            {/* 行策部分 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <img src="/icons/execute-strategy.svg" alt="行策" className={styles.sectionIcon} />
                行策
              </h2>
              {/* 核心策略 - 有阴影框 */}
              <div className={styles.coreStrategy}>
                <p className={styles.strategyHighlight}>{answer.行策.核心策略}</p>
              </div>
              {/* 具体方法 - 白色底色 */}
              <div className={styles.detailedMethod}>
                <p className={styles.methodText}>{answer.行策.具体方法}</p>
              </div>
              {/* 风险提醒 - 白色底色 */}
              <div className={styles.riskWarning}>
                <p className={styles.warningText}>{answer.行策.风险提醒}</p>
              </div>
            </section>
          </article>
        )}
      </main>

      {/* 底部区域 */}
      <footer className={styles.footerSection}>
        <div className={styles.footerTitle}>让千载经略，为你今日一策</div>
        <div className={styles.footerButtons}>
          <a href="#" className={styles.footerBtn} title="功能开发中，敬请期待">众议百解</a>
          <a href="#" className={styles.footerBtn} title="功能开发中，敬请期待">一日一策</a>
          <a href="#" className={styles.footerBtn} title="功能开发中，敬请期待">历问历答</a>
        </div>
      </footer>
    </div>
  )
}