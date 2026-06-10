<script setup lang="ts">
import calendarIcon from '~/assets/icons/PerpleCalendar.svg'
import documentIcon from '~/assets/icons/Document.svg'
import clockIcon from '~/assets/icons/PerpleClock.svg'
import checkIcon from '~/assets/icons/YellowGalochka.svg'

definePageMeta({ layout: 'student' })

// TODO: заменить на useFetch('/api/student/homework')
const data = {
  stats: { total: 6, inProgress: 2, completed: 3 },
  items: [
    {
      id: 1,
      title: 'Алгоритмы сортировки',
      subject: 'Алгоритмы и структуры данных',
      description: 'Реализовать алгоритмы быстрой сортировки и сортировки слиянием. Провести анализ сложности.',
      deadline: '28 апреля 2026 г.',
      points: 100,
      status: 'completed'
    },
    {
      id: 2,
      title: 'JavaScript: Работа с массивами',
      subject: 'JavaScript Основы',
      description: 'Реализовать функции для работы с массивами: фильтрация, сортировка, поиск. Использовать методы map, filter, reduce.',
      deadline: '26 апреля 2026 г.',
      points: 80,
      status: 'overdue'
    },
    {
      id: 3,
      title: 'Создание веб-страницы с HTML/CSS',
      subject: 'Frontend разработка',
      description: 'Разработать адаптивную landing page используя HTML5 и CSS3. Требования: семантическая верстка, флексбокс, медиа-запросы.',
      deadline: '28 апреля 2026 г.',
      points: 100,
      status: 'in_progress'
    },
    {
      id: 4,
      title: 'Асинхронность и промисы',
      subject: 'JavaScript Основы',
      description: 'Реализовать цепочки промисов, обработку ошибок через catch. Переписать колбэки на async/await.',
      deadline: '30 апреля 2026 г.',
      points: 80,
      status: 'review'
    },
    {
      id: 5,
      title: 'CSS Grid Layout',
      subject: 'Frontend разработка',
      description: 'Создать сложный макет с использованием CSS Grid. Реализовать адаптивную сетку без медиа-запросов.',
      deadline: '2 мая 2026 г.',
      points: 60,
      status: 'pending'
    },
    {
      id: 12,
      title: 'Лендинг на HTML&CSS',
      subject: 'Frontend разработка',
      description: 'Создать полноценную landing page для продукта или стартапа на выбор. Семантика, CSS-переменные, Grid, Flexbox, hover-эффекты, адаптивность — без CSS-фреймворков.',
      deadline: '28 апреля 2026 г.',
      points: 100,
      status: 'pending'
    }
  ]
}

const statusMap: Record<string, { label: string; cls: string }> = {
  completed:  { label: 'Выполнено',        cls: 'hw-badge--green'  },
  overdue:    { label: 'Просрочено',        cls: 'hw-badge--red'    },
  in_progress:{ label: 'В процессе',        cls: 'hw-badge--purple' },
  review:     { label: 'На проверке',       cls: 'hw-badge--yellow' },
  pending:    { label: 'Не начато',         cls: 'hw-badge--gray'   }
}

function btnLabel(status: string) {
  if (status === 'completed') return 'Посмотреть решение'
  if (status === 'overdue')   return 'Просмотреть'
  return 'Приступить'
}

function btnClass(status: string) {
  return status === 'completed' ? 'hw-btn hw-btn--outline' : 'hw-btn hw-btn--filled'
}
</script>

<template>
  <div class="hw-list">

    <!-- Статистика -->
    <div class="hw-stats">
      <div class="hw-stat">
        <div class="hw-stat__icon hw-stat__icon--purple">
          <img :src="documentIcon" alt="" />
        </div>
        <div>
          <p class="hw-stat__label">Всего заданий</p>
          <p class="hw-stat__num">{{ data.stats.total }}</p>
        </div>
      </div>
      <div class="hw-stat">
        <div class="hw-stat__icon hw-stat__icon--clock">
          <img :src="clockIcon" alt="" />
        </div>
        <div>
          <p class="hw-stat__label">В процессе</p>
          <p class="hw-stat__num">{{ data.stats.inProgress }}</p>
        </div>
      </div>
      <div class="hw-stat">
        <div class="hw-stat__icon hw-stat__icon--green">
          <img :src="checkIcon" alt="" />
        </div>
        <div>
          <p class="hw-stat__label">Выполнено</p>
          <p class="hw-stat__num">{{ data.stats.completed }}</p>
        </div>
      </div>
    </div>

    <!-- Список заданий -->
    <div class="hw-items">
      <div v-for="item in data.items" :key="item.id" class="hw-item">
        <div class="hw-item__top">
          <div class="hw-item__title-row">
            <span class="hw-item__dot" :class="item.status === 'completed' ? 'hw-item__dot--check' : 'hw-item__dot--circle'" />
            <h3 class="hw-item__title">{{ item.title }}</h3>
          </div>
          <span class="hw-badge" :class="statusMap[item.status].cls">
            {{ statusMap[item.status].label }}
          </span>
        </div>
        <p class="hw-item__subject">{{ item.subject }}</p>
        <p class="hw-item__desc">{{ item.description }}</p>
        <div class="hw-item__divider" />
        <div class="hw-item__footer">
          <div class="hw-item__meta">
            <img :src="calendarIcon" alt="" class="hw-item__meta-icon" />
            <span>Срок: {{ item.deadline }}</span>
            <span class="hw-item__points">{{ item.points }} баллов</span>
          </div>
          <NuxtLink :to="`/student/homework/${item.id}`" :class="btnClass(item.status)">
            {{ btnLabel(item.status) }}
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
.hw-list {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Stats */
.hw-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.hw-stat {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img { width: 26px; height: 26px; }

    &--purple { background: var(--c-purple-light); }
    &--clock  { background: var(--c-purple-light); }
    &--green  { background: var(--c-green-light); }
  }

  &__label {
    font-size: 13px;
    color: var(--c-text-gray);
    margin-bottom: 4px;
  }

  &__num {
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 800;
    color: var(--c-text-dark);
    line-height: 1;
  }
}

/* Items */
.hw-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hw-item {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 24px;

  &__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 2px solid var(--c-text-gray);

    &--check {
      border-color: var(--c-green);
      background: url('~/assets/icons/YellowGalochka.svg') center/14px no-repeat;
      background-color: var(--c-green-light);
    }
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__subject {
    font-size: 13px;
    color: var(--c-purple-text);
    font-weight: 500;
    margin: 0 0 10px 32px;
  }

  &__desc {
    font-size: 14px;
    color: var(--c-text-gray);
    line-height: 1.55;
    margin-bottom: 16px;
  }

  &__divider {
    height: 1px;
    background: #E8E8E8;
    margin-bottom: 16px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--c-text-dark);
  }

  &__meta-icon {
    width: 16px;
    height: 16px;
  }

  &__points {
    display: inline-flex;
    align-items: center;
    padding: 3px 12px;
    border-radius: var(--radius-full);
    background: var(--c-yellow-light);
    color: var(--c-yellow-text);
    font-size: 12px;
    font-weight: 600;
  }
}

/* Badges */
.hw-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;

  &--green  { background: var(--c-green-light);  color: var(--c-green);       border: 1px solid var(--c-green); }
  &--red    { background: var(--c-red-light);    color: var(--c-red);         border: 1px solid var(--c-red); }
  &--purple { background: var(--c-purple-light); color: var(--c-purple-text); border: 1px solid var(--c-purple-text); }
  &--yellow { background: var(--c-yellow-light); color: var(--c-yellow-text); border: 1px solid var(--c-yellow); }
  &--gray   { background: #F0F0F0;               color: #888;                 border: 1px solid #CCC; }
}

/* Buttons */
.hw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: opacity 0.2s;

  &--outline {
    border: 1.5px solid var(--c-purple-text);
    color: var(--c-purple-text);
    background: transparent;
    &:hover { background: var(--c-purple-light); }
  }

  &--filled {
    background: var(--c-purple-text);
    color: var(--c-white);
    border: none;
    &:hover { opacity: 0.88; }
  }
}

@media (max-width: 768px) {
  .hw-stats { grid-template-columns: repeat(3, 1fr); }

  .hw-item {
    padding: 18px;

    &__footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    &__footer .hw-btn {
      width: 100%;
      justify-content: center;
    }
  }
}

@media (max-width: 580px) {
  .hw-stats { grid-template-columns: 1fr; }

  .hw-item {
    &__top { flex-wrap: wrap; gap: 8px; }
    &__title { font-size: 16px; }
    &__meta { flex-wrap: wrap; gap: 6px; }
  }
}
</style>
