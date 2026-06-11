<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type Group = { id:number; name:string; subject:string; teacher:string; students:number; schedule:string; format:string; progress:number; status:'active'|'finishing'|'draft'|'archive' }

const items = ref<Group[]>([
  { id:1, name:'WebDev-2024-A', subject:'Frontend',     teacher:'Елена Петровна',  students:14, schedule:'Пн/Ср · 18:00', format:'Онлайн', progress:62,  status:'active'    },
  { id:2, name:'Algo-Jr-3',     subject:'Алгоритмика',  teacher:'Сергей Михайлов', students:12, schedule:'Вт/Чт · 17:00', format:'Офлайн', progress:48,  status:'active'    },
  { id:3, name:'Front-Adv-1',   subject:'Frontend Pro', teacher:'Елена Петровна',  students:8,  schedule:'Сб · 11:00',    format:'Гибрид', progress:81,  status:'active'    },
  { id:4, name:'Python-Kids-2', subject:'Python',       teacher:'Мария Северова',  students:11, schedule:'Пн/Чт · 16:00',format:'Онлайн', progress:90,  status:'finishing' },
  { id:5, name:'Scratch-Start', subject:'Scratch',      teacher:'—',               students:6,  schedule:'Сб · 10:00',    format:'Офлайн', progress:0,   status:'draft'     },
  { id:6, name:'Al-Lab-1',      subject:'AI / ML',      teacher:'Дмитрий Сычёв',   students:7,  schedule:'Вт · 19:00',    format:'Гибрид', progress:33,  status:'active'    },
  { id:7, name:'WebDev-2023-Z', subject:'Frontend',     teacher:'Елена Петровна',  students:13, schedule:'архив',          format:'—',      progress:100, status:'archive'   }
])

const statusMap: Record<string, { label: string; cls: string }> = {
  active:    { label: 'активна',     cls: 'al-badge--green'  },
  finishing: { label: 'завершается', cls: 'al-badge--yellow' },
  draft:     { label: 'черновик',    cls: 'al-badge--blue'   },
  archive:   { label: 'архив',       cls: 'al-badge--gray'   }
}

const tabs = computed(() => [
  { key:'all',       label:'Все',         count: items.value.length },
  { key:'active',    label:'Активные',    count: items.value.filter(i => i.status === 'active').length },
  { key:'finishing', label:'Завершаются', count: items.value.filter(i => i.status === 'finishing').length },
  { key:'draft',     label:'Черновики',   count: items.value.filter(i => i.status === 'draft').length },
  { key:'archive',   label:'Архив',       count: items.value.filter(i => i.status === 'archive').length },
])

const activeTab = ref('all')
const search    = ref('')

const filtered = computed(() => {
  let list = activeTab.value === 'all' ? items.value : items.value.filter(i => i.status === activeTab.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.subject.toLowerCase().includes(q) || i.teacher.toLowerCase().includes(q))
  }
  return list
})

// Модалка
const showAdd = ref(false)
const form = reactive({ name:'', subject:'', teacher:'', students:0, schedule:'', format:'Онлайн' as string, status:'active' as 'active'|'finishing'|'draft'|'archive' })

const toast = reactive({ show: false, text: '' })
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

function submitAdd() {
  if (!form.name.trim()) return
  items.value.push({
    id: Date.now(),
    name: form.name, subject: form.subject, teacher: form.teacher || '—',
    students: form.students, schedule: form.schedule || '—',
    format: form.format, progress: 0, status: form.status
  })
  showAdd.value = false
  Object.assign(form, { name:'', subject:'', teacher:'', students:0, schedule:'', format:'Онлайн', status:'active' })
  showToast('Группа добавлена')
}
</script>

<template>
  <div class="al-page">

    <div class="al-hero">
      <h1 class="al-hero__title">Группы</h1>
      <div class="al-hero__badges">
        <span class="al-hero__badge">Всего: {{ items.length }}</span>
        <span class="al-hero__badge al-hero__badge--light">Активных: {{ items.filter(i => i.status === 'active').length }}</span>
      </div>
    </div>

    <div class="al-card">
      <div class="al-card__head">
        <h2 class="al-card__title">Список групп</h2>
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
            <th>ГРУППА</th><th>ПРЕДМЕТ</th><th>ПРЕПОДАВАТЕЛЬ</th><th>УЧЕНИКОВ</th>
            <th>РАСПИСАНИЕ</th><th>ФОРМАТ</th><th>ПРОГРЕСС</th><th>СТАТУС</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in filtered" :key="g.id" class="al-table__row">
            <td class="al-table__name">{{ g.name }}</td>
            <td>{{ g.subject }}</td>
            <td>{{ g.teacher }}</td>
            <td>{{ g.students }}</td>
            <td class="al-table__gray">{{ g.schedule }}</td>
            <td>{{ g.format }}</td>
            <td>
              <div class="al-progress">
                <div class="al-progress__bar">
                  <div class="al-progress__fill" :style="{ width: g.progress + '%' }" />
                </div>
                <span class="al-progress__pct">{{ g.progress }}%</span>
              </div>
            </td>
            <td>
              <span class="al-badge" :class="statusMap[g.status].cls">
                <span class="al-badge__dot" />{{ statusMap[g.status].label }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модалка добавления группы -->
    <Teleport to="body">
      <div v-if="showAdd" class="al-modal-overlay" @click.self="showAdd = false">
        <div class="al-modal">
          <h2 class="al-modal__title">Новая группа</h2>
          <div class="al-modal__fields">
            <div class="al-modal__field al-modal__field--full">
              <label class="al-modal__label">Название группы *</label>
              <input v-model="form.name" class="al-modal__input" placeholder="WebDev-2025-A" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Предмет</label>
              <input v-model="form.subject" class="al-modal__input" placeholder="Frontend, Python..." />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Преподаватель</label>
              <input v-model="form.teacher" class="al-modal__input" placeholder="Иван Петров" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Расписание</label>
              <input v-model="form.schedule" class="al-modal__input" placeholder="Пн/Ср · 18:00" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Формат</label>
              <select v-model="form.format" class="al-modal__select">
                <option>Онлайн</option>
                <option>Офлайн</option>
                <option>Гибрид</option>
              </select>
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Статус</label>
              <select v-model="form.status" class="al-modal__select">
                <option value="active">Активна</option>
                <option value="finishing">Завершается</option>
                <option value="draft">Черновик</option>
                <option value="archive">Архив</option>
              </select>
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
