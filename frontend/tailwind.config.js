/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts,scss}",
    "./node_modules/primeng/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'logo-green': 'var(--logo-green)',
        'logo-green-light': 'var(--logo-green-light)',
        'logo-blue': 'var(--logo-blue)',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false // 🛑 Désactive le reset de Tailwind
  }
}
