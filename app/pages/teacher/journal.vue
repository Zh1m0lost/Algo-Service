<script setup lang="ts">
import { avg } from '~/utils/grades'
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

// Форма начисления баллов
const form = reactive({
  studentId: '',
  lessonId:  '',
  points:    10,
})

// Выбранные ячейки для массового начисления (Ctrl/Cmd-клик).
const selection = ref<{ studentId: string; lessonId: string }[]>([])
function isSelected(studentId: string, lessonId: string) {
  return selection.value.some(c => c.studentId === studentId && c.lessonId === lessonId)
}

function scrollToForm() {
  if (import.meta.client) {
    requestAnimationFrame(() => document.getElementById('jrn-grade-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }
}

// Клик по ячейке: обычный — выбрать одну и подставить в форму; Ctrl/Cmd — добавить/убрать из массового выбора.
function editCell(student: any, idx: number, e: MouseEvent) {
  const lessonId = lessons.value[idx]?.id ?? ''
  if (!lessonId) return
  const cell = { studentId: student.id, lessonId }

  if (e.ctrlKey || e.metaKey) {
    const at = selection.value.findIndex(c => c.studentId === cell.studentId && c.lessonId === cell.lessonId)
    if (at >= 0) selection.value.splice(at, 1)
    else selection.value.push(cell)
  } else {
    selection.value = [cell]
    form.points = student.scores[idx] ?? 0
    scrollToForm()
  }
  form.studentId = cell.studentId
  form.lessonId  = cell.lessonId
}

// Подсказка: какой ученик/занятие сейчас редактируется.
const editingStudent = computed(() => students.value.find((s: any) => s.id === form.studentId)?.name ?? '')
const editingLesson  = computed(() => lessons.value.find((l: any) => l.id === form.lessonId)?.title ?? '')

// При обновлении данных подставляем первого ученика и первое занятие.
watch(data, (d) => {
  if (!d) return
  selection.value = []
  form.studentId = d.students?.[0]?.id ?? ''
  const ids = (d.lessons ?? []).map((l: any) => l.id)
  if (!ids.includes(form.lessonId)) form.lessonId = ids[0] ?? ''
}, { immediate: true })

const saving = ref(false)

// Тост
const toast = reactive({ show: false, text: '', ok: true })
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string, ok = true) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text; toast.ok = ok; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

async function submitGrade() {
  const cells = selection.value.length
    ? [...selection.value]
    : (form.studentId && form.lessonId ? [{ studentId: form.studentId, lessonId: form.lessonId }] : [])

  if (!cells.length) { showToast('Выберите ячейку в таблице', false); return }
  if (typeof form.points !== 'number' || Number.isNaN(form.points)) { showToast('Введите баллы', false); return }

  saving.value = true
  try {
    if (cells.length > 1) {
      await api('/teacher/journal/bulk', {
        method: 'POST',
        body: { group: selectedGroup.value, points: form.points, items: cells },
      })
      showToast(`Баллы выставлены: ${cells.length} ячеек`)
    } else {
      await api('/teacher/journal/grade', {
        method: 'POST',
        body: { group: selectedGroup.value, studentId: cells[0].studentId, lessonId: cells[0].lessonId, points: form.points },
      })
      showToast('Балл сохранён')
    }
    selection.value = []
    await refresh()
  } catch (e: any) {
    showToast(e?.data?.message || 'Не удалось сохранить балл', false)
  } finally {
    saving.value = false
  }
}

function resetForm() {
  selection.value = []
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

  const header = ['Ученик', ...lessons.value.map((l: any) => l.title), 'Итого баллов', 'Средний балл']
  const rows = students.value.map((s: any) => [
    s.name,
    ...lessons.value.map((_: any, i: number) => s.scores[i] ?? ''),
    s.total,
    avg(s.scores) ?? '',
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
            <th v-for="l in lessons" :key="l.id" class="jrn-table__th">{{ l.title }}</th>
            <th class="jrn-table__th">Итого баллов</th>
            <th class="jrn-table__th">Средний балл</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(student, sIdx) in students" :key="sIdx" class="jrn-table__row">
            <td class="jrn-table__name">{{ student.name }}</td>
            <td
              v-for="(pts, gIdx) in student.scores"
              :key="gIdx"
              class="jrn-table__cell jrn-table__cell--click"
              :class="{ 'jrn-table__cell--active': isSelected(student.id, lessons[gIdx]?.id) }"
              :title="'Клик — выставить/исправить балл; Ctrl+клик — выбрать несколько'"
              @click="editCell(student, gIdx, $event)"
            >
              <span v-if="pts !== null" class="jrn-table__grade">{{ pts }}</span>
              <span v-else class="jrn-table__empty">—</span>
            </td>
            <td class="jrn-table__points">
              {{ student.total.toLocaleString('ru') }}
            </td>
            <td class="jrn-table__avg">{{ avg(student.scores) ?? '—' }}</td>
          </tr>
          <tr v-if="!students.length">
            <td :colspan="lessons.length + 3" class="jrn-table__empty-row">
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
        Клик по ячейке — выставить или <strong>исправить</strong> балл. <strong>Ctrl+клик</strong> (⌘ на Mac) —
        выбрать несколько ячеек и начислить им один балл сразу. Баллы копятся — даже 1 балл это хорошо.
      </p>

      <p v-if="selection.length > 1" class="jrn-form-card__editing">
        Выбрано ячеек: <strong>{{ selection.length }}</strong> — балл применится ко всем
      </p>
      <p v-else-if="editingStudent && editingLesson" class="jrn-form-card__editing">
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
          {{ saving ? 'Сохраняем…' : (selection.length > 1 ? `Сохранить (${selection.length})` : 'Сохранить балл') }}
        </button>
        <button class="jrn-form__btn jrn-form__btn--reset"  @click="resetForm">Сбросить</button>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="jrn-toast" :class="{ 'jrn-toast--error': !toast.ok }">{{ toast.text }}</div>
    </Transition>

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
    &--click:hover { background: var(--c-bg); }
    &--active { outline: 2px solid var(--c-purple-text); outline-offset: -2px; background: var(--c-purple-light); }
  }

  &__grade {
    font-size: 20px;
    font-weight: 700;
    color: var(--c-text-dark);
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

.jrn-toast {
  position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
  background: var(--c-green); color: #fff; font-size: 14px; font-weight: 600;
  padding: 12px 28px; border-radius: var(--radius-full); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 999; white-space: nowrap;
  &--error { background: var(--c-red); }
}

.toast-enter-active, .toast-leave-active { transition: opacity 0.25s, transform 0.25s; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
