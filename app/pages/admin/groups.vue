<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type Group = { id:number; name:string; subject:string; teacher:string; students:number; schedule:string; format:string; progress:number; status:'active'|'finishing'|'draft'|'archive' }

const items = useState<Group[]>('adminGroups', () => [
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

<style lang="scss">
.al-page {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.al-hero {
  background: var(--c-purple);
  border-radius: var(--radius-md);
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  &__title { font-family: var(--font-heading); font-size: 28px; font-weight: 800; color: var(--c-white); }
  &__badges { display: flex; gap: 10px; }
  &__badge {
    padding: 8px 20px; border-radius: var(--radius-full);
    background: rgba(255,255,255,0.2); color: var(--c-white); font-size: 14px; font-weight: 600;
    &--light { background: rgba(255,255,255,0.15); }
  }
}

.al-card {
  background: var(--c-white); border-radius: var(--radius-md); padding: 24px;
  &__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
  &__title { font-size: 17px; font-weight: 700; color: var(--c-text-dark); }
  &__controls { display: flex; align-items: center; gap: 10px; }
}

.al-search {
  display: flex; align-items: center; gap: 8px;
  border: 1.5px solid #E0E0E0; border-radius: var(--radius-full); padding: 8px 16px; background: var(--c-white);
  &__icon { font-size: 14px; color: var(--c-text-gray); }
  &__input {
    border: none; outline: none; font-size: 14px; color: var(--c-text-dark); background: transparent; width: 180px;
    &::placeholder { color: var(--c-text-gray); }
  }
}

.al-add-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--c-purple-text); color: var(--c-white);
  font-size: 22px; font-weight: 300; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: opacity 0.2s;
  &:hover { opacity: 0.88; }
}

.al-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }

.al-tab {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px;
  border-radius: var(--radius-full); font-size: 13px; font-weight: 600; cursor: pointer;
  border: 1.5px solid #E0E0E0; background: transparent; color: var(--c-text-dark);
  font-family: var(--font-main); transition: all 0.15s;
  &:hover { border-color: var(--c-purple-text); color: var(--c-purple-text); }
  &--active { background: var(--c-purple-text); border-color: var(--c-purple-text); color: var(--c-white); }
  &__count { font-size: 12px; opacity: 0.85; }
}

.al-table {
  width: 100%; border-collapse: collapse;
  th { text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: var(--c-text-gray); padding: 10px 12px; border-bottom: 1.5px solid #F0F0F0; }
  &__row {
    border-bottom: 1px solid #F8F8F8; transition: background 0.15s;
    &:hover { background: var(--c-bg); }
    &:last-child { border-bottom: none; }
    td { padding: 14px 12px; font-size: 14px; color: var(--c-text-dark); vertical-align: middle; }
  }
  &__name { font-weight: 700; }
  &__gray { color: var(--c-text-gray) !important; }
}

.al-progress {
  display: flex; align-items: center; gap: 8px;
  &__bar { width: 80px; height: 5px; background: #E8E8E8; border-radius: var(--radius-full); overflow: hidden; flex-shrink: 0; }
  &__fill { height: 100%; background: var(--c-purple-text); border-radius: var(--radius-full); }
  &__pct { font-size: 13px; color: var(--c-text-gray); min-width: 36px; }
}

.al-badge {
  display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px;
  border-radius: var(--radius-full); font-size: 12px; font-weight: 600; white-space: nowrap;
  &__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  &--green  { background: var(--c-green-light);  color: var(--c-green-text);  }
  &--yellow { background: var(--c-yellow-light); color: var(--c-yellow-text); }
  &--blue   { background: var(--c-purple-light); color: var(--c-purple-text); }
  &--gray   { background: #F0F0F0;               color: #777;                 }
  &--red    { background: var(--c-red-light);    color: var(--c-red);         }
}

.al-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: var(--c-white); flex-shrink: 0;
}

.al-person { display: flex; align-items: center; gap: 10px; }

/* ── Модалка (общие стили для всего админа) ────────── */
.al-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
}

.al-modal {
  background: var(--c-white);
  border-radius: var(--radius-lg);
  padding: 32px;
  width: 100%; max-width: 560px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.18);

  &--wide { max-width: 680px; }

  &__title {
    font-family: var(--font-heading);
    font-size: 20px; font-weight: 700; color: var(--c-text-dark);
    margin-bottom: 24px;
  }

  &__fields {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    margin-bottom: 24px;
  }

  &__field {
    display: flex; flex-direction: column; gap: 6px;
    &--full { grid-column: 1 / -1; }
    &--checkbox { align-items: flex-start; justify-content: flex-end; }
  }

  &__label { font-size: 13px; color: var(--c-text-gray); font-weight: 500; }

  &__input, &__select, &__textarea {
    width: 100%; padding: 10px 14px;
    border: 1.5px solid #E0E0E0; border-radius: var(--radius-sm);
    font-size: 14px; font-family: var(--font-main); color: var(--c-text-dark);
    background: var(--c-white); outline: none; transition: border-color 0.2s;
    box-sizing: border-box;
    &:focus { border-color: var(--c-purple); }
  }

  &__select { appearance: none; cursor: pointer; }

  &__textarea { resize: vertical; line-height: 1.5; }

  &__checkbox-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 14px; color: var(--c-text-dark); cursor: pointer;
    input { width: 16px; height: 16px; accent-color: var(--c-purple-text); cursor: pointer; }
  }

  &__footer { display: flex; gap: 12px; justify-content: flex-end; }

  &__btn {
    padding: 10px 24px; border-radius: var(--radius-full);
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: var(--font-main); border: none; transition: opacity 0.2s;
    &--submit { background: var(--c-purple-text); color: var(--c-white); &:hover { opacity: 0.88; } }
    &--cancel { background: #F0F0F0; color: var(--c-text-dark); &:hover { background: #E0E0E0; } }
  }
}

/* ── Toast (общий) ──────────────────────────────── */
.al-toast {
  position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
  background: var(--c-green); color: var(--c-white);
  font-size: 14px; font-weight: 600; padding: 12px 28px;
  border-radius: var(--radius-full); box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1100; white-space: nowrap;
}

.toast-enter-active, .toast-leave-active { transition: opacity 0.25s, transform 0.25s; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(-50%) translateY(12px); }

@media (max-width: 768px) {
  .al-hero { flex-direction: column; align-items: flex-start; padding: 20px; gap: 12px; &__title { font-size: 22px; } }
  .al-card { padding: 16px; &__head { flex-direction: column; align-items: flex-start; gap: 12px; } &__controls { width: 100%; justify-content: space-between; } }
  .al-search__input { width: 140px; }
  .al-card { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .al-table { min-width: 640px; th { padding: 8px 10px; font-size: 10px; } &__row td { padding: 12px 10px; font-size: 13px; } }
  .al-progress__bar { width: 60px; }
  .al-modal__fields { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .al-hero { padding: 16px; &__badges { flex-wrap: wrap; } &__badge { font-size: 13px; padding: 6px 14px; } }
  .al-tabs { gap: 6px; }
  .al-tab { padding: 6px 12px; font-size: 12px; }
  .al-search__input { width: 110px; }
}
</style>
