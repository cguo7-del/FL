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
    
    // 安全获取原文内容（使用智能选择）
    const getOriginalText = async (book) => {
      if (!book || !book.章节内容 || typeof book.章节内容 !== 'string') {
        return "古人云：'知己知彼，百战不殆。'"
      }
      // 使用智能引用选择
      const quote = await selectIntelligentQuote(question, book)
      return quote.text
    }
    
    const getBookSource = (book) => {
      if (!book || !book.书籍名称 || !book.章节名称) {
        return "《古代典籍》"
      }
      return `《${book.书籍名称}·${book.章节名称}》`
    }
    
    // 调用大语言模型生成答案内容
    try {
      const prompt = `请基于以下信息生成一个结构化的智慧解答：

用户问题：${question}

选择的方略经纬：${strategies && strategies.length > 0 ? strategies.join('、') : '无特定方向'}

引用书籍：${randomBook ? `《${randomBook.书籍名称}》` : '古代典籍'}
书籍内容：${randomBook ? randomBook.章节内容 : '古代智慧典籍'}

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
      const generatedAnswer = await generateIntelligentAnswer(question, randomBook, strategies)
      
      return {
        探源: {
          原文: await getOriginalText(randomBook),
          出处: getBookSource(randomBook),
          问题转述: question,
          深层分析: generatedAnswer.deepAnalysis
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
      return {
        探源: {
          原文: await getOriginalText(randomBook),
          出处: getBookSource(randomBook),
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
    '管理': '春秋时期，管仲辅佐齐桓公，面对内忧外患，不急于求成，而是先稳内政、后图霸业，最终成就一代霸主。其智慧在于：急事缓做，缓事急做。',
    '决策': '战国时期，赵武灵王面临胡服骑射的重大决策时，明知会遭到保守派反对，但他通过逐步试点、示范效果的方式，最终说服了朝野上下。',
    '竞争': '三国时期，诸葛亮在与司马懿的较量中，深知正面对抗不利，于是采用"以逸待劳"的策略，通过空城计等智谋，在实力不足的情况下仍能与强敌周旋。',
    '团队': '汉初，刘邦能够统一天下，关键在于他善于团结各方人才，对张良用其智，对韩信用其勇，对萧何用其能，让每个人都能发挥所长。',
    '挑战': '明朝时期，于谦在土木堡之变后临危受命，面对瓦剌大军的压境的危局，他没有慌乱，而是冷静分析形势，调动一切可用资源，最终成功保卫了北京。',
    '策略': '孙武在《孙子兵法》中提出"兵者，诡道也"，强调策略的灵活性和适应性，根据不同情况采用不同的战术，这一思想至今仍有重要指导意义。'
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

  // 基于书籍内容的智能答案生成函数（优化并行处理）
  const generateIntelligentAnswer = async (question, book, strategies) => {
    try {
      const bookTitle = book ? book.书籍名称 : '古代典籍';
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
      
      // 并行调用所有API，无超时限制
      const promises = [
        callDeepSeekAPI(analysisPrompt),
        generateLogicAnalysis(question, book, strategies),
        generateRelevantHistoricalCase(question, book),
        generateCoreStrategy(question, book, strategies),
        generateDetailedMethod(question, book, strategies),
        generateRiskWarning(question, book)
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
    if (question.includes('困难') || question.includes('挑战')) keywords.push('挑战')
    if (question.includes('策略') || question.includes('方法')) keywords.push('策略')
    return keywords
  }
  
  // 生成书中逻辑拆解
  const generateLogicAnalysis = async (question, book, strategies) => {
    if (!book) return '古籍智慧指引方向，核心在于顺势而为。';
    
    const logicPrompt = `古籍：《${book.书籍名称}》
用户问题："${question}"

请用1-2句话简要拆解这本古籍中与用户问题相关的核心逻辑。要求：
1. 直接点出书中的核心智慧
2. 语言简洁有力
3. 与用户问题紧密相关`;
    
    const logic = await callDeepSeekAPI(logicPrompt);
    return logic || `《${book.书籍名称}》强调顺势而为，核心在于把握时机与人心。`;
  }
  
  // 生成历史案例
  const generateRelevantHistoricalCase = async (question, book) => {
    const casePrompt = `用户问题："${question}"

请提供一个简短、生动、有画面感的真实历史案例来说明类似问题的解决之道。要求：
1. 真实的历史人物和事件
2. 与用户问题高度相关
3. 语言生动有画面感
4. 控制在100字以内
5. 突出解决问题的智慧`;
    
    const historicalCase = await callDeepSeekAPI(casePrompt);
    return historicalCase || '春秋时期，管仲辅佐齐桓公，面对内忧外患，不急于求成，而是先稳内政、后图霸业，最终成就一代霸主。其智慧在于：急事缓做，缓事急做。';
  }
  
  // 生成核心策略（高能摘要）
  const generateCoreStrategy = async (question, book, strategies) => {
    const strategiesText = strategies && strategies.length > 0 
      ? strategies.join('、') 
      : '综合智慧';
    
    const strategyPrompt = `用户问题："${question}"
方略经纬：${strategiesText}

请给出一个快准狠的高能摘要，作为解决问题的核心策略。要求：
1. 语言简洁有力
2. 直击问题要害
3. 具有可操作性
4. 控制在50字以内
5. 体现古代智慧的精髓`;
    
    const coreStrategy = await callDeepSeekAPI(strategyPrompt);
    return coreStrategy || '先稳后进，以静制动。明确目标，分步实施，借势而为，化危为机。';
  }
  
  // 生成详细解决方法
  const generateDetailedMethod = async (question, book, strategies) => {
    const strategiesText = strategies && strategies.length > 0 
      ? strategies.join('、') 
      : '综合智慧';
    
    const methodPrompt = `用户问题："${question}"
方略经纬：${strategiesText}

请详细给出解决方法，要求：
1. 分步骤、有逻辑
2. 具体可操作
3. 结合古代智慧
4. 语言简洁明了
5. 控制在200字以内`;
    
    const detailedMethod = await callDeepSeekAPI(methodPrompt);
    return detailedMethod || `第一步：明确目标，理清思路。第二步：分析现状，找准问题根源。第三步：制定计划，分步实施。第四步：调动资源，凝聚力量。第五步：持续跟进，及时调整。关键在于稳扎稳打，步步为营。`;
  }
  
  // 生成风险示警
  const generateRiskWarning = async (question, book) => {
    const warningPrompt = `用户问题："${question}"

请给出一个简短的示警，提醒用户在解决问题过程中需要注意的风险。要求：
1. 语言简洁有力
2. 直指关键风险
3. 具有警示作用
4. 控制在50字以内
5. 体现古代智慧的谨慎`;
    
    const riskWarning = await callDeepSeekAPI(warningPrompt);
    return riskWarning || '切忌急功近利，欲速则不达。过程中需防范利益冲突，保持初心不变。';
  }
  
  // 智能选择引用
  const selectIntelligentQuote = async (question, book) => {
    if (!book) return { text: '智者顺时而谋，愚者逆势而动。', source: '古代智慧' };
    
    const quotePrompt = `古籍：《${book.书籍名称}》
用户问题："${question}"

请从这本古籍的智慧中，选择或生成一句与用户问题高度相关的经典语录。要求：
1. 语言简洁有力
2. 与问题高度相关
3. 体现古代智慧
4. 控制在30字以内`;
    
    const quote = await callDeepSeekAPI(quotePrompt);
    return {
      text: quote || '知己知彼，百战不殆。',
      source: book.书籍名称
    };
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
        <div className={styles.brand}>方略 Fanglue</div>
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
                <cite className={styles.quoteSource}>- {answer.探源.出处}</cite>
              </blockquote>
              <div className={styles.analysis}>
                <p className={styles.questionRestate}>{answer.探源.问题转述}</p>
                <p className={styles.deepAnalysis}>{answer.探源.深层分析}</p>
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
              <p className={styles.strategyHighlight}>{answer.行策.核心策略}</p>
              <p className={styles.methodText}>{answer.行策.具体方法}</p>
              <p className={styles.warningText}>{answer.行策.风险提醒}</p>
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