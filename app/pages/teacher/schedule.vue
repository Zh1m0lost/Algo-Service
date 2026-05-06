<script setup lang="ts">
definePageMeta({ layout: 'teacher' })

// TODO: заменить на useFetch('/api/teacher/schedule?week=2026-04-27')
const data = {
  weekLabel: '27 апр. — 2 мая 2026',
  todayDayIndex: 2, // 1=ПН … 5=ПТ (вторник = текущий день)

  days: [
    { index: 1, short: 'ПН', date: '27' },
    { index: 2, short: 'ВТ', date: '28' },
    { index: 3, short: 'СР', date: '29' },
    { index: 4, short: 'ЧТ', date: '30' },
    { index: 5, short: 'ПТ', date: '1'  }
  ],

  timeSlots: ['16:00', '18:00', '20:00'],

  lessons: [
    { day: 1, time: '18:00', group: 'WebDev-B', subject: 'JavaScript',  color: '#EDE7FF', text: '#5B2D8E' },
    { day: 1, time: '20:00', group: 'Python-A',  subject: 'ООП',         color: '#E2F5D8', text: '#2E6E16' },
    { day: 2, time: '16:00', group: 'WebDev-A', subject: 'HTML/CSS',    color: '#FFF5C2', text: '#7A6100' },
    { day: 2, time: '20:00', group: 'Python-B',  subject: 'Функции',    color: '#D8EEFF', text: '#1A5A8E' },
    { day: 3, time: '18:00', group: 'WebDev-B', subject: 'Промисы',     color: '#E2F5D8', text: '#2E6E16' },
    { day: 4, time: '16:00', group: 'React-2025',subject: 'Компоненты', color: '#D8EEFF', text: '#1A5A8E' },
    { day: 4, time: '20:00', group: 'Алро-Adv', subject: 'Графы',       color: '#FFF5C2', text: '#7A6100' },
    { day: 5, time: '18:00', group: 'WebDev-A', subject: 'Проект',      color: '#EDE7FF', text: '#5B2D8E' }
  ],

  tasks: {
    todo: [
      { id: 1, title: 'Подготовить материалы по промисам',   meta: 'WebDev-B · 28 апр.', priority: 'urgent'  },
      { id: 2, title: 'Составить тест по Python ООП',        meta: 'Python-A · 30 апр.', priority: 'medium'  },
      { id: 3, title: 'Обновить задание по Алгоритмам',      meta: 'Алро-Adv',           priority: 'low'     },
      { id: 4, title: 'Записать видео-разбор ДЗ',            meta: 'Все группы',          priority: 'medium'  }
    ],
    inProgress: [
      { id: 5, title: 'Проверить ДЗ по HTML/CSS (WebDev-B)', meta: 'до 28 апр.',          priority: 'urgent'  },
      { id: 6, title: 'Написать конспект по React Hooks',    meta: 'React-2026',          priority: 'medium'  },
      { id: 7, title: 'Выставить оценки за контрольную',     meta: 'Python-A',            priority: 'urgent'  }
    ],
    done: [
      { id: 8, title: 'Проверить ДЗ Алгоритмы (3 работы)',  meta: '25 апр.',             priority: 'done'    },
      { id: 9, title: 'Составить задание по Git',            meta: '24 апр.',             priority: 'done'    },
      { id: 10,title: 'Созвон с группой Python-B',           meta: '23 апр.',             priority: 'done'    }
    ]
  }
}

const priorityMap: Record<string, { label: string; cls: string }> = {
  urgent: { label: 'Срочно',    cls: 'sch-task__badge--urgent'  },
  medium: { label: 'Средний',   cls: 'sch-task__badge--medium'  },
  low:    { label: 'Низкий',    cls: 'sch-task__badge--low'     },
  done:   { label: 'Выполнено', cls: 'sch-task__badge--done'    }
}

// Быстрый поиск занятия по (day, time)
const lessonMap = computed(() => {
  const map: Record<string, typeof data.lessons[0]> = {}
  for (const l of data.lessons) map[`${l.day}-${l.time}`] = l
  return map
})

function getLesson(dayIndex: number, time: string) {
  return lessonMap.value[`${dayIndex}-${time}`] ?? null
}
</script>

<template>
  <div class="sch">

    <div class="sch__header">
      <h1 class="sch__title">Расписание</h1>
      <p class="sch__week">Неделя {{ data.weekLabel }}</p>
    </div>

    <!-- Сетка расписания -->
    <div class="sch-grid">
      <!-- Шапка: дни -->
      <div class="sch-grid__corner" />
      <div
        v-for="day in data.days"
        :key="day.index"
        class="sch-grid__day-head"
        :class="{ 'sch-grid__day-head--today': day.index === data.todayDayIndex }"
      >
        <span class="sch-grid__day-short">{{ day.short }}</span>
        <span class="sch-grid__day-num">{{ day.date }}</span>
      </div>

      <!-- Строки: временные слоты -->
      <template v-for="time in data.timeSlots" :key="time">
        <div class="sch-grid__time">{{ time }}</div>
        <div
          v-for="day in data.days"
          :key="`${day.index}-${time}`"
          class="sch-grid__cell"
        >
          <div
            v-if="getLesson(day.index, time)"
            class="sch-lesson"
            :style="{
              background: getLesson(day.index, time)!.color,
              color: getLesson(day.index, time)!.text
            }"
          >
            <span class="sch-lesson__group">{{ getLesson(day.index, time)!.group }}</span>
            <span class="sch-lesson__subject">{{ getLesson(day.index, time)!.subject }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Задачи на неделю -->
    <div class="sch-tasks">
      <h2 class="sch-tasks__title">Мои задачи на неделю</h2>

      <div class="sch-kanban">
        <!-- К выполнению -->
        <div class="sch-col">
          <p class="sch-col__label sch-col__label--gray">К ВЫПОЛНЕНИЮ</p>
          <div class="sch-col__list">
            <div v-for="task in data.tasks.todo" :key="task.id" class="sch-task">
              <p class="sch-task__title">{{ task.title }}</p>
              <div class="sch-task__footer">
                <span class="sch-task__meta">{{ task.meta }}</span>
                <span class="sch-task__badge" :class="priorityMap[task.priority].cls">
                  {{ priorityMap[task.priority].label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- В процессе -->
        <div class="sch-col">
          <p class="sch-col__label sch-col__label--blue">В ПРОЦЕССЕ</p>
          <div class="sch-col__list">
            <div v-for="task in data.tasks.inProgress" :key="task.id" class="sch-task">
              <p class="sch-task__title">{{ task.title }}</p>
              <div class="sch-task__footer">
                <span class="sch-task__meta">{{ task.meta }}</span>
                <span class="sch-task__badge" :class="priorityMap[task.priority].cls">
                  {{ priorityMap[task.priority].label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Готово -->
        <div class="sch-col">
          <p class="sch-col__label sch-col__label--green">ГОТОВО</p>
          <div class="sch-col__list">
            <div v-for="task in data.tasks.done" :key="task.id" class="sch-task">
              <p class="sch-task__title">{{ task.title }}</p>
              <div class="sch-task__footer">
                <span class="sch-task__meta">{{ task.meta }}</span>
                <span class="sch-task__badge" :class="priorityMap[task.priority].cls">
                  {{ priorityMap[task.priority].label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
.sch {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sch__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sch__title {
  font-family: var(--font-heading);
  font-size: 26px;
  font-weight: 800;
  color: var(--c-text-dark);
}

.sch__week {
  font-size: 14px;
  color: var(--c-text-gray);
}

/* ── Сетка ─────────────────────────── */
.sch-grid {
  display: grid;
  grid-template-columns: 72px repeat(5, 1fr);
  background: var(--c-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid #E8E8E8;
}

.sch-grid__corner {
  background: var(--c-white);
  border-right: 1px solid #E8E8E8;
  border-bottom: 1px solid #E8E8E8;
}

.sch-grid__day-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 8px;
  border-right: 1px solid #E8E8E8;
  border-bottom: 1px solid #E8E8E8;
  gap: 2px;

  &:last-child { border-right: none; }

  &--today {
    .sch-grid__day-short { color: var(--c-purple-text); font-weight: 800; }
    .sch-grid__day-num   { color: var(--c-purple-text); font-weight: 800; }
  }
}

.sch-grid__day-short {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-gray);
  letter-spacing: 0.04em;
}

.sch-grid__day-num {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--c-text-dark);
}

.sch-grid__time {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--c-text-gray);
  font-weight: 500;
  border-right: 1px solid #E8E8E8;
  border-bottom: 1px solid #E8E8E8;
  padding: 8px 4px;

  &:last-of-type { border-bottom: none; }
}

.sch-grid__cell {
  border-right: 1px solid #E8E8E8;
  border-bottom: 1px solid #E8E8E8;
  padding: 6px;
  min-height: 80px;

  &:nth-child(6n) { border-right: none; }
}

/* Занятие в ячейке */
.sch-lesson {
  height: 100%;
  min-height: 68px;
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;

  &__group {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
  }

  &__subject {
    font-size: 12px;
    font-weight: 400;
    opacity: 0.85;
  }
}

/* ── Задачи ─────────────────────────── */
.sch-tasks {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sch-tasks__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--c-text-dark);
}

.sch-kanban {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: start;
}

.sch-col {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-bottom: 4px;

    &--gray  { color: var(--c-text-gray); }
    &--blue  { color: #1A5A8E; }
    &--green { color: var(--c-green-text); }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.sch-task {
  background: var(--c-white);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--c-text-dark);
    line-height: 1.4;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__meta {
    font-size: 12px;
    color: var(--c-text-gray);
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    flex-shrink: 0;

    &--urgent { background: var(--c-red);         color: var(--c-white);       }
    &--medium { background: var(--c-yellow);       color: var(--c-yellow-text); }
    &--low    { background: #E0E0E0;               color: #666;                 }
    &--done   { background: var(--c-green-light);  color: var(--c-green-text);  border: 1px solid var(--c-green); }
  }
}
</style>
