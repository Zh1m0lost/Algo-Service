<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type Task = {
  id:number; title:string; desc:string
  recurrence: { label:string; cls:string }
  deadline: { text:string; urgent:boolean }
  assignee: { name:string; role:string }
  comment: { author:string; date:string; text:string } | null
  urgency: 'urgent'|'soon'|'calm'
}

const recurrenceOptions = [
  { label:'Однократно',                        cls:'tk-pill--gray'   },
  { label:'Еженедельно · Каждый понедельник',  cls:'tk-pill--yellow' },
  { label:'По дням недели · Пн / Ср / Пт',    cls:'tk-pill--yellow' },
  { label:'Ежемесячно · 1-го числа',          cls:'tk-pill--pink'   },
  { label:'Ежедневно · Каждый рабочий день',  cls:'tk-pill--green'  },
]

const items = ref<Task[]>([
  {
    id:1, title:'Финальный проект — Лендинг',
    desc:'Разработать адаптивный landing page по требованиям из ТЗ. Сдача через GitHub Pages, после самопроверки.',
    recurrence:{ label:'Однократно', cls:'tk-pill--gray' },
    deadline:{ text:'28 апреля · 23:59', urgent:true },
    assignee:{ name:'WebDev-2024-A', role:'группа' },
    comment:{ author:'Е. Петровна', date:'21 апр', text:'Добавьте viewport-метатег.' },
    urgency:'urgent'
  },
  {
    id:2, title:'Еженедельная домашка по алгоритмам',
    desc:'5 задач из практикума. Сдача — за 24 часа до следующего занятия.',
    recurrence:{ label:'Еженедельно · Каждый понедельник', cls:'tk-pill--yellow' },
    deadline:{ text:'Каждый Пн · 18:00', urgent:true },
    assignee:{ name:'Algo-Jr-3', role:'группа' },
    comment:{ author:'С. Михайлов', date:'27 апр', text:'3 ученика не сдали на этой неделе.' },
    urgency:'soon'
  },
  {
    id:3, title:'Заполнить журнал посещаемости',
    desc:'Отметить присутствующих и выставить оценки за активность.',
    recurrence:{ label:'По дням недели · Пн / Ср / Пт', cls:'tk-pill--yellow' },
    deadline:{ text:'После каждого занятия', urgent:false },
    assignee:{ name:'Все преподаватели', role:'преподаватель' },
    comment:null,
    urgency:'calm'
  },
  {
    id:4, title:'Контроль оплаты — собрать просрочки',
    desc:'Проверить статусы оплат, отправить напоминания родителям.',
    recurrence:{ label:'Ежемесячно · 1-го числа', cls:'tk-pill--pink' },
    deadline:{ text:'1 мая 2026', urgent:true },
    assignee:{ name:'И. Иванов', role:'админ' },
    comment:{ author:'И. Иванов', date:'01 апр', text:'В апреле — 3 случая.' },
    urgency:'soon'
  },
  {
    id:5, title:'Проверка лабораторных работ',
    desc:'Ревью кода всех лаб. за модуль с обратной связью.',
    recurrence:{ label:'Ежедневно · Каждый рабочий день', cls:'tk-pill--green' },
    deadline:{ text:'до 22:00', urgent:false },
    assignee:{ name:'Е. Петровна', role:'преподаватель' },
    comment:{ author:'Е. Петровна', date:'сегодня', text:'Закрыто 12 из 14.' },
    urgency:'calm'
  },
  {
    id:6, title:'Подготовить материалы к новому модулю',
    desc:'Презентации, демо-проекты, тесты для нового набора.',
    recurrence:{ label:'Однократно', cls:'tk-pill--gray' },
    deadline:{ text:'15 мая 2026', urgent:false },
    assignee:{ name:'Е. Петровна, С. Михайлов', role:'преподаватель' },
    comment:null,
    urgency:'calm'
  },
  {
    id:7, title:'Сдать ТЗ к концу недели',
    desc:'Срок прошёл — задача в просрочке.',
    recurrence:{ label:'Однократно', cls:'tk-pill--gray' },
    deadline:{ text:'25 апр 2026', urgent:true },
    assignee:{ name:'Front-Adv-1', role:'группа' },
    comment:null,
    urgency:'urgent'
  }
])

const tabs = computed(() => [
  { key:'all',    label:'Все',      count: items.value.length },
  { key:'urgent', label:'Срочные',  count: items.value.filter(i => i.urgency === 'urgent').length },
  { key:'soon',   label:'Скоро',    count: items.value.filter(i => i.urgency === 'soon').length },
  { key:'calm',   label:'Спокойно', count: items.value.filter(i => i.urgency === 'calm').length },
])

const activeTab = ref('all')
const search    = ref('')

const filtered = computed(() => {
  let list = activeTab.value === 'all' ? items.value : items.value.filter(i => i.urgency === activeTab.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(i => i.title.toLowerCase().includes(q) || i.assignee.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))
  }
  return list
})

// Модалка
const showAdd = ref(false)
const form = reactive({
  title: '', desc: '', recurrenceIdx: 0, deadlineText: '', deadlineUrgent: false,
  assigneeName: '', assigneeRole: 'группа' as 'группа'|'преподаватель'|'админ',
  urgency: 'calm' as 'urgent'|'soon'|'calm'
})

const toast = reactive({ show: false, text: '' })
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

function submitAdd() {
  if (!form.title.trim()) return
  items.value.push({
    id: Date.now(),
    title: form.title,
    desc: form.desc,
    recurrence: recurrenceOptions[form.recurrenceIdx],
    deadline: { text: form.deadlineText || '—', urgent: form.deadlineUrgent },
    assignee: { name: form.assigneeName || '—', role: form.assigneeRole },
    comment: null,
    urgency: form.urgency
  })
  showAdd.value = false
  Object.assign(form, { title:'', desc:'', recurrenceIdx:0, deadlineText:'', deadlineUrgent:false, assigneeName:'', assigneeRole:'группа', urgency:'calm' })
  showToast('Задача добавлена')
}
</script>

<template>
  <div class="tk-page">
    <div class="tk-card">

      <div class="tk-card__head">
        <h1 class="tk-card__title">Все задачи</h1>
        <div class="tk-card__controls">
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

      <table class="tk-table">
        <thead>
          <tr>
            <th style="width:36px" />
            <th>ЗАДАЧА</th>
            <th>РЕГУЛЯРНОСТЬ</th>
            <th>ДЕДЛАЙН</th>
            <th>КОМУ НАЗНАЧЕНО</th>
            <th>ПОСЛЕДНИЙ КОММЕНТАРИЙ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in filtered" :key="task.id" class="tk-table__row">
            <td class="tk-table__arrow">▸</td>
            <td class="tk-table__task">
              <p class="tk-table__task-title">{{ task.title }}</p>
              <p class="tk-table__task-desc">{{ task.desc }}</p>
            </td>
            <td>
              <span class="tk-pill" :class="task.recurrence.cls">{{ task.recurrence.label }}</span>
            </td>
            <td :class="task.deadline.urgent ? 'tk-table__deadline--urgent' : 'tk-table__deadline'">
              {{ task.deadline.text }}
            </td>
            <td class="tk-table__assignee">
              <p class="tk-table__assignee-name">{{ task.assignee.name }}</p>
              <p class="tk-table__assignee-role">{{ task.assignee.role }}</p>
            </td>
            <td class="tk-table__comment">
              <template v-if="task.comment">
                <span class="tk-table__comment-author">{{ task.comment.author }}</span>
                <span class="tk-table__comment-date">{{ task.comment.date }}</span>
                <p class="tk-table__comment-text">{{ task.comment.text }}</p>
              </template>
              <span v-else class="tk-table__comment-empty">— нет комментариев</span>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    <!-- Модалка добавления задачи -->
    <Teleport to="body">
      <div v-if="showAdd" class="al-modal-overlay" @click.self="showAdd = false">
        <div class="al-modal al-modal--wide">
          <h2 class="al-modal__title">Новая задача</h2>
          <div class="al-modal__fields">
            <div class="al-modal__field al-modal__field--full">
              <label class="al-modal__label">Название *</label>
              <input v-model="form.title" class="al-modal__input" placeholder="Название задачи" />
            </div>
            <div class="al-modal__field al-modal__field--full">
              <label class="al-modal__label">Описание</label>
              <textarea v-model="form.desc" class="al-modal__textarea" placeholder="Подробное описание..." rows="3" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Регулярность</label>
              <select v-model.number="form.recurrenceIdx" class="al-modal__select">
                <option v-for="(opt, i) in recurrenceOptions" :key="i" :value="i">{{ opt.label }}</option>
              </select>
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Дедлайн</label>
              <input v-model="form.deadlineText" class="al-modal__input" placeholder="28 апреля · 23:59" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Кому назначено</label>
              <input v-model="form.assigneeName" class="al-modal__input" placeholder="WebDev-2024-A" />
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Роль</label>
              <select v-model="form.assigneeRole" class="al-modal__select">
                <option value="группа">Группа</option>
                <option value="преподаватель">Преподаватель</option>
                <option value="админ">Админ</option>
              </select>
            </div>
            <div class="al-modal__field">
              <label class="al-modal__label">Срочность</label>
              <select v-model="form.urgency" class="al-modal__select">
                <option value="urgent">Срочно</option>
                <option value="soon">Скоро</option>
                <option value="calm">Спокойно</option>
              </select>
            </div>
            <div class="al-modal__field al-modal__field--checkbox">
              <label class="al-modal__checkbox-label">
                <input v-model="form.deadlineUrgent" type="checkbox" />
                Горящий дедлайн
              </label>
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
.tk-page {
  padding-top: 20px;
}

.tk-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 24px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.tk-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;

  th {
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--c-text-gray);
    padding: 10px 12px;
    border-bottom: 1.5px solid #F0F0F0;
  }

  &__row {
    border-bottom: 1px solid #F5F5F5;
    transition: background 0.15s;
    &:hover { background: var(--c-bg); }
    &:last-child { border-bottom: none; }
    td { padding: 16px 12px; vertical-align: top; font-size: 14px; color: var(--c-text-dark); }
  }

  &__arrow { color: var(--c-text-gray); font-size: 12px; cursor: pointer; user-select: none; vertical-align: middle !important; padding-right: 4px !important; }
  &__task { max-width: 280px; }
  &__task-title { font-weight: 700; font-size: 14px; color: var(--c-text-dark); margin-bottom: 5px; line-height: 1.3; }
  &__task-desc  { font-size: 12px; color: var(--c-text-gray); line-height: 1.5; }

  &__deadline        { font-size: 14px; color: var(--c-text-dark); white-space: nowrap; }
  &__deadline--urgent { font-size: 14px; font-weight: 700; color: var(--c-red); white-space: nowrap; }

  &__assignee-name { font-weight: 600; font-size: 14px; color: var(--c-text-dark); margin-bottom: 3px; }
  &__assignee-role { font-size: 12px; color: var(--c-text-gray); }

  &__comment { max-width: 220px; }
  &__comment-author { font-weight: 600; font-size: 13px; color: var(--c-text-dark); margin-right: 6px; }
  &__comment-date   { font-size: 12px; color: var(--c-text-gray); }
  &__comment-text   { font-size: 12px; color: var(--c-text-gray); margin-top: 3px; line-height: 1.4; }
  &__comment-empty  { font-size: 13px; color: #BBBBBB; }
}

.tk-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  max-width: 180px;
  white-space: normal;
  text-align: center;

  &--gray   { background: #EBEBEB;               color: #666;                 }
  &--yellow { background: var(--c-yellow-light); color: var(--c-yellow-text); }
  &--pink   { background: #FFE4E4;               color: #9F2323;              }
  &--green  { background: var(--c-green-light);  color: var(--c-green-text);  }
}

@media (max-width: 768px) {
  .tk-card {
    padding: 16px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    &__head { flex-direction: column; align-items: flex-start; gap: 12px; }
    &__controls { width: 100%; justify-content: space-between; }
  }
  .tk-table { min-width: 700px; th { padding: 8px 10px; } &__row td { padding: 12px 10px; font-size: 13px; } &__task { max-width: 200px; } &__comment { max-width: 160px; } }
}

@media (max-width: 480px) {
  .tk-table { min-width: 580px; }
  .tk-card__title { font-size: 17px; }
}
</style>
