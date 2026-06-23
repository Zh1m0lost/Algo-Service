<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route  = useRoute()
const router = useRouter()
const api    = useApi()
const id     = route.params.id as string

const { data, refresh } = await useAsyncData(`admin-group-${id}`, () =>
  api<any>(`/admin/groups/${id}`),
)

const form = reactive({ name: '', subject: '', teacher: '', schedule: '', format: 'Онлайн', status: 'active' })
const clean = (v: string) => (v && v !== '—' ? v : '')

watch(data, (d) => {
  if (!d) return
  form.name = d.name
  form.subject = clean(d.subject)
  form.teacher = clean(d.teacher)
  form.schedule = clean(d.schedule)
  form.format = d.format
  form.status = d.status
}, { immediate: true })

const statusMap: Record<string, string> = { active: 'активна', finishing: 'завершается', draft: 'черновик', archive: 'архив' }

const saving = ref(false)
const toast  = reactive({ show: false, text: '', ok: true })
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string, ok = true) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text; toast.ok = ok; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

async function save() {
  if (!form.name.trim()) { showToast('Введите название', false); return }
  saving.value = true
  try {
    await api(`/admin/groups/${id}`, { method: 'PUT', body: { ...form } })
    await refresh()
    showToast('Сохранено')
  } catch {
    showToast('Не удалось сохранить', false)
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm('Удалить группу? Действие необратимо.')) return
  try {
    await api(`/admin/groups/${id}`, { method: 'DELETE' })
    router.push('/admin/groups')
  } catch {
    showToast('Не удалось удалить', false)
  }
}

// ── Уроки курса ──
const lessons = ref<any[]>([])
const loadingLessons = ref(false)
async function loadLessons() {
  loadingLessons.value = true
  try {
    lessons.value = await api<any[]>(`/admin/groups/${id}/lessons`)
  } catch {
    lessons.value = []
  } finally {
    loadingLessons.value = false
  }
}

const lessonEditor = reactive({
  open: false,
  mode: 'new' as 'new' | 'edit',
  id: '',
  title: '',
  date: '',
  zoom: '',
  goals: [''] as string[],
})
const savingLesson = ref(false)

function startNewLesson() {
  Object.assign(lessonEditor, { open: true, mode: 'new', id: '', title: '', date: '', zoom: '', goals: [''] })
}
function editLesson(l: any) {
  Object.assign(lessonEditor, {
    open: true, mode: 'edit', id: l.id,
    title: l.title ?? '', date: l.dateInput ?? '', zoom: l.zoom ?? '',
    goals: l.goals?.length ? [...l.goals] : [''],
  })
}
function closeLessonEditor() { lessonEditor.open = false }
function addGoal() { lessonEditor.goals.push('') }
function removeGoal(i: number) { lessonEditor.goals.splice(i, 1); if (!lessonEditor.goals.length) lessonEditor.goals.push('') }

async function saveLesson() {
  if (!lessonEditor.title.trim()) { showToast('Введите название урока', false); return }
  savingLesson.value = true
  const body = {
    title: lessonEditor.title.trim(),
    date: lessonEditor.date || null,
    zoom: lessonEditor.zoom || null,
    goals: lessonEditor.goals.filter(g => g.trim()),
  }
  try {
    if (lessonEditor.mode === 'new') {
      await api(`/admin/groups/${id}/lessons`, { method: 'POST', body })
      showToast('Урок создан')
    } else {
      await api(`/admin/lessons/${lessonEditor.id}`, { method: 'PUT', body })
      showToast('Урок сохранён')
    }
    closeLessonEditor()
    await loadLessons()
  } catch {
    showToast('Не удалось сохранить урок', false)
  } finally {
    savingLesson.value = false
  }
}

async function removeLesson(l: any) {
  if (!confirm(`Удалить урок «${l.title}»?`)) return
  try {
    await api(`/admin/lessons/${l.id}`, { method: 'DELETE' })
    if (lessonEditor.id === l.id) closeLessonEditor()
    await loadLessons()
  } catch {
    showToast('Не удалось удалить урок', false)
  }
}

onMounted(loadLessons)
</script>

<template>
  <div v-if="data" class="dt-page">
    <button class="dt-back" @click="router.push('/admin/groups')">← К списку групп</button>

    <div class="dt-grid">
      <div class="dt-col">
        <div class="dt-card">
          <div class="dt-head">
            <div class="dt-avatar" style="background: var(--c-purple)">👥</div>
            <div>
              <p class="dt-head__name">{{ data.name }}</p>
              <p class="dt-head__sub">{{ form.subject || 'Без предмета' }} · {{ statusMap[data.status] ?? data.status }} · {{ data.students }} учеников</p>
            </div>
          </div>
        </div>

        <div class="dt-card">
          <p class="dt-card__label">РЕДАКТИРОВАНИЕ</p>
          <div class="dt-form">
            <label class="dt-field dt-field--full">
              <span class="dt-field__label">Название группы</span>
              <input v-model="form.name" class="dt-field__input" />
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Предмет</span>
              <input v-model="form.subject" class="dt-field__input" />
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Преподаватель</span>
              <input v-model="form.teacher" class="dt-field__input" placeholder="ФИО преподавателя" />
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Расписание</span>
              <input v-model="form.schedule" class="dt-field__input" placeholder="Пн/Ср · 18:00" />
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Формат</span>
              <select v-model="form.format" class="dt-field__select">
                <option>Онлайн</option><option>Офлайн</option><option>Гибрид</option>
              </select>
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Статус</span>
              <select v-model="form.status" class="dt-field__select">
                <option value="active">Активна</option>
                <option value="finishing">Завершается</option>
                <option value="draft">Черновик</option>
                <option value="archive">Архив</option>
              </select>
            </label>
          </div>
          <div class="dt-actions">
            <button class="dt-btn dt-btn--save" :disabled="saving" @click="save">{{ saving ? 'Сохранение…' : 'Сохранить' }}</button>
            <button class="dt-btn dt-btn--del" @click="remove">Удалить</button>
          </div>
        </div>
      </div>

      <div class="dt-col">
        <div class="dt-card">
          <p class="dt-card__label">УЧЕНИКИ ГРУППЫ</p>
          <div class="dt-list">
            <NuxtLink
              v-for="s in data.studentsList"
              :key="s.id"
              :to="`/admin/students/${s.id}`"
              class="dt-list__item dt-list__item--link"
            >
              <span>{{ s.name }}</span>
              <span class="dt-list__meta">{{ s.phone || '' }}</span>
            </NuxtLink>
            <p v-if="!data.studentsList?.length" class="dt-empty">В группе пока нет учеников</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Уроки курса -->
    <div class="dt-card agl">
      <div class="agl__head">
        <p class="dt-card__label">УРОКИ КУРСА · {{ lessons.length }}</p>
        <button class="dt-btn dt-btn--save agl__new" @click="startNewLesson">
          <UiIcon name="plus" :size="15" /> Новый урок
        </button>
      </div>

      <div v-if="loadingLessons" class="dt-empty">Загрузка…</div>
      <div v-else-if="!lessons.length" class="dt-empty">В курсе пока нет уроков</div>
      <div v-else class="agl__list">
        <div v-for="l in lessons" :key="l.id" class="agl__row">
          <div class="agl__info">
            <span class="agl__title">{{ l.title }}</span>
            <span class="agl__date">{{ l.date }} · {{ l.tasksCount }} заданий</span>
          </div>
          <div class="agl__actions">
            <button class="agl__act" title="Редактировать" @click="editLesson(l)"><UiIcon name="edit" :size="16" /></button>
            <button class="agl__act agl__act--del" title="Удалить" @click="removeLesson(l)"><UiIcon name="trash" :size="16" /></button>
          </div>
        </div>
      </div>

      <!-- Редактор урока -->
      <div v-if="lessonEditor.open" class="agl__editor">
        <div class="agl__head">
          <p class="dt-card__label">{{ lessonEditor.mode === 'new' ? 'НОВЫЙ УРОК' : 'РЕДАКТИРОВАНИЕ УРОКА' }}</p>
          <button class="agl__close" aria-label="Закрыть" @click="closeLessonEditor">✕</button>
        </div>
        <div class="dt-form">
          <label class="dt-field dt-field--full">
            <span class="dt-field__label">Название урока</span>
            <input v-model="lessonEditor.title" class="dt-field__input" placeholder="JavaScript — Промисы" />
          </label>
          <label class="dt-field">
            <span class="dt-field__label">Дата и время</span>
            <input v-model="lessonEditor.date" type="datetime-local" class="dt-field__input" />
          </label>
          <label class="dt-field">
            <span class="dt-field__label">Ссылка на Zoom</span>
            <input v-model="lessonEditor.zoom" class="dt-field__input" placeholder="https://zoom.us/j/…" />
          </label>
        </div>

        <p class="dt-card__label agl__sublabel">ЦЕЛИ УРОКА</p>
        <div v-for="(g, i) in lessonEditor.goals" :key="i" class="agl__goal">
          <input v-model="lessonEditor.goals[i]" class="dt-field__input" :placeholder="`Цель ${i + 1}`" />
          <button class="agl__act agl__act--del" title="Удалить цель" @click="removeGoal(i)"><UiIcon name="trash" :size="16" /></button>
        </div>
        <button class="agl__add" @click="addGoal">+ Добавить цель</button>

        <div class="dt-actions agl__editor-actions">
          <button class="dt-btn dt-btn--save" :disabled="savingLesson" @click="saveLesson">
            {{ savingLesson ? 'Сохранение…' : (lessonEditor.mode === 'new' ? 'Создать урок' : 'Сохранить урок') }}
          </button>
          <button class="dt-btn dt-btn--del" @click="closeLessonEditor">Отмена</button>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="al-toast" :class="{ 'al-toast--error': !toast.ok }">{{ toast.text }}</div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.agl__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.agl__new {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  font-size: 13px;
}

.agl__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agl__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--c-bg);
}

.agl__info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.agl__title { font-size: 15px; font-weight: 700; color: var(--c-text-dark); }
.agl__date { font-size: 13px; color: var(--c-text-gray); }

.agl__actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.agl__act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--c-white);
  border-radius: var(--radius-sm);
  color: var(--c-purple-text);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover { background: var(--c-purple-light); }
  &--del { color: var(--c-red); &:hover { background: var(--c-red-light); } }
}

.agl__editor {
  border-top: 1px solid #ECECEC;
  padding-top: 16px;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.agl__close {
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

.agl__sublabel { margin-top: 4px; }

.agl__goal { display: flex; align-items: center; gap: 10px; }

.agl__add {
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

.agl__editor-actions { margin-top: 4px; }
</style>
