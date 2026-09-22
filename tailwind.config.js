/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors')
const deprecatedColorNames = new Set([
  'lightBlue',
  'warmGray',
  'trueGray',
  'coolGray',
  'blueGray'
])
const supportedColors = Object.fromEntries(
  Object.keys(colors)
    .filter((name) => !deprecatedColorNames.has(name))
    .map((name) => [name, colors[name]])
)
const neueMontrealFontStack = ['Neue Montreal', 'Arial', 'sans-serif']
const sourceSerifFontStack = ['var(--font-source-serif-4)', 'Georgia', 'serif']

module.exports = {
  content: [
    './pages/**/*.{jsx,tsx}',
    './components/**/*.{jsx,tsx}',
    './content/**/*.mdx',
    './posts/**/*.mdx'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...supportedColors,
        primary: 'var(--color-text)',
        secondary: 'var(--color-text-secondary)',
        bg: 'var(--color-background)',
        nav: 'var(--color-nav-background)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-link-posts)'
      },
      fontFamily: {
        body: neueMontrealFontStack,
        code: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'monospace'
        ],
        display: neueMontrealFontStack,
        sans: neueMontrealFontStack,
        serif: sourceSerifFontStack,
        ui: neueMontrealFontStack
      },
      animation: {
        gradient: 'gradient 10s ease infinite',
        marquee: 'site-playlist-marquee 7s ease-in-out infinite alternate'
      },
      keyframes: {
        gradient: {
          '0%': { 'background-position': '0% 100%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 100%' }
        },
        'site-playlist-marquee': {
          '0%, 12%': { transform: 'translateX(0)' },
          '88%, 100%': {
            transform: 'translateX(calc(-1 * var(--playlist-marquee-distance)))'
          }
        }
      },
      backgroundImage: {
        iridescent:
          'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)'
      },
      backgroundSize: {
        'zoom-350': '350% 350%',
        'zoom-150': '150% 150%'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
}
