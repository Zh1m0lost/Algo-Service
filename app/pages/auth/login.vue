<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login: signIn, homePath } = useAuth()

const login = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)

const error = ref('')

// ── Быстрый вход под демо-ролью ──
const showRoleModal = ref(false)
const quickLoading  = ref('')

const DEMO: Record<string, { login: string; password: string; label: string; icon: string }> = {
  admin:   { login: 'admin', password: 'qq', label: 'Администратор', icon: '🛡️' },
  teacher: { login: 'pd',    password: 'qq', label: 'Преподаватель', icon: '📚' },
  student: { login: 'std',   password: 'qq', label: 'Ученик',        icon: '🎓' },
}

async function quickLogin(key: string) {
  const cred = DEMO[key]
  if (!cred) return
  // Подставляем данные в форму и отправляем её под выбранной ролью.
  login.value = cred.login
  password.value = cred.password
  error.value = ''
  quickLoading.value = key
  try {
    const user = await signIn(cred.login, cred.password)
    showRoleModal.value = false
    await navigateTo(homePath(user.role))
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось войти под выбранной ролью'
    showRoleModal.value = false
  } finally {
    quickLoading.value = ''
  }
}

async function handleLogin() {
  if (!login.value || !password.value) return
  error.value = ''
  loading.value = true
  try {
    const user = await signIn(login.value, password.value)
    await navigateTo(homePath(user.role))
  } catch (e: any) {
    error.value =
      e?.data?.errors?.login?.[0] ||
      e?.data?.message ||
      'Неверный логин или пароль'
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

    <button type="button" class="login-form__demo" @click="showRoleModal = true">
      Быстрый вход для демонстрации
    </button>
  </form>

  <Teleport to="body">
    <div v-if="showRoleModal" class="role-overlay" @click.self="showRoleModal = false">
      <div class="role-modal">
        <button class="role-modal__close" aria-label="Закрыть" @click="showRoleModal = false">✕</button>
        <h2 class="role-modal__title">Войти как</h2>
        <p class="role-modal__sub">Выберите роль — вход выполнится автоматически</p>

        <div class="role-modal__list">
          <button
            v-for="(d, key) in DEMO"
            :key="key"
            class="role-card"
            :disabled="!!quickLoading"
            @click="quickLogin(key)"
          >
            <span class="role-card__icon">{{ d.icon }}</span>
            <span class="role-card__label">{{ d.label }}</span>
            <span class="role-card__arrow">{{ quickLoading === key ? '…' : '→' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
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

  &__demo {
    margin-top: 2px;
    background: none;
    border: none;
    color: var(--c-purple-text);
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-main);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;

    &:hover { opacity: 0.78; }
  }
}

/* ── Модалка быстрого входа ── */
.role-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.role-modal {
  position: relative;
  background: var(--c-white);
  border-radius: var(--radius-lg);
  padding: 36px 32px 28px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);

  &__close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border: none;
    background: var(--c-bg);
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    color: var(--c-text-gray);
    transition: background 0.15s;

    &:hover { background: var(--c-purple-light); color: var(--c-purple-text); }
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 700;
    color: var(--c-text-dark);
    text-align: center;
  }

  &__sub {
    font-size: 14px;
    color: var(--c-text-gray);
    text-align: center;
    margin: 6px 0 22px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.role-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: var(--radius-md);
  border: 1.5px solid #E6E2F2;
  background: var(--c-white);
  cursor: pointer;
  font-family: var(--font-main);
  transition: border-color 0.15s, background 0.15s, transform 0.1s;

  &:hover { border-color: var(--c-purple); background: var(--c-purple-light); }
  &:active { transform: scale(0.99); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    background: var(--c-purple-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  &__label {
    flex: 1;
    text-align: left;
    font-size: 16px;
    font-weight: 600;
    color: var(--c-text-dark);
  }

  &__arrow {
    font-size: 18px;
    color: var(--c-purple-text);
    font-weight: 700;
  }
}
</style>
