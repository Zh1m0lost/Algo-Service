export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  devServer: {
    host: 'localhost'
  },
  css: ['~/assets/css/main.scss'],
})
