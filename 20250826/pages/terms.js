import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '../styles/Terms.module.css'
import { authOperations } from '../lib/supabase'

export default function Terms() {
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
        <title>服务条款 - 方略 Fanglue</title>
        <meta name="description" content="方略服务条款 - 了解使用我们服务的相关条款和条件" />
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
            <h1 className={styles.titleLine}>服务条款</h1>
          </div>

          {/* 正文内容 */}
          <div className={styles.contentSection}>
            <div className={styles.contentText}>
              <p>欢迎使用方略（Fanglue）提供的服务。在您使用我们的服务之前，请仔细阅读并理解本服务条款。通过访问或使用我们的服务，您表示同意遵守本条款的所有规定</p>
              
              <p>我们致力于为用户提供优质的古典文化学习和交流平台。您在使用我们的服务时，应当遵守相关法律法规，不得发布违法、有害、虚假或不当的内容，共同维护良好的社区环境</p>
              
              <p>我们保留随时修改、暂停或终止服务的权利，并会在合理范围内提前通知用户。对于因系统维护、升级或其他不可抗力因素导致的服务中断，我们将尽力减少对用户的影响</p>
              
              <p>如果您对本服务条款有任何疑问或需要进一步了解，请通过contact@fanglue.org与我们联系。我们将根据实际情况和用户反馈，持续完善我们的服务条款</p>
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