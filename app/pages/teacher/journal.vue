<script setup lang="ts">
definePageMeta({ layout: 'teacher' })

const api = useApi()
const selectedGroup = ref<string>('')

const { data, refresh } = await useAsyncData('teacher-journal',
  () => api<any>('/teacher/journal', { query: { group: selectedGroup.value || undefined } }),
  { watch: [selectedGroup] },
)

const groups   = computed<string[]>(() => data.value?.groups ?? [])
const lessons  = computed<any[]>(() => data.value?.lessons ?? [])
const students = computed<any[]>(() => data.value?.students ?? [])

// Как только список групп пришёл — выбираем первую.
watchEffect(() => {
  if (!selectedGroup.value && groups.value.length) {
    selectedGroup.value = groups.value[0]
  }
})

// Любые начисленные баллы — это хорошо (даже 1). Ячейку с баллами подсвечиваем «золотом».
function cellStyle(points: number | null) {
  return points !== null ? { background: 'var(--c-yellow-light)' } : {}
}

// Клик по ячейке — исправить/выставить балл: подставляем ученика, занятие и текущее значение в форму.
function editCell(student: any, idx: number) {
  form.studentId = student.id
  form.lessonId  = lessons.value[idx]?.id ?? ''
  form.points    = student.scores[idx] ?? 0
  // Прокрутка к форме, чтобы исправление было очевидным.
  if (import.meta.client) {
    requestAnimationFrame(() => document.getElementById('jrn-grade-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }
}

// Подсказка: какой ученик/занятие сейчас редактируется.
const editingStudent = computed(() => students.value.find((s: any) => s.id === form.studentId)?.name ?? '')
const editingLesson  = computed(() => lessons.value.find((l: any) => l.id === form.lessonId)?.title ?? '')

// Форма начисления баллов
const form = reactive({
  studentId: '',
  lessonId:  '',
  points:    10,
})

// При обновлении данных подставляем первого ученика и первое занятие.
watch(data, (d) => {
  if (!d) return
  form.studentId = d.students?.[0]?.id ?? ''
  const ids = (d.lessons ?? []).map((l: any) => l.id)
  if (!ids.includes(form.lessonId)) form.lessonId = ids[0] ?? ''
}, { immediate: true })

const saving = ref(false)

async function submitGrade() {
  if (!form.student || !form.assignment) return
  saving.value = true
  try {
    await api('/teacher/journal/grade', {
      method: 'POST',
      body: {
        group:     selectedGroup.value,
        studentId: form.studentId,
        lessonId:  form.lessonId,
        points:    form.points,
      },
    })
    await refresh()
  } finally {
    saving.value = false
  }
}

function resetForm() {
  form.studentId = students.value[0]?.id ?? ''
  form.lessonId  = lessons.value[0]?.id ?? ''
  form.points    = 10
}

// Дропдаун группы
const groupOpen = ref(false)

function exportCsv() {
  const escape = (v: unknown) => {
    const str = String(v ?? '')
    return /[",;\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }

  const header = ['Ученик', ...lessons.value.map((l: any) => l.title), 'Итого баллов']
  const rows = students.value.map((s: any) => [
    s.name,
    ...lessons.value.map((_: any, i: number) => s.scores[i] ?? ''),
    s.total,
  ])

  // Разделитель «;» и BOM — чтобы Excel корректно открыл кириллицу.
  const csv = [header, ...rows].map(r => r.map(escape).join(';')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `journal-${selectedGroup.value || 'group'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="jrn">

    <!-- Заголовок -->
    <div class="jrn-header">
      <h1 class="jrn-header__title">Журнал баллов</h1>
      <div class="jrn-header__right">

        <!-- Выбор группы -->
        <div class="jrn-group-select" @click.stop="groupOpen = !groupOpen">
          <span>{{ selectedGroup }}</span>
          <span class="jrn-group-select__arrow">▾</span>
          <div v-if="groupOpen" class="jrn-group-select__dropdown" @click.stop>
            <div
              v-for="g in groups"
              :key="g"
              class="jrn-group-select__option"
              :class="{ 'jrn-group-select__option--active': g === selectedGroup }"
              @click="selectedGroup = g; groupOpen = false"
            >
              {{ g }}
            </div>
          </div>
        </div>

        <!-- Экспорт -->
        <button class="jrn-export-btn" @click="exportCsv">⬇ Экспорт CSV</button>
      </div>
    </div>

    <!-- Таблица баллов -->
    <div class="jrn-table-wrap">
      <table class="jrn-table">
        <thead>
          <tr>
            <th class="jrn-table__th jrn-table__th--student">Ученик</th>
            <th v-for="l in lessons" :key="l.id" class="jrn-table__th">
              <span class="jrn-table__th-title">{{ l.title }}</span>
              <span v-if="l.date" class="jrn-table__th-date">{{ l.date }}</span>
            </th>
            <th class="jrn-table__th">Итого баллов</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(student, sIdx) in students" :key="sIdx" class="jrn-table__row">
            <td class="jrn-table__name">{{ student.name }}</td>
            <td
              v-for="(pts, gIdx) in student.scores"
              :key="gIdx"
              class="jrn-table__cell jrn-table__cell--click"
              :class="{ 'jrn-table__cell--active': form.studentId === student.id && form.lessonId === lessons[gIdx]?.id }"
              :style="cellStyle(pts)"
              :title="pts !== null ? 'Нажмите, чтобы исправить балл' : 'Нажмите, чтобы выставить балл'"
              @click="editCell(student, gIdx)"
            >
              <span v-if="pts !== null" class="jrn-table__grade">+{{ pts }}</span>
              <span v-else class="jrn-table__empty">+</span>
            </td>
            <td class="jrn-table__points">
              {{ student.total.toLocaleString('ru') }}
            </td>
          </tr>
          <tr v-if="!students.length">
            <td :colspan="lessons.length + 2" class="jrn-table__empty-row">
              В этой группе пока нет занятий или учеников
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Форма начисления / исправления баллов -->
    <div id="jrn-grade-form" class="jrn-form-card">
      <p class="jrn-form-card__label">НАЧИСЛЕНИЕ И ИСПРАВЛЕНИЕ БАЛЛОВ</p>
      <p class="jrn-form-card__hint">
        Нажмите на ячейку в таблице, чтобы выставить или <strong>исправить</strong> балл за занятие.
        Баллы копятся — даже 1 балл это хорошо.
      </p>

      <p v-if="editingStudent && editingLesson" class="jrn-form-card__editing">
        Редактируется: <strong>{{ editingStudent }}</strong> · {{ editingLesson }}
      </p>

      <div class="jrn-form">
        <div class="jrn-form__field">
          <label class="jrn-form__field-label">Ученик</label>
          <select v-model="form.studentId" class="jrn-form__select">
            <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <div class="jrn-form__field jrn-form__field--wide">
          <label class="jrn-form__field-label">Занятие</label>
          <select v-model="form.lessonId" class="jrn-form__select">
            <option v-for="l in lessons" :key="l.id" :value="l.id">{{ l.title }}{{ l.date ? ' · ' + l.date : '' }}</option>
          </select>
        </div>

        <div class="jrn-form__field jrn-form__field--sm">
          <label class="jrn-form__field-label">Баллы</label>
          <input v-model.number="form.points" type="number" min="1" max="1000" class="jrn-form__input" />
        </div>
      </div>

      <div class="jrn-form__btns">
        <button class="jrn-form__btn jrn-form__btn--submit" :disabled="saving" @click="submitGrade">
          {{ saving ? 'Сохраняем…' : 'Сохранить балл' }}
        </button>
        <button class="jrn-form__btn jrn-form__btn--reset"  @click="resetForm">Сбросить</button>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
.jrn {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.jrn-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  &__title {
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 800;
    color: var(--c-text-dark);
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

/* Group select */
.jrn-group-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1.5px solid var(--c-purple-text);
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  color: var(--c-purple-text);
  cursor: pointer;
  user-select: none;
  background: var(--c-white);

  &__arrow { font-size: 12px; }

  &__dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 100%;
    background: var(--c-white);
    border: 1.5px solid #E0E0E0;
    border-radius: var(--radius-sm);
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    z-index: 100;
    overflow: hidden;
  }

  &__option {
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    color: var(--c-text-dark);
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;

    &:hover { background: var(--c-bg); }
    &--active { background: var(--c-purple-light); color: var(--c-purple-text); font-weight: 700; }
  }
}

/* Export button */
.jrn-export-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  border: 1.5px solid #E0E0E0;
  background: var(--c-white);
  font-size: 14px;
  font-weight: 600;
  color: var(--c-purple-text);
  cursor: pointer;
  font-family: var(--font-main);
  transition: border-color 0.2s;

  &:hover { border-color: var(--c-purple-text); }
}

/* Table */
.jrn-table-wrap {
  background: var(--c-white);
  border-radius: var(--radius-md);
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #EBEBEB;
}

.jrn-table {
  width: 100%;
  border-collapse: collapse;

  &__th {
    padding: 16px 20px;
    font-size: 14px;
    font-weight: 500;
    color: var(--c-text-dark);
    text-align: center;
    border-bottom: 1.5px solid #EBEBEB;
    border-right: 1px solid #EBEBEB;
    background: var(--c-white);

    &--student {
      text-align: left;
      min-width: 180px;
    }

    &:last-child { border-right: none; }
  }

  &__th-title { display: block; font-weight: 600; }
  &__th-date { display: block; font-size: 11px; color: var(--c-text-gray); font-weight: 400; margin-top: 2px; }

  &__row {
    border-bottom: 1px solid #F0F0F0;
    &:last-child { border-bottom: none; }
  }

  &__name {
    padding: 18px 20px;
    font-size: 15px;
    font-weight: 500;
    color: var(--c-text-dark);
    border-right: 1px solid #EBEBEB;
    white-space: nowrap;
  }

  &__cell {
    padding: 18px 20px;
    text-align: center;
    border-right: 1px solid #EBEBEB;
    transition: background 0.2s;
    min-width: 100px;

    &--click { cursor: pointer; }
    &--click:hover { outline: 2px solid var(--c-purple); outline-offset: -2px; }
    &--active { outline: 2px solid var(--c-purple-text); outline-offset: -2px; }
  }

  &__grade {
    font-size: 18px;
    font-weight: 700;
    color: var(--c-green-text);
  }

  &__empty {
    font-size: 18px;
    color: #CCC;
  }

  &__empty-row {
    padding: 28px 16px;
    text-align: center;
    font-size: 14px;
    color: var(--c-text-gray);
  }

  &__points {
    padding: 18px 20px;
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    color: #B87A00;
    border-right: 1px solid #EBEBEB;
    white-space: nowrap;
  }

  &__avg {
    padding: 18px 20px;
    text-align: center;
    font-size: 16px;
    font-weight: 700;
  }
}

/* Form */
.jrn-form-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--c-purple-text);
  }

  &__hint {
    font-size: 13px;
    color: var(--c-text-gray);
    margin-top: -8px;
  }

  &__editing {
    font-size: 13px;
    color: var(--c-purple-text);
    background: var(--c-purple-light);
    padding: 8px 12px;
    border-radius: var(--radius-sm);
  }
}

.jrn-form {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 160px;

    &--wide { flex: 2; min-width: 220px; }
    &--sm   { flex: 0 0 110px; min-width: 100px; }
  }

  &__field-label {
    font-size: 13px;
    color: var(--c-text-gray);
    font-weight: 500;
  }

  &__select, &__input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #DCDCDC;
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-family: var(--font-main);
    color: var(--c-text-dark);
    background: var(--c-white);
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.2s;

    &:focus { border-color: var(--c-purple); }
  }

  &__select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }

  &__btns {
    display: flex;
    gap: 10px;
    margin-top: 4px;
  }

  &__btn {
    padding: 10px 24px;
    border-radius: var(--radius-full);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-main);
    transition: opacity 0.2s;
    border: none;

    &--submit {
      background: var(--c-green);
      color: var(--c-white);
      &:hover { opacity: 0.88; }
    }

    &--reset {
      background: #F0F0F0;
      color: var(--c-text-dark);
      &:hover { background: #E0E0E0; }
    }
  }
}

@media (max-width: 768px) {
  .jrn-header {
    flex-wrap: wrap;
    gap: 12px;

    &__right { flex-wrap: wrap; }
  }

  /* Таблица — горизонтальный скролл */
  .jrn-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .jrn-table {
    min-width: 560px;

    &__th { padding: 12px 14px; font-size: 13px; }
    &__name { padding: 14px; font-size: 14px; }
    &__cell { padding: 14px; min-width: 80px; }
    &__points, &__avg { padding: 14px; }
  }

  .jrn-form-card { padding: 20px; }

  .jrn-form__btns { flex-wrap: wrap; }

  .jrn-form__btn { flex: 1; min-width: 120px; text-align: center; }
}

@media (max-width: 480px) {
  .jrn-header__title { font-size: 18px; }

  .jrn-export-btn span { display: none; }

  .jrn-form {
    flex-direction: column;
    &__field, &__field--wide, &__field--sm { flex: none; width: 100%; }
  }
}
</style>
