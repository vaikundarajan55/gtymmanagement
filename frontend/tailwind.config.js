/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#f0f9ff',100:'#e0f2fe',500:'#0ea5e9',600:'#0284c7',700:'#0369a1',800:'#075985',900:'#0c4a6e' },
        gym: { dark:'#0f172a', card:'#1e293b', accent:'#f59e0b', danger:'#ef4444', success:'#10b981' }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'confetti': 'confetti 3.2s ease-in both',
        'pop': 'pop 0.6s cubic-bezier(.2,1.6,.4,1) both',
        'drift': 'drift 30s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        confetti: { '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' }, '100%': { transform: 'translateY(420px) rotate(720deg)', opacity: '0' } },
        pop: { '0%': { transform: 'scale(0)' }, '100%': { transform: 'scale(1)' } },
        drift: {
          '0%': { transform: 'scale(1.05) translate(0, 0)' },
          '100%': { transform: 'scale(1.18) translate(-3%, -4%)' },
        },
      }
    },
  },
  plugins: [],
}
