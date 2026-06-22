export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  devServer: {
    host: 'localhost'
  },
  css: ['~/assets/css/main.scss'],
  runtimeConfig: {
    public: {
      // Базовый URL API. Переопределяется переменной окружения NUXT_PUBLIC_API_BASE.
      // По умолчанию — продакшен-бэкенд. Для локальной разработки укажите
      // NUXT_PUBLIC_API_BASE=http://localhost:8000/api
      apiBase: 'https://api.enotit.space/api',
    },
  },
})
