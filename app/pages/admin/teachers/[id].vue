<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route  = useRoute()
const router = useRouter()
const api    = useApi()
const id     = route.params.id as string

const { data, refresh } = await useAsyncData(`admin-teacher-${id}`, () =>
  api<any>(`/admin/teachers/${id}`),
)

const palette = ['#F5A623', '#7B5EA7', '#E8823A', '#6B8FA8', '#3A9A8A', '#A07BC0']
const initials = computed(() => (data.value?.name ?? '').split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join(''))
const color = computed(() => palette[(data.value?.name?.length ?? 0) % palette.length])

const form = reactive({ name: '', subject: '', email: '', phone: '', status: 'active', rate: 0 })
const clean = (v: string) => (v && v !== '—' ? v : '')

watch(data, (d) => {
  if (!d) return
  form.name = d.name
  form.subject = clean(d.subject)
  form.email = clean(d.email)
  form.phone = clean(d.phone)
  form.status = d.status
  form.rate = d.rate
}, { immediate: true })

const statusMap: Record<string, string> = { active: 'активный', probation: 'исп. срок', pending: 'ожидает' }

const saving = ref(false)
const toast  = reactive({ show: false, text: '', ok: true })
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string, ok = true) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text; toast.ok = ok; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

async function save() {
  if (!form.name.trim()) { showToast('Введите имя', false); return }
  saving.value = true
  try {
    await api(`/admin/teachers/${id}`, { method: 'PUT', body: { ...form } })
    await refresh()
    showToast('Сохранено')
  } catch {
    showToast('Не удалось сохранить', false)
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm('Удалить преподавателя? Действие необратимо.')) return
  try {
    await api(`/admin/teachers/${id}`, { method: 'DELETE' })
    router.push('/admin/teachers')
  } catch {
    showToast('Не удалось удалить', false)
  }
}

// ── Задачи преподавателя ──
const statusLabels: Record<string, string> = { todo: 'К выполнению', in_progress: 'В процессе', done: 'Готово' }
const recurrenceOptions = [
  'Однократно',
  'Еженедельно · Каждый понедельник',
  'По дням недели · Пн / Ср / Пт',
  'Ежемесячно · 1-го числа',
  'Ежедневно · Каждый рабочий день',
]

const taskModal = reactive({ open: false, mode: 'new' as 'new' | 'edit', id: '', title: '', desc: '', deadline: '', recurrence: 'Однократно' })
const savingTask = ref(false)

function openNewTask() {
  Object.assign(taskModal, { open: true, mode: 'new', id: '', title: '', desc: '', deadline: '', recurrence: 'Однократно' })
}
function openEditTask(t: any) {
  Object.assign(taskModal, { open: true, mode: 'edit', id: t.id, title: t.title, desc: t.desc, deadline: t.deadline, recurrence: t.recurrence })
}
function closeTaskModal() { taskModal.open = false }

async function saveTask() {
  if (!taskModal.title.trim()) { showToast('Введите название задачи', false); return }
  savingTask.value = true
  const body = {
    title: taskModal.title.trim(),
    desc: taskModal.desc,
    deadlineText: taskModal.deadline,
    recurrence: taskModal.recurrence,
    assigneeName: data.value?.name,
    assigneeRole: 'преподаватель',
  }
  try {
    if (taskModal.mode === 'new') await api('/admin/tasks', { method: 'POST', body })
    else await api(`/admin/tasks/${taskModal.id}`, { method: 'PUT', body })
    closeTaskModal()
    await refresh()
    showToast('Задача сохранена')
  } catch {
    showToast('Не удалось сохранить задачу', false)
  } finally {
    savingTask.value = false
  }
}

async function removeTask(t: any) {
  if (!confirm(`Удалить задачу «${t.title}»?`)) return
  try {
    await api(`/admin/tasks/${t.id}`, { method: 'DELETE' })
    await refresh()
    showToast('Задача удалена')
  } catch {
    showToast('Не удалось удалить', false)
  }
}
</script>

<template>
  <div v-if="data" class="dt-page">
    <button class="dt-back" @click="router.push('/admin/teachers')">← К списку преподавателей</button>

    <div class="dt-grid">
      <div class="dt-col">
        <div class="dt-card">
          <div class="dt-head">
            <div class="dt-avatar" :style="{ background: color }">{{ initials }}</div>
            <div>
              <p class="dt-head__name">{{ data.name }}</p>
              <p class="dt-head__sub">{{ form.subject || 'Без предмета' }} · {{ statusMap[data.status] ?? data.status }} · {{ data.rate }} ₽/час</p>
            </div>
          </div>
        </div>

        <div class="dt-card">
          <p class="dt-card__label">РЕДАКТИРОВАНИЕ</p>
          <div class="dt-form">
            <label class="dt-field dt-field--full">
              <span class="dt-field__label">ФИО</span>
              <input v-model="form.name" class="dt-field__input" />
            </label>
            <label class="dt-field dt-field--full">
              <span class="dt-field__label">Предмет</span>
              <input v-model="form.subject" class="dt-field__input" />
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Email</span>
              <input v-model="form.email" class="dt-field__input" />
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Телефон</span>
              <input v-model="form.phone" class="dt-field__input" />
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Статус</span>
              <select v-model="form.status" class="dt-field__select">
                <option value="active">Активный</option>
                <option value="probation">Исп. срок</option>
                <option value="pending">Ожидает</option>
              </select>
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Ставка (₽/час)</span>
              <input v-model.number="form.rate" type="number" min="0" class="dt-field__input" />
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
          <p class="dt-card__label">ГРУППЫ ПРЕПОДАВАТЕЛЯ</p>
          <div class="dt-list">
            <NuxtLink
              v-for="g in data.groups"
              :key="g.id"
              :to="`/admin/groups/${g.id}`"
              class="dt-list__item dt-list__item--link"
            >
              <span>{{ g.name }}</span>
              <span class="dt-list__meta">{{ g.subject }} · {{ g.students }} уч.</span>
            </NuxtLink>
            <p v-if="!data.groups?.length" class="dt-empty">Нет групп</p>
          </div>
        </div>

        <div class="dt-card">
          <div class="tk-head">
            <p class="dt-card__label">ЗАДАЧИ ПРЕПОДАВАТЕЛЯ</p>
            <button class="dt-btn dt-btn--save tk-new" @click="openNewTask"><UiIcon name="plus" :size="15" /> Задача</button>
          </div>
          <div class="dt-list">
            <div v-for="t in data.tasks" :key="t.id" class="tk-row">
              <div class="tk-info">
                <span class="tk-title">{{ t.title }}</span>
                <span class="tk-meta">{{ statusLabels[t.status] || t.status }}{{ t.deadline ? ' · ' + t.deadline : '' }}</span>
              </div>
              <div class="tk-actions">
                <button class="tk-act" title="Изменить" @click="openEditTask(t)"><UiIcon name="edit" :size="16" /></button>
                <button class="tk-act tk-act--del" title="Удалить" @click="removeTask(t)"><UiIcon name="trash" :size="16" /></button>
              </div>
            </div>
            <p v-if="!data.tasks?.length" class="dt-empty">Задач нет</p>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="taskModal.open" class="al-modal-overlay" @click.self="closeTaskModal">
        <div class="al-modal">
          <h2 class="al-modal__title">{{ taskModal.mode === 'new' ? 'Новая задача' : 'Редактирование задачи' }}</h2>
          <div class="al-modal__fields">
            <div class="al-modal__field al-modal__field--full">
              <label class="al-modal__label">Название *</label>
              <input v-model="taskModal.title" class="al-modal__input" placeholder="Название задачи" />
            </div>
            <div class="al-modal__field al-modal__field--full">
              <label class="al-modal__label">Описание</label>
              <textarea v-model="taskModal.desc" class="al-modal__textarea" rows="3" placeholder="Подробности…" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Дедлайн</label>
              <input v-model="taskModal.deadline" class="al-modal__input" placeholder="25 июня · 23:59" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Регулярность</label>
              <select v-model="taskModal.recurrence" class="al-modal__select">
                <option v-for="r in recurrenceOptions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
          </div>
          <div class="al-modal__footer">
            <button class="al-modal__btn al-modal__btn--cancel" @click="closeTaskModal">Отмена</button>
            <button class="al-modal__btn al-modal__btn--submit" :disabled="savingTask" @click="saveTask">
              {{ savingTask ? 'Сохранение…' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Transition name="toast">
      <div v-if="toast.show" class="al-toast" :class="{ 'al-toast--error': !toast.ok }">{{ toast.text }}</div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.tk-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.tk-new { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 13px; }
.tk-row {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 10px 14px; border-radius: var(--radius-sm); background: var(--c-bg);
}
.tk-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.tk-title { font-size: 14px; font-weight: 600; color: var(--c-text-dark); }
.tk-meta { font-size: 12px; color: var(--c-text-gray); }
.tk-actions { display: flex; gap: 6px; flex-shrink: 0; }
.tk-act {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border: none; background: var(--c-white);
  border-radius: var(--radius-sm); color: var(--c-purple-text); cursor: pointer; transition: background 0.15s;
  &:hover { background: var(--c-purple-light); }
  &--del { color: var(--c-red); &:hover { background: var(--c-red-light); } }
}
</style>
