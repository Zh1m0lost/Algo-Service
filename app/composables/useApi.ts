/** Доступ к настроенному HTTP-клиенту ($api) из компонентов и страниц. */
export function useApi() {
  return useNuxtApp().$api
}
