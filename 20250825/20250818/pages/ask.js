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
    { id: '行正持礼', label: '行正持礼', description: '论语、孟子、礼记、近思录' },
    { id: '顺势而为', label: '顺势而为', description: '道德经、庄子、淮南子' },
    { id: '巧谋实战', label: '巧谋实战', description: '孙子兵法、鬼谷子、资治通鉴、三十六计' },
    { id: '运筹帷幄', label: '运筹帷幄', description: '韩非子、商君书、盐铁论、贞观政要' }
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
      // 跳转到答案生成页面
      const strategyParams = selectedStrategies.length > 0 ? selectedStrategies.join(',') : ''
      const queryParams = new URLSearchParams({
        question: question,
        ...(strategyParams && { strategies: strategyParams })
      })
      
      window.location.href = `/answer?${queryParams.toString()}`
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.brand}>方略 Fanglue</div>
        <div className={styles.navLinks}>
          <a href="/" className={styles.navLink}>返回首页</a>
          <div className={styles.dbStatus}>数据库: {connectionStatus}</div>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>问古今，寻方略</h1>
          <p className={styles.subtitle}>请输入您的问题，让古智与算法为您解答</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.questionForm}>
          <div className={styles.inputGroup}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="请输入您的问题...\n\n例如：\n• 如何在商业竞争中制定策略？\n• 古代兵法在现代管理中的应用\n• 面对困境时的决策思路"
              className={styles.questionInput}
              rows={6}
              disabled={isSubmitting}
            />
          </div>

          {/* 方略经纬选择区域 */}
          <div className={styles.strategySection}>
            <h3 className={styles.strategyTitle}>方略经纬</h3>
            <p className={styles.strategySubtitle}>选择您希望参考的智慧方向（可多选或不选）</p>
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
                      <div className={styles.strategyDescription}>{strategy.description}</div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!question.trim() || isSubmitting}
          >
            {isSubmitting ? '正在思考...' : '立即寻索'}
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

        <div className={styles.features}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>📚</div>
            <div className={styles.featureText}>
              <div className={styles.featureTitle}>博古通今</div>
              <div className={styles.featureDesc}>融合古代智慧与现代思维</div>
            </div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🎯</div>
            <div className={styles.featureText}>
              <div className={styles.featureTitle}>精准解答</div>
              <div className={styles.featureDesc}>针对性分析，实用性建议</div>
            </div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>⚡</div>
            <div className={styles.featureText}>
              <div className={styles.featureTitle}>即时响应</div>
              <div className={styles.featureDesc}>快速获得深度思考结果</div>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 方略 Fanglue - 让千载经略，为你今日一策</p>
      </footer>
    </div>
  )
}