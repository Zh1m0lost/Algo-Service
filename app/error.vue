<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()

const is404 = computed(() => props.error?.statusCode === 404)

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="err-page">
    <div class="err-page__bg">
      <span class="err-page__circle err-page__circle--1" />
      <span class="err-page__circle err-page__circle--2" />
      <span class="err-page__circle err-page__circle--3" />
    </div>

    <div class="err-content">
      <NuxtLink to="/" class="err-logo">
        <img src="~/assets/icons/logo.svg" alt="Алгоритмика" />
      </NuxtLink>

      <div class="err-code">{{ is404 ? '404' : error.statusCode }}</div>

      <h1 class="err-title">
        {{ is404 ? 'Страница не найдена' : 'Что-то пошло не так' }}
      </h1>

      <p class="err-sub">
        {{ is404
          ? 'Похоже, эта страница переехала или никогда не существовала.'
          : 'Произошла неожиданная ошибка. Попробуйте вернуться назад.' }}
      </p>

      <div class="err-actions">
        <button class="err-btn err-btn--primary" @click="goHome">
          На главную
        </button>
        <button class="err-btn err-btn--outline" @click="$router.back()">
          ← Назад
        </button>
      </div>

      <div class="err-links">
        <NuxtLink to="/student" class="err-link">Кабинет ученика</NuxtLink>
        <span class="err-link-sep">·</span>
        <NuxtLink to="/teacher" class="err-link">Кабинет преподавателя</NuxtLink>
        <span class="err-link-sep">·</span>
        <NuxtLink to="/admin" class="err-link">Админ-панель</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '~/assets/css/main.scss';

.err-page {
  min-height: 100vh;
  background: var(--c-purple);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.err-page__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.err-page__circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);

  &--1 { width: 500px; height: 500px; top: -180px;  right: -120px; }
  &--2 { width: 320px; height: 320px; bottom: -100px; left: -80px;  }
  &--3 { width: 200px; height: 200px; top: 40%;      left: 38%;    background: rgba(255,255,255,0.04); }
}

.err-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 520px;
  width: 100%;
}

.err-logo {
  margin-bottom: 48px;
  display: inline-block;

  img { height: 44px; filter: brightness(0) invert(1); }
}

.err-code {
  font-family: var(--font-heading);
  font-size: 140px;
  font-weight: 800;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 3px rgba(255, 255, 255, 0.3);
  letter-spacing: -4px;
  margin-bottom: 8px;
  user-select: none;
}

.err-title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--c-white);
  margin-bottom: 14px;
}

.err-sub {
  font-size: 15px;
  color: var(--c-text-white-dim);
  line-height: 1.6;
  margin-bottom: 40px;
}

.err-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.err-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 32px;
  border-radius: var(--radius-full);
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-main);
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s;
  border: none;
  text-decoration: none;

  &--primary {
    background: var(--c-white);
    color: var(--c-purple);

    &:hover { opacity: 0.9; }
  }

  &--outline {
    background: transparent;
    border: 1.5px solid rgba(255, 255, 255, 0.4);
    color: var(--c-white);

    &:hover { background: rgba(255, 255, 255, 0.1); }
  }
}

.err-links {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.err-link {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s;

  &:hover { color: var(--c-white); }
}

.err-link-sep {
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
}

@media (max-width: 480px) {
  .err-code { font-size: 100px; }
  .err-title { font-size: 22px; }
  .err-logo { margin-bottom: 32px; img { height: 36px; } }
  .err-btn { padding: 12px 24px; font-size: 14px; width: 100%; }
  .err-actions { width: 100%; }
}
</style>
