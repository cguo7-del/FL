import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '../styles/About.module.css'
import { authOperations } from '../lib/supabase'

export default function About() {
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
        <title>关于我们 - 方略 Fanglue</title>
        <meta name="description" content="了解方略 - 从经史到兵法，古智与算法，同答一问" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* 顶部导航栏 */}
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
          {/* 页面标题 */}
          <div className={styles.pageTitle}>
            <h1 className={styles.titleLine}>关于我们</h1>
          </div>

          {/* 正文内容 */}
          <div className={styles.contentSection}>
            <div className={styles.contentText}>
              <p>在生活里、工作中，你是不是也常常遇到这种情况：问题横在眼前，不知道该怎么选、怎么推进，或者人际关系突然卡住，让人一时间无从下手？</p>
              
              <p>方略，正是为这种时刻准备的。我们深入研读古代经典，把《老子》的智慧、《庄子》的洒脱、《韩非子》的策略，重新转译成今天立刻能用的思路和方法。它能在你提出问题的瞬间，从浩瀚的古籍中筛选出最贴合的答案，并化成简洁、直接、可落地的建议</p>
              
              <p>所以，当你迷茫时，不妨来和方略聊聊。你会发现，几千年前的人和我们一样，也面对选择与困境；唯一的不同是，现在你不需要再去翻那些晦涩的古文，而是能立刻拿到经过提炼的、真正能帮你解题的灵感</p>
              
              <p>有了方略，你就不再是一个人摸索，而是随时随地都能和古代的先贤并肩作战，一起找到最聪明的解决方法</p>
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
    </>
  )
}