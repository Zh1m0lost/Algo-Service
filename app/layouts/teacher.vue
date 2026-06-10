<script setup lang="ts">
const teacherName = ref('Елена Петровна')
const route = useRoute()
const isSubPage = computed(() => route.path !== '/teacher')

function logout() {
  navigateTo('/auth/login')
}
</script>

<template>
  <div class="teacher-layout">
    <header class="t-header">
      <div class="t-header__inner">
        <div class="t-header__left">
          <button v-if="isSubPage" class="t-header__back" @click="$router.back()">←</button>
          <NuxtLink to="/teacher" class="t-header__logo">
            <img src="~/assets/icons/logo.svg" alt="Алгоритмика" />
          </NuxtLink>
        </div>

        <div class="t-header__right">
          <div class="t-header__user">
            <img src="~/assets/icons/user.svg" alt="" class="t-header__avatar" />
            <span>{{ teacherName }}</span>
          </div>
          <button class="t-header__logout" @click="logout">
            <img src="~/assets/icons/exit.svg" alt="Выйти" />
          </button>
        </div>
      </div>
    </header>

    <nav class="t-nav">
      <div class="t-nav__inner">
        <NuxtLink to="/teacher" class="t-nav__link">Главная</NuxtLink>
        <span class="t-nav__sep">·</span>
        <NuxtLink to="/teacher/schedule" class="t-nav__link">Расписание</NuxtLink>
        <span class="t-nav__sep">·</span>
        <NuxtLink to="/teacher/homework" class="t-nav__link">Домашние задания</NuxtLink>
        <span class="t-nav__sep">·</span>
        <NuxtLink to="/teacher/constructor" class="t-nav__link">Конструктор задач</NuxtLink>
        <span class="t-nav__sep">·</span>
        <NuxtLink to="/teacher/journal" class="t-nav__link">Журнал</NuxtLink>
      </div>
    </nav>

    <main class="t-content">
      <slot />
    </main>
  </div>
</template>

<style lang="scss">
.teacher-layout {
  min-height: 100vh;
  background: var(--c-bg);
}

.t-header {
  background: var(--c-purple);
  padding: 0 24px;

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__logo img { height: 48px; }

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

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__back {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    background: rgba(255,255,255,0.15);
    border: none;
    color: var(--c-white);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    flex-shrink: 0;
    &:hover { background: rgba(255,255,255,0.25); }
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

.t-nav {
  background: var(--c-bg);
  padding: 12px 24px;

  &__inner {
    max-width: 1200px;
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

.t-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 40px;
}

@media (max-width: 768px) {
  .t-header {
    padding: 0 16px;
    &__inner { height: 60px; }
    &__logo img { height: 38px; }
  }

  .t-nav {
    padding: 0 16px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &__inner {
      gap: 4px;
      flex-wrap: nowrap;
      white-space: nowrap;
      padding: 10px 0;
    }

    &__link { font-size: 13px; }
  }

  .t-content { padding: 0 16px 32px; }
}

@media (max-width: 480px) {
  .t-header {
    &__user {
      padding: 6px 10px;
      gap: 0;
      span { display: none; }
    }
  }

  .t-nav__sep { display: none; }

  .t-nav__inner { gap: 2px; }

  .t-nav__link {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>
