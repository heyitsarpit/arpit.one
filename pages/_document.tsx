/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang='en' data-scroll-behavior='smooth'>
        <Head>
          <link rel='shortcut icon' href='/images/icon-128x128.png' />
          <link rel='apple-touch-icon' href='/images/icon-384x384.png' />
          <link rel='manifest' href='/manifest.json' />
        </Head>
        <body className='dark'>
          <script
            // biome-ignore lint/security/noDangerouslySetInnerHtml: This inline script applies the saved theme before hydration to avoid a flash.
            dangerouslySetInnerHTML={{
              __html: `!function(){var a=document.body.classList;a.remove("dark");var e=localStorage.getItem("theme");e?a.add(e.replace(/"/g,"")):window.matchMedia("(prefers-color-scheme: dark)").matches?a.add("dark"):a.add("light")}()`
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
