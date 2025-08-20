import React, { useState, useEffect } from 'react'
import styles from '../styles/Ask.module.css'
import { dbOperations } from '../lib/supabase'

export default function Ask() {
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('未连接')
  const [selectedStrategies, setSelectedStrategies] = useState([])

  // 四大方略经纬选项
  const strategyOptions = [
    { id: '行正持礼', label: '行正持礼' },
    { id: '顺势而为', label: '顺势而为' },
    { id: '巧谋实战', label: '巧谋实战' },
    { id: '运筹帷幄', label: '运筹帷幄' }
  ]

  // 测试数据库连接
  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await dbOperations.testConnection()
        setConnectionStatus(isConnected ? '已连接' : '连接失败')
      } catch (error) {
        setConnectionStatus('连接错误')
        console.error('数据库连接测试失败:', error)
      }
    }
    
    testConnection()
  }, [])

  // 处理方略经纬选择
  const handleStrategyChange = (strategyId) => {
    setSelectedStrategies(prev => {
      if (prev.includes(strategyId)) {
        return prev.filter(id => id !== strategyId)
      } else {
        return [...prev, strategyId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsSubmitting(true)
    
    try {
      // 直接跳转到答案生成页面
      const strategyParams = selectedStrategies.length > 0 ? selectedStrategies.join(',') : ''
      const queryParams = new URLSearchParams({
        question: question,
        ...(strategyParams && { strategies: strategyParams })
      })
      
      window.location.href = `/answer?${queryParams.toString()}`
    } catch (error) {
      console.error('提交失败:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.brand} onClick={() => window.location.href = '/'} style={{cursor: 'pointer'}}>方略 Fanglue</div>
        <div className={styles.navLinks}>
          <button className={styles.authBtn}>注册/登录</button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>问古今，寻方略</h1>
          <p className={styles.subtitle}>让千载经略，为你今日一策</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.questionForm}>
          <div className={styles.inputGroup}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="请输入您的问题..."
              className={styles.questionInput}
              rows={6}
              disabled={isSubmitting}
            />
          </div>

          {/* 方略经纬选择区域 */}
          <div className={styles.strategySection}>
            <h3 className={styles.strategyTitle}>方略经纬</h3>
            <p className={styles.strategySubtitle}>您希望从哪些方面获得解答？（可单选或多选，如果不选，将自动为您搜索最优策略）</p>
            <div className={styles.strategyGrid}>
              {strategyOptions.map((strategy) => (
                <div 
                  key={strategy.id} 
                  className={`${styles.strategyOption} ${selectedStrategies.includes(strategy.id) ? styles.selected : ''}`}
                  onClick={() => handleStrategyChange(strategy.id)}
                >
                  <div className={styles.strategyCheckbox}>
                    <input
                      type="checkbox"
                      id={strategy.id}
                      checked={selectedStrategies.includes(strategy.id)}
                      onChange={() => handleStrategyChange(strategy.id)}
                      className={styles.checkbox}
                    />
                    <label htmlFor={strategy.id} className={styles.checkboxLabel}>
                      <div className={styles.strategyLabel}>{strategy.label}</div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`${styles.submitButton} ${isSubmitting ? styles.loading : ''}`}
            disabled={!question.trim() || isSubmitting}
          >
            {isSubmitting ? '处理中...' : '立即寻索'}
          </button>
        </form>

        {answer && (
          <div className={styles.answerSection}>
            <h3 className={styles.answerTitle}>方略解答</h3>
            <div className={styles.answerContent}>
              {answer}
            </div>
          </div>
        )}


      </main>

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