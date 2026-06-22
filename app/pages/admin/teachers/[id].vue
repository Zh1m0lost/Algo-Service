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
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="al-toast" :class="{ 'al-toast--error': !toast.ok }">{{ toast.text }}</div>
    </Transition>
  </div>
</template>
