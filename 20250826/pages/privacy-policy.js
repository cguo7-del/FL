import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '../styles/PrivacyPolicy.module.css'
import { authOperations } from '../lib/supabase'

export default function PrivacyPolicy() {
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
        <title>隐私政策 - 方略 Fanglue</title>
        <meta name="description" content="方略隐私政策 - 了解我们如何保护您的个人信息" />
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
            <h1 className={styles.titleLine}>隐私政策</h1>
          </div>

          {/* 正文内容 */}
          <div className={styles.contentSection}>
            <div className={styles.contentText}>
              <p>方略（以下简称"我们"）非常注重您的隐私，我们致力于维持您对我们的信任，并保护您的个人信息</p>
              
              <p>您留下的邮箱和提问内容，只会被用来改进功能和优化用户体验。我们会尽全力保护您的个人信息安全，采取合理的技术和管理措施，防止未经授权的访问、泄露或篡改。我们承诺不会将您的个人信息出售给任何第三方。我们仅在为您提供服务、改善用户体验、保障系统安全等必要情况下使用您的信息，并严格按照相关法律法规的要求进行处理</p>
              
              <p>隐私政策可能会不时更新，我们会在网站上发布最新版本，您可以随时查看</p>
              
              <p>如果您对我们的隐私政策有任何疑问或建议，欢迎通过contact@fanglue.org与我们联系。我们会认真对待每一份反馈，并持续完善我们的隐私保护措施</p>
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