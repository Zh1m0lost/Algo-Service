<script setup lang="ts">
definePageMeta({ layout: 'teacher' })

const api = useApi()

const toast = reactive({ show: false, text: '', ok: true })
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string, ok = true) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text; toast.ok = ok; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
const colors = ['#602B7A', '#1A5A8E', '#2E6E16', '#7A6100', '#9F2323', '#0F6E6E']

// ── Курсы ──
const { data: coursesData, refresh: refreshCourses } = await useAsyncData('teacher-courses', () =>
  api<any[]>('/teacher/courses'),
)
const courses = computed<any[]>(() => coursesData.value ?? [])

// Группы преподавателя (для привязки к курсу).
const { data: groupsData, refresh: refreshGroups } = await useAsyncData('teacher-mygroups', () =>
  api<any[]>('/teacher/groups'),
)
const myGroups = computed<any[]>(() => groupsData.value ?? [])

const selectedCourseId = ref<string>('')
const courseMode = ref<'edit' | 'new'>('edit')
const courseDetail = ref<any | null>(null)

const courseForm = reactive({ name: '', subject: '', color: colors[0] })
const gen = reactive({ weeks: 32, weekday: 0, time: '18:00' })
const savingCourse = ref(false)

function fillCourseForm(c: any | null) {
  courseForm.name = c?.name ?? ''
  courseForm.subject = c?.subject ?? ''
  courseForm.color = c?.color || colors[0]
}

async function loadCourse(id: string) {
  courseDetail.value = await api<any>(`/teacher/courses/${id}`)
  fillCourseForm(courseDetail.value)
}

async function selectCourse(id: string) {
  if (!id) return
  selectedCourseId.value = id
  courseMode.value = 'edit'
  closeLessonEditor()
  await loadCourse(id)
}

function onCourseSelect(e: Event) {
  selectCourse((e.target as HTMLSelectElement).value)
}

function startNewCourse() {
  courseMode.value = 'new'
  closeLessonEditor()
  courseDetail.value = null
  fillCourseForm(null)
  Object.assign(gen, { weeks: 32, weekday: 0, time: '18:00' })
}

function cancelNewCourse() {
  courseMode.value = 'edit'
  if (selectedCourseId.value) selectCourse(selectedCourseId.value)
}

watch(courses, (list) => {
  if (!selectedCourseId.value && courseMode.value === 'edit' && list.length) selectCourse(list[0].id)
}, { immediate: true })

async function saveCourse() {
  if (!courseForm.name.trim()) { showToast('Введите название курса', false); return }
  savingCourse.value = true
  try {
    if (courseMode.value === 'new') {
      const res = await api<any>('/teacher/courses', {
        method: 'POST',
        body: { ...courseForm, weeks: gen.weeks, weekday: gen.weekday, time: gen.time },
      })
      await refreshCourses()
      await selectCourse(res.id)
      showToast('Курс создан, программа сгенерирована')
    } else {
      await api(`/teacher/courses/${selectedCourseId.value}`, { method: 'PUT', body: { ...courseForm } })
      await refreshCourses()
      await loadCourse(selectedCourseId.value)
      showToast('Курс сохранён')
    }
  } catch {
    showToast('Не удалось сохранить курс', false)
  } finally {
    savingCourse.value = false
  }
}

async function regenerate() {
  if (!selectedCourseId.value) return
  if (!confirm(`Сгенерировать программу на ${gen.weeks} недель? Существующие занятия на этих позициях сохранятся.`)) return
  try {
    await api(`/teacher/courses/${selectedCourseId.value}/generate`, {
      method: 'POST',
      body: { weeks: gen.weeks, weekday: gen.weekday, time: gen.time },
    })
    await loadCourse(selectedCourseId.value)
    await refreshCourses()
    showToast('Программа обновлена')
  } catch {
    showToast('Не удалось сгенерировать программу', false)
  }
}

// ── Привязка групп к курсу ──
const assignGroupId = ref('')
const freeGroups = computed(() => myGroups.value.filter((g: any) => g.courseId !== selectedCourseId.value))

async function assignGroup() {
  if (!assignGroupId.value) return
  try {
    await api(`/teacher/courses/${selectedCourseId.value}/assign-group`, {
      method: 'POST',
      body: { group_id: assignGroupId.value },
    })
    assignGroupId.value = ''
    await loadCourse(selectedCourseId.value)
    await refreshGroups()
    showToast('Группа привязана к курсу')
  } catch {
    showToast('Не удалось привязать группу', false)
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
  homeworkTaskId: '',
  homeworkOptions: [] as any[],
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
    homeworkTaskId: '', homeworkOptions: [], goals: [''], links: [{ label: '', href: '' }],
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
      homeworkTaskId: l.homeworkTaskId ?? '', homeworkOptions: l.homeworkOptions ?? [],
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
  const body: Record<string, any> = {
    title: lessonEditor.title.trim(),
    date: lessonEditor.date || null,
    zoom: lessonEditor.zoom || null,
    homeworkTaskId: lessonEditor.homeworkTaskId || null,
    goals: lessonEditor.goals.filter(g => g.trim()),
    links: lessonEditor.links.filter(l => l.href.trim()),
  }
  try {
    if (lessonEditor.mode === 'new') {
      const res = await api<any>('/teacher/lessons', { method: 'POST', body: { course_id: selectedCourseId.value, ...body } })
      showToast('Урок создан')
      await loadCourse(selectedCourseId.value)
      await refreshCourses()
      if (res?.id) await editLesson(res.id)
    } else {
      await api(`/teacher/lessons/${lessonEditor.id}`, { method: 'PUT', body })
      showToast('Урок сохранён')
      await loadCourse(selectedCourseId.value)
    }
  } catch {
    showToast('Не удалось сохранить урок', false)
  } finally {
    savingLesson.value = false
  }
}

// ── Задания урока ──
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
    await editLesson(lessonEditor.id)
    await loadCourse(selectedCourseId.value)
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
        Курс — это программа: у него много уроков, а у урока — много заданий. Группа (набор учеников)
        привязывается к курсу. Создайте курс — недельная программа сгенерируется автоматически.
      </p>
    </div>

    <!-- Выбор курса -->
    <div class="wz-coursebar">
      <label class="wz-coursebar__field">
        <span class="wz-field__lbl">Курс</span>
        <select
          class="wz-input"
          :value="courseMode === 'new' ? '' : selectedCourseId"
          @change="onCourseSelect"
        >
          <option v-if="!courses.length" value="">Курсов пока нет — создайте новый</option>
          <option v-if="courseMode === 'new'" value="">— новый курс —</option>
          <option v-for="c in courses" :key="c.id" :value="c.id">
            {{ c.name }}{{ c.subject ? ' · ' + c.subject : '' }} ({{ c.lessonsCount }} ур.)
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
        <span v-if="courseMode === 'edit' && courseDetail" class="wz-badge">
          <UiIcon name="layers" :size="14" /> {{ courseDetail.lessons.length }} уроков
        </span>
      </div>

      <div class="wz-grid">
        <label class="wz-field wz-field--full">
          <span class="wz-field__lbl">Название курса</span>
          <input v-model="courseForm.name" class="wz-input" placeholder="Frontend-разработка" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Предмет</span>
          <input v-model="courseForm.subject" class="wz-input" placeholder="Веб / Python / Алгоритмы" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Цвет</span>
          <div class="wz-swatches">
            <button
              v-for="c in colors"
              :key="c"
              type="button"
              class="wz-swatch"
              :class="{ 'wz-swatch--active': courseForm.color === c }"
              :style="{ background: c }"
              @click="courseForm.color = c"
            />
          </div>
        </label>
      </div>

      <!-- Параметры недельной программы -->
      <p class="wz-card__label wz-card__label--mt">
        {{ courseMode === 'new' ? 'ПРОГРАММА (СГЕНЕРИРУЕТСЯ АВТОМАТИЧЕСКИ)' : 'ПЕРЕГЕНЕРИРОВАТЬ ПРОГРАММУ' }}
      </p>
      <div class="wz-grid">
        <label class="wz-field">
          <span class="wz-field__lbl">Недель (занятий)</span>
          <input v-model.number="gen.weeks" type="number" min="1" max="60" class="wz-input" />
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">День недели</span>
          <select v-model.number="gen.weekday" class="wz-input">
            <option v-for="(d, i) in weekdays" :key="i" :value="i">{{ d }}</option>
          </select>
        </label>
        <label class="wz-field">
          <span class="wz-field__lbl">Время</span>
          <input v-model="gen.time" class="wz-input" placeholder="18:00" />
        </label>
      </div>

      <div class="wz-actions">
        <button v-if="courseMode === 'new'" class="wz-btn wz-btn--ghost" @click="cancelNewCourse">Отмена</button>
        <button
          v-if="courseMode === 'edit'"
          class="wz-btn wz-btn--outline"
          @click="regenerate"
        >Сгенерировать занятия</button>
        <button class="wz-btn wz-btn--primary" :disabled="savingCourse" @click="saveCourse">
          {{ savingCourse ? 'Сохранение…' : (courseMode === 'new' ? 'Создать курс' : 'Сохранить курс') }}
        </button>
      </div>
    </div>

    <!-- Группы курса -->
    <div v-if="courseMode === 'edit' && courseDetail" class="wz-card">
      <p class="wz-card__label">ГРУППЫ КУРСА</p>
      <div class="wz-chips">
        <span v-for="g in courseDetail.groups" :key="g.id" class="wz-chip">{{ g.name }}</span>
        <span v-if="!courseDetail.groups.length" class="wz-empty wz-empty--sm">К курсу пока не привязана ни одна группа</span>
      </div>
      <div class="wz-assign">
        <select v-model="assignGroupId" class="wz-input">
          <option value="">Выберите группу…</option>
          <option v-for="g in freeGroups" :key="g.id" :value="g.id">
            {{ g.name }}{{ g.courseName ? ' (сейчас: ' + g.courseName + ')' : '' }}
          </option>
        </select>
        <button class="wz-btn wz-btn--outline" :disabled="!assignGroupId" @click="assignGroup">Привязать группу</button>
      </div>
    </div>

    <!-- Уроки курса -->
    <div v-if="courseMode === 'edit' && courseDetail" class="wz-card">
      <div class="wz-card__head">
        <p class="wz-card__label">УРОКИ КУРСА</p>
        <button class="wz-btn wz-btn--outline wz-btn--sm" @click="startNewLesson">
          <UiIcon name="plus" :size="15" /> Новый урок
        </button>
      </div>

      <div v-if="!courseDetail.lessons.length" class="wz-empty">В курсе пока нет уроков.</div>
      <div v-else class="wz-lessons">
        <button
          v-for="l in courseDetail.lessons"
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
        <label v-if="lessonEditor.homeworkOptions.length" class="wz-field wz-field--full">
          <span class="wz-field__lbl">Домашнее задание к уроку</span>
          <select v-model="lessonEditor.homeworkTaskId" class="wz-input">
            <option value="">— нет —</option>
            <option v-for="h in lessonEditor.homeworkOptions" :key="h.id" :value="h.id">{{ h.title }}</option>
          </select>
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

  &__title { font-family: var(--font-heading); font-size: 24px; font-weight: 800; color: var(--c-text-dark); }
  &__subtitle { font-size: 14px; color: var(--c-text-gray); line-height: 1.5; margin-top: 6px; max-width: 760px; }
}

.wz-head { display: flex; flex-direction: column; }

.wz-coursebar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;

  &__field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 220px; }
}

.wz-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &--editor { border: 1.5px solid var(--c-purple-light); }

  &__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

  &__label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--c-purple-text);
    &--mt { margin-top: 12px; }
  }
}

.wz-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: var(--radius-full);
  background: var(--c-purple-light); color: var(--c-purple-text);
  font-size: 12px; font-weight: 600; white-space: nowrap;

  &--soft { background: var(--c-bg); color: var(--c-text-gray); }
}

.wz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.wz-field {
  display: flex; flex-direction: column; gap: 6px;
  &--full { grid-column: 1 / -1; }
  &__lbl { font-size: 13px; color: var(--c-text-gray); font-weight: 500; }
}

.wz-input {
  width: 100%; box-sizing: border-box;
  border: 1.5px solid #E0E0E0; border-radius: var(--radius-sm);
  padding: 10px 14px; font-size: 14px; font-family: var(--font-main);
  color: var(--c-text-dark); background: var(--c-white); outline: none; transition: border-color 0.2s;
  &:focus { border-color: var(--c-purple); }
}

.wz-textarea { resize: vertical; min-height: 64px; line-height: 1.5; }

.wz-swatches { display: flex; gap: 8px; align-items: center; height: 42px; }
.wz-swatch {
  width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent;
  cursor: pointer; padding: 0; transition: transform 0.1s, border-color 0.15s;
  &:hover { transform: scale(1.1); }
  &--active { border-color: var(--c-text-dark); }
}

.wz-row { display: flex; align-items: center; gap: 10px; &--link { flex-wrap: wrap; } }
.wz-radio { width: 18px; height: 18px; accent-color: var(--c-purple); cursor: pointer; flex-shrink: 0; }

.wz-icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer; padding: 6px; border-radius: var(--radius-sm);
  color: var(--c-text-gray); flex-shrink: 0; transition: color 0.15s, background 0.15s;
  &:hover { color: var(--c-red); background: var(--c-red-light); }
}

.wz-close {
  width: 30px; height: 30px; border: none; background: var(--c-bg); border-radius: 50%;
  cursor: pointer; font-size: 13px; color: var(--c-text-gray); transition: background 0.15s, color 0.15s;
  &:hover { background: var(--c-purple-light); color: var(--c-purple-text); }
}

.wz-add {
  align-self: flex-start; padding: 7px 16px; border-radius: var(--radius-full);
  border: 1.5px solid var(--c-purple-text); background: transparent; color: var(--c-purple-text);
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-main);
  &:hover { background: var(--c-purple-light); }
}

.wz-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.wz-chip {
  display: inline-flex; align-items: center; padding: 6px 14px; border-radius: var(--radius-full);
  background: var(--c-bg); color: var(--c-text-dark); font-size: 13px; font-weight: 600;
}

.wz-assign { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 4px;
  .wz-input { flex: 1; min-width: 200px; }
}

.wz-lessons { display: flex; flex-direction: column; gap: 8px; }
.wz-lesson {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  width: 100%; text-align: left; padding: 14px 16px; border-radius: var(--radius-sm);
  border: 1.5px solid transparent; background: var(--c-bg); cursor: pointer; font-family: var(--font-main);
  transition: border-color 0.15s, background 0.15s;

  &:hover { border-color: var(--c-purple); }
  &--active { border-color: var(--c-purple-text); background: var(--c-purple-light); }

  &__main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  &__title { font-size: 15px; font-weight: 700; color: var(--c-text-dark); }
  &__date { font-size: 13px; color: var(--c-text-gray); }
  &__meta { display: flex; align-items: center; gap: 10px; color: var(--c-purple-text); flex-shrink: 0; }
}

.wz-empty {
  font-size: 14px; color: var(--c-text-gray); text-align: center; padding: 20px 0;
  &--sm { padding: 8px 0; text-align: left; }
}

.wz-divider { height: 1px; background: #ECECEC; margin: 8px 0; }

.wz-tasks { display: flex; flex-direction: column; gap: 8px; }
.wz-task {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  border-radius: var(--radius-sm); background: var(--c-bg);
  &__title { flex: 1; font-size: 14px; font-weight: 600; color: var(--c-text-dark); min-width: 0; }
  &__type { font-size: 12px; color: var(--c-text-gray); white-space: nowrap; }
}

.wz-subcard {
  background: var(--c-bg); border-radius: var(--radius-sm); padding: 18px 20px;
  display: flex; flex-direction: column; gap: 12px; margin-top: 4px;
  .wz-input { background: var(--c-white); }
}

.wz-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; align-items: center; }

.wz-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 11px 24px; border-radius: var(--radius-full); font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: var(--font-main); border: none; text-decoration: none;
  transition: opacity 0.2s, background 0.2s, border-color 0.2s;

  &--sm { padding: 8px 16px; font-size: 13px; }
  &--primary { background: var(--c-purple-text); color: #fff; margin-left: auto; &:hover { opacity: 0.88; } }
  &--outline { background: transparent; border: 1.5px solid var(--c-purple-text); color: var(--c-purple-text); &:hover { background: var(--c-purple-light); } }
  &--ghost { background: transparent; color: var(--c-text-gray); &:hover { color: var(--c-purple-text); } }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.wz-toast {
  position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
  background: var(--c-green); color: #fff; font-size: 14px; font-weight: 600;
  padding: 12px 28px; border-radius: var(--radius-full); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
