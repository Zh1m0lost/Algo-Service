<script setup lang="ts">
definePageMeta({ layout: 'admin' })

// TODO: заменить на useFetch('/api/admin/tasks')
const data = {
  items: [
    {
      id: 1,
      title:       'Финальный проект — Лендинг',
      desc:        'Разработать адаптивный landing page по требованиям из ТЗ. Сдача через GitHub Pages, после самопроверки.',
      recurrence:  { label: 'Однократно', cls: 'tk-pill--gray' },
      deadline:    { text: '28 апреля · 23:59', urgent: true },
      assignee:    { name: 'WebDev-2024-A', role: 'группа' },
      comment:     { author: 'Е. Петровна', date: '21 апр', text: 'Добавьте viewport-метатег.' },
      urgency:     'urgent'
    },
    {
      id: 2,
      title:       'Еженедельная домашка по алгоритмам',
      desc:        '5 задач из практикума. Сдача — за 24 часа до следующего занятия.',
      recurrence:  { label: 'Еженедельно · Каждый понедельник', cls: 'tk-pill--yellow' },
      deadline:    { text: 'Каждый Пн · 18:00', urgent: true },
      assignee:    { name: 'Algo-Jr-3', role: 'группа' },
      comment:     { author: 'С. Михайлов', date: '27 апр', text: '3 ученика не сдали на этой неделе.' },
      urgency:     'soon'
    },
    {
      id: 3,
      title:       'Заполнить журнал посещаемости',
      desc:        'Отметить присутствующих и выставить оценки за активность.',
      recurrence:  { label: 'По дням недели · Пн / Ср / Пт', cls: 'tk-pill--yellow' },
      deadline:    { text: 'После каждого занятия', urgent: false },
      assignee:    { name: 'Все преподаватели', role: 'преподаватель' },
      comment:     null,
      urgency:     'calm'
    },
    {
      id: 4,
      title:       'Контроль оплаты — собрать просрочки',
      desc:        'Проверить статусы оплат, отправить напоминания родителям.',
      recurrence:  { label: 'Ежемесячно · 1-го числа каждого месяца', cls: 'tk-pill--pink' },
      deadline:    { text: '1 мая 2026', urgent: true },
      assignee:    { name: 'И. Иванов', role: 'админ' },
      comment:     { author: 'И. Иванов', date: '01 апр', text: 'В апреле — 3 случая.' },
      urgency:     'soon'
    },
    {
      id: 5,
      title:       'Проверка лабораторных работ',
      desc:        'Ревью кода всех лаб. за модуль с обратной связью.',
      recurrence:  { label: 'Ежедневно · Каждый рабочий день', cls: 'tk-pill--green' },
      deadline:    { text: 'до 22:00', urgent: false },
      assignee:    { name: 'Е. Петровна', role: 'преподаватель' },
      comment:     { author: 'Е. Петровна', date: 'сегодня', text: 'Закрыто 12 из 14.' },
      urgency:     'calm'
    },
    {
      id: 6,
      title:       'Подготовить материалы к новому модулю',
      desc:        'Презентации, демо-проекты, тесты для нового набора.',
      recurrence:  { label: 'Однократно', cls: 'tk-pill--gray' },
      deadline:    { text: '15 мая 2026', urgent: false },
      assignee:    { name: 'Е. Петровна, С. Михайлов', role: 'преподаватель' },
      comment:     null,
      urgency:     'calm'
    },
    {
      id: 7,
      title:       'Сдать ТЗ к концу недели',
      desc:        'Срок прошёл — задача в просрочке.',
      recurrence:  { label: 'Однократно', cls: 'tk-pill--gray' },
      deadline:    { text: '25 апр 2026', urgent: true },
      assignee:    { name: 'Front-Adv-1', role: 'группа' },
      comment:     null,
      urgency:     'urgent'
    }
  ]
}

const tabs = [
  { key: 'all',    label: 'Все',      count: 7 },
  { key: 'urgent', label: 'Срочные',  count: 2 },
  { key: 'soon',   label: 'Скоро',    count: 2 },
  { key: 'calm',   label: 'Спокойно', count: 3 }
]

const activeTab = ref('all')
const search    = ref('')

const filtered = computed(() => {
  let list = activeTab.value === 'all'
    ? data.items
    : data.items.filter(i => i.urgency === activeTab.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.assignee.name.toLowerCase().includes(q) ||
      i.desc.toLowerCase().includes(q)
    )
  }
  return list
})
</script>

<template>
  <div class="tk-page">
    <div class="tk-card">

      <!-- Шапка карточки -->
      <div class="tk-card__head">
        <h1 class="tk-card__title">Все задачи</h1>
        <div class="tk-card__controls">
          <div class="al-search">
            <span class="al-search__icon">🔍</span>
            <input v-model="search" class="al-search__input" placeholder="Поиск" />
          </div>
          <button class="al-add-btn">+</button>
        </div>
      </div>

      <!-- Табы -->
      <div class="al-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="al-tab"
          :class="{ 'al-tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }} <span class="al-tab__count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Таблица -->
      <table class="tk-table">
        <thead>
          <tr>
            <th style="width:36px" />
            <th>ЗАДАЧА</th>
            <th>РЕГУЛЯРНОСТЬ</th>
            <th>ДЕДЛАЙН</th>
            <th>КОМУ НАЗНАЧЕНО</th>
            <th>ПОСЛЕДНИЙ КОММЕНТАРИЙ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in filtered" :key="task.id" class="tk-table__row">

            <!-- Стрелка -->
            <td class="tk-table__arrow">▸</td>

            <!-- Задача -->
            <td class="tk-table__task">
              <p class="tk-table__task-title">{{ task.title }}</p>
              <p class="tk-table__task-desc">{{ task.desc }}</p>
            </td>

            <!-- Регулярность -->
            <td>
              <span class="tk-pill" :class="task.recurrence.cls">
                {{ task.recurrence.label }}
              </span>
            </td>

            <!-- Дедлайн -->
            <td :class="task.deadline.urgent ? 'tk-table__deadline--urgent' : 'tk-table__deadline'">
              {{ task.deadline.text }}
            </td>

            <!-- Кому назначено -->
            <td class="tk-table__assignee">
              <p class="tk-table__assignee-name">{{ task.assignee.name }}</p>
              <p class="tk-table__assignee-role">{{ task.assignee.role }}</p>
            </td>

            <!-- Последний комментарий -->
            <td class="tk-table__comment">
              <template v-if="task.comment">
                <span class="tk-table__comment-author">{{ task.comment.author }}</span>
                <span class="tk-table__comment-date">{{ task.comment.date }}</span>
                <p class="tk-table__comment-text">{{ task.comment.text }}</p>
              </template>
              <span v-else class="tk-table__comment-empty">— нет комментариев</span>
            </td>

          </tr>
        </tbody>
      </table>

    </div>
  </div>
</template>

<style lang="scss">
.tk-page {
  padding-top: 20px;
}

.tk-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 24px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

/* Table */
.tk-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;

  th {
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--c-text-gray);
    padding: 10px 12px;
    border-bottom: 1.5px solid #F0F0F0;
  }

  &__row {
    border-bottom: 1px solid #F5F5F5;
    transition: background 0.15s;

    &:hover { background: var(--c-bg); }
    &:last-child { border-bottom: none; }

    td {
      padding: 16px 12px;
      vertical-align: top;
      font-size: 14px;
      color: var(--c-text-dark);
    }
  }

  &__arrow {
    color: var(--c-text-gray);
    font-size: 12px;
    cursor: pointer;
    user-select: none;
    vertical-align: middle !important;
    padding-right: 4px !important;
  }

  &__task { max-width: 280px; }

  &__task-title {
    font-weight: 700;
    font-size: 14px;
    color: var(--c-text-dark);
    margin-bottom: 5px;
    line-height: 1.3;
  }

  &__task-desc {
    font-size: 12px;
    color: var(--c-text-gray);
    line-height: 1.5;
  }

  &__deadline {
    font-size: 14px;
    color: var(--c-text-dark);
    white-space: nowrap;

    &--urgent {
      font-size: 14px;
      font-weight: 700;
      color: var(--c-red);
      white-space: nowrap;
    }
  }

  &__assignee-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--c-text-dark);
    margin-bottom: 3px;
  }

  &__assignee-role {
    font-size: 12px;
    color: var(--c-text-gray);
  }

  &__comment {
    max-width: 220px;
  }

  &__comment-author {
    font-weight: 600;
    font-size: 13px;
    color: var(--c-text-dark);
    margin-right: 6px;
  }

  &__comment-date {
    font-size: 12px;
    color: var(--c-text-gray);
  }

  &__comment-text {
    font-size: 12px;
    color: var(--c-text-gray);
    margin-top: 3px;
    line-height: 1.4;
  }

  &__comment-empty {
    font-size: 13px;
    color: #BBBBBB;
  }
}

/* Regularity pills */
.tk-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  max-width: 180px;
  white-space: normal;
  text-align: center;

  &--gray   { background: #EBEBEB;               color: #666;                 }
  &--yellow { background: var(--c-yellow-light); color: var(--c-yellow-text); }
  &--pink   { background: #FFE4E4;               color: #9F2323;              }
  &--green  { background: var(--c-green-light);  color: var(--c-green-text);  }
}
</style>
