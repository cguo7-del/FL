import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'
import { authOperations } from '../lib/supabase'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  
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
  
  // 处理登出
  const handleSignOut = async () => {
    try {
      await authOperations.signOut()
      setShowDropdown(false)
    } catch (error) {
      console.error('登出错误:', error)
    }
  }

  return (
    <>
      <Head>
        <title>方略 Fanglue</title>
        <meta name="description" content="从经史到兵法，古智与算法，同答一问" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* 顶部导航栏 */}
        <nav className={styles.navbar}>
          <div className={styles.brand}>方略 Fanglue</div>
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
              <button 
                className={styles.authBtn}
                onClick={() => router.push('/auth')}
              >
                注册/登录
              </button>
            )}
          </div>
        </nav>

        {/* 主内容区域 */}
        <main className={styles.mainContent}>
          {/* 主标题区域 */}
          <div className={styles.mainTitle}>
            <div className={styles.titleLine}>三十息，问古今</div>
            <div className={styles.titleLine}>千年略，解一念</div>
            <div className={styles.subtitle}>从经史到兵法，古智与算法，同答一问</div>
          </div>

          {/* 核心功能按钮 */}
          <a href="/ask" className={styles.mainButton}>立即寻索</a>

          {/* 功能模块展示 */}
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <img src="/icons/explore-source.svg" alt="探源" width="60" height="60" />
              </div>
              <div className={styles.featureTitle}>探源</div>
              <div className={styles.featureDesc}>溯古问道<br />择智珠以为引</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <img src="/icons/analyze-situation.svg" alt="析局" width="60" height="60" />
              </div>
              <div className={styles.featureTitle}>析局</div>
              <div className={styles.featureDesc}>洞察机枢<br />见万变之本脉</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <img src="/icons/execute-strategy.svg" alt="行策" width="60" height="60" />
              </div>
              <div className={styles.featureTitle}>行策</div>
              <div className={styles.featureDesc}>授你谋纲<br />行于九地八方</div>
            </div>
          </div>
        </main>

        {/* 底部区域 */}
        <footer className={styles.footerSection}>
          <div className={styles.footerTitle}>让千载经略，为你今日一策</div>
          <div className={styles.footerButtons}>
            <a href="#" className={styles.footerBtn} title="功能开发中，敬请期待">众议百解</a>
            <a href="#" className={styles.footerBtn} title="功能开发中，敬请期待">一日一策</a>
            <a href="/collection" className={styles.footerBtn}>历问历答</a>
          </div>
        </footer>
      </div>
    </>
  )
}