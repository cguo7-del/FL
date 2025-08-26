import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import styles from '../styles/Auth.module.css'
import { supabase, authOperations, localizeSupabaseError } from '../lib/supabase'

export default function Auth() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await authOperations.getCurrentUser()
        setUser(user)
        if (user) {
          router.push('/')
        }
      } catch (error) {
        // 用户未登录，继续显示登录页面
        console.log('用户未登录')
      }
    }
    checkUser()

    // 监听认证状态变化
    const { data: { subscription } } = authOperations.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null)
        router.push('/')
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 表单验证函数
  const validateForm = () => {
    const newErrors = {}

    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = '请输入邮箱地址'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '请检查邮箱格式'
    }

    if (!isLogin) {
      // 用户名验证（仅注册时）
      if (!formData.username) {
        newErrors.username = '请输入用户名'
      } else if (formData.username.length < 3) {
        newErrors.username = '用户名至少需要3个字符'
      }

      // 密码验证（注册时更严格）
      if (!formData.password) {
        newErrors.password = '请输入密码'
      } else {
        const password = formData.password
        const hasNumber = /\d/.test(password)
        const hasLetter = /[a-zA-Z]/.test(password)
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
        
        if (password.length < 8) {
          newErrors.password = '密码至少需要8位字符'
        } else if (!hasNumber) {
          newErrors.password = '密码必须包含数字'
        } else if (!hasLetter) {
          newErrors.password = '密码必须包含字母'
        } else if (!hasSpecial) {
          newErrors.password = '密码必须包含特殊符号'
        }
      }

      // 确认密码验证
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认密码'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致'
      }
    } else {
      // 登录时密码验证（较宽松）
      if (!formData.password) {
        newErrors.password = '请输入密码'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 实时验证
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 清除该字段的错误信息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 处理注册
  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setMessage('')

    try {
      const data = await authOperations.signUp(
        formData.email, 
        formData.password, 
        formData.username
      )
      
      setMessage('注册成功！请检查您的邮箱并点击验证链接完成注册。')
      // 清空表单
      setFormData({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('注册错误:', error)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理登录
  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setMessage('')

    try {
      const data = await authOperations.signIn(
        formData.email, 
        formData.password
      )
      
      setMessage('登录成功！正在跳转...')
      // 登录成功会通过 onAuthStateChange 自动跳转
    } catch (error) {
      console.error('登录错误:', error)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>{isLogin ? '登录' : '注册'} - 方略 Fanglue</title>
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
            {/* 切换标签 */}
            <div className={styles.authTabs}>
              <button 
                className={`${styles.tabButton} ${isLogin ? styles.active : ''}`}
                onClick={() => {
                  setIsLogin(true)
                  setErrors({})
                  setMessage('')
                }}
              >
                登录
              </button>
              <button 
                className={`${styles.tabButton} ${!isLogin ? styles.active : ''}`}
                onClick={() => {
                  setIsLogin(false)
                  setErrors({})
                  setMessage('')
                }}
              >
                注册
              </button>
            </div>

            {/* 表单 */}
            <form onSubmit={isLogin ? handleSignIn : handleSignUp} className={styles.authForm}>
              {/* 邮箱输入 */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>邮箱地址<span className={styles.requiredAsterisk}> *</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`${styles.input} ${errors.email ? styles.error : ''}`}
                  placeholder="请输入您的邮箱地址"
                  disabled={isLoading}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              {/* 用户名输入（仅注册时显示） */}
              {!isLogin && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>用户名<span className={styles.requiredAsterisk}> *</span></label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`${styles.input} ${errors.username ? styles.error : ''}`}
                    placeholder="至少3个字符"
                    disabled={isLoading}
                  />
                  <div className={styles.hint}>
                    {formData.username.length > 0 && (
                      <span className={formData.username.length >= 3 ? styles.valid : styles.invalid}>
                        {formData.username.length}/3 字符
                      </span>
                    )}
                  </div>
                  {errors.username && <span className={styles.errorText}>{errors.username}</span>}
                </div>
              )}

              {/* 密码输入 */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>密码<span className={styles.requiredAsterisk}> *</span></label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`${styles.input} ${errors.password ? styles.error : ''}`}
                  placeholder={isLogin ? "请输入密码" : "8位以上，包含数字、字母和特殊符号"}
                  disabled={isLoading}
                />
                {!isLogin && formData.password && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthItem}>
                      <span className={formData.password.length >= 8 ? styles.valid : styles.invalid}>
                        ✓ 至少8位字符
                      </span>
                    </div>
                    <div className={styles.strengthItem}>
                      <span className={/\d/.test(formData.password) ? styles.valid : styles.invalid}>
                        ✓ 包含数字
                      </span>
                    </div>
                    <div className={styles.strengthItem}>
                      <span className={/[a-zA-Z]/.test(formData.password) ? styles.valid : styles.invalid}>
                        ✓ 包含字母
                      </span>
                    </div>
                    <div className={styles.strengthItem}>
                      <span className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? styles.valid : styles.invalid}>
                        ✓ 包含特殊符号
                      </span>
                    </div>
                  </div>
                )}
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              {/* 确认密码（仅注册时显示） */}
              {!isLogin && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>确认密码<span className={styles.requiredAsterisk}> *</span></label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                    placeholder="请再次输入密码"
                    disabled={isLoading}
                  />
                  {formData.confirmPassword && (
                    <div className={styles.hint}>
                      <span className={formData.password === formData.confirmPassword ? styles.valid : styles.invalid}>
                        {formData.password === formData.confirmPassword ? '✓ 密码一致' : '✗ 密码不一致'}
                      </span>
                    </div>
                  )}
                  {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
                </div>
              )}

              {/* 提交按钮 */}
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isLoading || Object.keys(errors).some(key => errors[key])}
              >
                {isLoading ? '处理中...' : (isLogin ? '登录' : '注册')}
              </button>

              {/* 消息显示 */}
              {message && (
                <div className={`${styles.message} ${message.includes('成功') ? styles.success : styles.error}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </>
  )
}