/**
 * HTTP-клиент приложения ($api): базовый URL из runtimeConfig, подстановка
 * Bearer-токена и единая обработка 401 (разлогин + переход на страницу входа).
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Accept', 'application/json')

      const token = import.meta.client ? localStorage.getItem('auth_token') : null
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      options.headers = headers
    },

    onResponseError({ response }) {
      // Истёкший/недействительный токен — сбрасываем сессию и уводим на вход.
      if (response.status === 401 && import.meta.client) {
        localStorage.removeItem('auth_token')
        useState('auth_token').value = null
        useState('auth_user').value = null
        navigateTo('/auth/login')
      }
    },
  })

  return {
    provide: { api },
  }
})

declare module '#app' {
  interface NuxtApp {
    $api: typeof $fetch
  }
}
