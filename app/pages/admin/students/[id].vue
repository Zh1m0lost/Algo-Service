<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route  = useRoute()
const router = useRouter()
const api    = useApi()
const id     = route.params.id as string

const { data, refresh } = await useAsyncData(`admin-student-${id}`, () =>
  api<any>(`/admin/students/${id}`),
)

const palette = ['#F5A623', '#7B5EA7', '#E8823A', '#6B8FA8', '#3A9A8A', '#57A86B', '#A07BC0']
const initials = computed(() => (data.value?.name ?? '').split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join(''))
const color = computed(() => palette[(data.value?.name?.length ?? 0) % palette.length])

const form = reactive({ name: '', group: '', parent: '', phone: '', payment: 'paid', points: 0 })
const clean = (v: string) => (v && v !== '—' ? v : '')

watch(data, (d) => {
  if (!d) return
  form.name = d.name
  form.group = clean(d.group)
  form.parent = clean(d.parent)
  form.phone = clean(d.phone)
  form.payment = d.payment
  form.points = d.points
}, { immediate: true })

const paymentMap: Record<string, string> = { paid: 'оплачено', overdue: 'просрочено', pending: 'ожидает' }

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
    await api(`/admin/students/${id}`, { method: 'PUT', body: { ...form } })
    await refresh()
    showToast('Сохранено')
  } catch {
    showToast('Не удалось сохранить', false)
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm('Удалить ученика? Действие необратимо.')) return
  try {
    await api(`/admin/students/${id}`, { method: 'DELETE' })
    router.push('/admin/students')
  } catch {
    showToast('Не удалось удалить', false)
  }
}
</script>

<template>
  <div v-if="data" class="dt-page">
    <button class="dt-back" @click="router.push('/admin/students')">← К списку учеников</button>

    <div class="dt-grid">
      <div class="dt-col">
        <!-- Шапка -->
        <div class="dt-card">
          <div class="dt-head">
            <div class="dt-avatar" :style="{ background: color }">{{ initials }}</div>
            <div>
              <p class="dt-head__name">{{ data.name }}</p>
              <p class="dt-head__sub">{{ form.group || 'Без группы' }} · {{ paymentMap[data.payment] ?? data.payment }} · {{ data.points }} баллов</p>
            </div>
          </div>
        </div>

        <!-- Редактирование -->
        <div class="dt-card">
          <p class="dt-card__label">РЕДАКТИРОВАНИЕ</p>
          <div class="dt-form">
            <label class="dt-field dt-field--full">
              <span class="dt-field__label">ФИО</span>
              <input v-model="form.name" class="dt-field__input" />
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Группа</span>
              <input v-model="form.group" class="dt-field__input" placeholder="Название группы" />
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Родитель</span>
              <input v-model="form.parent" class="dt-field__input" />
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Телефон</span>
              <input v-model="form.phone" class="dt-field__input" />
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Оплата</span>
              <select v-model="form.payment" class="dt-field__select">
                <option value="paid">Оплачено</option>
                <option value="pending">Ожидает</option>
                <option value="overdue">Просрочено</option>
              </select>
            </label>
            <label class="dt-field">
              <span class="dt-field__label">Баллы</span>
              <input v-model.number="form.points" type="number" min="0" class="dt-field__input" />
            </label>
          </div>
          <div class="dt-actions">
            <button class="dt-btn dt-btn--save" :disabled="saving" @click="save">{{ saving ? 'Сохранение…' : 'Сохранить' }}</button>
            <button class="dt-btn dt-btn--del" @click="remove">Удалить</button>
          </div>
        </div>
      </div>

      <!-- История баллов -->
      <div class="dt-col">
        <div class="dt-card">
          <p class="dt-card__label">ПОСЛЕДНИЕ ОПЕРАЦИИ</p>
          <div class="dt-list">
            <div v-for="t in data.transactions" :key="t.id" class="dt-list__item">
              <span>{{ t.comment || (t.type === 'purchase' ? 'Покупка' : 'Начисление') }}</span>
              <span :style="{ color: t.amount > 0 ? 'var(--c-green)' : 'var(--c-red)', fontWeight: 700 }">
                {{ t.amount > 0 ? '+' : '' }}{{ t.amount }}
              </span>
            </div>
            <p v-if="!data.transactions?.length" class="dt-empty">Операций пока нет</p>
          </div>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="al-toast" :class="{ 'al-toast--error': !toast.ok }">{{ toast.text }}</div>
    </Transition>
  </div>
</template>
