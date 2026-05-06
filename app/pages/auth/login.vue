<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const login = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)

const error = ref('')

// Мок-учётные данные:
//   ученик:        std   / qq
//   преподаватель: pd    / qq
//   администратор: admin / qq
// TODO: заменить на useFetch('/api/auth/login', { method: 'POST', body: { login, password, remember } })
const MOCK_USERS: Record<string, { password: string; redirect: string }> = {
  std:   { password: 'qq', redirect: '/student' },
  pd:    { password: 'qq', redirect: '/teacher' },
  admin: { password: 'qq', redirect: '/admin'   }
}

async function handleLogin() {
  if (!login.value || !password.value) return
  error.value = ''
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 400))
    const user = MOCK_USERS[login.value]
    if (!user || user.password !== password.value) {
      error.value = 'Неверный логин или пароль'
      return
    }
    await navigateTo(user.redirect)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="handleLogin">
    <UiInput v-model="login" label="Логин" type="text" />
    <UiInput v-model="password" label="Пароль" type="password" class="login-form__password" />

    <div class="login-form__row">
      <label class="login-form__remember">
        <input v-model="remember" type="checkbox" class="login-form__checkbox" />
        <span>Запомнить меня</span>
      </label>
      <a href="#" class="login-form__forgot">Забыли пароль?</a>
    </div>

    <p v-if="error" class="login-form__error">{{ error }}</p>

    <UiButton type="submit" :loading="loading" class="login-form__submit">
      {{ loading ? 'Входим...' : 'Войти в аккаунт' }}
    </UiButton>
  </form>
</template>

<style lang="scss">
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__password {
    margin-top: 4px;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: -4px;
  }

  &__remember {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--c-black);
    cursor: pointer;
  }

  &__checkbox {
    width: 18px;
    height: 18px;
    accent-color: var(--c-purple);
    cursor: pointer;
  }

  &__forgot {
    font-size: 14px;
    color: var(--c-purple-text);
    font-weight: 500;

    &:hover { opacity: 0.75; }
  }

  &__error {
    font-size: 13px;
    color: var(--c-red);
    text-align: center;
    margin-top: -8px;
  }

  &__submit {
    margin-top: 8px;
  }
}
</style>
