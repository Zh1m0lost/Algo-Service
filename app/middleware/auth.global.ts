/**
 * Глобальная защита маршрутов:
 *  - неавторизованного отправляем на /auth/login;
 *  - авторизованного со страницы входа и с «/» — на его домашнюю по роли;
 *  - запрещаем заходить в чужой раздел (student/teacher/admin).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { token, user, fetchMe, homePath } = useAuth()
  const isAuthRoute = to.path.startsWith('/auth')

  // Корень — редирект в зависимости от авторизации.
  if (to.path === '/') {
    return navigateTo(token.value ? homePath() : '/auth/login', { replace: true })
  }

  // Нет токена — пускаем только в раздел авторизации.
  if (!token.value) {
    return isAuthRoute ? undefined : navigateTo('/auth/login', { replace: true })
  }

  // Токен есть, но профиль ещё не загружен — подтягиваем его.
  if (!user.value) {
    await fetchMe()
  }

  // Токен оказался недействительным.
  if (!user.value) {
    return isAuthRoute ? undefined : navigateTo('/auth/login', { replace: true })
  }

  const role = user.value.role

  // Авторизованного со страницы входа уводим на его домашнюю.
  if (isAuthRoute) {
    return navigateTo(homePath(role), { replace: true })
  }

  // Защита разделов по роли.
  const area = to.path.split('/')[1]
  if (['student', 'teacher', 'admin'].includes(area) && area !== role) {
    return navigateTo(homePath(role), { replace: true })
  }
})
