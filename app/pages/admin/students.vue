<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type Student = { id:number; initials:string; color:string; name:string; group:string; parent:string; phone:string; payment:'paid'|'overdue'|'pending'; points:number }

const avatarColors = ['#F5A623','#7B5EA7','#E8823A','#D4A017','#6B8FA8','#5B7EA6','#3A9A8A','#4A8C5C','#57A86B','#A07BC0']

const items = useState<Student[]>('adminStudents', () => [
  { id:1, initials:'АК', color:'#F5A623', name:'Анна Кузьмина',    group:'Algo-Jr-3',     parent:'Ольга Кузьмина',    phone:'+7 (916) 234-12-99', payment:'paid',    points:1240 },
  { id:2, initials:'МС', color:'#7B5EA7', name:'Михаил Соколов',   group:'WebDev-2024-A', parent:'Игорь Соколов',     phone:'+7 (903) 110-44-21', payment:'overdue', points:860  },
  { id:3, initials:'ПЛ', color:'#E8823A', name:'Полина Лебедева',  group:'Front-Adv-1',   parent:'Ирина Лебедева',    phone:'+7 (925) 770-09-08', payment:'paid',    points:1820 },
  { id:4, initials:'ЯО', color:'#D4A017', name:'Ярослав Орлов',    group:'Robo-Mid-B',    parent:'Сергей Орлов',      phone:'+7 (917) 312-56-77', payment:'paid',    points:430  },
  { id:5, initials:'СЗ', color:'#6B8FA8', name:'Софья Зуева',      group:'Python-Kids-2', parent:'Анна Зуева',        phone:'+7 (929) 008-12-43', payment:'pending', points:720  },
  { id:6, initials:'АБ', color:'#5B7EA6', name:'Артём Беляев',     group:'GameDev-Teen',  parent:'Елена Беляева',     phone:'+7 (916) 998-45-12', payment:'paid',    points:1010 },
  { id:7, initials:'КН', color:'#3A9A8A', name:'Кира Никитина',    group:'AI-Lab-1',      parent:'Александр Никитин', phone:'+7 (903) 220-78-90', payment:'paid',    points:990  },
  { id:8, initials:'ТГ', color:'#4A8C5C', name:'Тимур Гордеев',    group:'WebDev-2024-A', parent:'Айгуль Гордеева',   phone:'+7 (925) 644-23-15', payment:'paid',    points:1380 },
  { id:9, initials:'МВ', color:'#57A86B', name:'Мария Васнецова',  group:'Scratch-Start', parent:'Светлана Васнецова',phone:'+7 (917) 110-22-39', payment:'pending', points:60   }
])

const paymentMap: Record<string, { label: string; cls: string }> = {
  paid:    { label: 'оплачено',   cls: 'al-badge--green'  },
  overdue: { label: 'просрочено', cls: 'al-badge--red'    },
  pending: { label: 'ожидает',    cls: 'al-badge--yellow' }
}

const tabs = computed(() => [
  { key: 'all',     label: 'Все',        count: items.value.length },
  { key: 'paid',    label: 'Оплачено',   count: items.value.filter(i => i.payment === 'paid').length },
  { key: 'pending', label: 'Ожидает',    count: items.value.filter(i => i.payment === 'pending').length },
  { key: 'overdue', label: 'Просрочено', count: items.value.filter(i => i.payment === 'overdue').length },
])

const activeTab = ref('all')
const search    = ref('')

const filtered = computed(() => {
  let list = activeTab.value === 'all' ? items.value : items.value.filter(i => i.payment === activeTab.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.group.toLowerCase().includes(q) || i.parent.toLowerCase().includes(q))
  }
  return list
})

// Модалка
const showAdd = ref(false)
const form = reactive({ name:'', group:'', parent:'', phone:'', payment:'paid' as 'paid'|'overdue'|'pending', points:0 })

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

function submitAdd() {
  if (!form.name.trim()) return
  items.value.push({
    id: Date.now(),
    initials: mkInitials(form.name),
    color: avatarColors[items.value.length % avatarColors.length],
    name: form.name, group: form.group, parent: form.parent,
    phone: form.phone, payment: form.payment, points: form.points
  })
  showAdd.value = false
  Object.assign(form, { name:'', group:'', parent:'', phone:'', payment:'paid', points:0 })
  showToast('Ученик добавлен')
}
</script>

<template>
  <div class="al-page">

    <div class="al-hero">
      <h1 class="al-hero__title">Ученики</h1>
      <div class="al-hero__badges">
        <span class="al-hero__badge">Всего: {{ items.length }}</span>
        <span class="al-hero__badge al-hero__badge--light">Нет оплаты: {{ items.filter(i => i.payment === 'overdue').length }}</span>
      </div>
    </div>

    <div class="al-card">
      <div class="al-card__head">
        <h2 class="al-card__title">Список учеников</h2>
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
            <th>УЧЕНИК</th><th>ГРУППА</th><th>РОДИТЕЛЬ / КОНТАКТ</th><th>ОПЛАТА</th><th>БАЛЛЫ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id" class="al-table__row">
            <td>
              <div class="al-person">
                <div class="al-avatar" :style="{ background: s.color }">{{ s.initials }}</div>
                <span class="al-table__name">{{ s.name }}</span>
              </div>
            </td>
            <td>{{ s.group }}</td>
            <td class="al-table__gray">{{ s.parent }} · {{ s.phone }}</td>
            <td>
              <span class="al-badge" :class="paymentMap[s.payment].cls">
                <span class="al-badge__dot" />{{ paymentMap[s.payment].label }}
              </span>
            </td>
            <td class="al-table__name">{{ s.points.toLocaleString('ru') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модалка добавления ученика -->
    <Teleport to="body">
      <div v-if="showAdd" class="al-modal-overlay" @click.self="showAdd = false">
        <div class="al-modal">
          <h2 class="al-modal__title">Новый ученик</h2>
          <div class="al-modal__fields">
            <div class="al-modal__field al-modal__field--full">
              <label class="al-modal__label">ФИО *</label>
              <input v-model="form.name" class="al-modal__input" placeholder="Иван Иванов" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Группа</label>
              <input v-model="form.group" class="al-modal__input" placeholder="WebDev-2024-A" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Родитель</label>
              <input v-model="form.parent" class="al-modal__input" placeholder="Мария Иванова" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Телефон</label>
              <input v-model="form.phone" class="al-modal__input" placeholder="+7 (900) 000-00-00" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Оплата</label>
              <select v-model="form.payment" class="al-modal__select">
                <option value="paid">Оплачено</option>
                <option value="pending">Ожидает</option>
                <option value="overdue">Просрочено</option>
              </select>
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Баллы</label>
              <input v-model.number="form.points" type="number" min="0" class="al-modal__input" placeholder="0" />
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

<style lang="scss">
.al-person {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
