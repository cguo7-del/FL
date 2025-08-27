import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script src="https://cmp.gatekeeperconsent.com/min.js" data-cfasync="false"></script>
        <script src="https://the.gatekeeperconsent.com/cmp.min.js" data-cfasync="false"></script>
        <script async src="//www.ezojs.com/ezoic/sa.min.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.ezstandalone = window.ezstandalone || {};
            ezstandalone.cmd = ezstandalone.cmd || [];
          `
        }} />
        <meta name="monetag" content="4468a7d9ab5ccf1aac91e6acd7e06f12" />
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5500005062081722"
          crossOrigin="anonymous"
        ></script>
        <script src="https://fpyf8.com/88/tag.min.js" data-zone="166640" async data-cfasync="false"></script>
      </Head>
      <Component {...pageProps} />
    </>
  )
}