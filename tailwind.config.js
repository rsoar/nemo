/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/index.html',
    './src/renderer/bubble.html',
    './src/renderer/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        panel: { DEFAULT: 'var(--panel)', elev: 'var(--panel-elev)' },
        titlebar: 'var(--titlebar)',
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        subtle: 'var(--subtle)',
        border: { DEFAULT: 'var(--border)', strong: 'var(--border-strong)' },
        input: 'var(--input)',
        ring: 'var(--ring)',
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
          soft: 'var(--accent-soft)'
        },
        danger: 'var(--danger)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)'
      },
      boxShadow: {
        panel: '0 30px 80px -20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        bubble: '0 20px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(0, 0, 0, 0.2)',
        toolbar: '0 12px 30px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)'
      }
    }
  },
  plugins: []
}
