import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '../styles/Ask.module.css'
import { dbOperations, authOperations } from '../lib/supabase'

export default function Ask() {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('未连接')
  const [selectedStrategies, setSelectedStrategies] = useState([])
  const [strategyOptions, setStrategyOptions] = useState([])
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // 测试数据库连接和获取策略选项
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
    
    const fetchStrategyOptions = async () => {
      try {
        const { supabase } = await import('../lib/supabase')
        const { data, error } = await supabase
          .from('book_library')
          .select('strategy_category')
          .order('strategy_category')
        
        if (error) {
          console.error('获取策略分类失败:', error)
          // 使用默认选项作为备用
          setStrategyOptions([
            { id: '行正持礼', label: '行正持礼' },
            { id: '顺势而为', label: '顺势而为' },
            { id: '巧谋实战', label: '巧谋实战' },
            { id: '运筹帷幄', label: '运筹帷幄' }
          ])
        } else {
          // 去重并转换为选项格式
          const uniqueCategories = [...new Set(data.map(item => item.strategy_category))]
          const options = uniqueCategories.map(category => ({
            id: category,
            label: category
          }))
          setStrategyOptions(options)
        }
      } catch (error) {
        console.error('获取策略分类失败:', error)
        // 使用默认选项作为备用
        setStrategyOptions([
          { id: '行正持礼', label: '行正持礼' },
          { id: '顺势而为', label: '顺势而为' },
          { id: '巧谋实战', label: '巧谋实战' },
          { id: '运筹帷幄', label: '运筹帷幄' }
        ])
      }
    }
    
    testConnection()
    fetchStrategyOptions()
  }, [])
  
  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authOperations.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        setUser(null)
      }
    }
    
    checkUser()
    
    // 监听认证状态变化
    const { data: { subscription } } = authOperations.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })
    
    return () => subscription.unsubscribe()
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

  // 处理登出
  const handleSignOut = async () => {
    try {
      await authOperations.signOut()
      setShowDropdown(false)
    } catch (error) {
      console.error('登出错误:', error)
    }
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
        <div className={styles.brand} onClick={() => router.push('/')} style={{cursor: 'pointer'}}>方略 Fanglue</div>
        <div className={styles.navLinks}>
          {user ? (
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
                      router.push('/collection')
                    }}
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
          ) : (
            <button className={styles.authBtn} onClick={() => router.push('/auth')}>注册/登录</button>
          )}
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
          <a href="/collection" className={styles.footerBtn}>历问历答</a>
        </div>
        {/* 页脚导航 */}
        <div className={styles.footerNavigation}>
          <span className={styles.copyright}>© 2025 Fanglue.org</span>
          <span className={styles.navSeparator}>|</span>
          <a href="/about" className={styles.footerNavLink}>关于我们</a>
          <span className={styles.navSeparator}>|</span>
          <a href="/contact" className={styles.footerNavLink}>联系我们</a>
          <span className={styles.navSeparator}>|</span>
          <a href="/advertise" className={styles.footerNavLink}>广告合作</a>
          <span className={styles.navSeparator}>|</span>
          <a href="/privacy-policy" className={styles.footerNavLink}>隐私政策</a>
            <span className={styles.navSeparator}>|</span>
            <a href="/terms" className={styles.footerNavLink}>服务条款</a>
        </div>
      </footer>
    </div>
  )
}