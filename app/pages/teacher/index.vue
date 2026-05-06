<script setup lang="ts">
definePageMeta({ layout: 'teacher' })

// TODO: заменить на useFetch('/api/teacher/dashboard')
const data = {
  teacher: { name: 'Елена Петровна' },
  date: 'Понедельник, 27 апреля 2026',

  stats: {
    groups:      6,
    onReview:    7,
    todayLessons: 2
  },

  quickActions: [
    { icon: '📅', title: 'Расписание',        desc: 'Занятия на неделю и таск-трекер',    to: '/teacher/schedule'    },
    { icon: '📄', title: 'Домашние задания',   desc: 'Создать и выдать задания',            to: '/teacher/homework'    },
    { icon: '🔧', title: 'Конструктор задач',  desc: 'Создавать и редактировать задачи',   to: '/teacher/constructor' },
    { icon: '📖', title: 'Журнал баллов',      desc: 'Оценки и баллы по группам',          to: '/teacher/journal'     }
  ],

  todayLessons: [
    {
      id: 1,
      title:   'JavaScript — Асинхронность и промисы',
      group:   'WebDev-2024-B',
      format:  'Zoom',
      time:    '18:00–19:30',
      color:   '#602B7A',
      status:  'start'
    },
    {
      id: 2,
      title:   'Python — ООП и классы',
      group:   'Python-2024-A',
      format:  'Zoom',
      time:    '20:00–21:30',
      color:   '#56B835',
      status:  'prepare'
    }
  ],

  tasks: {
    today: [
      { id: 1, title: 'Проверить ДЗ по HTML/CSS (WebDev-B)', urgent: true, meta: '7 работ · сегодня' },
      { id: 2, title: 'Выставить оценки за контрольную',      urgent: true, meta: 'Python-A · сегодня' }
    ],
    week: [
      { id: 3, title: 'Подготовить материалы к занятию',  urgent: false, meta: 'WebDev-2024-B · среда' },
      { id: 4, title: 'Составить тест по JavaScript',     urgent: false, meta: 'до пятницы' }
    ],
    overdue: [
      { id: 5, title: 'Ответить на вопросы в чате',       urgent: true,  meta: 'Python-A · 2 дня назад' }
    ]
  }
}

const activeTab = ref<'today' | 'week' | 'overdue'>('today')

const tabs = [
  { key: 'today',   label: 'Сегодня'   },
  { key: 'week',    label: 'Неделя'    },
  { key: 'overdue', label: 'Просрочены'}
] as const

const currentTasks = computed(() => data.tasks[activeTab.value])
</script>

<template>
  <div class="td">

    <!-- Hero -->
    <div class="td-hero">
      <div class="td-hero__circles">
        <span class="td-hero__circle td-hero__circle--1" />
        <span class="td-hero__circle td-hero__circle--2" />
      </div>

      <div class="td-hero__left">
        <h1 class="td-hero__title">Добрый день, {{ data.teacher.name }}!</h1>
        <p class="td-hero__sub">
          Сегодня {{ data.stats.todayLessons }} занятия и {{ data.stats.onReview }} работ ждут проверки.<br />
          Удачного рабочего дня!
        </p>
        <div class="td-hero__date">
          <span class="td-hero__date-icon">📅</span>
          {{ data.date }}
        </div>
      </div>

      <div class="td-hero__stats">
        <div class="td-hero__stat">
          <span class="td-hero__stat-num">{{ data.stats.groups }}</span>
          <span class="td-hero__stat-label">Групп</span>
        </div>
        <div class="td-hero__stat td-hero__stat--yellow">
          <span class="td-hero__stat-num td-hero__stat-num--yellow">{{ data.stats.onReview }}</span>
          <span class="td-hero__stat-label">На проверке</span>
        </div>
        <div class="td-hero__stat td-hero__stat--green">
          <span class="td-hero__stat-num td-hero__stat-num--green">{{ data.stats.todayLessons }}</span>
          <span class="td-hero__stat-label">Занятия сегодня</span>
        </div>
      </div>
    </div>

    <!-- Быстрые действия -->
    <div class="td-quick">
      <NuxtLink
        v-for="action in data.quickActions"
        :key="action.title"
        :to="action.to"
        class="td-quick-card"
      >
        <div class="td-quick-card__icon">{{ action.icon }}</div>
        <p class="td-quick-card__title">{{ action.title }}</p>
        <p class="td-quick-card__desc">{{ action.desc }}</p>
      </NuxtLink>
    </div>

    <!-- Нижняя сетка -->
    <div class="td-bottom">

      <!-- Занятия сегодня -->
      <div class="td-card">
        <p class="td-section-label">ЗАНЯТИЯ СЕГОДНЯ</p>
        <div class="td-lessons">
          <div v-for="lesson in data.todayLessons" :key="lesson.id" class="td-lesson" :style="{ borderLeftColor: lesson.color }">
            <div class="td-lesson__info">
              <h3 class="td-lesson__title">{{ lesson.title }}</h3>
              <p class="td-lesson__meta">{{ lesson.group }} · {{ lesson.format }} · {{ lesson.time }}</p>
            </div>
            <div class="td-lesson__btns">
              <button class="td-btn td-btn--outline">Материалы</button>
              <button class="td-btn td-btn--filled" :style="lesson.status === 'prepare' ? { background: 'transparent', border: '1.5px solid var(--c-purple-text)', color: 'var(--c-purple-text)' } : {}">
                {{ lesson.status === 'start' ? 'Начать' : 'Подготовиться' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Мои задачи -->
      <div class="td-card">
        <p class="td-section-label">МОИ ЗАДАЧИ</p>

        <div class="td-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="td-tab"
            :class="{ 'td-tab--active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="td-task-list">
          <div v-for="task in currentTasks" :key="task.id" class="td-task">
            <div>
              <p class="td-task__title">{{ task.title }}</p>
              <div class="td-task__meta">
                <span v-if="task.urgent" class="td-task__urgent">Срочно</span>
                <span class="td-task__info">{{ task.meta }}</span>
              </div>
            </div>
          </div>
          <p v-if="currentTasks.length === 0" class="td-task__empty">Задач нет</p>
        </div>

        <button class="td-all-tasks-btn">Все задачи</button>
      </div>

    </div>
  </div>
</template>

<style lang="scss">
.td {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Hero */
.td-hero {
  position: relative;
  background: var(--c-purple);
  border-radius: var(--radius-md);
  padding: 32px 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  overflow: hidden;

  &__circles { position: absolute; inset: 0; pointer-events: none; }

  &__circle {
    position: absolute;
    border-radius: 50%;
    background: var(--c-circle-bg);

    &--1 { width: 280px; height: 280px; right: 300px; top: -100px; }
    &--2 { width: 180px; height: 180px; right: 200px; bottom: -60px; }
  }

  &__left {
    flex: 1;
    position: relative;
    z-index: 1;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 32px;
    font-weight: 800;
    color: var(--c-white);
    margin-bottom: 10px;
    line-height: 1.2;
  }

  &__sub {
    font-size: 15px;
    color: var(--c-text-white-dim);
    line-height: 1.5;
    margin-bottom: 16px;
  }

  &__date {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--c-text-white-dim);
  }

  &__date-icon { font-size: 14px; }

  &__stats {
    display: flex;
    gap: 12px;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }

  &__stat {
    background: rgba(255,255,255,0.15);
    border-radius: var(--radius-sm);
    padding: 16px 24px;
    text-align: center;
    min-width: 100px;
  }

  &__stat-num {
    display: block;
    font-family: var(--font-heading);
    font-size: 36px;
    font-weight: 800;
    color: var(--c-white);
    line-height: 1;
    margin-bottom: 6px;

    &--yellow { color: var(--c-yellow); }
    &--green  { color: #7BEE56; }
  }

  &__stat-label {
    font-size: 12px;
    color: var(--c-text-white-dim);
    white-space: nowrap;
  }
}

/* Quick actions */
.td-quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.td-quick-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  text-decoration: none;
  transition: box-shadow 0.2s, transform 0.15s;

  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transform: translateY(-2px);
  }

  &__icon {
    font-size: 32px;
    width: 56px;
    height: 56px;
    background: var(--c-purple-light);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__desc {
    font-size: 12px;
    color: var(--c-text-gray);
    line-height: 1.4;
  }
}

/* Bottom grid */
.td-bottom {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
  align-items: start;
}

/* Card */
.td-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 24px;
}

.td-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-purple-text);
  margin-bottom: 16px;
}

/* Lessons */
.td-lessons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.td-lesson {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 16px 16px 20px;
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  border-left: 4px solid var(--c-purple);

  &__info { flex: 1; min-width: 0; }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-bottom: 5px;
    line-height: 1.3;
  }

  &__meta {
    font-size: 13px;
    color: var(--c-text-gray);
  }

  &__btns {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

/* Tabs */
.td-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.td-tab {
  padding: 7px 16px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: var(--font-main);
  background: transparent;
  color: var(--c-text-gray);
  transition: background 0.15s, color 0.15s;

  &:hover { background: var(--c-purple-light); color: var(--c-purple-text); }

  &--active {
    background: var(--c-purple-text);
    color: var(--c-white);
  }
}

/* Tasks */
.td-task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 80px;
  margin-bottom: 16px;
}

.td-task {
  &__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--c-text-dark);
    margin-bottom: 4px;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__urgent {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: var(--radius-full);
    background: var(--c-red);
    color: var(--c-white);
    font-size: 12px;
    font-weight: 600;
  }

  &__info {
    font-size: 13px;
    color: var(--c-text-gray);
  }

  &__empty {
    font-size: 14px;
    color: var(--c-text-gray);
    text-align: center;
    padding: 20px 0;
  }
}

.td-all-tasks-btn {
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-sm);
  background: var(--c-purple-light);
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-purple-text);
  cursor: pointer;
  font-family: var(--font-main);
  transition: opacity 0.2s;

  &:hover { opacity: 0.8; }
}

/* Buttons */
.td-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-main);
  transition: opacity 0.2s;
  white-space: nowrap;

  &--outline {
    background: transparent;
    border: 1.5px solid var(--c-purple-text);
    color: var(--c-purple-text);
    &:hover { background: var(--c-purple-light); }
  }

  &--filled {
    background: var(--c-purple-text);
    color: var(--c-white);
    border: none;
    &:hover { opacity: 0.88; }
  }
}
</style>
