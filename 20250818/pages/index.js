import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
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
          <div className={styles.authButtons}>
            <a href="#" className={styles.authBtn} title="功能开发中，敬请期待">登录</a>
            <a href="#" className={styles.authBtn} title="功能开发中，敬请期待">注册</a>
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
              <div className={styles.featureIcon}>📜</div>
              <div className={styles.featureTitle}>探源</div>
              <div className={styles.featureDesc}>溯古问道<br />择智珠以为引</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🔍</div>
              <div className={styles.featureTitle}>析局</div>
              <div className={styles.featureDesc}>洞察机枢<br />见万变之本脉</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>📈</div>
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
            <a href="#" className={styles.footerBtn} title="功能开发中，敬请期待">历问历答</a>
          </div>
        </footer>
      </div>
    </>
  )
}