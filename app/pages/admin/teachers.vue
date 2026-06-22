<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type Teacher = { id:number; initials:string; color:string; name:string; subject:string; email:string; phone:string; status:'active'|'probation'|'pending'; rate:number }

const avatarColors = ['#F5A623','#7B5EA7','#E8823A','#D4A017','#6B8FA8','#3A9A8A','#8A8A9A','#A07BC0','#5B7EA6']

const api = useApi()
const { data, refresh } = await useAsyncData('admin-teachers', () =>
  api<any[]>('/admin/teachers'),
)
const items = computed(() =>
  (data.value ?? []).map((t: any, i: number) => ({
    ...t,
    initials: mkInitials(t.name),
    color: avatarColors[i % avatarColors.length],
  })),
)

const statusMap: Record<string, { label: string; cls: string }> = {
  active:    { label: 'активный',  cls: 'al-badge--green'  },
  probation: { label: 'Исп. срок', cls: 'al-badge--yellow' },
  pending:   { label: 'ожидает',   cls: 'al-badge--blue'   }
}

const tabs = computed(() => [
  { key: 'all',       label: 'Все',       count: items.value.length },
  { key: 'active',    label: 'Активные',  count: items.value.filter(i => i.status === 'active').length },
  { key: 'probation', label: 'Исп. срок', count: items.value.filter(i => i.status === 'probation').length },
  { key: 'pending',   label: 'Ожидает',   count: items.value.filter(i => i.status === 'pending').length },
])

const activeTab = ref('all')
const search    = ref('')

const filtered = computed(() => {
  let list = activeTab.value === 'all' ? items.value : items.value.filter(i => i.status === activeTab.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.subject.toLowerCase().includes(q) || i.email.toLowerCase().includes(q))
  }
  return list
})

// Модалка
const showAdd = ref(false)
const form = reactive({ name:'', subject:'', email:'', phone:'', status:'active' as 'active'|'probation'|'pending', rate:1200 })

const toast = reactive({ show: false, text: '' })
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

function mkInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('')
}

async function submitAdd() {
  if (!form.name.trim()) return
  await api('/admin/teachers', {
    method: 'POST',
    body: {
      name: form.name, subject: form.subject, email: form.email,
      phone: form.phone, status: form.status, rate: form.rate,
    },
  })
  await refresh()
  showAdd.value = false
  Object.assign(form, { name:'', subject:'', email:'', phone:'', status:'active', rate:1200 })
  showToast('Преподаватель добавлен')
}
</script>

<template>
  <div class="al-page">

    <div class="al-hero">
      <h1 class="al-hero__title">Преподаватели</h1>
      <div class="al-hero__badges">
        <span class="al-hero__badge">Всего: {{ items.length }}</span>
        <span class="al-hero__badge al-hero__badge--light">На испытании: {{ items.filter(i => i.status === 'probation').length }}</span>
      </div>
    </div>

    <div class="al-card">
      <div class="al-card__head">
        <h2 class="al-card__title">Список преподавателей</h2>
        <div class="al-card__controls">
          <div class="al-search">
            <span class="al-search__icon">🔍</span>
            <input v-model="search" class="al-search__input" placeholder="Поиск" />
          </div>
          <button class="al-add-btn" @click="showAdd = true">+</button>
        </div>
      </div>

      <div class="al-tabs">
        <button
          v-for="tab in tabs" :key="tab.key"
          class="al-tab" :class="{ 'al-tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }} <span class="al-tab__count">{{ tab.count }}</span>
        </button>
      </div>

      <table class="al-table">
        <thead>
          <tr>
            <th>ПРЕПОДАВАТЕЛЬ</th><th>ПРЕДМЕТ</th><th>КОНТАКТ / EMAIL</th><th>СТАТУС</th><th>СТАВКА (Р/ЧАС)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in filtered" :key="t.id" class="al-table__row">
            <td>
              <div class="al-person">
                <div class="al-avatar" :style="{ background: t.color }">{{ t.initials }}</div>
                <span class="al-table__name">{{ t.name }}</span>
              </div>
            </td>
            <td>{{ t.subject }}</td>
            <td class="al-table__gray">{{ t.email }} {{ t.phone }}</td>
            <td>
              <span class="al-badge" :class="statusMap[t.status].cls">
                <span v-if="t.status !== 'probation'" class="al-badge__dot" />
                {{ statusMap[t.status].label }}
              </span>
            </td>
            <td class="al-table__name">{{ t.rate.toLocaleString('ru') }} ₽</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модалка добавления преподавателя -->
    <Teleport to="body">
      <div v-if="showAdd" class="al-modal-overlay" @click.self="showAdd = false">
        <div class="al-modal">
          <h2 class="al-modal__title">Новый преподаватель</h2>
          <div class="al-modal__fields">
            <div class="al-modal__field al-modal__field--full">
              <label class="al-modal__label">ФИО *</label>
              <input v-model="form.name" class="al-modal__input" placeholder="Иван Петров" />
            </div>
            <div class="al-modal__field al-modal__field--full">
              <label class="al-modal__label">Предмет</label>
              <input v-model="form.subject" class="al-modal__input" placeholder="Python, Web-разработка..." />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Email</label>
              <input v-model="form.email" class="al-modal__input" placeholder="teacher@algo.ru" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Телефон</label>
              <input v-model="form.phone" class="al-modal__input" placeholder="+7 (900) 000-00-00" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Статус</label>
              <select v-model="form.status" class="al-modal__select">
                <option value="active">Активный</option>
                <option value="probation">Исп. срок</option>
                <option value="pending">Ожидает</option>
              </select>
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Ставка (₽/час)</label>
              <input v-model.number="form.rate" type="number" min="0" class="al-modal__input" placeholder="1200" />
            </div>
          </div>
          <div class="al-modal__footer">
            <button class="al-modal__btn al-modal__btn--cancel" @click="showAdd = false">Отмена</button>
            <button class="al-modal__btn al-modal__btn--submit" @click="submitAdd">Добавить</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="al-toast">{{ toast.text }}</div>
    </Transition>

  </div>
</template>
