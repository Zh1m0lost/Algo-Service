<script setup lang="ts">
definePageMeta({ layout: 'admin' })

// TODO: заменить на useFetch('/api/admin/dashboard')
const data = {
  admin: { name: 'Алексей' },

  hero: {
    subtitle:      'Краткая сводка по школе. До конца модуля 2 недели — 5 задач требуют внимания.',
    students:      312,
    groups:        24,
    moduleProgress: 62
  },

  statCards: [
    {
      icon: '👥', title: 'Группы',
      desc: 'Состав, расписание, преподаватели',
      value: 24, delta: '+2 за месяц',
      to: '/admin/groups'
    },
    {
      icon: '🎓', title: 'Ученики',
      desc: 'Карточки, оплата, прогресс, баллы',
      value: 312, delta: '+16 за месяц',
      to: '/admin/students'
    },
    {
      icon: '📚', title: 'Преподаватели',
      desc: 'Нагрузка, ставка, предметы',
      value: 18, delta: '1 в найме',
      to: '/admin/teachers'
    },
    {
      icon: '📋', title: 'Мастер-задач',
      desc: 'Дедлайны, регулярные задания, описания',
      value: 47, delta: '5 на этой неделе',
      to: '/admin/tasks'
    }
  ],

  quickActions: [
    { icon: '+', label: 'Новая группа',   sub: 'Расписание',          to: '/admin/groups/new'   },
    { icon: '+', label: 'Новый ученик',   sub: 'Карточка контакт',    to: '/admin/students/new' },
    { icon: '+', label: 'Преподаватель',  sub: 'Ставка · предметы',   to: '/admin/teachers/new' },
    { icon: '+', label: 'Задача',         sub: 'Дедлайн, регулярность', to: '/admin/tasks/new'  }
  ],

  lessons: [
    { id: 1, subject: 'JS — Асинхронность', group: 'WebDev-2024-A', date: '29 апр.', time: '19:00' },
    { id: 2, subject: 'Python — Алгоритмы', group: 'Algo-Jr-3',     date: '29 апр.', time: '19:00' },
    { id: 3, subject: 'Frontend — Лендинг', group: 'Front-Adv-1',   date: '30 апр.', time: '19:00' },
    { id: 4, subject: 'Робототехника',      group: 'Robo-Mid-B',     date: '30 апр.', time: '19:30' }
  ],

  activity: [
    { id: 1, text: 'Анна Кузьмина зарегистрирована в Алгоритмике',      time: '5 мин. назад' },
    { id: 2, text: 'Создана задача «Проект к финалу» · регулярная',      time: '5 мин.'       },
    { id: 3, text: 'Е. Петрова обновила расписание Front-Adv-1',         time: '4 мин.'       },
    { id: 4, text: 'Платёж просрочен · М. Соколов',                      time: '1 час'        }
  ],

  alerts: [
    { id: 1, text: '3 просроченные задачи мастера',    to: '/admin/tasks'    },
    { id: 2, text: '2 ученика с просроченной оплатой', to: '/admin/students' },
    { id: 3, text: '1 группа без преподавателя',       to: '/admin/groups'   }
  ]
}
</script>

<template>
  <div class="adm">

    <!-- Hero -->
    <div class="adm-hero">
      <div class="adm-hero__circles">
        <span class="adm-hero__circle adm-hero__circle--1" />
        <span class="adm-hero__circle adm-hero__circle--2" />
      </div>

      <div class="adm-hero__left">
        <h1 class="adm-hero__title">Привет, {{ data.admin.name }}!</h1>
        <p class="adm-hero__sub">{{ data.hero.subtitle }}</p>
        <div class="adm-hero__progress-wrap">
          <span class="adm-hero__progress-label">Прогресс модуля: {{ data.hero.moduleProgress }}%</span>
          <div class="adm-hero__progress-bar">
            <div class="adm-hero__progress-fill" :style="{ width: data.hero.moduleProgress + '%' }" />
          </div>
        </div>
      </div>

      <div class="adm-hero__stats">
        <div class="adm-hero__stat">
          <span class="adm-hero__stat-num">{{ data.hero.students }}</span>
          <span class="adm-hero__stat-label">учеников</span>
        </div>
        <div class="adm-hero__stat">
          <span class="adm-hero__stat-num">{{ data.hero.groups }}</span>
          <span class="adm-hero__stat-label">группы</span>
        </div>
      </div>
    </div>

    <!-- Карточки-счётчики -->
    <div class="adm-stats">
      <NuxtLink
        v-for="card in data.statCards"
        :key="card.title"
        :to="card.to"
        class="adm-stat-card"
      >
        <div class="adm-stat-card__top">
          <div class="adm-stat-card__icon">{{ card.icon }}</div>
          <span class="adm-stat-card__arrow">→</span>
        </div>
        <p class="adm-stat-card__title">{{ card.title }}</p>
        <p class="adm-stat-card__desc">{{ card.desc }}</p>
        <p class="adm-stat-card__value">{{ card.value }}</p>
        <p class="adm-stat-card__delta">{{ card.delta }}</p>
      </NuxtLink>
    </div>

    <!-- Быстрые действия -->
    <div class="adm-quick-wrap">
      <p class="adm-section-label">БЫСТРЫЕ ДЕЙСТВИЯ</p>
      <div class="adm-quick">
        <NuxtLink
          v-for="action in data.quickActions"
          :key="action.label"
          :to="action.to"
          class="adm-quick-btn"
        >
          <span class="adm-quick-btn__plus">+</span>
          <span class="adm-quick-btn__label">{{ action.label }}</span>
          <span class="adm-quick-btn__sub">{{ action.sub }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Нижняя сетка -->
    <div class="adm-bottom">

      <!-- Ближайшие занятия -->
      <div class="adm-card">
        <p class="adm-section-label">БЛИЖАЙШИЕ ЗАНЯТИЯ</p>
        <div class="adm-lessons">
          <div v-for="lesson in data.lessons" :key="lesson.id" class="adm-lesson">
            <div class="adm-lesson__dot" />
            <div class="adm-lesson__info">
              <span class="adm-lesson__subject">{{ lesson.subject }}</span>
              <span class="adm-lesson__group">· {{ lesson.group }}</span>
            </div>
            <span class="adm-lesson__time">{{ lesson.date }}, {{ lesson.time }}</span>
          </div>
        </div>
      </div>

      <!-- Правая колонка -->
      <div class="adm-right">

        <!-- Лента активности -->
        <div class="adm-card">
          <p class="adm-section-label">ЛЕНТА АКТИВНОСТИ</p>
          <div class="adm-activity">
            <div v-for="item in data.activity" :key="item.id" class="adm-activity-item">
              <span class="adm-activity-item__dot" />
              <span class="adm-activity-item__text">{{ item.text }}</span>
              <span class="adm-activity-item__time">{{ item.time }}</span>
            </div>
          </div>
        </div>

        <!-- Требует внимания -->
        <div class="adm-card adm-card--alert">
          <p class="adm-section-label">ТРЕБУЕТ ВНИМАНИЯ</p>
          <div class="adm-alerts">
            <div v-for="alert in data.alerts" :key="alert.id" class="adm-alert">
              <span class="adm-alert__text">{{ alert.text }}</span>
              <NuxtLink :to="alert.to" class="adm-alert__link">Открыть →</NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style lang="scss">
.adm {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Hero */
.adm-hero {
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

    &--1 { width: 260px; height: 260px; right: 260px; top: -90px; }
    &--2 { width: 160px; height: 160px; right: 170px; bottom: -50px; }
  }

  &__left {
    flex: 1;
    position: relative;
    z-index: 1;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 30px;
    font-weight: 800;
    color: var(--c-white);
    margin-bottom: 8px;
  }

  &__sub {
    font-size: 14px;
    color: var(--c-text-white-dim);
    line-height: 1.5;
    margin-bottom: 18px;
  }

  &__progress-wrap {
    max-width: 420px;
  }

  &__progress-label {
    font-size: 12px;
    color: var(--c-text-white-dim);
    display: block;
    margin-bottom: 6px;
  }

  &__progress-bar {
    height: 6px;
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
    padding: 16px 28px;
    text-align: center;
    min-width: 110px;
  }

  &__stat-num {
    display: block;
    font-family: var(--font-heading);
    font-size: 38px;
    font-weight: 800;
    color: var(--c-white);
    line-height: 1;
    margin-bottom: 4px;
  }

  &__stat-label {
    font-size: 12px;
    color: var(--c-text-white-dim);
  }
}

/* Stat cards */
.adm-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.adm-stat-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 20px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: box-shadow 0.2s, transform 0.15s;

  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transform: translateY(-2px);
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__icon {
    font-size: 24px;
    width: 44px;
    height: 44px;
    background: var(--c-purple-light);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__arrow {
    font-size: 16px;
    color: var(--c-purple-text);
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
    margin-bottom: 8px;
  }

  &__value {
    font-family: var(--font-heading);
    font-size: 32px;
    font-weight: 800;
    color: var(--c-text-dark);
    line-height: 1;
  }

  &__delta {
    font-size: 12px;
    color: var(--c-green-text);
    font-weight: 500;
    margin-top: 2px;
  }
}

/* Quick actions */
.adm-quick-wrap {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 20px 24px;
}

.adm-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-purple-text);
  margin-bottom: 14px;
}

.adm-quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.adm-quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  border-radius: var(--radius-md);
  background: var(--c-purple-light);
  text-decoration: none;
  text-align: center;
  transition: opacity 0.2s;

  &:hover { opacity: 0.8; }

  &__plus {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--c-purple-text);
    color: var(--c-white);
    font-size: 20px;
    font-weight: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;
  }

  &__label {
    font-size: 13px;
    font-weight: 700;
    color: var(--c-purple-text);
  }

  &__sub {
    font-size: 11px;
    color: var(--c-text-gray);
  }
}

/* Bottom grid */
.adm-bottom {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
  align-items: start;
}

.adm-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card */
.adm-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 22px 24px;

  &--alert { }
}

/* Lessons */
.adm-lessons {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.adm-lesson {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #F2F2F2;

  &:last-child { border-bottom: none; }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--c-purple);
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    font-size: 14px;
    color: var(--c-text-dark);
  }

  &__subject { font-weight: 600; }

  &__group {
    color: var(--c-text-gray);
    margin-left: 4px;
  }

  &__time {
    font-size: 13px;
    color: var(--c-text-gray);
    flex-shrink: 0;
  }
}

/* Activity */
.adm-activity {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adm-activity-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--c-purple);
    flex-shrink: 0;
    margin-top: 4px;
  }

  &__text {
    flex: 1;
    color: var(--c-text-dark);
    line-height: 1.4;
  }

  &__time {
    color: var(--c-text-gray);
    flex-shrink: 0;
    font-size: 12px;
  }
}

/* Alerts */
.adm-alerts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adm-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--c-red-light);

  &__text {
    font-size: 13px;
    color: var(--c-text-dark);
    font-weight: 500;
  }

  &__link {
    font-size: 13px;
    font-weight: 600;
    color: var(--c-red);
    text-decoration: none;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover { text-decoration: underline; }
  }
}

@media (max-width: 768px) {
  .adm-hero {
    flex-direction: column;
    padding: 24px 20px;
    gap: 20px;

    &__title { font-size: 24px; }
    &__progress-wrap { max-width: 100%; }

    &__stats {
      flex-direction: row;
      width: 100%;
    }

    &__stat {
      flex: 1;
      padding: 12px 16px;
      min-width: 0;
    }
  }

  .adm-stats { grid-template-columns: repeat(2, 1fr); }

  .adm-quick { grid-template-columns: repeat(2, 1fr); }

  .adm-bottom { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .adm-hero {
    padding: 20px 16px;

    &__title { font-size: 20px; }
    &__circle { display: none; }
    &__stat-num { font-size: 28px; }
  }

  .adm-stats { grid-template-columns: 1fr; }

  .adm-stat-card__value { font-size: 26px; }

  .adm-quick { grid-template-columns: repeat(2, 1fr); gap: 10px; }

  .adm-alert {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .adm-lesson {
    flex-wrap: wrap;
    &__time { width: 100%; padding-left: 18px; }
  }
}
</style>
