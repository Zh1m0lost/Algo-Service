<script setup lang="ts">
definePageMeta({ layout: 'admin' })

// ── Shared state (same keys as individual pages) ─────────────────────────────
type Student = { id:number; initials:string; color:string; name:string; group:string; parent:string; phone:string; payment:'paid'|'overdue'|'pending'; points:number }
type Teacher = { id:number; initials:string; color:string; name:string; subject:string; email:string; phone:string; status:'active'|'probation'|'pending'; rate:number }
type Group   = { id:number; name:string; subject:string; teacher:string; students:number; schedule:string; format:string; progress:number; status:'active'|'finishing'|'draft'|'archive' }
type Task    = { id:number; title:string; desc:string; recurrence:{ label:string; cls:string }; deadline:{ text:string; urgent:boolean }; assignee:{ name:string; role:string }; comment:{ author:string; date:string; text:string }|null; urgency:'urgent'|'soon'|'calm' }

const api = useApi()

const avatarColors = ['#F5A623','#7B5EA7','#E8823A','#D4A017','#6B8FA8','#5B7EA6','#3A9A8A','#4A8C5C','#57A86B','#A07BC0']
const recurrenceOptions = [
  { label:'Однократно',                        cls:'tk-pill--gray'   },
  { label:'Еженедельно · Каждый понедельник',  cls:'tk-pill--yellow' },
  { label:'По дням недели · Пн / Ср / Пт',    cls:'tk-pill--yellow' },
  { label:'Ежемесячно · 1-го числа',          cls:'tk-pill--pink'   },
  { label:'Ежедневно · Каждый рабочий день',  cls:'tk-pill--green'  },
]

function mkInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('')
}

// ── Modal state ───────────────────────────────────────────────────────────────
type ModalType = 'student'|'teacher'|'group'|'task'|null
const activeModal = ref<ModalType>(null)

const studentForm = reactive({ name:'', group:'', parent:'', phone:'', payment:'paid' as 'paid'|'overdue'|'pending', points:0 })
const teacherForm = reactive({ name:'', subject:'', email:'', phone:'', status:'active' as 'active'|'probation'|'pending', rate:1200 })
const groupForm   = reactive({ name:'', subject:'', teacher:'', students:0, schedule:'', format:'Онлайн', status:'active' as 'active'|'finishing'|'draft'|'archive' })
const taskForm    = reactive({ title:'', desc:'', recurrenceIdx:0, deadlineText:'', deadlineUrgent:false, assigneeName:'', assigneeRole:'группа' as 'группа'|'преподаватель'|'админ', urgency:'calm' as 'urgent'|'soon'|'calm' })

const toast = reactive({ show: false, text: '' })
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

function openModal(type: ModalType) { activeModal.value = type }
function closeModal() { activeModal.value = null }

async function submitStudent() {
  if (!studentForm.name.trim()) return
  await api('/admin/students', { method: 'POST', body: {
    name: studentForm.name, group: studentForm.group, parent: studentForm.parent,
    phone: studentForm.phone, payment: studentForm.payment, points: studentForm.points,
  }})
  await refresh()
  closeModal()
  Object.assign(studentForm, { name:'', group:'', parent:'', phone:'', payment:'paid', points:0 })
  showToast('Ученик добавлен')
}

async function submitTeacher() {
  if (!teacherForm.name.trim()) return
  await api('/admin/teachers', { method: 'POST', body: {
    name: teacherForm.name, subject: teacherForm.subject, email: teacherForm.email,
    phone: teacherForm.phone, status: teacherForm.status, rate: teacherForm.rate,
  }})
  await refresh()
  closeModal()
  Object.assign(teacherForm, { name:'', subject:'', email:'', phone:'', status:'active', rate:1200 })
  showToast('Преподаватель добавлен')
}

async function submitGroup() {
  if (!groupForm.name.trim()) return
  await api('/admin/groups', { method: 'POST', body: {
    name: groupForm.name, subject: groupForm.subject, teacher: groupForm.teacher,
    schedule: groupForm.schedule, format: groupForm.format, status: groupForm.status,
  }})
  await refresh()
  closeModal()
  Object.assign(groupForm, { name:'', subject:'', teacher:'', students:0, schedule:'', format:'Онлайн', status:'active' })
  showToast('Группа добавлена')
}

async function submitTask() {
  if (!taskForm.title.trim()) return
  await api('/admin/tasks', { method: 'POST', body: {
    title: taskForm.title, desc: taskForm.desc,
    recurrence: recurrenceOptions[taskForm.recurrenceIdx]?.label,
    deadlineText: taskForm.deadlineText, deadlineUrgent: taskForm.deadlineUrgent,
    assigneeName: taskForm.assigneeName, assigneeRole: taskForm.assigneeRole,
    urgency: taskForm.urgency,
  }})
  await refresh()
  closeModal()
  Object.assign(taskForm, { title:'', desc:'', recurrenceIdx:0, deadlineText:'', deadlineUrgent:false, assigneeName:'', assigneeRole:'группа', urgency:'calm' })
  showToast('Задача добавлена')
}

// Быстрые действия открывают модалки создания (навигация, не данные).
const quickActions = [
  { label: 'Новая группа',  sub: 'Расписание',            type: 'group'   as ModalType },
  { label: 'Новый ученик',  sub: 'Карточка · контакт',    type: 'student' as ModalType },
  { label: 'Преподаватель', sub: 'Ставка · предметы',     type: 'teacher' as ModalType },
  { label: 'Задача',        sub: 'Дедлайн, регулярность', type: 'task'    as ModalType },
]

const { data, refresh } = await useAsyncData('admin-dashboard', () =>
  api<any>('/admin/dashboard'),
)
</script>

<template>
  <div v-if="data" class="adm">

    <!-- Hero -->
    <div class="adm-hero">
      <div class="adm-hero__circles">
        <span class="adm-hero__circle adm-hero__circle--1" />
        <span class="adm-hero__circle adm-hero__circle--2" />
      </div>

      <div class="adm-hero__left">
        <h1 class="adm-hero__title">Привет, {{ data.admin.name }}!</h1>
        <p class="adm-hero__sub">{{ data.hero.subtitle }}</p>
        <div class="adm-hero__progress-wrap">
          <span class="adm-hero__progress-label">Прогресс модуля: {{ data.hero.moduleProgress }}%</span>
          <div class="adm-hero__progress-bar">
            <div class="adm-hero__progress-fill" :style="{ width: data.hero.moduleProgress + '%' }" />
          </div>
        </div>
      </div>

      <div class="adm-hero__stats">
        <div class="adm-hero__stat">
          <span class="adm-hero__stat-num">{{ data.hero.students }}</span>
          <span class="adm-hero__stat-label">учеников</span>
        </div>
        <div class="adm-hero__stat">
          <span class="adm-hero__stat-num">{{ data.hero.groups }}</span>
          <span class="adm-hero__stat-label">группы</span>
        </div>
      </div>
    </div>

    <!-- Карточки-счётчики -->
    <div class="adm-stats">
      <NuxtLink
        v-for="card in data.statCards"
        :key="card.title"
        :to="card.to"
        class="adm-stat-card"
      >
        <div class="adm-stat-card__top">
          <div class="adm-stat-card__icon"><UiIcon :name="card.icon" :size="24" /></div>
          <span class="adm-stat-card__arrow">→</span>
        </div>
        <p class="adm-stat-card__title">{{ card.title }}</p>
        <p class="adm-stat-card__desc">{{ card.desc }}</p>
        <p class="adm-stat-card__value">{{ card.value }}</p>
        <p class="adm-stat-card__delta">{{ card.delta }}</p>
      </NuxtLink>
    </div>

    <!-- Быстрые действия -->
    <div class="adm-quick-wrap">
      <p class="adm-section-label">БЫСТРЫЕ ДЕЙСТВИЯ</p>
      <div class="adm-quick">
        <button
          v-for="action in quickActions"
          :key="action.label"
          class="adm-quick-btn"
          @click="openModal(action.type)"
        >
          <span class="adm-quick-btn__plus">+</span>
          <span class="adm-quick-btn__label">{{ action.label }}</span>
          <span class="adm-quick-btn__sub">{{ action.sub }}</span>
        </button>
      </div>
    </div>

    <!-- Нижняя сетка -->
    <div class="adm-bottom">

      <!-- Ближайшие занятия -->
      <div class="adm-card">
        <p class="adm-section-label">БЛИЖАЙШИЕ ЗАНЯТИЯ</p>
        <div class="adm-lessons">
          <div v-for="lesson in data.lessons" :key="lesson.id" class="adm-lesson">
            <div class="adm-lesson__dot" />
            <div class="adm-lesson__info">
              <span class="adm-lesson__subject">{{ lesson.subject }}</span>
              <span class="adm-lesson__group">· {{ lesson.group }}</span>
            </div>
            <span class="adm-lesson__time">{{ lesson.date }}, {{ lesson.time }}</span>
          </div>
        </div>
      </div>

      <!-- Правая колонка -->
      <div class="adm-right">

        <!-- Лента активности -->
        <div class="adm-card">
          <div class="adm-activity-head">
            <p class="adm-section-label">ЛЕНТА АКТИВНОСТИ</p>
            <NuxtLink to="/admin/transactions" class="adm-activity-head__link">Все транзакции →</NuxtLink>
          </div>
          <div class="adm-activity">
            <div v-for="item in data.activity" :key="item.id" class="adm-activity-item">
              <span class="adm-activity-item__dot" />
              <span class="adm-activity-item__text">{{ item.text }}</span>
              <span class="adm-activity-item__time">{{ item.time }}</span>
            </div>
          </div>
        </div>

        <!-- Требует внимания -->
        <div class="adm-card adm-card--alert">
          <p class="adm-section-label">ТРЕБУЕТ ВНИМАНИЯ</p>
          <div class="adm-alerts">
            <div v-for="alert in data.alerts" :key="alert.id" class="adm-alert">
              <span class="adm-alert__text">{{ alert.text }}</span>
              <NuxtLink :to="alert.to" class="adm-alert__link">Открыть →</NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>

  <!-- ── Модалки ─────────────────────────────────────────────────────────── -->
  <Teleport to="body">

    <!-- Новый ученик -->
    <div v-if="activeModal === 'student'" class="al-modal-overlay" @click.self="closeModal">
      <div class="al-modal">
        <h2 class="al-modal__title">Новый ученик</h2>
        <div class="al-modal__fields">
          <div class="al-modal__field al-modal__field--full">
            <label class="al-modal__label">ФИО *</label>
            <input v-model="studentForm.name" class="al-modal__input" placeholder="Иван Иванов" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Группа</label>
            <input v-model="studentForm.group" class="al-modal__input" placeholder="WebDev-2024-A" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Родитель</label>
            <input v-model="studentForm.parent" class="al-modal__input" placeholder="Мария Иванова" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Телефон</label>
            <input v-model="studentForm.phone" class="al-modal__input" placeholder="+7 (900) 000-00-00" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Оплата</label>
            <select v-model="studentForm.payment" class="al-modal__select">
              <option value="paid">Оплачено</option>
              <option value="pending">Ожидает</option>
              <option value="overdue">Просрочено</option>
            </select>
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Баллы</label>
            <input v-model.number="studentForm.points" type="number" min="0" class="al-modal__input" placeholder="0" />
          </div>
        </div>
        <div class="al-modal__footer">
          <button class="al-modal__btn al-modal__btn--cancel" @click="closeModal">Отмена</button>
          <button class="al-modal__btn al-modal__btn--submit" @click="submitStudent">Добавить</button>
        </div>
      </div>
    </div>

    <!-- Новый преподаватель -->
    <div v-if="activeModal === 'teacher'" class="al-modal-overlay" @click.self="closeModal">
      <div class="al-modal">
        <h2 class="al-modal__title">Новый преподаватель</h2>
        <div class="al-modal__fields">
          <div class="al-modal__field al-modal__field--full">
            <label class="al-modal__label">ФИО *</label>
            <input v-model="teacherForm.name" class="al-modal__input" placeholder="Иван Петров" />
          </div>
          <div class="al-modal__field al-modal__field--full">
            <label class="al-modal__label">Предмет</label>
            <input v-model="teacherForm.subject" class="al-modal__input" placeholder="Python, Web-разработка..." />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Email</label>
            <input v-model="teacherForm.email" class="al-modal__input" placeholder="teacher@algo.ru" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Телефон</label>
            <input v-model="teacherForm.phone" class="al-modal__input" placeholder="+7 (900) 000-00-00" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Статус</label>
            <select v-model="teacherForm.status" class="al-modal__select">
              <option value="active">Активный</option>
              <option value="probation">Исп. срок</option>
              <option value="pending">Ожидает</option>
            </select>
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Ставка (₽/час)</label>
            <input v-model.number="teacherForm.rate" type="number" min="0" class="al-modal__input" placeholder="1200" />
          </div>
        </div>
        <div class="al-modal__footer">
          <button class="al-modal__btn al-modal__btn--cancel" @click="closeModal">Отмена</button>
          <button class="al-modal__btn al-modal__btn--submit" @click="submitTeacher">Добавить</button>
        </div>
      </div>
    </div>

    <!-- Новая группа -->
    <div v-if="activeModal === 'group'" class="al-modal-overlay" @click.self="closeModal">
      <div class="al-modal">
        <h2 class="al-modal__title">Новая группа</h2>
        <div class="al-modal__fields">
          <div class="al-modal__field al-modal__field--full">
            <label class="al-modal__label">Название группы *</label>
            <input v-model="groupForm.name" class="al-modal__input" placeholder="WebDev-2025-A" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Предмет</label>
            <input v-model="groupForm.subject" class="al-modal__input" placeholder="Frontend, Python..." />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Преподаватель</label>
            <input v-model="groupForm.teacher" class="al-modal__input" placeholder="Иван Петров" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Расписание</label>
            <input v-model="groupForm.schedule" class="al-modal__input" placeholder="Пн/Ср · 18:00" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Формат</label>
            <select v-model="groupForm.format" class="al-modal__select">
              <option>Онлайн</option>
              <option>Офлайн</option>
              <option>Гибрид</option>
            </select>
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Статус</label>
            <select v-model="groupForm.status" class="al-modal__select">
              <option value="active">Активна</option>
              <option value="finishing">Завершается</option>
              <option value="draft">Черновик</option>
              <option value="archive">Архив</option>
            </select>
          </div>
        </div>
        <div class="al-modal__footer">
          <button class="al-modal__btn al-modal__btn--cancel" @click="closeModal">Отмена</button>
          <button class="al-modal__btn al-modal__btn--submit" @click="submitGroup">Добавить</button>
        </div>
      </div>
    </div>

    <!-- Новая задача -->
    <div v-if="activeModal === 'task'" class="al-modal-overlay" @click.self="closeModal">
      <div class="al-modal al-modal--wide">
        <h2 class="al-modal__title">Новая задача</h2>
        <div class="al-modal__fields">
          <div class="al-modal__field al-modal__field--full">
            <label class="al-modal__label">Название *</label>
            <input v-model="taskForm.title" class="al-modal__input" placeholder="Название задачи" />
          </div>
          <div class="al-modal__field al-modal__field--full">
            <label class="al-modal__label">Описание</label>
            <textarea v-model="taskForm.desc" class="al-modal__textarea" placeholder="Подробное описание..." rows="3" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Регулярность</label>
            <select v-model.number="taskForm.recurrenceIdx" class="al-modal__select">
              <option v-for="(opt, i) in recurrenceOptions" :key="i" :value="i">{{ opt.label }}</option>
            </select>
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Дедлайн</label>
            <input v-model="taskForm.deadlineText" class="al-modal__input" placeholder="28 апреля · 23:59" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Кому назначено</label>
            <input v-model="taskForm.assigneeName" class="al-modal__input" placeholder="WebDev-2024-A" />
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Роль</label>
            <select v-model="taskForm.assigneeRole" class="al-modal__select">
              <option value="группа">Группа</option>
              <option value="преподаватель">Преподаватель</option>
              <option value="админ">Админ</option>
            </select>
          </div>
          <div class="al-modal__field">
            <label class="al-modal__label">Срочность</label>
            <select v-model="taskForm.urgency" class="al-modal__select">
              <option value="urgent">Срочно</option>
              <option value="soon">Скоро</option>
              <option value="calm">Спокойно</option>
            </select>
          </div>
          <div class="al-modal__field al-modal__field--checkbox">
            <label class="al-modal__checkbox-label">
              <input v-model="taskForm.deadlineUrgent" type="checkbox" />
              Горящий дедлайн
            </label>
          </div>
        </div>
        <div class="al-modal__footer">
          <button class="al-modal__btn al-modal__btn--cancel" @click="closeModal">Отмена</button>
          <button class="al-modal__btn al-modal__btn--submit" @click="submitTask">Добавить</button>
        </div>
      </div>
    </div>

  </Teleport>

  <!-- Toast -->
  <Transition name="toast">
    <div v-if="toast.show" class="al-toast">{{ toast.text }}</div>
  </Transition>

</template>

<style lang="scss">
.adm {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Hero */
.adm-hero {
  position: relative;
  background: var(--c-purple);
  border-radius: var(--radius-md);
  padding: 32px 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  overflow: hidden;

  &__circles { position: absolute; inset: 0; pointer-events: none; }

  &__circle {
    position: absolute;
    border-radius: 50%;
    background: var(--c-circle-bg);

    &--1 { width: 260px; height: 260px; right: 260px; top: -90px; }
    &--2 { width: 160px; height: 160px; right: 170px; bottom: -50px; }
  }

  &__left {
    flex: 1;
    position: relative;
    z-index: 1;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 30px;
    font-weight: 800;
    color: var(--c-white);
    margin-bottom: 8px;
  }

  &__sub {
    font-size: 14px;
    color: var(--c-text-white-dim);
    line-height: 1.5;
    margin-bottom: 18px;
  }

  &__progress-wrap {
    max-width: 420px;
  }

  &__progress-label {
    font-size: 12px;
    color: var(--c-text-white-dim);
    display: block;
    margin-bottom: 6px;
  }

  &__progress-bar {
    height: 6px;
    background: rgba(255,255,255,0.2);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: var(--c-yellow);
    border-radius: var(--radius-full);
    transition: width 0.4s;
  }

  &__stats {
    display: flex;
    gap: 12px;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }

  &__stat {
    background: rgba(255,255,255,0.15);
    border-radius: var(--radius-sm);
    padding: 16px 28px;
    text-align: center;
    min-width: 110px;
  }

  &__stat-num {
    display: block;
    font-family: var(--font-heading);
    font-size: 38px;
    font-weight: 800;
    color: var(--c-white);
    line-height: 1;
    margin-bottom: 4px;
  }

  &__stat-label {
    font-size: 12px;
    color: var(--c-text-white-dim);
  }
}

/* Stat cards */
.adm-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.adm-stat-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 20px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: box-shadow 0.2s, transform 0.15s;

  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transform: translateY(-2px);
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__icon {
    width: 44px;
    height: 44px;
    background: var(--c-purple-light);
    color: var(--c-purple-text);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__arrow {
    font-size: 16px;
    color: var(--c-purple-text);
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__desc {
    font-size: 12px;
    color: var(--c-text-gray);
    line-height: 1.4;
    margin-bottom: 8px;
  }

  &__value {
    font-family: var(--font-heading);
    font-size: 32px;
    font-weight: 800;
    color: var(--c-text-dark);
    line-height: 1;
  }

  &__delta {
    font-size: 12px;
    color: var(--c-green-text);
    font-weight: 500;
    margin-top: 2px;
  }
}

/* Quick actions */
.adm-quick-wrap {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 20px 24px;
}

.adm-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-purple-text);
  margin-bottom: 14px;
}

.adm-quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.adm-quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  border-radius: var(--radius-md);
  background: var(--c-purple-light);
  text-decoration: none;
  text-align: center;
  transition: opacity 0.2s;
  border: none;
  cursor: pointer;
  font-family: var(--font-main);

  &:hover { opacity: 0.8; }

  &__plus {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--c-purple-text);
    color: var(--c-white);
    font-size: 20px;
    font-weight: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;
  }

  &__label {
    font-size: 13px;
    font-weight: 700;
    color: var(--c-purple-text);
  }

  &__sub {
    font-size: 11px;
    color: var(--c-text-gray);
  }
}

/* Bottom grid */
.adm-bottom {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
  align-items: start;
}

.adm-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card */
.adm-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 22px 24px;

  &--alert { }
}

/* Lessons */
.adm-lessons {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.adm-lesson {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #F2F2F2;

  &:last-child { border-bottom: none; }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--c-purple);
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    font-size: 14px;
    color: var(--c-text-dark);
  }

  &__subject { font-weight: 600; }

  &__group {
    color: var(--c-text-gray);
    margin-left: 4px;
  }

  &__time {
    font-size: 13px;
    color: var(--c-text-gray);
    flex-shrink: 0;
  }
}

/* Activity */
.adm-activity-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;

  .adm-section-label { margin-bottom: 0; }

  &__link {
    font-size: 12px;
    font-weight: 600;
    color: var(--c-purple-text);
    text-decoration: none;
    white-space: nowrap;

    &:hover { text-decoration: underline; }
  }
}

.adm-activity {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adm-activity-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--c-purple);
    flex-shrink: 0;
    margin-top: 4px;
  }

  &__text {
    flex: 1;
    color: var(--c-text-dark);
    line-height: 1.4;
  }

  &__time {
    color: var(--c-text-gray);
    flex-shrink: 0;
    font-size: 12px;
  }
}

/* Alerts */
.adm-alerts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adm-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--c-red-light);

  &__text {
    font-size: 13px;
    color: var(--c-text-dark);
    font-weight: 500;
  }

  &__link {
    font-size: 13px;
    font-weight: 600;
    color: var(--c-red);
    text-decoration: none;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover { text-decoration: underline; }
  }
}

@media (max-width: 768px) {
  .adm-hero {
    flex-direction: column;
    padding: 24px 20px;
    gap: 20px;

    &__title { font-size: 24px; }
    &__progress-wrap { max-width: 100%; }

    &__stats {
      flex-direction: row;
      width: 100%;
    }

    &__stat {
      flex: 1;
      padding: 12px 16px;
      min-width: 0;
    }
  }

  .adm-stats { grid-template-columns: repeat(2, 1fr); }

  .adm-quick { grid-template-columns: repeat(2, 1fr); }

  .adm-bottom { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .adm-hero {
    padding: 20px 16px;

    &__title { font-size: 20px; }
    &__circle { display: none; }
    &__stat-num { font-size: 28px; }
  }

  .adm-stats { grid-template-columns: 1fr; }

  .adm-stat-card__value { font-size: 26px; }

  .adm-quick { grid-template-columns: repeat(2, 1fr); gap: 10px; }

  .adm-alert {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .adm-lesson {
    flex-wrap: wrap;
    &__time { width: 100%; padding-left: 18px; }
  }
}
</style>
