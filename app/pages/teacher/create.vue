<script setup lang="ts">
definePageMeta({ layout: 'teacher' })

const api = useApi()

const steps = [
  { n: 1, label: 'Курс' },
  { n: 2, label: 'Урок' },
  { n: 3, label: 'Задание' },
]
const step = ref(1)

const toast = reactive({ show: false, text: '', ok: true })
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string, ok = true) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text; toast.ok = ok; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

// ── Шаг 1. Курс (группа) ──
const { data: groupsData, refresh: refreshGroups } = await useAsyncData('teacher-create-groups', () =>
  api<any[]>('/teacher/groups'),
)
const groups = computed(() => groupsData.value ?? [])
const selectedGroupId = ref<string>('')

const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
const newGroup = reactive({ name: '', subject: '', weekday: 0, lesson_time: '18:00', format: 'Онлайн' })
const creatingGroup = ref(false)

watch(groups, (g) => {
  if (!selectedGroupId.value && g.length) selectedGroupId.value = g[0].id
}, { immediate: true })

async function createGroup() {
  if (!newGroup.name.trim()) { showToast('Введите название курса', false); return }
  creatingGroup.value = true
  try {
    const res = await api<any>('/teacher/groups', { method: 'POST', body: { ...newGroup } })
    await refreshGroups()
    selectedGroupId.value = res.id
    Object.assign(newGroup, { name: '', subject: '', weekday: 0, lesson_time: '18:00', format: 'Онлайн' })
    showToast('Курс создан')
  } catch {
    showToast('Не удалось создать курс', false)
  } finally {
    creatingGroup.value = false
  }
}

function toLesson() {
  if (!selectedGroupId.value) { showToast('Выберите или создайте курс', false); return }
  step.value = 2
}

// ── Шаг 2. Урок ──
const lesson = reactive({ title: '', date: '', zoom: '', goals: [''], links: [{ label: '', href: '' }] })
const savingLesson = ref(false)

function addGoal() { lesson.goals.push('') }
function removeGoal(i: number) { lesson.goals.splice(i, 1); if (!lesson.goals.length) lesson.goals.push('') }
function addLink() { lesson.links.push({ label: '', href: '' }) }
function removeLink(i: number) { lesson.links.splice(i, 1); if (!lesson.links.length) lesson.links.push({ label: '', href: '' }) }

async function createLesson(goNext = false) {
  if (!lesson.title.trim()) { showToast('Введите название урока', false); return }
  savingLesson.value = true
  try {
    await api('/teacher/lessons', {
      method: 'POST',
      body: {
        group_id: selectedGroupId.value,
        title: lesson.title.trim(),
        date: lesson.date || null,
        zoom: lesson.zoom || null,
        goals: lesson.goals.filter(g => g.trim()),
        links: lesson.links.filter(l => l.href.trim()),
      },
    })
    showToast('Урок создан')
    Object.assign(lesson, { title: '', date: '', zoom: '', goals: [''], links: [{ label: '', href: '' }] })
    if (goNext) step.value = 3
  } catch {
    showToast('Не удалось создать урок', false)
  } finally {
    savingLesson.value = false
  }
}

// ── Шаг 3. Задание ──
const MAX_POINTS = 40
const task = reactive({
  title: '', points: 20, type: 'file' as 'single' | 'input' | 'file',
  instructions: '',
  options: [{ value: '', correct: false }, { value: '', correct: false }],
  correct: 0,
  answers: [''],
})
const savingTask = ref(false)

watch(() => task.points, (v) => {
  if (typeof v !== 'number' || Number.isNaN(v)) return
  if (v > MAX_POINTS) task.points = MAX_POINTS
  else if (v < 1) task.points = 1
})

function addOption() { task.options.push({ value: '', correct: false }) }
function addAnswer() { task.answers.push('') }

function taskValid(): boolean {
  if (!task.title.trim() || task.points < 1) return false
  if (task.type === 'single') return task.options.filter(o => o.value.trim()).length >= 2
  if (task.type === 'input') return task.answers.filter(a => a.trim()).length >= 1
  return true // file
}

async function createTask() {
  if (!taskValid()) { showToast('Заполните условие задания', false); return }
  savingTask.value = true
  try {
    const base: Record<string, any> = { name: task.title.trim(), points: task.points, type: task.type }
    let body = base
    if (task.type === 'single') {
      const opts = task.options.filter(o => o.value.trim())
      body = { ...base, options: opts.map(o => ({ value: o.value.trim() })), correct: Math.min(task.correct, opts.length - 1) }
    } else if (task.type === 'input') {
      body = { ...base, answers: task.answers.filter(a => a.trim()).map(a => a.trim()) }
    } else {
      body = { ...base, instructions: task.instructions.trim() }
    }
    await api('/teacher/tasks', { method: 'POST', body })
    showToast('Задание создано')
    Object.assign(task, { title: '', points: 20, type: 'file', instructions: '', options: [{ value: '', correct: false }, { value: '', correct: false }], correct: 0, answers: [''] })
  } catch {
    showToast('Не удалось создать задание', false)
  } finally {
    savingTask.value = false
  }
}
</script>

<template>
  <div class="wz">
    <h1 class="wz__title">Мастер создания</h1>

    <!-- Степпер -->
    <div class="wz-steps">
      <button
        v-for="s in steps"
        :key="s.n"
        class="wz-step"
        :class="{ 'wz-step--active': step === s.n, 'wz-step--done': step > s.n }"
        @click="step = s.n"
      >
        <span class="wz-step__num">{{ s.n }}</span>
        <span class="wz-step__label">{{ s.label }}</span>
      </button>
    </div>

    <!-- Шаг 1: Курс -->
    <div v-if="step === 1" class="wz-card">
      <p class="wz-card__label">ВЫБЕРИТЕ КУРС</p>
      <div class="wz-field">
        <select v-model="selectedGroupId" class="wz-input">
          <option v-if="!groups.length" value="">Курсов пока нет — создайте ниже</option>
          <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }} · {{ g.subject }}</option>
        </select>
      </div>

      <p class="wz-card__label wz-card__label--mt">ИЛИ СОЗДАЙТЕ НОВЫЙ</p>
      <div class="wz-grid">
        <label class="wz-field wz-field--full">
          <span class="wz-field__lbl">Название курса</span>
          <input v-model="newGroup.name" class="wz-input" placeholder="WebDev-2026-A" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Предмет</span>
          <input v-model="newGroup.subject" class="wz-input" placeholder="Frontend" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">День недели</span>
          <select v-model.number="newGroup.weekday" class="wz-input">
            <option v-for="(d, i) in weekdays" :key="i" :value="i">{{ d }}</option>
          </select>
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Время</span>
          <input v-model="newGroup.lesson_time" class="wz-input" placeholder="18:00" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Формат</span>
          <select v-model="newGroup.format" class="wz-input">
            <option>Онлайн</option><option>Офлайн</option><option>Гибрид</option>
          </select>
        </label>
      </div>
      <div class="wz-actions">
        <button class="wz-btn wz-btn--outline" :disabled="creatingGroup" @click="createGroup">
          {{ creatingGroup ? 'Создание…' : 'Создать курс' }}
        </button>
        <button class="wz-btn wz-btn--primary" @click="toLesson">Далее: урок →</button>
      </div>
    </div>

    <!-- Шаг 2: Урок -->
    <div v-else-if="step === 2" class="wz-card">
      <p class="wz-card__label">НОВЫЙ УРОК</p>
      <div class="wz-grid">
        <label class="wz-field wz-field--full">
          <span class="wz-field__lbl">Название урока</span>
          <input v-model="lesson.title" class="wz-input" placeholder="JavaScript — Промисы" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Дата и время</span>
          <input v-model="lesson.date" type="datetime-local" class="wz-input" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Ссылка на Zoom</span>
          <input v-model="lesson.zoom" class="wz-input" placeholder="https://zoom.us/j/…" />
        </label>
      </div>

      <p class="wz-card__label wz-card__label--mt">ЦЕЛИ УРОКА</p>
      <div v-for="(g, i) in lesson.goals" :key="i" class="wz-row">
        <input v-model="lesson.goals[i]" class="wz-input" :placeholder="`Цель ${i + 1}`" />
        <button class="wz-icon" @click="removeGoal(i)">🗑️</button>
      </div>
      <button class="wz-add" @click="addGoal">+ Добавить цель</button>

      <p class="wz-card__label wz-card__label--mt">МАТЕРИАЛЫ (ССЫЛКИ)</p>
      <div v-for="(l, i) in lesson.links" :key="i" class="wz-row wz-row--link">
        <input v-model="l.label" class="wz-input" placeholder="Название" />
        <input v-model="l.href" class="wz-input" placeholder="https://…" />
        <button class="wz-icon" @click="removeLink(i)">🗑️</button>
      </div>
      <button class="wz-add" @click="addLink">+ Добавить ссылку</button>

      <div class="wz-actions">
        <button class="wz-btn wz-btn--ghost" @click="step = 1">← Назад</button>
        <button class="wz-btn wz-btn--outline" :disabled="savingLesson" @click="createLesson(false)">Сохранить и добавить ещё</button>
        <button class="wz-btn wz-btn--primary" :disabled="savingLesson" @click="createLesson(true)">Сохранить → задание</button>
      </div>
    </div>

    <!-- Шаг 3: Задание -->
    <div v-else class="wz-card">
      <p class="wz-card__label">НОВОЕ ЗАДАНИЕ</p>
      <div class="wz-grid">
        <label class="wz-field wz-field--full">
          <span class="wz-field__lbl">Название / вопрос</span>
          <input v-model="task.title" class="wz-input" placeholder="Сформулируйте задание" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Баллы (до {{ MAX_POINTS }})</span>
          <input v-model.number="task.points" type="number" min="1" :max="MAX_POINTS" class="wz-input" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Тип</span>
          <select v-model="task.type" class="wz-input">
            <option value="file">Прикрепить файл</option>
            <option value="single">Одиночный выбор</option>
            <option value="input">Ввод ответа</option>
          </select>
        </label>
      </div>

      <template v-if="task.type === 'single'">
        <p class="wz-card__label wz-card__label--mt">ВАРИАНТЫ (отметьте правильный)</p>
        <div v-for="(o, i) in task.options" :key="i" class="wz-row">
          <input type="radio" class="wz-radio" :checked="task.correct === i" @change="task.correct = i" />
          <input v-model="o.value" class="wz-input" :placeholder="`Вариант ${i + 1}`" />
        </div>
        <button class="wz-add" @click="addOption">+ Вариант</button>
      </template>

      <template v-else-if="task.type === 'input'">
        <p class="wz-card__label wz-card__label--mt">ПРАВИЛЬНЫЕ ОТВЕТЫ</p>
        <div v-for="(a, i) in task.answers" :key="i" class="wz-row">
          <input v-model="task.answers[i]" class="wz-input" :placeholder="`Ответ ${i + 1}`" />
        </div>
        <button class="wz-add" @click="addAnswer">+ Ответ</button>
      </template>

      <template v-else>
        <p class="wz-card__label wz-card__label--mt">ИНСТРУКЦИЯ</p>
        <textarea v-model="task.instructions" class="wz-input wz-textarea" rows="3" placeholder="Что прикрепить и в каком формате" />
      </template>

      <div class="wz-actions">
        <button class="wz-btn wz-btn--ghost" @click="step = 2">← Назад</button>
        <NuxtLink to="/teacher/constructor" class="wz-btn wz-btn--ghost">Сложная задача — Конструктор</NuxtLink>
        <button class="wz-btn wz-btn--primary" :disabled="savingTask" @click="createTask">
          {{ savingTask ? 'Создание…' : 'Создать задание' }}
        </button>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="wz-toast" :class="{ 'wz-toast--error': !toast.ok }">{{ toast.text }}</div>
    </Transition>
  </div>
</template>

<style lang="scss">
.wz {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__title {
    font-family: var(--font-heading);
    font-size: 24px;
    font-weight: 800;
    color: var(--c-text-dark);
  }
}

.wz-steps { display: flex; gap: 10px; flex-wrap: wrap; }
.wz-step {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: var(--radius-full);
  border: 1.5px solid #E0E0E0;
  background: var(--c-white);
  cursor: pointer;
  font-family: var(--font-main);
  transition: all 0.15s;

  &__num {
    width: 24px; height: 24px; border-radius: 50%;
    background: #E8E8E8; color: var(--c-text-gray);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
  }
  &__label { font-size: 14px; font-weight: 600; color: var(--c-text-gray); }

  &--active {
    border-color: var(--c-purple-text);
    .wz-step__num { background: var(--c-purple-text); color: #fff; }
    .wz-step__label { color: var(--c-purple-text); }
  }
  &--done .wz-step__num { background: var(--c-green); color: #fff; }
}

.wz-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--c-purple-text);
    &--mt { margin-top: 12px; }
  }
}

.wz-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.wz-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  &--full { grid-column: 1 / -1; }
  &__lbl { font-size: 13px; color: var(--c-text-gray); font-weight: 500; }
}

.wz-input {
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid #E0E0E0;
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 14px;
  font-family: var(--font-main);
  color: var(--c-text-dark);
  background: var(--c-white);
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-color: var(--c-purple); }
}

.wz-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }

.wz-row {
  display: flex;
  align-items: center;
  gap: 10px;
  &--link { flex-wrap: wrap; }
}

.wz-radio { width: 18px; height: 18px; accent-color: var(--c-purple); cursor: pointer; flex-shrink: 0; }

.wz-icon {
  background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; opacity: 0.6; flex-shrink: 0;
  &:hover { opacity: 1; }
}

.wz-add {
  align-self: flex-start;
  padding: 7px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--c-purple-text);
  background: transparent;
  color: var(--c-purple-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-main);
  &:hover { background: var(--c-purple-light); }
}

.wz-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  align-items: center;
}

.wz-btn {
  padding: 11px 24px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-main);
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: opacity 0.2s, background 0.2s, border-color 0.2s;

  &--primary { background: var(--c-purple-text); color: #fff; margin-left: auto; &:hover { opacity: 0.88; } }
  &--outline { background: transparent; border: 1.5px solid var(--c-purple-text); color: var(--c-purple-text); &:hover { background: var(--c-purple-light); } }
  &--ghost { background: transparent; color: var(--c-text-gray); &:hover { color: var(--c-purple-text); } }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.wz-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--c-green);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 999;
  &--error { background: var(--c-red); }
}

.toast-enter-active, .toast-leave-active { transition: opacity 0.25s, transform 0.25s; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(-50%) translateY(12px); }

@media (max-width: 640px) {
  .wz-card { padding: 20px; }
  .wz-grid { grid-template-columns: 1fr; }
  .wz-btn--primary { margin-left: 0; width: 100%; justify-content: center; }
}
</style>
