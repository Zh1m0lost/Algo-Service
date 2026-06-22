<script setup lang="ts">
definePageMeta({ layout: 'student' })

const route  = useRoute()
const router = useRouter()

type Lesson = {
  title: string; group: string; time: string; date: string; color: string
  goals: string[]
  plan: { time: string; title: string; desc: string }[]
  links: { icon: string; label: string; href: string; tag: string }[]
  tags: string[]
}


const id = route.params.id as string
const { data: lesson } = await useAsyncData(`student-lesson-${id}`, () =>
  useApi()<any>(`/lessons/${id}`),
)

const tagColors: Record<string, string> = {
  'Документация': '#EDE7FF',
  'Видео':        '#FFE8D0',
  'Практика':     '#D0E8FF',
  'Конспект':     '#D8F5D0',
  'API':          '#D8EEFF',
  'Игра':         '#FFE0F0',
  'Дизайн':       '#FFF5C2',
  'Визуализация': '#E2F5D8',
  'Задача':       '#FFE0E0',
  'Репозиторий':  '#EDE7FF',
  'Чеклист':      '#D8F5D0',
}

const tagTextColors: Record<string, string> = {
  'Документация': '#5B2D8E',
  'Видео':        '#A0480A',
  'Практика':     '#1A5A8E',
  'Конспект':     '#2E6E16',
  'API':          '#1A5A8E',
  'Игра':         '#8E1A5A',
  'Дизайн':       '#7A6100',
  'Визуализация': '#2E6E16',
  'Задача':       '#8E1A1A',
  'Репозиторий':  '#5B2D8E',
  'Чеклист':      '#2E6E16',
}
</script>

<template>
  <div v-if="lesson" class="lsn-page">

    <!-- Шапка -->
    <div class="lsn-hero" :style="{ background: lesson.color }">
      <div class="lsn-hero__circles">
        <span class="lsn-hero__circle lsn-hero__circle--1" />
        <span class="lsn-hero__circle lsn-hero__circle--2" />
      </div>
      <div class="lsn-hero__content">
        <button class="lsn-back" @click="router.back()">← Назад</button>
        <div class="lsn-hero__tags">
          <span v-for="tag in lesson.tags" :key="tag" class="lsn-hero__tag">{{ tag }}</span>
        </div>
        <h1 class="lsn-hero__title">{{ lesson.title }}</h1>
        <div class="lsn-hero__meta">
          <span class="lsn-hero__meta-item">👥 {{ lesson.group }}</span>
          <span class="lsn-hero__meta-item">🕐 {{ lesson.time }}</span>
          <span class="lsn-hero__meta-item">📅 {{ lesson.date }}</span>
        </div>
      </div>
    </div>

    <div class="lsn-cols">

      <!-- Левая колонка -->
      <div class="lsn-left">

        <!-- Цели урока -->
        <div class="lsn-card">
          <div class="lsn-card__icon-wrap" :style="{ background: lesson.color + '20' }">
            <span class="lsn-card__icon">🎯</span>
          </div>
          <p class="lsn-section-label">ЦЕЛИ УРОКА</p>
          <ul class="lsn-goals">
            <li v-for="(goal, i) in lesson.goals" :key="i" class="lsn-goal">
              <span class="lsn-goal__num" :style="{ background: lesson.color + '20', color: lesson.color }">{{ i + 1 }}</span>
              <span class="lsn-goal__text">{{ goal }}</span>
            </li>
          </ul>
        </div>

        <!-- План урока -->
        <div class="lsn-card">
          <div class="lsn-card__icon-wrap" :style="{ background: lesson.color + '20' }">
            <span class="lsn-card__icon">📋</span>
          </div>
          <p class="lsn-section-label">ПЛАН УРОКА</p>
          <div class="lsn-plan">
            <div v-for="(step, i) in lesson.plan" :key="i" class="lsn-plan-step">
              <div class="lsn-plan-step__left">
                <div class="lsn-plan-step__dot" :style="{ background: lesson.color }" />
                <div v-if="i < lesson.plan.length - 1" class="lsn-plan-step__line" />
              </div>
              <div class="lsn-plan-step__body">
                <div class="lsn-plan-step__header">
                  <span class="lsn-plan-step__title">{{ step.title }}</span>
                  <span class="lsn-plan-step__time" :style="{ color: lesson.color }">{{ step.time }}</span>
                </div>
                <p class="lsn-plan-step__desc">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Правая колонка -->
      <div class="lsn-right">

        <!-- Материалы и ссылки -->
        <div class="lsn-card">
          <div class="lsn-card__icon-wrap" :style="{ background: lesson.color + '20' }">
            <span class="lsn-card__icon">🔗</span>
          </div>
          <p class="lsn-section-label">МАТЕРИАЛЫ И ССЫЛКИ</p>
          <div class="lsn-links">
            <a
              v-for="link in lesson.links"
              :key="link.label"
              :href="link.href"
              target="_blank"
              rel="noopener"
              class="lsn-link"
            >
              <span class="lsn-link__icon">{{ link.icon }}</span>
              <span class="lsn-link__label">{{ link.label }}</span>
              <span
                class="lsn-link__tag"
                :style="{ background: tagColors[link.tag] ?? '#F0F0F0', color: tagTextColors[link.tag] ?? '#555' }"
              >{{ link.tag }}</span>
              <span class="lsn-link__arrow">↗</span>
            </a>
          </div>
        </div>

        <!-- Статистика -->
        <div class="lsn-stats">
          <div class="lsn-stat" :style="{ borderTopColor: lesson.color }">
            <span class="lsn-stat__num">{{ lesson.plan.length }}</span>
            <span class="lsn-stat__label">Блоков в плане</span>
          </div>
          <div class="lsn-stat" :style="{ borderTopColor: lesson.color }">
            <span class="lsn-stat__num">{{ lesson.goals.length }}</span>
            <span class="lsn-stat__label">Целей урока</span>
          </div>
          <div class="lsn-stat" :style="{ borderTopColor: lesson.color }">
            <span class="lsn-stat__num">{{ lesson.links.length }}</span>
            <span class="lsn-stat__label">Ссылок</span>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style lang="scss">
.lsn-page {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Hero */
.lsn-hero {
  border-radius: var(--radius-md);
  padding: 36px 40px;
  position: relative;
  overflow: hidden;

  &__circles { position: absolute; inset: 0; pointer-events: none; }

  &__circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);

    &--1 { width: 320px; height: 320px; right: -60px;  top: -120px; }
    &--2 { width: 180px; height: 180px; right: 180px; bottom: -70px; }
  }

  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__tag {
    padding: 4px 12px;
    border-radius: var(--radius-full);
    background: rgba(255,255,255,0.18);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    backdrop-filter: blur(4px);
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    line-height: 1.25;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  &__meta-item {
    font-size: 14px;
    color: rgba(255,255,255,0.8);
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.lsn-back {
  align-self: flex-start;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: var(--radius-full);
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  font-family: var(--font-main);
  transition: background 0.2s;
  backdrop-filter: blur(4px);

  &:hover { background: rgba(255,255,255,0.25); }
}

/* Columns */
.lsn-cols {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
}

.lsn-left, .lsn-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card */
.lsn-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon { font-size: 22px; }
}

.lsn-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-purple-text);
}

/* Goals */
.lsn-goals {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lsn-goal {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  &__num {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
  }

  &__text {
    font-size: 15px;
    color: var(--c-text-dark);
    line-height: 1.55;
  }
}

/* Plan */
.lsn-plan {
  display: flex;
  flex-direction: column;
}

.lsn-plan-step {
  display: flex;
  gap: 16px;

  &__left {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 16px;
  }

  &__dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;
  }

  &__line {
    width: 2px;
    flex: 1;
    background: #EBEBEB;
    margin: 4px 0;
    min-height: 20px;
  }

  &__body {
    padding-bottom: 20px;
    flex: 1;
  }

  &:last-child &__body { padding-bottom: 0; }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 4px;
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__time {
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    background: currentColor;
    background-clip: text;
    opacity: 0.9;
  }

  &__desc {
    font-size: 13px;
    color: var(--c-text-gray);
    line-height: 1.5;
  }
}

/* Links */
.lsn-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lsn-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px solid #EBEBEB;
  text-decoration: none;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: var(--c-purple-text);
    transform: translateX(2px);
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  }

  &__icon { font-size: 18px; flex-shrink: 0; }

  &__label {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: var(--c-text-dark);
  }

  &__tag {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  &__arrow {
    font-size: 14px;
    color: var(--c-text-gray);
    flex-shrink: 0;
  }
}

/* Stats */
.lsn-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.lsn-stat {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 20px 16px;
  text-align: center;
  border-top: 3px solid;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__num {
    font-family: var(--font-heading);
    font-size: 32px;
    font-weight: 800;
    color: var(--c-text-dark);
    line-height: 1;
  }

  &__label {
    font-size: 12px;
    color: var(--c-text-gray);
    font-weight: 500;
  }
}

@media (max-width: 900px) {
  .lsn-cols { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .lsn-hero { padding: 24px 20px; &__title { font-size: 20px; } }
  .lsn-card { padding: 20px; }
  .lsn-stats { grid-template-columns: repeat(3, 1fr); }
}
</style>
