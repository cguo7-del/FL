import React, { useState, useEffect } from 'react'
import styles from '../styles/Ask.module.css'
import { dbOperations } from '../lib/supabase'

export default function Ask() {
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('未连接')

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsSubmitting(true)
    
    try {
      // 模拟AI服务调用
      const aiAnswer = '感谢您的提问！AI问答功能正在开发中，敬请期待。'
      
      // 将问答对话存储到数据库
      await dbOperations.insert('conversations', {
        question: question,
        answer: aiAnswer,
        created_at: new Date().toISOString()
      })
      
      setAnswer(aiAnswer)
      console.log('问答已保存到数据库')
    } catch (error) {
      console.error('保存问答到数据库失败:', error)
      // 即使数据库保存失败，仍然显示AI回答
      setAnswer('感谢您的提问！AI问答功能正在开发中，敬请期待。')
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