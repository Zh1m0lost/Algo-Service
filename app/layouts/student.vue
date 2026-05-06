<script setup lang="ts">
const userName = ref('Иван Иванов')

function logout() {
  navigateTo('/auth/login')
}
</script>

<template>
  <div class="student-layout">
    <header class="s-header">
      <div class="s-header__inner">
        <NuxtLink to="/student" class="s-header__logo">
          <img src="~/assets/icons/logo.svg" alt="Алгоритмика" />
        </NuxtLink>

        <div class="s-header__right">
          <div class="s-header__user">
            <img src="~/assets/icons/user.svg" alt="" class="s-header__avatar" />
            <span>{{ userName }}</span>
          </div>
          <button class="s-header__logout" @click="logout">
            <img src="~/assets/icons/exit.svg" alt="Выйти" />
          </button>
        </div>
      </div>
    </header>

    <nav class="s-nav">
      <div class="s-nav__inner">
        <NuxtLink to="/student" class="s-nav__link">Главная</NuxtLink>
        <span class="s-nav__sep">·</span>
        <NuxtLink to="/student/homework" class="s-nav__link">Домашние задания</NuxtLink>
        <span class="s-nav__sep">·</span>
        <NuxtLink to="/student/shop" class="s-nav__link">Магазин</NuxtLink>
      </div>
    </nav>

    <main class="s-content">
      <slot />
    </main>
  </div>
</template>

<style lang="scss">
.student-layout {
  min-height: 100vh;
  background: var(--c-bg);
}

.s-header {
  background: var(--c-purple);
  padding: 0 24px;

  &__inner {
    max-width: 1100px;
    margin: 0 auto;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__logo img {
    height: 48px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.15);
    border-radius: var(--radius-full);
    padding: 8px 16px;
    color: var(--c-white);
    font-size: 15px;
    font-weight: 500;
  }

  &__avatar {
    width: 28px;
    height: 28px;
  }

  &__logout {
    background: rgba(255,255,255,0.15);
    border: none;
    border-radius: var(--radius-sm);
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;

    &:hover { background: rgba(255,255,255,0.25); }

    img { width: 22px; height: 22px; }
  }
}

.s-nav {
  background: var(--c-bg);
  padding: 12px 24px;

  &__inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__link {
    font-size: 14px;
    color: var(--c-text-gray);
    font-weight: 500;
    transition: color 0.2s;

    &.router-link-active { color: var(--c-purple-text); }
    &:hover { color: var(--c-purple-text); }
  }

  &__sep {
    color: var(--c-text-gray);
    font-size: 12px;
  }
}

.s-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 40px;
}
</style>
