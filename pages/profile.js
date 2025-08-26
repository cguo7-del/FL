import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '../styles/Profile.module.css'
import { authOperations, supabase, localizeSupabaseError } from '../lib/supabase'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  
  // 表单状态
  const [username, setUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  
  // 忘记密码状态
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  useEffect(() => {
    const initUser = async () => {
      try {
        const currentUser = await authOperations.getCurrentUser()
        setUser(currentUser)
        if (currentUser) {
          setUsername(currentUser.user_metadata?.username || '')
        }
      } catch (error) {
        setUser(null)
      }
    }

    initUser()

    const { data: { subscription } } = authOperations.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null)
        if (session?.user) {
          setUsername(session.user.user_metadata?.username || '')
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await authOperations.signOut()
      setShowDropdown(false)
    } catch (error) {
      console.error('登出错误:', error)
    }
  }

  const showMessage = (msg, type) => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
  }

  const handleUpdateUsername = async (e) => {
    e.preventDefault()
    if (!username.trim()) {
      showMessage('用户名不能为空', 'error')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await authOperations.supabase.auth.updateUser({
        data: { username: username.trim() }
      })
      
      if (error) throw error
      
      showMessage('用户名更新成功', 'success')
      setIsEditingUsername(false)
    } catch (error) {
      showMessage(error.message || '用户名更新失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('请填写所有密码字段', 'error')
      return
    }
    
    if (newPassword !== confirmPassword) {
      showMessage('两次输入的新密码不匹配', 'error')
      return
    }
    
    if (newPassword.length < 6) {
      showMessage('新密码至少需要6个字符', 'error')
      return
    }

    setLoading(true)
    try {
      // 首先验证当前密码
      const { error: signInError } = await authOperations.supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })
      
      if (signInError) {
        throw new Error('当前密码不正确')
      }
      
      // 更新密码
      const { error: updateError } = await authOperations.supabase.auth.updateUser({
        password: newPassword
      })
      
      if (updateError) throw updateError
      
      showMessage('密码更新成功', 'success')
      setIsEditingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      showMessage(error.message || '密码更新失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 邮箱格式验证
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 忘记密码处理
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    
    if (!validateEmail(resetEmail)) {
      showMessage('请检查邮箱格式', 'error')
      return
    }
    
    setLoading(true)
    setMessage('')

    try {
      const redirectTo = process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth?type=recovery`
        : `${window.location.origin}/auth?type=recovery`

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo
      })

      if (error) {
        showMessage(localizeSupabaseError(error), 'error')
      } else {
        showMessage('重置邮件已发送，请检查您的邮箱', 'success')
        setShowForgotPassword(false)
        setResetEmail('')
      }
    } catch (error) {
      showMessage('发送重置邮件失败，请稍后重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false)
    setResetEmail('')
    setMessage('')
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>请先登录...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>个人资料 - 方略 Fanglue</title>
        <meta name="description" content="个人资料管理" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        {/* 导航栏 */}
        <nav className={styles.navbar}>
          <div className={styles.brand} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            方略 Fanglue
          </div>
          <div className={styles.navLinks}>
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
          </div>
        </nav>

        {/* 主内容 */}
        <main className={styles.mainContent}>
          <div className={styles.profileContainer}>
            <h1 className={styles.title}>个人资料</h1>
            
            {message && (
              <div className={`${styles.message} ${styles[messageType]}`}>
                {message}
              </div>
            )}

            {/* 用户名编辑 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>用户名</h2>
              {!isEditingUsername ? (
                <div className={styles.displayField}>
                  <span className={styles.fieldValue}>
                    {user.user_metadata?.username || '未设置'}
                  </span>
                  <button 
                    className={styles.editButton}
                    onClick={() => setIsEditingUsername(true)}
                  >
                    修改
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateUsername} className={styles.editForm}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className={styles.input}
                    disabled={loading}
                  />
                  <div className={styles.buttonGroup}>
                    <button 
                      type="submit" 
                      className={styles.saveButton}
                      disabled={loading}
                    >
                      {loading ? '保存中...' : '保存'}
                    </button>
                    <button 
                      type="button" 
                      className={styles.cancelButton}
                      onClick={() => {
                        setIsEditingUsername(false)
                        setUsername(user.user_metadata?.username || '')
                      }}
                      disabled={loading}
                    >
                      取消
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 邮箱显示 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>邮箱</h2>
              <div className={styles.displayField}>
                <span className={styles.fieldValue}>{user.email}</span>
                <span className={styles.fieldNote}>邮箱不可修改</span>
              </div>
            </div>

            {/* 密码修改 */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>密码</h2>
              {!isEditingPassword ? (
                <div className={styles.displayField}>
                  <span className={styles.fieldValue}>••••••••</span>
                  <button 
                    className={styles.editButton}
                    onClick={() => setIsEditingPassword(true)}
                  >
                    修改
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className={styles.editForm}>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="请输入当前密码"
                    className={styles.input}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码"
                    className={styles.input}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                    className={styles.input}
                    disabled={loading}
                  />
                  <div className={styles.buttonGroup}>
                    <button 
                      type="submit" 
                      className={styles.saveButton}
                      disabled={loading}
                    >
                      {loading ? '更新中...' : '确认更改'}
                    </button>
                    <button 
                      type="button" 
                      className={styles.forgotButton}
                      onClick={() => {
                        setResetEmail(user.email)
                        setShowForgotPassword(true)
                      }}
                      disabled={loading}
                    >
                      忘记密码
                    </button>
                    <button 
                      type="button" 
                      className={styles.cancelButton}
                      onClick={() => {
                        setIsEditingPassword(false)
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                      disabled={loading}
                    >
                      取消修改
                    </button>
                  </div>
                </form>
              )}
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
        
        {/* 忘记密码模态框 */}
        {showForgotPassword && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>重置密码</h3>
                <button 
                  className={styles.closeButton}
                  onClick={handleCloseForgotPassword}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleForgotPassword} className={styles.forgotPasswordForm}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>邮箱地址</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className={styles.input}
                    placeholder="请输入您的邮箱地址"
                    required
                    disabled={loading}
                  />
                </div>
                <div className={styles.modalButtons}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={handleCloseForgotPassword}
                    disabled={loading}
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={loading || !resetEmail}
                  >
                    {loading ? '发送中...' : '发送重置邮件'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}