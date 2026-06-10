<script setup lang="ts">
import shopCartIcon from '~/assets/icons/shopping-cart.svg'
import yellowCheckIcon from '~/assets/icons/YellowGalochka.svg'

definePageMeta({ layout: 'student' })

// TODO: заменить на useFetch('/api/student/dashboard')
const data = {
  user: { name: 'Иван' },
  progress: { total: 5, completed: 3, message: 'До конца модуля осталось всего 2 задания.' },
  nextLesson: {
    homeworkId: 4,
    lessonId: 1,
    dateLabel: 'Вторник, 29 апреля 2026',
    title: 'JavaScript — Асинхронность и промисы',
    teacher: 'Елена Петровна',
    group: 'WebDev-2024-A',
    format: 'Онлайн',
    timeStart: '18:00',
    timeEnd: '19:30',
    zoomLink: 'https://zoom.us/j/123456'
  },
  nearestDeadline: {
    id: 12,
    title: 'Frontend разработка — Лендинг на HTML&CSS',
    tags: ['HTML / CSS'],
    points: 100,
    daysLeft: 2,
    deadline: '28 апреля 2026, 23:59'
  },
  points: {
    total: 1240,
    history: [
      { id: 1, type: 'homework', title: 'Алгоритмы и структуры данных', date: '22 апр. 2026', amount: 100 },
      { id: 2, type: 'homework', title: 'JavaScript Основы', date: '18 апр. 2026', amount: 80 },
      { id: 3, type: 'shop', title: 'Футболка Алгоритмика', date: '10 апр. 2026', amount: -200 }
    ]
  },
  nearestTasks: [
    { id: 12, title: 'Frontend разработка', deadline: '28 апр.' },
    { id: 13, title: 'JavaScript Основы', deadline: '30 апр.' }
  ]
}

const progressPercent = computed(() =>
  Math.round((data.progress.completed / data.progress.total) * 100)
)
</script>

<template>
  <div class="dashboard">

    <!-- Hero -->
    <div class="hero">
      <div class="hero__circles">
        <span class="hero__circle hero__circle--1" />
        <span class="hero__circle hero__circle--2" />
      </div>
      <div class="hero__left">
        <h1 class="hero__title">Привет, {{ data.user.name }}!</h1>
        <p class="hero__subtitle">
          Ты на верном пути — продолжай в том же духе.<br />
          {{ data.progress.message }}
        </p>
        <div class="hero__progress">
          <div class="hero__progress-label">
            <span>Прогресс по домашним заданиям</span>
            <span>{{ data.progress.completed }} из {{ data.progress.total }} выполнено</span>
          </div>
          <div class="hero__progress-bar">
            <div class="hero__progress-fill" :style="{ width: progressPercent + '%' }" />
          </div>
        </div>
      </div>
      <div class="hero__right">
        <div class="hero__stat">
          <span class="hero__stat-num">{{ data.progress.total }}</span>
          <span class="hero__stat-label">Всего заданий</span>
        </div>
        <div class="hero__stat hero__stat--yellow">
          <span class="hero__stat-num hero__stat-num--yellow">{{ data.progress.completed }}</span>
          <span class="hero__stat-label">Выполнено</span>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div class="dashboard-grid">

      <!-- Следующее занятие -->
      <div class="card">
        <p class="card__section-label">СЛЕДУЮЩЕЕ ЗАНЯТИЕ</p>
        <div class="lesson-date">
          <img src="~/assets/icons/PerpleCalendar.svg" alt="" />
          <span>{{ data.nextLesson.dateLabel }}</span>
        </div>
        <h3 class="lesson-title">{{ data.nextLesson.title }}</h3>
        <p class="lesson-meta">Преподаватель: <strong>{{ data.nextLesson.teacher }}</strong></p>
        <p class="lesson-meta">Группа: {{ data.nextLesson.group }} · {{ data.nextLesson.format }}</p>
        <div class="lesson-footer">
          <span class="lesson-time">
            <img src="~/assets/icons/PerpleClock.svg" alt="" />
            {{ data.nextLesson.timeStart }} — {{ data.nextLesson.timeEnd }}
          </span>
          <a :href="data.nextLesson.zoomLink" target="_blank" class="lesson-zoom">
            <img src="~/assets/icons/Phone.svg" alt="" />
            Zoom · ссылка в описании
          </a>
        </div>
        <div class="lesson-divider" />
        <NuxtLink :to="`/student/lesson/${data.nextLesson.lessonId}`" class="btn-primary">Материалы урока</NuxtLink>
      </div>

      <!-- Ближайший дедлайн -->
      <div class="card card--deadline">
        <p class="card__section-label card__section-label--red">
          <span class="dot dot--red" /> БЛИЖАЙШИЙ ДЕДЛАЙН
        </p>
        <h3 class="deadline-title">{{ data.nearestDeadline.title }}</h3>
        <div class="deadline-tags">
          <span v-for="tag in data.nearestDeadline.tags" :key="tag" class="tag tag--purple">{{ tag }}</span>
          <span class="tag tag--yellow">{{ data.nearestDeadline.points }} баллов</span>
          <span class="tag tag--red">Осталось {{ data.nearestDeadline.daysLeft }} дня</span>
        </div>
        <p class="deadline-date">
          <img src="~/assets/icons/redclock.svg" alt="" />
          Срок: {{ data.nearestDeadline.deadline }}
        </p>
        <NuxtLink :to="`/student/homework/${data.nearestDeadline.id}`" class="btn-start">
          <img src="~/assets/icons/DveStrelki.svg" alt="" />
          Приступить
        </NuxtLink>
      </div>

      <!-- Мои баллы -->
      <div class="card">
        <p class="card__section-label">МОИ БАЛЛЫ</p>
        <div class="points-total">
          <span class="points-total__num">{{ data.points.total.toLocaleString('ru') }}</span>
          <span class="points-total__star">⭐</span>
        </div>
        <p class="points-subtitle">Накоплено за всё время</p>

        <div class="points-list">
          <div v-for="item in data.points.history" :key="item.id" class="points-item">
            <div class="points-item__stripe" />
            <img
              :src="item.type === 'shop' ? shopCartIcon : yellowCheckIcon"
              alt=""
              class="points-item__icon"
            />
            <div class="points-item__info">
              <p class="points-item__title">{{ item.title }}</p>
              <p class="points-item__date">{{ item.date }}</p>
            </div>
            <span
              class="points-item__amount"
              :class="item.amount > 0 ? 'points-item__amount--plus' : 'points-item__amount--minus'"
            >
              {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
            </span>
          </div>
        </div>

        <NuxtLink to="/student/shop" class="btn-outline btn-outline--full">
          <img src="~/assets/icons/PerpleShop.svg" alt="" />
          Перейти в магазин
        </NuxtLink>
      </div>

      <!-- Правая колонка -->
      <div class="right-col">

        <!-- Быстрые действия -->
        <div class="card">
          <p class="card__section-label">БЫСТРЫЕ ДЕЙСТВИЯ</p>
          <div class="quick-actions">
            <NuxtLink to="/student/homework" class="quick-action quick-action--purple">
              <img src="~/assets/icons/Document.svg" alt="" />
              <span>Все домашки</span>
            </NuxtLink>
            <NuxtLink to="/student/shop" class="quick-action quick-action--yellow">
              <img src="~/assets/icons/EllowShop.svg" alt="" />
              <span>Магазин</span>
            </NuxtLink>
            <NuxtLink to="/student/scores" class="quick-action quick-action--green">
              <img src="~/assets/icons/history.svg" alt="" />
              <span>История баллов</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Ближайшие задания -->
        <div class="card">
          <p class="card__section-label">БЛИЖАЙШИЕ ЗАДАНИЯ</p>
          <div class="tasks-list">
            <div v-for="task in data.nearestTasks" :key="task.id" class="tasks-item">
              <span class="dot dot--red" />
              <span class="tasks-item__title">{{ task.title }}</span>
              <span class="tasks-item__date">{{ task.deadline }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style lang="scss">
.dashboard {
  padding-top: 20px;
}

/* Hero */
.hero {
  position: relative;
  background: var(--c-purple);
  border-radius: var(--radius-md);
  padding: 32px 32px 28px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  overflow: hidden;
  margin-bottom: 24px;

  &__circles {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__circle {
    position: absolute;
    border-radius: 50%;
    background: var(--c-circle-bg);

    &--1 { width: 200px; height: 200px; right: 220px; top: -60px; }
    &--2 { width: 140px; height: 140px; right: 160px; bottom: -40px; }
  }

  &__left {
    flex: 1;
    position: relative;
    z-index: 1;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 700;
    color: var(--c-white);
    margin-bottom: 8px;
  }

  &__subtitle {
    color: var(--c-text-white-dim);
    font-size: 15px;
    line-height: 1.5;
    margin-bottom: 20px;
  }

  &__progress {
    max-width: 480px;
  }

  &__progress-label {
    display: flex;
    justify-content: space-between;
    color: var(--c-text-white-dim);
    font-size: 13px;
    margin-bottom: 8px;
  }

  &__progress-bar {
    height: 8px;
    background: rgba(255,255,255,0.2);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: var(--c-yellow);
    border-radius: var(--radius-full);
    transition: width 0.4s;
  }

  &__right {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    z-index: 1;
  }

  &__stat {
    background: rgba(255,255,255,0.12);
    border-radius: var(--radius-sm);
    padding: 12px 24px;
    text-align: center;
    min-width: 100px;
  }

  &__stat-num {
    display: block;
    font-family: var(--font-heading);
    font-size: 32px;
    font-weight: 800;
    color: var(--c-white);
    line-height: 1;
    margin-bottom: 4px;

    &--yellow { color: var(--c-yellow); }
  }

  &__stat-label {
    font-size: 12px;
    color: var(--c-text-white-dim);
  }
}

/* Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Card */
.card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 24px;

  &__section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--c-purple-text);
    margin-bottom: 16px;

    &--red { color: var(--c-red); }
  }

  &--deadline {
    background: var(--c-white);
    border: 1.5px solid var(--c-red);
  }
}

/* Lesson card */
.lesson-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--c-purple-light);
  border-radius: var(--radius-full);
  padding: 6px 14px;
  font-size: 13px;
  color: var(--c-purple-text);
  margin-bottom: 14px;

  img { width: 16px; height: 16px; }
}

.lesson-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--c-text-dark);
  margin-bottom: 10px;
}

.lesson-meta {
  font-size: 13px;
  color: var(--c-text-gray);
  margin-bottom: 4px;
  strong { color: var(--c-text-dark); }
}

.lesson-footer {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 16px 0 20px;
}

.lesson-time, .lesson-zoom {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--c-text-dark);

  img { width: 16px; height: 16px; }
}

.lesson-zoom {
  color: var(--c-green);
}

.lesson-divider {
  height: 1px;
  background: #E0E0E0;
  margin: 16px 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  background: var(--c-purple-text);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--c-white);
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover { opacity: 0.88; }
}

/* Deadline card */
.deadline-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--c-text-dark);
  margin-bottom: 12px;
}

.deadline-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;

  &--purple {
    background: var(--c-purple-light);
    color: var(--c-purple-text);
  }

  &--yellow {
    background: var(--c-yellow-light);
    color: var(--c-yellow-text);
  }

  &--red {
    background: var(--c-red-light);
    color: var(--c-red);
  }
}

.deadline-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--c-text-dark);
  margin-bottom: 20px;

  img { width: 16px; height: 16px; }
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &--red { background: var(--c-red); }
  &--green { background: var(--c-green); }
}

/* Buttons */
.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: auto;
  padding: 10px 24px;
  border: 1.5px solid var(--c-purple);
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  color: var(--c-purple-text);
  cursor: pointer;
  transition: background 0.2s;
  background: transparent;
  text-decoration: none;

  &:hover { background: var(--c-purple-light); }
  &--full { width: 100%; margin-top: 16px; }

  img { width: 18px; height: 18px; }
}

.btn-start {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 48px;
  background: var(--c-red);
  border: none;
  border-radius: var(--radius-full);
  color: var(--c-white);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover { opacity: 0.88; }
  img { width: 18px; height: 18px; }
}

/* Points */
.points-total {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;

  &__num {
    font-family: var(--font-heading);
    font-size: 36px;
    font-weight: 800;
    color: var(--c-purple-text);
  }

  &__star { font-size: 24px; }
}

.points-subtitle {
  font-size: 13px;
  color: var(--c-text-gray);
  margin-bottom: 16px;
}

.points-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.points-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--c-blue-stripe);

  &__stripe {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--c-blue-stripe);
  }

  &__icon { width: 28px; height: 28px; }

  &__info { flex: 1; }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--c-text-dark);
  }

  &__date {
    font-size: 12px;
    color: var(--c-text-gray);
    margin-top: 2px;
  }

  &__amount {
    font-size: 15px;
    font-weight: 700;

    &--plus { color: var(--c-green); }
    &--minus { color: var(--c-red); }
  }
}

/* Quick actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: opacity 0.2s;

  &:hover { opacity: 0.8; }

  img { width: 32px; height: 32px; }

  &--purple {
    background: var(--c-purple-light);
    color: var(--c-purple-text);
  }

  &--yellow {
    background: var(--c-yellow-light);
    color: var(--c-yellow-text);
  }

  &--green {
    background: var(--c-green-light);
    color: var(--c-green-text);
  }
}

/* Tasks list */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tasks-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--c-blue-stripe);

  &__title {
    flex: 1;
    font-size: 14px;
    color: var(--c-text-dark);
  }

  &__date {
    font-size: 13px;
    color: var(--c-text-gray);
  }
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    padding: 24px 20px;
    gap: 20px;

    &__title { font-size: 22px; }
    &__subtitle { margin-bottom: 16px; }
    &__progress { max-width: 100%; }

    &__right {
      flex-direction: row;
      width: 100%;
    }

    &__stat { flex: 1; }
  }

  .dashboard-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .hero {
    padding: 20px 16px;

    &__title { font-size: 18px; }
    &__subtitle { font-size: 13px; }
    &__circle { display: none; }

    &__stat { padding: 10px 12px; }
    &__stat-num { font-size: 24px; }
    &__stat-label { font-size: 11px; }
  }

  .quick-actions { gap: 8px; }

  .quick-action {
    padding: 12px 6px;
    font-size: 11px;
    img { width: 24px; height: 24px; }
  }

  .lesson-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .btn-primary { width: 100%; }
  .btn-start   { width: 100%; }
}
</style>
