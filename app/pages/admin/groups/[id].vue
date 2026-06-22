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

    <Transition name="toast">
      <div v-if="toast.show" class="al-toast" :class="{ 'al-toast--error': !toast.ok }">{{ toast.text }}</div>
    </Transition>
  </div>
</template>
