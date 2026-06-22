<script setup lang="ts">
import { avg } from '~/utils/grades'
definePageMeta({ layout: 'teacher' })

const api = useApi()
const selectedGroup = ref<string>('')

const { data, refresh } = await useAsyncData('teacher-journal',
  () => api<any>('/teacher/journal', { query: { group: selectedGroup.value || undefined } }),
  { watch: [selectedGroup] },
)

const groups      = computed<string[]>(() => data.value?.groups ?? [])
const subjects    = computed<string[]>(() => data.value?.subjects ?? [])
const assignments = computed<string[]>(() => data.value?.assignments ?? [])
const students    = computed<any[]>(() => data.value?.students ?? [])

// Как только список групп пришёл — выбираем первую.
watchEffect(() => {
  if (!selectedGroup.value && groups.value.length) {
    selectedGroup.value = groups.value[0]
  }
})

// Цвета ячеек по оценке
const cellBg: Record<number, string> = {
  5: '#D8F5D0',
  4: '#D0E8FF',
  3: '#EDE7FF',
  2: '#FFE0E0'
}

function gradeBg(g: number | null) {
  return g ? cellBg[g] ?? '#fff' : '#fff'
}

function avgColor(a: number | null) {
  if (a === null) return '#BBB'
  if (a >= 4.5) return 'var(--c-green)'
  if (a >= 4.0) return 'var(--c-text-dark)'
  if (a >= 3.5) return 'var(--c-purple-text)'
  return 'var(--c-red)'
}

// Форма выставления оценки
const form = reactive({
  student:    '',
  assignment: '',
  points:     85,
  grade:      5
})

// При обновлении данных подставляем первого ученика и первое задание.
watch(data, (d) => {
  if (!d) return
  form.student = d.students?.[0]?.name ?? ''
  if (!d.assignments?.includes(form.assignment)) {
    form.assignment = d.assignments?.[0] ?? ''
  }
}, { immediate: true })

async function submitGrade() {
  if (!form.student || !form.assignment) return
  await api('/teacher/journal/grade', {
    method: 'POST',
    body: {
      group:      selectedGroup.value,
      student:    form.student,
      assignment: form.assignment,
      points:     form.points,
      grade:      form.grade,
    },
  })
  await refresh()
}

function resetForm() {
  form.student    = students.value[0]?.name ?? ''
  form.assignment = assignments.value[0] ?? ''
  form.points     = 85
  form.grade      = 5
}

// Дропдаун группы
const groupOpen = ref(false)

function exportSvg() {
  const colW   = [200, ...subjects.value.map(() => 110), 130, 120]
  const rowH   = 48
  const headH  = 52
  const pad    = 16
  const totalW = colW.reduce((a, b) => a + b, 0)
  const totalH = headH + students.value.length * rowH

  const x = (col: number) => colW.slice(0, col).reduce((a, b) => a + b, 0)

  const gradeFill: Record<number, string> = { 5: '#D8F5D0', 4: '#D0E8FF', 3: '#EDE7FF', 2: '#FFE0E0' }

  const cols = ['Ученик', ...subjects.value, 'Итого баллов', 'Средний балл']

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" font-family="Arial, sans-serif">`
  svg += `<rect width="${totalW}" height="${totalH}" fill="#fff"/>`

  // Заголовок
  cols.forEach((col, ci) => {
    svg += `<rect x="${x(ci)}" y="0" width="${colW[ci]}" height="${headH}" fill="#F8F8F8" stroke="#EBEBEB" stroke-width="1"/>`
    svg += `<text x="${x(ci) + colW[ci] / 2}" y="${headH / 2 + 5}" text-anchor="middle" font-size="13" font-weight="600" fill="#333">${col}</text>`
  })

  // Строки
  students.value.forEach((s, ri) => {
    const y = headH + ri * rowH
    const a = avg(s.grades)

    const avgFill = a === null ? '#BBB' : a >= 4.5 ? '#4CAF50' : a >= 4.0 ? '#333' : a >= 3.5 ? '#6B48FF' : '#E53935'

    // Имя
    svg += `<rect x="${x(0)}" y="${y}" width="${colW[0]}" height="${rowH}" fill="#fff" stroke="#F0F0F0" stroke-width="1"/>`
    svg += `<text x="${x(0) + pad}" y="${y + rowH / 2 + 5}" font-size="14" font-weight="500" fill="#333">${s.name}</text>`

    // Оценки
    subjects.value.forEach((_, si) => {
      const g = s.grades[si]
      const fill = g ? gradeFill[g] ?? '#fff' : '#fff'
      svg += `<rect x="${x(si + 1)}" y="${y}" width="${colW[si + 1]}" height="${rowH}" fill="${fill}" stroke="#F0F0F0" stroke-width="1"/>`
      svg += `<text x="${x(si + 1) + colW[si + 1] / 2}" y="${y + rowH / 2 + 6}" text-anchor="middle" font-size="18" font-weight="700" fill="#333">${g ?? '—'}</text>`
    })

    // Баллы
    const pc = subjects.value.length + 1
    svg += `<rect x="${x(pc)}" y="${y}" width="${colW[pc]}" height="${rowH}" fill="#fff" stroke="#F0F0F0" stroke-width="1"/>`
    svg += `<text x="${x(pc) + colW[pc] / 2}" y="${y + rowH / 2 + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="#B87A00">${s.points.toLocaleString('ru')}</text>`

    // Средний
    const ac = subjects.value.length + 2
    svg += `<rect x="${x(ac)}" y="${y}" width="${colW[ac]}" height="${rowH}" fill="#fff" stroke="#F0F0F0" stroke-width="1"/>`
    svg += `<text x="${x(ac) + colW[ac] / 2}" y="${y + rowH / 2 + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="${avgFill}">${a ?? '—'}</text>`
  })

  svg += '</svg>'

  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `journal-${selectedGroup.value}.svg`
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
        <button class="jrn-export-btn" @click="exportSvg">⬇ Экспорт SVG</button>
      </div>
    </div>

    <!-- Таблица оценок -->
    <div class="jrn-table-wrap">
      <table class="jrn-table">
        <thead>
          <tr>
            <th class="jrn-table__th jrn-table__th--student">Ученик</th>
            <th v-for="sub in subjects" :key="sub" class="jrn-table__th">{{ sub }}</th>
            <th class="jrn-table__th">Итого баллов</th>
            <th class="jrn-table__th">Средний балл</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(student, sIdx) in students" :key="sIdx" class="jrn-table__row">
            <td class="jrn-table__name">{{ student.name }}</td>
            <td
              v-for="(grade, gIdx) in student.grades"
              :key="gIdx"
              class="jrn-table__cell"
              :style="{ background: gradeBg(grade) }"
            >
              <span v-if="grade !== null" class="jrn-table__grade">{{ grade }}</span>
              <span v-else class="jrn-table__empty">—</span>
            </td>
            <td class="jrn-table__points">
              {{ student.points.toLocaleString('ru') }}
            </td>
            <td
              class="jrn-table__avg"
              :style="{ color: avgColor(avg(student.grades)) }"
            >
              {{ avg(student.grades) ?? '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Форма выставления оценки -->
    <div class="jrn-form-card">
      <p class="jrn-form-card__label">ВЫСТАВЛЕНИЕ ОЦЕНКИ</p>

      <div class="jrn-form">
        <div class="jrn-form__field">
          <label class="jrn-form__field-label">Ученик</label>
          <select v-model="form.student" class="jrn-form__select">
            <option v-for="s in students" :key="s.name" :value="s.name">{{ s.name }}</option>
          </select>
        </div>

        <div class="jrn-form__field jrn-form__field--wide">
          <label class="jrn-form__field-label">Задание</label>
          <select v-model="form.assignment" class="jrn-form__select">
            <option v-for="a in assignments" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>

        <div class="jrn-form__field jrn-form__field--sm">
          <label class="jrn-form__field-label">Баллы</label>
          <input v-model.number="form.points" type="number" min="0" max="100" class="jrn-form__input" />
        </div>

        <div class="jrn-form__field jrn-form__field--sm">
          <label class="jrn-form__field-label">Оценка</label>
          <select v-model.number="form.grade" class="jrn-form__select">
            <option v-for="n in [5,4,3,2]" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>

      <div class="jrn-form__btns">
        <button class="jrn-form__btn jrn-form__btn--submit" @click="submitGrade">Выставить</button>
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
  overflow: hidden;
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
