import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '../styles/Collection.module.css'
import { authOperations, collectionOperations } from '../lib/supabase'

// 解析答案内容为三个板块
function parseAnswerSections(answer) {
  const sections = {
    explore: { title: '探源', content: '', icon: '/icons/explore-source.svg' },
    analyze: { title: '析局', content: '', icon: '/icons/analyze-situation.svg' },
    execute: { title: '行策', content: '', icon: '/icons/execute-strategy.svg' }
  }

  // 按照标题分割内容，保持原文
  const parts = answer.split(/(?=##\s*[探析行][源局策])/)
  
  parts.forEach(part => {
    if (part.includes('## 探源') || part.includes('探源')) {
      sections.explore.content = part.replace(/##\s*探源\s*/, '').trim()
    } else if (part.includes('## 析局') || part.includes('析局')) {
      sections.analyze.content = part.replace(/##\s*析局\s*/, '').trim()
    } else if (part.includes('## 行策') || part.includes('行策')) {
      sections.execute.content = part.replace(/##\s*行策\s*/, '').trim()
    } else if (!part.includes('##') && part.trim()) {
      // 如果没有明确的标题，尝试根据内容特征分配
      if (part.includes('古语') || part.includes('典籍') || part.includes('经典')) {
        sections.explore.content = part.trim()
      } else if (part.includes('分析') || part.includes('情况') || part.includes('局势')) {
        sections.analyze.content = part.trim()
      } else {
        sections.execute.content = part.trim()
      }
    }
  })

  return sections
}

// 渲染单个答案板块
function renderAnswerSection(section, sectionKey) {
  if (!section.content) return null

  // 为析局和行策添加分隔线
  const needsSeparator = sectionKey === 'analyze' || sectionKey === 'execute'

  return (
    <div key={sectionKey} className={styles.answerSection}>
      {needsSeparator && <div className={styles.sectionSeparator}></div>}
      <div className={styles.answerSectionTitle}>
        <img src={section.icon} alt={section.title} className={styles.answerSectionIcon} />
        {section.title}
      </div>
      <div className={styles.answerSectionContent}>
        {sectionKey === 'explore' && renderExploreContent(section.content)}
        {sectionKey === 'analyze' && renderAnalyzeContent(section.content)}
        {sectionKey === 'execute' && renderExecuteContent(section.content)}
      </div>
    </div>
  )
}

// 渲染探源内容
function renderExploreContent(content) {
  return (
    <div>
      <p>{content}</p>
    </div>
  )
}

// 渲染析局内容
function renderAnalyzeContent(content) {
  return (
    <div>
      <p className={styles.paragraphSpacing}>{content}</p>
    </div>
  )
}

// 渲染行策内容
function renderExecuteContent(content) {
  return (
    <div>
      <p className={styles.paragraphSpacing}>{content}</p>
    </div>
  )
}

// 解析并渲染完整答案
function renderFullAnswer(answerData) {
  try {
    // 尝试解析JSON格式的答案
    const answer = JSON.parse(answerData)
    
    return (
      <div className={styles.fullAnswerContainer}>
        <button className={styles.collapseButton}>收起</button>
        {/* 探源部分 */}
        <section className={styles.answerSection}>
          <h3 className={styles.sectionTitle}>
            <img src="/icons/explore-source.svg" alt="探源" className={styles.sectionIcon} />
            探源
          </h3>
          <div className={styles.quoteContainer}>
            <blockquote className={styles.quote}>
              <p className={styles.quoteText}>"{answer.探源.原文}"</p>
              <cite className={styles.quoteSource}>-{answer.探源.出处}</cite>
            </blockquote>
          </div>
          <div className={styles.analysis}>
            <p>{answer.探源.深层分析}</p>
          </div>
        </section>

        {/* 析局部分 */}
        <section className={styles.answerSection}>
          <h3 className={styles.sectionTitle}>
            <img src="/icons/analyze-situation.svg" alt="析局" className={styles.sectionIcon} />
            析局
          </h3>
          <p className={styles.logicAnalysis}>{answer.析局.逻辑分析}</p>
          <aside className={styles.historicalCase}>
            <p className={styles.caseText}>{answer.析局.历史案例}</p>
          </aside>
        </section>

        {/* 行策部分 */}
        <section className={styles.answerSection}>
          <h3 className={styles.sectionTitle}>
            <img src="/icons/execute-strategy.svg" alt="行策" className={styles.sectionIcon} />
            行策
          </h3>
          <div className={styles.coreStrategy}>
            <p className={styles.strategyHighlight}>{answer.行策.核心策略}</p>
          </div>
          <div className={styles.detailedMethod}>
            <p className={styles.methodText}>{answer.行策.具体方法}</p>
          </div>
          <div className={styles.riskWarning}>
            <p className={styles.warningText}>{answer.行策.风险提醒}</p>
          </div>
        </section>
      </div>
    )
  } catch (error) {
    // 如果不是JSON格式，按原来的方式显示
    return (
      <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit'}}>{answerData}</pre>
    )
  }
}

// 获取答案预览
function getAnswerPreview(answerData) {
  try {
    // 解析JSON并提取quote和source内容
    const answer = JSON.parse(answerData)
    let quote = ''
    let source = ''
    
    // 提取原文和出处
    function extractQuoteAndSource(obj, parentKey = '') {
      if (typeof obj === 'string') {
        if (parentKey === '原文') {
          quote = obj
        } else if (parentKey === '出处') {
          source = obj
        }
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => extractQuoteAndSource(value, key))
      }
    }
    
    extractQuoteAndSource(answer)
    
    return (
      <div className={styles.answerPreview}>
        <div className={styles.quoteRow}>
          <div className={styles.quoteText}>"{quote}"</div>
          <button className={styles.expandButton}>展开</button>
        </div>
        <div className={styles.sourceText}>— {source}</div>
      </div>
    )
  } catch (error) {
    // 如果不是JSON格式，返回简单文本
    const plainText = answerData.replace(/[\n\r]/g, ' ').trim()
    return plainText.substring(0, 100) + (plainText.length > 100 ? '...' : '')
  }
}

export default function Collection() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [expandedAnswers, setExpandedAnswers] = useState(new Set())
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  
  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authOperations.getCurrentUser()
        if (!currentUser) {
          router.push('/auth')
          return
        }
        setUser(currentUser)
        await loadCollections(currentUser.id)
      } catch (error) {
        console.error('用户认证错误:', error)
        router.push('/auth')
      }
    }
    
    checkUser()
    
    // 监听认证状态变化
    const { data: { subscription } } = authOperations.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null)
        if (session?.user) {
          loadCollections(session.user.id)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/auth')
      }
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  // 加载收藏列表
  const loadCollections = async (userId) => {
    try {
      setLoading(true)
      const result = await collectionOperations.getUserCollections(userId)
      setCollections(result?.data || [])
    } catch (error) {
      console.error('加载收藏失败:', error)
      setCollections([])
    } finally {
      setLoading(false)
    }
  }
  
  // 处理登出
  const handleSignOut = async () => {
    try {
      await authOperations.signOut()
      setShowDropdown(false)
    } catch (error) {
      console.error('登出错误:', error)
    }
  }
  
  // 切换问题展开/折叠
  const toggleQuestion = (question) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(question)) {
      newExpanded.delete(question)
    } else {
      newExpanded.add(question)
    }
    setExpandedQuestions(newExpanded)
  }
  
  // 切换答案展开/折叠
  const toggleAnswer = (id) => {
    const newExpanded = new Set(expandedAnswers)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedAnswers(newExpanded)
  }
  
  // 选择/取消选择项目
  const toggleSelection = (id) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }
  
  // 选择/取消选择问题（联动选择该问题下的所有答案）
  const toggleQuestionSelection = (question) => {
    const questionGroup = groupedArray.find(group => group.question === question)
    if (!questionGroup) return
    
    const answerIds = questionGroup.answers.map(answer => answer.id)
    const newSelected = new Set(selectedItems)
    
    // 检查是否所有答案都已选中
    const allSelected = answerIds.every(id => newSelected.has(id))
    
    if (allSelected) {
      // 如果全部选中，则取消选择所有答案
      answerIds.forEach(id => newSelected.delete(id))
    } else {
      // 如果未全部选中，则选择所有答案
      answerIds.forEach(id => newSelected.add(id))
    }
    
    setSelectedItems(newSelected)
  }
  
  // 检查问题是否被选中（当其下所有答案都被选中时）
  const isQuestionSelected = (question) => {
    const questionGroup = groupedArray.find(group => group.question === question)
    if (!questionGroup) return false
    
    const answerIds = questionGroup.answers.map(answer => answer.id)
    return answerIds.length > 0 && answerIds.every(id => selectedItems.has(id))
  }
  
  // 检查问题是否部分选中（有些答案被选中但不是全部）
  const isQuestionPartiallySelected = (question) => {
    const questionGroup = groupedArray.find(group => group.question === question)
    if (!questionGroup) return false
    
    const answerIds = questionGroup.answers.map(answer => answer.id)
    const selectedCount = answerIds.filter(id => selectedItems.has(id)).length
    return selectedCount > 0 && selectedCount < answerIds.length
  }
  
  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedItems.size === currentPageItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(currentPageItems.map(item => item.id)))
    }
  }
  
  // 删除选中项目
  const handleDelete = async () => {
    if (selectedItems.size === 0) return
    
    try {
      const idsArray = Array.from(selectedItems)
      await collectionOperations.deleteCollections(idsArray)
      
      // 重新加载数据
      await loadCollections(user.id)
      setSelectedItems(new Set())
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
  }
  
  // 按问题分组收藏数据
  const groupedCollections = collections.reduce((groups, item) => {
    const question = item.question
    if (!groups[question]) {
      groups[question] = []
    }
    groups[question].push(item)
    return groups
  }, {})
  
  // 将分组转换为数组并按最新收藏时间排序
  const groupedArray = Object.entries(groupedCollections).map(([question, answers]) => ({
    question,
    answers: answers.sort((a, b) => new Date(b.collected_at) - new Date(a.collected_at)),
    latestDate: answers.reduce((latest, answer) => 
      new Date(answer.collected_at) > new Date(latest) ? answer.collected_at : latest, 
      answers[0].collected_at
    )
  })).sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate))
  
  // 分页计算（基于问题组）
  const totalPages = Math.ceil(groupedArray.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentPageGroups = groupedArray.slice(startIndex, startIndex + itemsPerPage)
  
  // 获取当前页面的所有答案项（用于全选功能）
  const currentPageItems = currentPageGroups.flatMap(group => group.answers)
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>加载中...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>历问历答 - 方略 Fanglue</title>
        <meta name="description" content="查看您收藏的问答内容" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* 顶部导航栏 */}
        <nav className={styles.navbar}>
          <div className={styles.brand} onClick={() => router.push('/')} style={{cursor: 'pointer'}}>方略 Fanglue</div>
          <div className={styles.navLinks}>
            {user && (
              <div className={styles.userMenu}>
                <button 
                  className={styles.userButton}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {user.user_metadata?.username || user.email}
                  <span className={styles.dropdownArrow}>▼</span>
                </button>
                {showDropdown && (
                  <div className={styles.dropdown}>
                    <button 
                      className={styles.dropdownItem}
                      onClick={() => {
                        setShowDropdown(false)
                        router.push('/profile')
                      }}
                    >
                      个人资料
                    </button>
                    <button 
                      className={styles.dropdownItem}
                      onClick={() => {
                        setShowDropdown(false)
                        // 当前就在历问历答页面
                      }}
                      style={{backgroundColor: '#f0f0f0'}}
                    >
                      历问历答
                    </button>
                    <hr className={styles.dropdownDivider} />
                    <button 
                      className={styles.dropdownItem}
                      onClick={handleSignOut}
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* 主内容区域 */}
        <main className={styles.mainContent}>
          {/* 页面标题 */}
          <div className={styles.mainTitle}>
            <div className={styles.titleLine}>历问历答</div>
          </div>

          {/* 操作栏 */}
          {collections.length > 0 && (
            <div className={styles.actionBar}>
              <div className={styles.selectActions}>
                <div className={styles.leftActions}>
                  <label className={styles.selectAll}>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.size === currentPageItems.length && currentPageItems.length > 0}
                      onChange={toggleSelectAll}
                    />
                    全选
                  </label>
                  <div className={styles.pageInfo}>
                    共 {groupedArray.length} 个问题，{collections.length} 条收藏
                  </div>
                </div>
                {selectedItems.size > 0 && (
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    删除 ({selectedItems.size})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 收藏列表 */}
          {collections.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19.5C4 18.837 4.263 18.201 4.732 17.732C5.201 17.263 5.837 17 6.5 17H20" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20V22H6.5C5.837 22 5.201 21.737 4.732 21.268C4.263 20.799 4 20.163 4 19.5V4.5C4 3.837 4.263 3.201 4.732 2.732C5.201 2.263 5.837 2 6.5 2Z" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.emptyTitle}>暂无收藏</div>
              <button 
                className={styles.mainButton}
                onClick={() => router.push('/ask')}
              >
                立即寻索
              </button>
            </div>
          ) : (
            <>
              <div className={styles.collectionList}>
                {currentPageGroups.map((group) => (
                  <div key={group.question} className={styles.questionGroup}>
                    {/* 问题标题区域 */}
                    <div className={styles.questionHeader}>
                      <div className={styles.questionTitle}>
                        <div className={styles.questionTitleRow}>
                          <label className={styles.questionCheckbox}>
                            <input 
                              type="checkbox" 
                              checked={isQuestionSelected(group.question)}
                              ref={input => {
                                if (input) {
                                  input.indeterminate = isQuestionPartiallySelected(group.question)
                                }
                              }}
                              onChange={() => toggleQuestionSelection(group.question)}
                            />
                          </label>
                          <button 
                            className={styles.questionToggle}
                            onClick={() => toggleQuestion(group.question)}
                          >
                            <span className={styles.toggleIcon}>
                              {expandedQuestions.has(group.question) ? '▼' : '▶'}
                            </span>
                            {group.question}
                          </button>
                        </div>

                      </div>
                    </div>
                    
                    {/* 答案列表区域 */}
                    {expandedQuestions.has(group.question) && (
                      <div className={styles.answersList}>
                        {group.answers.map((item, index) => (
                          <div key={item.id} className={styles.answerItem}>
                            <div className={styles.answerHeader}>
                              <label className={styles.itemCheckbox}>
                                <input 
                                  type="checkbox" 
                                  checked={selectedItems.has(item.id)}
                                  onChange={() => toggleSelection(item.id)}
                                />
                              </label>
                            </div>
                            
                            <div 
                              className={styles.answerContent}
                              onClick={() => toggleAnswer(item.id)}
                              style={{cursor: 'pointer'}}
                            >
                              {expandedAnswers.has(item.id) ? (
                                <div className={styles.answerFullContent}>
                                  {renderFullAnswer(item.answer)}
                                </div>
                              ) : (
                                <div className={styles.answerCollapsed}>
                                  {getAnswerPreview(item.answer)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    className={styles.pageBtn}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    上一页
                  </button>
                  <span className={styles.pageInfo}>
                    第 {currentPage} 页，共 {totalPages} 页
                  </span>
                  <button 
                    className={styles.pageBtn}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* 底部区域 */}
        <footer className={styles.footerSection}>
          <div className={styles.footerTitle}>让千载经略，为你今日一策</div>
          <div className={styles.footerButtons}>
            <a href="#" className={styles.footerBtn} title="功能开发中，敬请期待">众议百解</a>
            <a href="#" className={styles.footerBtn} title="功能开发中，敬请期待">一日一策</a>
            <a href="/collection" className={`${styles.footerBtn} ${styles.active}`}>历问历答</a>
          </div>
        </footer>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>确认删除</h3>
            <p>确定要删除选中的 {selectedItems.size} 条收藏吗？此操作不可撤销。</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </button>
              <button 
                className={styles.confirmBtn}
                onClick={handleDelete}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}