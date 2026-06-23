<script setup lang="ts">
definePageMeta({ layout: 'teacher' })

const api = useApi()

// ── Тосты ──
const toast = reactive({ show: false, text: '', ok: true })
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string, ok = true) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text; toast.ok = ok; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

// ── Курсы ──
const { data: groupsData, refresh: refreshGroups } = await useAsyncData('teacher-courses', () =>
  api<any[]>('/teacher/groups'),
)
const groups = computed<any[]>(() => groupsData.value ?? [])
const selectedGroupId = ref<string>('')
const selectedGroup = computed<any | null>(() =>
  groups.value.find((g: any) => g.id === selectedGroupId.value) || null,
)

const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

// Режим панели курса: edit (существующий) | new (создание).
const courseMode = ref<'edit' | 'new'>('edit')
const courseForm = reactive({ name: '', subject: '', weekday: 0, lesson_time: '18:00', format: 'Онлайн' })
const savingCourse = ref(false)

function fillCourseForm(g: any | null) {
  courseForm.name = g?.name ?? ''
  courseForm.subject = g?.subject ?? ''
  courseForm.weekday = g?.weekday ?? 0
  courseForm.lesson_time = g?.lesson_time || '18:00'
  courseForm.format = g?.format ?? 'Онлайн'
}

// ── Уроки выбранного курса ──
const lessons = ref<any[]>([])
const loadingLessons = ref(false)
async function loadLessons() {
  if (!selectedGroupId.value) { lessons.value = []; return }
  loadingLessons.value = true
  try {
    lessons.value = await api<any[]>(`/teacher/groups/${selectedGroupId.value}/lessons`)
  } catch {
    lessons.value = []
  } finally {
    loadingLessons.value = false
  }
}

async function selectCourse(id: string) {
  selectedGroupId.value = id
  courseMode.value = 'edit'
  closeLessonEditor()
  fillCourseForm(selectedGroup.value)
  await loadLessons()
}

function onCourseSelect(e: Event) {
  const id = (e.target as HTMLSelectElement).value
  if (id) selectCourse(id)
}

function startNewCourse() {
  courseMode.value = 'new'
  closeLessonEditor()
  fillCourseForm(null)
}

function cancelNewCourse() {
  courseMode.value = 'edit'
  fillCourseForm(selectedGroup.value)
}

// Авто-выбор первого курса при загрузке.
watch(groups, (g) => {
  if (!selectedGroupId.value && g.length) selectCourse(g[0].id)
}, { immediate: true })

async function saveCourse() {
  if (!courseForm.name.trim()) { showToast('Введите название курса', false); return }
  savingCourse.value = true
  try {
    if (courseMode.value === 'new') {
      const res = await api<any>('/teacher/groups', { method: 'POST', body: { ...courseForm } })
      await refreshGroups()
      await selectCourse(res.id)
      showToast('Курс создан')
    } else {
      await api(`/teacher/groups/${selectedGroupId.value}`, { method: 'PUT', body: { ...courseForm } })
      await refreshGroups()
      showToast('Курс сохранён')
    }
  } catch {
    showToast('Не удалось сохранить курс', false)
  } finally {
    savingCourse.value = false
  }
}

// ── Редактор урока ──
const lessonEditor = reactive({
  open: false,
  mode: 'new' as 'new' | 'edit',
  id: '',
  title: '',
  date: '',
  zoom: '',
  goals: [''] as string[],
  links: [{ label: '', href: '' }] as { label: string; href: string }[],
})
const lessonTasks = ref<any[]>([])
const savingLesson = ref(false)

function closeLessonEditor() {
  lessonEditor.open = false
  lessonTasks.value = []
}

function startNewLesson() {
  Object.assign(lessonEditor, {
    open: true, mode: 'new', id: '', title: '', date: '', zoom: '',
    goals: [''], links: [{ label: '', href: '' }],
  })
  lessonTasks.value = []
  resetTaskForm()
}

async function editLesson(id: string) {
  try {
    const l = await api<any>(`/teacher/lessons/${id}`)
    Object.assign(lessonEditor, {
      open: true, mode: 'edit', id: l.id,
      title: l.title ?? '', date: l.date ?? '', zoom: l.zoom ?? '',
      goals: l.goals?.length ? [...l.goals] : [''],
      links: l.links?.length
        ? l.links.map((x: any) => ({ label: x.label ?? '', href: x.href ?? '' }))
        : [{ label: '', href: '' }],
    })
    lessonTasks.value = l.tasks ?? []
    resetTaskForm()
  } catch {
    showToast('Не удалось открыть урок', false)
  }
}

function addGoal() { lessonEditor.goals.push('') }
function removeGoal(i: number) { lessonEditor.goals.splice(i, 1); if (!lessonEditor.goals.length) lessonEditor.goals.push('') }
function addLink() { lessonEditor.links.push({ label: '', href: '' }) }
function removeLink(i: number) { lessonEditor.links.splice(i, 1); if (!lessonEditor.links.length) lessonEditor.links.push({ label: '', href: '' }) }

async function saveLesson() {
  if (!lessonEditor.title.trim()) { showToast('Введите название урока', false); return }
  savingLesson.value = true
  const body = {
    title: lessonEditor.title.trim(),
    date: lessonEditor.date || null,
    zoom: lessonEditor.zoom || null,
    goals: lessonEditor.goals.filter(g => g.trim()),
    links: lessonEditor.links.filter(l => l.href.trim()),
  }
  try {
    if (lessonEditor.mode === 'new') {
      const res = await api<any>('/teacher/lessons', { method: 'POST', body: { group_id: selectedGroupId.value, ...body } })
      showToast('Урок создан')
      await loadLessons()
      await refreshGroups()       // обновить счётчик уроков курса
      if (res?.id) await editLesson(res.id)  // сразу можно добавлять задания
    } else {
      await api(`/teacher/lessons/${lessonEditor.id}`, { method: 'PUT', body })
      showToast('Урок сохранён')
      await loadLessons()
    }
  } catch {
    showToast('Не удалось сохранить урок', false)
  } finally {
    savingLesson.value = false
  }
}

// ── Добавление задания в урок ──
const MAX_POINTS = 40
const taskForm = reactive({
  title: '', points: 20, type: 'file' as 'single' | 'input' | 'file',
  instructions: '',
  options: [{ value: '' }, { value: '' }] as { value: string }[],
  correct: 0,
  answers: [''] as string[],
})
const savingTask = ref(false)

watch(() => taskForm.points, (v) => {
  if (typeof v !== 'number' || Number.isNaN(v)) return
  if (v > MAX_POINTS) taskForm.points = MAX_POINTS
  else if (v < 1) taskForm.points = 1
})

function addOption() { taskForm.options.push({ value: '' }) }
function addAnswer() { taskForm.answers.push('') }

function taskValid(): boolean {
  if (!taskForm.title.trim() || taskForm.points < 1) return false
  if (taskForm.type === 'single') return taskForm.options.filter(o => o.value.trim()).length >= 2
  if (taskForm.type === 'input') return taskForm.answers.filter(a => a.trim()).length >= 1
  return true
}

function resetTaskForm() {
  Object.assign(taskForm, {
    title: '', points: 20, type: 'file', instructions: '',
    options: [{ value: '' }, { value: '' }], correct: 0, answers: [''],
  })
}

async function addTask() {
  if (!taskValid()) { showToast('Заполните условие задания', false); return }
  savingTask.value = true
  try {
    const base: Record<string, any> = {
      name: taskForm.title.trim(), points: taskForm.points, type: taskForm.type, lesson_id: lessonEditor.id,
    }
    let body = base
    if (taskForm.type === 'single') {
      const opts = taskForm.options.filter(o => o.value.trim())
      body = { ...base, options: opts.map(o => ({ value: o.value.trim() })), correct: Math.min(taskForm.correct, opts.length - 1) }
    } else if (taskForm.type === 'input') {
      body = { ...base, answers: taskForm.answers.filter(a => a.trim()).map(a => a.trim()) }
    } else {
      body = { ...base, instructions: taskForm.instructions.trim() }
    }
    await api('/teacher/tasks', { method: 'POST', body })
    showToast('Задание добавлено')
    resetTaskForm()
    await editLesson(lessonEditor.id)  // перезагрузить список заданий урока
    await loadLessons()                // обновить счётчик заданий
  } catch {
    showToast('Не удалось добавить задание', false)
  } finally {
    savingTask.value = false
  }
}
</script>

<template>
  <div class="wz">
    <div class="wz-head">
      <h1 class="wz__title">Курсы и уроки</h1>
      <p class="wz__subtitle">
        У курса много уроков, а у урока — много заданий. Выберите курс, при необходимости
        отредактируйте его и управляйте уроками и заданиями.
      </p>
    </div>

    <!-- Выбор курса -->
    <div class="wz-coursebar">
      <label class="wz-coursebar__field">
        <span class="wz-field__lbl">Курс</span>
        <select
          class="wz-input"
          :value="courseMode === 'new' ? '' : selectedGroupId"
          @change="onCourseSelect"
        >
          <option v-if="!groups.length" value="">Курсов пока нет — создайте новый</option>
          <option v-if="courseMode === 'new'" value="">— новый курс —</option>
          <option v-for="g in groups" :key="g.id" :value="g.id">
            {{ g.name }}{{ g.subject ? ' · ' + g.subject : '' }}
          </option>
        </select>
      </label>
      <button class="wz-btn wz-btn--outline" @click="startNewCourse">
        <UiIcon name="plus" :size="16" /> Новый курс
      </button>
    </div>

    <!-- Карточка курса -->
    <div class="wz-card">
      <div class="wz-card__head">
        <p class="wz-card__label">{{ courseMode === 'new' ? 'НОВЫЙ КУРС' : 'РЕДАКТИРОВАНИЕ КУРСА' }}</p>
        <span v-if="courseMode === 'edit' && selectedGroup" class="wz-badge">
          <UiIcon name="layers" :size="14" /> {{ selectedGroup.lessonsCount }} уроков
        </span>
      </div>

      <div class="wz-grid">
        <label class="wz-field wz-field--full">
          <span class="wz-field__lbl">Название курса</span>
          <input v-model="courseForm.name" class="wz-input" placeholder="WebDev-2026-A" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Предмет</span>
          <input v-model="courseForm.subject" class="wz-input" placeholder="Frontend" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">День недели</span>
          <select v-model.number="courseForm.weekday" class="wz-input">
            <option v-for="(d, i) in weekdays" :key="i" :value="i">{{ d }}</option>
          </select>
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Время</span>
          <input v-model="courseForm.lesson_time" class="wz-input" placeholder="18:00" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Формат</span>
          <select v-model="courseForm.format" class="wz-input">
            <option>Онлайн</option><option>Офлайн</option><option>Гибрид</option>
          </select>
        </label>
      </div>

      <div class="wz-actions">
        <button v-if="courseMode === 'new'" class="wz-btn wz-btn--ghost" @click="cancelNewCourse">Отмена</button>
        <button class="wz-btn wz-btn--primary" :disabled="savingCourse" @click="saveCourse">
          {{ savingCourse ? 'Сохранение…' : (courseMode === 'new' ? 'Создать курс' : 'Сохранить курс') }}
        </button>
      </div>
    </div>

    <!-- Уроки курса -->
    <div v-if="courseMode === 'edit' && selectedGroupId" class="wz-card">
      <div class="wz-card__head">
        <p class="wz-card__label">УРОКИ КУРСА</p>
        <button class="wz-btn wz-btn--outline wz-btn--sm" @click="startNewLesson">
          <UiIcon name="plus" :size="15" /> Новый урок
        </button>
      </div>

      <div v-if="loadingLessons" class="wz-empty">Загрузка…</div>
      <div v-else-if="!lessons.length" class="wz-empty">В курсе пока нет уроков. Добавьте первый.</div>
      <div v-else class="wz-lessons">
        <button
          v-for="l in lessons"
          :key="l.id"
          class="wz-lesson"
          :class="{ 'wz-lesson--active': lessonEditor.open && lessonEditor.id === l.id }"
          @click="editLesson(l.id)"
        >
          <span class="wz-lesson__main">
            <span class="wz-lesson__title">{{ l.title }}</span>
            <span class="wz-lesson__date">{{ l.date }}</span>
          </span>
          <span class="wz-lesson__meta">
            <span class="wz-badge wz-badge--soft">{{ l.tasksCount }} заданий</span>
            <UiIcon name="edit" :size="16" />
          </span>
        </button>
      </div>
    </div>

    <!-- Редактор урока -->
    <div v-if="lessonEditor.open" class="wz-card wz-card--editor">
      <div class="wz-card__head">
        <p class="wz-card__label">{{ lessonEditor.mode === 'new' ? 'НОВЫЙ УРОК' : 'РЕДАКТИРОВАНИЕ УРОКА' }}</p>
        <button class="wz-close" aria-label="Закрыть" @click="closeLessonEditor">✕</button>
      </div>

      <div class="wz-grid">
        <label class="wz-field wz-field--full">
          <span class="wz-field__lbl">Название урока</span>
          <input v-model="lessonEditor.title" class="wz-input" placeholder="JavaScript — Промисы" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Дата и время</span>
          <input v-model="lessonEditor.date" type="datetime-local" class="wz-input" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Ссылка на Zoom</span>
          <input v-model="lessonEditor.zoom" class="wz-input" placeholder="https://zoom.us/j/…" />
        </label>
      </div>

      <p class="wz-card__label wz-card__label--mt">ЦЕЛИ УРОКА</p>
      <div v-for="(g, i) in lessonEditor.goals" :key="i" class="wz-row">
        <input v-model="lessonEditor.goals[i]" class="wz-input" :placeholder="`Цель ${i + 1}`" />
        <button class="wz-icon-btn" title="Удалить цель" @click="removeGoal(i)"><UiIcon name="trash" :size="16" /></button>
      </div>
      <button class="wz-add" @click="addGoal">+ Добавить цель</button>

      <p class="wz-card__label wz-card__label--mt">МАТЕРИАЛЫ (ССЫЛКИ)</p>
      <div v-for="(l, i) in lessonEditor.links" :key="i" class="wz-row wz-row--link">
        <input v-model="l.label" class="wz-input" placeholder="Название" />
        <input v-model="l.href" class="wz-input" placeholder="https://…" />
        <button class="wz-icon-btn" title="Удалить ссылку" @click="removeLink(i)"><UiIcon name="trash" :size="16" /></button>
      </div>
      <button class="wz-add" @click="addLink">+ Добавить ссылку</button>

      <div class="wz-actions">
        <button class="wz-btn wz-btn--ghost" @click="closeLessonEditor">Отмена</button>
        <button class="wz-btn wz-btn--primary" :disabled="savingLesson" @click="saveLesson">
          {{ savingLesson ? 'Сохранение…' : (lessonEditor.mode === 'new' ? 'Создать урок' : 'Сохранить урок') }}
        </button>
      </div>

      <!-- Задания урока -->
      <template v-if="lessonEditor.mode === 'edit'">
        <div class="wz-divider" />

        <div class="wz-card__head">
          <p class="wz-card__label">ЗАДАНИЯ УРОКА · {{ lessonTasks.length }}</p>
          <NuxtLink to="/teacher/constructor" class="wz-btn wz-btn--ghost wz-btn--sm">Сложное — в Конструкторе →</NuxtLink>
        </div>

        <div v-if="lessonTasks.length" class="wz-tasks">
          <div v-for="t in lessonTasks" :key="t.id" class="wz-task">
            <span class="wz-task__title">{{ t.title }}</span>
            <span class="wz-task__type">{{ t.type }}</span>
            <span class="wz-badge wz-badge--soft">{{ t.points }} баллов</span>
          </div>
        </div>
        <div v-else class="wz-empty wz-empty--sm">Заданий пока нет — добавьте ниже.</div>

        <!-- Форма добавления задания -->
        <div class="wz-subcard">
          <div class="wz-grid">
            <label class="wz-field wz-field--full">
              <span class="wz-field__lbl">Название / вопрос</span>
              <input v-model="taskForm.title" class="wz-input" placeholder="Сформулируйте задание" />
            </label>
            <label class="wz-field">
              <span class="wz-field__lbl">Баллы (до {{ MAX_POINTS }})</span>
              <input v-model.number="taskForm.points" type="number" min="1" :max="MAX_POINTS" class="wz-input" />
            </label>
            <label class="wz-field">
              <span class="wz-field__lbl">Тип</span>
              <select v-model="taskForm.type" class="wz-input">
                <option value="file">Прикрепить файл</option>
                <option value="single">Одиночный выбор</option>
                <option value="input">Ввод ответа</option>
              </select>
            </label>
          </div>

          <template v-if="taskForm.type === 'single'">
            <p class="wz-card__label wz-card__label--mt">ВАРИАНТЫ (отметьте правильный)</p>
            <div v-for="(o, i) in taskForm.options" :key="i" class="wz-row">
              <input type="radio" class="wz-radio" :checked="taskForm.correct === i" @change="taskForm.correct = i" />
              <input v-model="o.value" class="wz-input" :placeholder="`Вариант ${i + 1}`" />
            </div>
            <button class="wz-add" @click="addOption">+ Вариант</button>
          </template>

          <template v-else-if="taskForm.type === 'input'">
            <p class="wz-card__label wz-card__label--mt">ПРАВИЛЬНЫЕ ОТВЕТЫ</p>
            <div v-for="(a, i) in taskForm.answers" :key="i" class="wz-row">
              <input v-model="taskForm.answers[i]" class="wz-input" :placeholder="`Ответ ${i + 1}`" />
            </div>
            <button class="wz-add" @click="addAnswer">+ Ответ</button>
          </template>

          <template v-else>
            <p class="wz-card__label wz-card__label--mt">ИНСТРУКЦИЯ</p>
            <textarea v-model="taskForm.instructions" class="wz-input wz-textarea" rows="2" placeholder="Что прикрепить и в каком формате" />
          </template>

          <div class="wz-actions">
            <button class="wz-btn wz-btn--primary" :disabled="savingTask" @click="addTask">
              {{ savingTask ? 'Добавление…' : '＋ Добавить задание' }}
            </button>
          </div>
        </div>
      </template>
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

  &__subtitle {
    font-size: 14px;
    color: var(--c-text-gray);
    line-height: 1.5;
    margin-top: 6px;
    max-width: 720px;
  }
}

.wz-head { display: flex; flex-direction: column; }

/* Панель выбора курса */
.wz-coursebar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 220px;
  }
}

.wz-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &--editor { border: 1.5px solid var(--c-purple-light); }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--c-purple-text);
    &--mt { margin-top: 12px; }
  }
}

.wz-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  background: var(--c-purple-light);
  color: var(--c-purple-text);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  &--soft { background: var(--c-bg); color: var(--c-text-gray); }
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

.wz-textarea { resize: vertical; min-height: 64px; line-height: 1.5; }

.wz-row {
  display: flex;
  align-items: center;
  gap: 10px;
  &--link { flex-wrap: wrap; }
}

.wz-radio { width: 18px; height: 18px; accent-color: var(--c-purple); cursor: pointer; flex-shrink: 0; }

.wz-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  color: var(--c-text-gray);
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
  &:hover { color: var(--c-red); background: var(--c-red-light); }
}

.wz-close {
  width: 30px;
  height: 30px;
  border: none;
  background: var(--c-bg);
  border-radius: 50%;
  cursor: pointer;
  font-size: 13px;
  color: var(--c-text-gray);
  transition: background 0.15s, color 0.15s;
  &:hover { background: var(--c-purple-light); color: var(--c-purple-text); }
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

/* Список уроков */
.wz-lessons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wz-lesson {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px solid transparent;
  background: var(--c-bg);
  cursor: pointer;
  font-family: var(--font-main);
  transition: border-color 0.15s, background 0.15s;

  &:hover { border-color: var(--c-purple); }
  &--active { border-color: var(--c-purple-text); background: var(--c-purple-light); }

  &__main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  &__title { font-size: 15px; font-weight: 700; color: var(--c-text-dark); }
  &__date { font-size: 13px; color: var(--c-text-gray); }

  &__meta {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--c-purple-text);
    flex-shrink: 0;
  }
}

.wz-empty {
  font-size: 14px;
  color: var(--c-text-gray);
  text-align: center;
  padding: 20px 0;
  &--sm { padding: 10px 0; }
}

.wz-divider { height: 1px; background: #ECECEC; margin: 8px 0; }

/* Задания урока */
.wz-tasks { display: flex; flex-direction: column; gap: 8px; }

.wz-task {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--c-bg);

  &__title { flex: 1; font-size: 14px; font-weight: 600; color: var(--c-text-dark); min-width: 0; }
  &__type { font-size: 12px; color: var(--c-text-gray); white-space: nowrap; }
}

.wz-subcard {
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;

  .wz-input { background: var(--c-white); }
}

.wz-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  align-items: center;
}

.wz-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 24px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-main);
  border: none;
  text-decoration: none;
  transition: opacity 0.2s, background 0.2s, border-color 0.2s;

  &--sm { padding: 8px 16px; font-size: 13px; }
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
  .wz-coursebar { flex-direction: column; align-items: stretch; }
}
</style>
