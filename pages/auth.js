import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import styles from '../styles/Auth.module.css'
import { supabase, authOperations, localizeSupabaseError } from '../lib/supabase'

// 忘记密码模态框组件
const ForgotPasswordModal = ({ 
  showForgotPassword, 
  resetEmail, 
  isLoading, 
  onClose, 
  onSubmit, 
  onEmailChange 
}) => {
  if (!showForgotPassword) return null
  
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>重置密码</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className={styles.forgotPasswordForm}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>邮箱地址</label>
            <input
              type="email"
              value={resetEmail}
              onChange={onEmailChange}
              className={styles.input}
              placeholder="请输入您的邮箱地址"
              required
              disabled={isLoading}
            />
          </div>
          <div className={styles.modalButtons}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading || !resetEmail}
            >
              {isLoading ? '发送中...' : '发送重置邮件'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Auth() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session)
      
      if (event === 'SIGNED_IN') {
        const { type } = router.query
        
        if (type === 'recovery') {
          // 密码重置流程，显示重置密码表单
          setIsPasswordReset(true)
          setMessage('')
          return
        }
        
        if (type === 'signup') {
          // 邮箱验证成功，直接跳转到首页
          setMessage('邮箱验证成功！欢迎使用！')
          router.push('/')
          return
        }
        
        // 正常登录，跳转到首页
        if (!isPasswordReset) {
          router.push('/')
        }
      }
      
      if (event === 'PASSWORD_RECOVERY') {
        // 密码重置会话
        setIsPasswordReset(true)
        setMessage('')
      }
      
      if (event === 'SIGNED_OUT') {
        // 用户登出时，确保重置所有状态
        setIsPasswordReset(false)
        setMessage('')
      }
    })

    // 检查URL参数
    const { type } = router.query
    if (type === 'recovery') {
      setIsPasswordReset(true)
    } else {
      // 如果没有 recovery 参数，确保不显示密码重置界面
      setIsPasswordReset(false)
    }

    return () => subscription.unsubscribe()
  }, [router.query, isPasswordReset])

  // 实时输入处理
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setMessage('')
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
    setMessage('')
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    setMessage('')
  }

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value)
    setMessage('')
  }

  const handleResetEmailChange = (e) => {
    setResetEmail(e.target.value)
    setMessage('')
  }

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false)
    setResetEmail('')
    setMessage('')
  }

  // 表单验证
  const validateForm = () => {
    // 邮箱格式验证
    if (!validateEmail(email)) {
      setMessage('请检查邮箱格式')
      return false
    }
    
    // 注册时的额外验证
    if (!isLogin) {
      // 用户名验证
      if (username.length < 3) {
        setMessage('用户名至少需要3个字符')
        return false
      }
      
      // 密码复杂度验证
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        setMessage('请输入正确格式的密码')
        return false
      }
      
      // 密码一致性验证
      if (password !== confirmPassword) {
        setMessage('两次输入的密码不一致')
        return false
      }
    } else {
      // 登录时的密码验证
      if (password.length < 8) {
        setMessage('密码至少需要8位字符')
        return false
      }
    }
    
    return true
  }

  // 注册处理
  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setMessage('')

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fanglue.org'
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          },
          emailRedirectTo: `${siteUrl}/auth?type=signup`
        }
      })

      if (error) {
        console.error('注册错误:', error)
        setMessage(localizeSupabaseError(error))
      } else {
        setMessage('注册成功！请检查您的邮箱以验证账户。')
      }
    } catch (error) {
      console.error('注册异常:', error)
      setMessage(localizeSupabaseError(error) || '注册失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 登录处理
  const handleSignIn = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('登录错误:', error)
        setMessage(localizeSupabaseError(error))
      }
    } catch (error) {
      console.error('登录异常:', error)
      setMessage(localizeSupabaseError(error) || '登录失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 邮箱格式验证
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 密码复杂度验证
  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password)
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const hasMinLength = password.length >= 8
    
    return {
      hasNumber,
      hasLetter,
      hasSpecial,
      hasMinLength,
      isValid: hasNumber && hasLetter && hasSpecial && hasMinLength
    }
  }

  // 忘记密码处理
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    
    if (!validateEmail(resetEmail)) {
      setMessage('请检查邮箱格式')
      return
    }
    
    setIsLoading(true)
    setMessage('')

    try {
      const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fanglue.org'}/auth?type=recovery`

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo
      })

      if (error) {
        setMessage(localizeSupabaseError(error.message))
      } else {
        setMessage('重置邮件已发送，请检查您的邮箱')
        setShowForgotPassword(false)
        setResetEmail('')
      }
    } catch (error) {
      setMessage('发送重置邮件失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 更新密码处理
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      setMessage('请输入正确格式的密码')
      return
    }
    
    if (newPassword !== confirmNewPassword) {
      setMessage('两次输入的密码不一致')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      // 检查当前会话
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setMessage('重置会话已过期，请重新获取重置链接')
        setIsLoading(false)
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('密码更新错误:', error)
        setMessage(localizeSupabaseError(error))
      } else {
        setMessage('密码更新成功！正在跳转到登录页面...')
        
        // 延迟跳转并登出用户
        setTimeout(async () => {
          await supabase.auth.signOut()
          setIsPasswordReset(false)
          setNewPassword('')
          setConfirmNewPassword('')
          setMessage('')
          // 跳转到登录页面，清除所有URL参数
          router.replace('/auth')
        }, 2000)
      }
    } catch (error) {
      console.error('密码更新错误:', error)
      setMessage(localizeSupabaseError(error) || '密码更新失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <>
      <Head>
        <title>{isPasswordReset ? '重置密码' : (isLogin ? '登录' : '注册')} - 方略 Fanglue</title>
        <meta name="description" content="方略 - 从经史到兵法，古智与算法，同答一问" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* 导航栏 */}
        <nav className={styles.navbar}>
          <div className={styles.brand} onClick={() => router.push('/')} style={{cursor: 'pointer'}}>
            方略 Fanglue
          </div>
        </nav>

        {/* 主内容 */}
        <main className={styles.mainContent}>
          <div className={styles.authCard}>
            {/* 密码重置表单 */}
            {isPasswordReset ? (
              <>
                <div className={styles.authTabs}>
                  <div className={`${styles.tabButton} ${styles.active}`}>
                    重置密码
                  </div>
                </div>
                <form onSubmit={handleUpdatePassword} className={styles.authForm}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>新密码<span className={styles.requiredAsterisk}> *</span></label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.input}
                      placeholder="请输入至少8位字符，包含字母、数字和特殊符号"
                      disabled={isLoading}
                      required
                    />
                    {newPassword && (
                      <div className={styles.hint}>
                        {!validatePassword(newPassword).isValid && (
                          <span className={styles.invalid}>
                            请输入正确格式的密码
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>确认新密码<span className={styles.requiredAsterisk}> *</span></label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className={styles.input}
                      placeholder="请输入至少8位字符，包含字母、数字和特殊符号"
                      disabled={isLoading}
                      required
                    />
                    {confirmNewPassword && (
                      <div className={styles.hint}>
                        <span className={newPassword === confirmNewPassword ? styles.valid : styles.invalid}>
                          {newPassword === confirmNewPassword ? '✓ 密码一致' : '✗ 密码不一致'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isLoading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                  >
                    {isLoading ? '更新中...' : '更新密码'}
                  </button>
                  
                  {message && (
                    <div className={`${styles.message} ${message.includes('成功') ? styles.success : styles.error}`}>
                      {message}
                    </div>
                  )}
                </form>
              </>
            ) : (
              <>
                {/* 登录/注册切换标签 */}
                <div className={styles.authTabs}>
                  <button 
                    className={`${styles.tabButton} ${isLogin ? styles.active : ''}`}
                    onClick={() => {
                      setIsLogin(true)
                      setMessage('')
                    }}
                  >
                    登录
                  </button>
                  <button 
                    className={`${styles.tabButton} ${!isLogin ? styles.active : ''}`}
                    onClick={() => {
                      setIsLogin(false)
                      setMessage('')
                    }}
                  >
                    注册
                  </button>
                </div>

                {/* 登录/注册表单 */}
                <form onSubmit={isLogin ? handleSignIn : handleSignUp} className={styles.authForm}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>邮箱<span className={styles.requiredAsterisk}> *</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className={styles.input}
                      placeholder="请输入您的邮箱地址"
                      disabled={isLoading}
                      required
                    />
                    {email && !validateEmail(email) && (
                      <div className={styles.hint}>
                        <span className={styles.invalid}>
                          请检查邮箱格式
                        </span>
                      </div>
                    )}
                  </div>

                  {!isLogin && (
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>用户名<span className={styles.requiredAsterisk}> *</span></label>
                      <input
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        className={styles.input}
                        placeholder="至少3个字符"
                        disabled={isLoading}
                        required
                      />
                      {username && username.length < 3 && (
                        <div className={styles.hint}>
                          <span className={styles.invalid}>
                            用户名至少需要3个字符
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>密码<span className={styles.requiredAsterisk}> *</span></label>
                    <input
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className={styles.input}
                      placeholder={isLogin ? "请输入您的密码" : "8位以上，必须包含数字、字母和特殊符号"}
                      disabled={isLoading}
                      required
                    />
                    {!isLogin && password && !validatePassword(password).isValid && (
                      <div className={styles.hint}>
                        <span className={styles.invalid}>
                          请输入正确格式的密码
                        </span>
                      </div>
                    )}
                  </div>

                  {!isLogin && (
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>确认密码<span className={styles.requiredAsterisk}> *</span></label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className={styles.input}
                        placeholder="8位以上，必须包含数字、字母和特殊符号"
                        disabled={isLoading}
                        required
                      />
                      {confirmPassword && (
                        <div className={styles.hint}>
                          <span className={password === confirmPassword ? styles.valid : styles.invalid}>
                            {password === confirmPassword ? '✓ 密码一致' : '两次输入的密码不一致'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isLoading || (isLogin ? 
                      (!email || !password || !validateEmail(email)) : 
                      (!email || !username || !password || !confirmPassword || 
                       !validateEmail(email) || username.length < 3 || 
                       !validatePassword(password).isValid || password !== confirmPassword)
                    )}
                  >
                    {isLoading ? (isLogin ? '登录中...' : '注册中...') : (isLogin ? '登录' : '注册')}
                  </button>

                  {isLogin && (
                    <div className={styles.forgotPasswordLink}>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className={styles.linkButton}
                        disabled={isLoading}
                      >
                        忘记密码？
                      </button>
                    </div>
                  )}

                  {message && (
                    <div className={`${styles.message} ${message.includes('成功') ? styles.success : styles.error}`}>
                      {message}
                    </div>
                  )}
                </form>
              </>
            )}
          </div>

          {/* 忘记密码模态框 */}
          <ForgotPasswordModal 
            showForgotPassword={showForgotPassword}
            resetEmail={resetEmail}
            isLoading={isLoading}
            onClose={handleCloseForgotPassword}
            onSubmit={handleForgotPassword}
            onEmailChange={handleResetEmailChange}
          />
        </main>
      </div>
    </>
  )
}