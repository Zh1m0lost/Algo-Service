<template>
  <div class="auth-wrap">
    <header class="auth-header">
      <div class="auth-header__logo">
        <img src="~/assets/icons/logo.svg" alt="Алгоритмика" class="auth-header__logo-img" />
      </div>
      <p class="auth-header__subtitle">Международная школа программирования</p>
    </header>

    <main class="auth-main">
      <h2 class="auth-main__title">Войдите в свой аккаунт</h2>
      <div class="auth-main__card">
        <slot />
      </div>
    </main>
  </div>
</template>

<style lang="scss">
.auth-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
}

.auth-header {
  background: var(--c-purple);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 48px;

  &__logo-img {
    height: 56px;
  }

  &__subtitle {
    margin-top: 12px;
    color: var(--c-white);
    font-size: 16px;
    text-align: center;
    opacity: 0.85;
  }
}

.auth-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px 40px;
  margin-top: -1px;

  &__title {
    font-family: var(--font-main);
    font-size: 20px;
    font-weight: 500;
    color: var(--c-text-gray);
    padding: 28px 0 24px;
  }

  &__card {
    background: var(--c-white);
    border-radius: var(--radius-lg);
    padding: 32px 40px;
    width: 100%;
    max-width: 520px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  }
}
</style>
