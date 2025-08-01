/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 크림 + 베이지 조합 (자연스러운 일기장 느낌)
        primary: {
          warm: '#A16207', // 따뜻한 갈색
          cream: '#FEF3C7', // 크림색
          beige: '#F5F5DC', // 베이지색
          brown: '#92400E', // 따뜻한 갈색
          'warm-gray': '#78716C', // 따뜻한 회색
        },
        secondary: {
          gold: '#D4AF37',
          'light-gold': '#F7E98E',
          silver: '#C0C0C0',
        },
        // 야구 테마 컬러
        baseball: {
          'field-green': '#228B22',
          'dirt-brown': '#8B4513',
          'stadium-blue': '#1E3A8A',
          'night-game': '#0F172A',
        },
        // 게임 상태 컬러
        game: {
          scheduled: '#6C757D',
          live: '#A16207', // 메인 색상과 통일
          finished: '#228B22',
          cancelled: '#DC3545',
          postponed: '#FFC107',
        }
      },
      fontFamily: {
        sans: ['Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', 'Noto Sans KR', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 