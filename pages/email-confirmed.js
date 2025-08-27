import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import styles from '../styles/EmailConfirmed.module.css'

export default function EmailConfirmed() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // 倒计时功能
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // 跳转到首页
          window.location.href = 'https://fanglue.org'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRedirect = () => {
    window.location.href = 'https://fanglue.org'
  }

  return (
    <>
      <Head>
        <title>邮箱验证成功 - 方略 Fanglue</title>
        <meta name="description" content="邮箱验证成功" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.successIcon}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1 className={styles.title}>邮箱已验证成功</h1>
          
          <p className={styles.message}>
            恭喜您！您的邮箱已成功验证。
          </p>
          
          <div className={styles.redirectInfo}>
            <p>请点击 <strong>fanglue.org</strong> 进行登录</p>
            <p className={styles.countdown}>
              {countdown > 0 ? `${countdown}秒后自动跳转...` : '正在跳转...'}
            </p>
          </div>
          
          <button 
            className={styles.redirectButton}
            onClick={handleRedirect}
          >
            立即前往 fanglue.org
          </button>
          
          <div className={styles.footer}>
            <p>如果页面没有自动跳转，请手动点击上方按钮</p>
          </div>
        </div>
      </div>
    </>
  )
}