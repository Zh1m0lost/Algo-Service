<script setup lang="ts">
definePageMeta({ layout: 'teacher' })

const route  = useRoute()
const router = useRouter()

const allReviews: Record<number, any> = {
  1: {
    student: { name: 'Иван Иванов', initials: 'ИИ' },
    task: 'Frontend — Лендинг HTML/CSS Про',
    deadline: '28 апреля 2026', submittedAt: '26 апреля 2026, 17:42',
    points: 100, tags: ['HTML / CSS'],
    description: 'Разработать адаптивную landing page используя HTML5 и CSS3. Страница должна корректно отображаться на всех популярных разрешениях экрана — от 320px до 1920px.',
    file: { name: 'landing_ivanov.zip', date: '26 апреля 2026, 17:42' },
    comments: [
      { id: 1, initials: 'ЕП', author: 'Елена Петровна', role: 'teacher', roleLabel: 'Преподаватель', date: '21 апр., 14:20', text: 'Иван, обратите внимание — в вашем коде не хватает тега <meta name="viewport">.' },
      { id: 2, initials: 'ИИ', author: 'Иван Иванов',    role: 'student', roleLabel: 'Ученик',         date: '21 апр., 15:04', text: 'Спасибо! Я добавил viewport meta и проверил на реальном устройстве — всё корректно.' }
    ]
  },
  2: {
    student: { name: 'Мария Смирнова', initials: 'МС' },
    task: 'JS — Работа с массивами',
    deadline: '30 апреля 2026', submittedAt: '29 апреля 2026, 21:10',
    points: 80, tags: ['JavaScript'],
    description: 'Реализовать набор функций для работы с массивами: фильтрация, трансформация и агрегация данных с использованием методов map, filter, reduce.',
    file: { name: 'arrays_smirnova.js', date: '29 апреля 2026, 21:10' },
    comments: [
      { id: 1, initials: 'МС', author: 'Мария Смирнова', role: 'student', roleLabel: 'Ученик', date: '29 апр., 21:15', text: 'Сдала работу, всё реализовала через цепочку методов.' }
    ]
  },
  3: {
    student: { name: 'Алексей Козлов', initials: 'АК' },
    task: 'Алгоритмы — Сортировки',
    deadline: '25 апреля 2026', submittedAt: '24 апреля 2026, 18:00',
    points: 90, tags: ['Алгоритмы'],
    description: 'Реализовать и сравнить алгоритмы сортировки: пузырьковая, быстрая, сортировка слиянием. Замерить время выполнения на массивах разного размера.',
    file: { name: 'sort_kozlov.py', date: '24 апреля 2026, 18:00' },
    comments: []
  },
  4: {
    student: { name: 'Дарья Михайлова', initials: 'ДМ' },
    task: 'Python — ООП',
    deadline: '1 мая 2026', submittedAt: '30 апреля 2026, 14:33',
    points: 120, tags: ['Python', 'ООП'],
    description: 'Спроектировать систему классов для интернет-магазина: Product, Cart, Order. Реализовать наследование, инкапсуляцию и полиморфизм.',
    file: { name: 'oop_mikhailova.py', date: '30 апреля 2026, 14:33' },
    comments: [
      { id: 1, initials: 'ЕП', author: 'Елена Петровна', role: 'teacher', roleLabel: 'Преподаватель', date: '30 апр., 16:00', text: 'Дарья, хорошая структура классов. Проверьте метод __str__ в классе Order.' },
      { id: 2, initials: 'ДМ', author: 'Дарья Михайлова', role: 'student', roleLabel: 'Ученик',       date: '30 апр., 17:20', text: 'Исправила, добавила __repr__ тоже.' }
    ]
  },
  5: {
    student: { name: 'Пётр Николаев', initials: 'ПН' },
    task: 'Frontend — Лендинг',
    deadline: '3 мая 2026', submittedAt: '2 мая 2026, 23:50',
    points: 100, tags: ['HTML / CSS'],
    description: 'Создать простую landing page по макету. Адаптив на мобильные устройства обязателен.',
    file: { name: 'landing_nikolaev.zip', date: '2 мая 2026, 23:50' },
    comments: []
  }
}

const id   = Number(route.params.id)
const data = allReviews[id] ?? allReviews[1]

const grade      = ref<number | null>(null)
const earnedPts  = ref<number>(data.points)
const feedback   = ref('')
const newComment = ref('')
const comments   = ref([...data.comments])

const toast = reactive({ show: false, text: '', type: 'success' })
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(text: string, type = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text
  toast.type = type
  toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

function submitReview() {
  if (grade.value === null) { showToast('Выберите оценку', 'error'); return }
  // TODO: POST /api/teacher/review/:id { grade, points, feedback }
  showToast('Оценка выставлена')
}

function sendComment() {
  if (!newComment.value.trim()) return
  const now = new Date()
  const dateStr = now.toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', '')
  comments.value.push({
    id: Date.now(), initials: 'ЕП', author: 'Елена Петровна',
    role: 'teacher', roleLabel: 'Преподаватель', date: dateStr, text: newComment.value.trim()
  })
  newComment.value = ''
}

function goBack() { router.back() }
</script>

<template>
  <div class="rv-page">

    <!-- Шапка -->
    <div class="rv-header">
      <button class="rv-back" @click="goBack">← Назад</button>
      <div class="rv-header__info">
        <div class="rv-header__avatar">{{ data.student.initials }}</div>
        <div>
          <p class="rv-header__name">{{ data.student.name }}</p>
          <p class="rv-header__task">{{ data.task }}</p>
        </div>
      </div>
      <span class="rv-header__badge">На проверке</span>
    </div>

    <div class="rv-cols">

      <!-- Левая: информация о работе -->
      <div class="rv-left">

        <!-- Сданная работа -->
        <div class="rv-card">
          <p class="rv-section-label">СДАННАЯ РАБОТА</p>
          <table class="rv-table">
            <tbody>
              <tr><td class="rv-table__key">Ученик</td><td class="rv-table__val">{{ data.student.name }}</td></tr>
              <tr><td class="rv-table__key">Задание</td><td class="rv-table__val">{{ data.task }}</td></tr>
              <tr><td class="rv-table__key">Срок сдачи</td><td class="rv-table__val">{{ data.deadline }}</td></tr>
              <tr><td class="rv-table__key">Сдано</td><td class="rv-table__val rv-table__val--green">{{ data.submittedAt }}</td></tr>
              <tr>
                <td class="rv-table__key">Файл</td>
                <td class="rv-table__val">
                  <span class="rv-file">📄 {{ data.file.name }}</span>
                  <span class="rv-file-date">· {{ data.file.date }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Описание задания -->
        <div class="rv-card">
          <p class="rv-section-label">ОПИСАНИЕ ЗАДАНИЯ</p>
          <p class="rv-desc">{{ data.description }}</p>
          <div class="rv-tags">
            <span v-for="tag in data.tags" :key="tag" class="rv-tag">{{ tag }}</span>
            <span class="rv-points-badge">{{ data.points }} баллов</span>
          </div>
        </div>

        <!-- Чат -->
        <div class="rv-card">
          <p class="rv-section-label">ДИАЛОГ С УЧЕНИКОМ</p>
          <div class="rv-chat">
            <div
              v-for="msg in comments"
              :key="msg.id"
              class="rv-msg"
              :class="msg.role === 'teacher' ? 'rv-msg--teacher' : 'rv-msg--student'"
            >
              <div class="rv-msg__avatar" :class="msg.role === 'teacher' ? 'rv-msg__avatar--teacher' : 'rv-msg__avatar--student'">
                {{ msg.initials }}
              </div>
              <div class="rv-msg__body">
                <div class="rv-msg__header">
                  <span class="rv-msg__author">{{ msg.author }}</span>
                  <span class="rv-msg__role" :class="msg.role === 'teacher' ? 'rv-msg__role--teacher' : 'rv-msg__role--student'">
                    {{ msg.roleLabel }}
                  </span>
                  <span class="rv-msg__date">{{ msg.date }}</span>
                </div>
                <p class="rv-msg__text">{{ msg.text }}</p>
              </div>
            </div>

            <div class="rv-chat__input-row">
              <div class="rv-msg__avatar rv-msg__avatar--teacher">ЕП</div>
              <div class="rv-chat__input-wrap">
                <textarea v-model="newComment" class="rv-textarea" placeholder="Написать комментарий..." rows="3" />
                <div class="rv-chat__btns">
                  <button class="rv-btn rv-btn--filled" @click="sendComment">Отправить</button>
                  <button class="rv-btn rv-btn--outline" @click="newComment = ''">Отмена</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Правая: выставление оценки -->
      <div class="rv-right">
        <div class="rv-card rv-grade-card">
          <p class="rv-section-label">ВЫСТАВИТЬ ОЦЕНКУ</p>

          <div class="rv-grade-row">
            <button
              v-for="n in [5, 4, 3, 2, 1]"
              :key="n"
              class="rv-grade-btn"
              :class="{ 'rv-grade-btn--active': grade === n }"
              @click="grade = n"
            >{{ n }}</button>
          </div>

          <div class="rv-field">
            <label class="rv-field__label">Баллы</label>
            <input v-model.number="earnedPts" type="number" min="0" :max="data.points" class="rv-input" />
            <span class="rv-field__hint">из {{ data.points }}</span>
          </div>

          <div class="rv-field">
            <label class="rv-field__label">Комментарий к оценке</label>
            <textarea v-model="feedback" class="rv-textarea" placeholder="Напишите отзыв о работе..." rows="5" />
          </div>

          <button class="rv-btn rv-btn--filled rv-btn--full" @click="submitReview">Выставить оценку</button>
        </div>
      </div>

    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="rv-toast" :class="{ 'rv-toast--error': toast.type === 'error' }">
        {{ toast.text }}
      </div>
    </Transition>

  </div>
</template>

<style lang="scss">
.rv-page {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.rv-header {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 20px 28px;

  &__info {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
  }

  &__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--c-green);
    color: var(--c-white);
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__name {
    font-size: 16px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__task {
    font-size: 13px;
    color: var(--c-text-gray);
    margin-top: 2px;
  }

  &__badge {
    padding: 5px 14px;
    border-radius: var(--radius-full);
    background: var(--c-yellow-light);
    color: var(--c-yellow-text);
    font-size: 13px;
    font-weight: 600;
    border: 1px solid var(--c-yellow);
    white-space: nowrap;
  }
}

.rv-back {
  background: none;
  border: 1.5px solid #E0E0E0;
  border-radius: var(--radius-full);
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-dark);
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.2s;
  font-family: var(--font-main);

  &:hover { border-color: var(--c-purple-text); color: var(--c-purple-text); }
}

/* Columns */
.rv-cols {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}

.rv-left, .rv-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Card */
.rv-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 28px 32px;
}

.rv-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-purple-text);
  margin-bottom: 16px;
}

/* Table */
.rv-table {
  width: 100%;
  border-collapse: collapse;

  tr { border-bottom: 1px solid #F0F0F0; }
  tr:last-child { border-bottom: none; }

  &__key {
    padding: 12px 16px;
    font-size: 13px;
    color: var(--c-text-gray);
    width: 140px;
    vertical-align: top;
  }

  &__val {
    padding: 12px 16px;
    font-size: 14px;
    color: var(--c-text-dark);

    &--green { color: var(--c-green); font-weight: 600; }
  }
}

.rv-file {
  color: var(--c-purple-text);
  font-weight: 500;
  cursor: pointer;
}

.rv-file-date {
  font-size: 13px;
  color: var(--c-text-gray);
  margin-left: 6px;
}

/* Description */
.rv-desc {
  font-size: 14px;
  color: var(--c-text-dark);
  line-height: 1.6;
  margin-bottom: 16px;
}

.rv-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rv-tag {
  padding: 3px 12px;
  border-radius: var(--radius-full);
  background: var(--c-purple-light);
  color: var(--c-purple-text);
  font-size: 13px;
  font-weight: 500;
}

.rv-points-badge {
  padding: 3px 12px;
  border-radius: var(--radius-full);
  background: var(--c-yellow-light);
  color: var(--c-yellow-text);
  font-size: 13px;
  font-weight: 600;
}

/* Chat */
.rv-chat {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rv-msg {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  &__avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--c-white);
    flex-shrink: 0;

    &--teacher { background: var(--c-purple); }
    &--student  { background: var(--c-green);  }
  }

  &__body {
    flex: 1;
    background: var(--c-bg);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  &__author { font-size: 14px; font-weight: 700; color: var(--c-text-dark); }

  &__role {
    font-size: 12px;
    font-weight: 500;
    padding: 2px 10px;
    border-radius: var(--radius-full);

    &--teacher { background: var(--c-purple-light); color: var(--c-purple-text); }
    &--student  { background: var(--c-green-light);  color: var(--c-green-text);  }
  }

  &__date { font-size: 12px; color: var(--c-text-gray); margin-left: auto; }

  &__text { font-size: 14px; color: var(--c-text-dark); line-height: 1.55; }
}

.rv-chat__input-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 4px;
}

.rv-chat__input-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rv-chat__btns {
  display: flex;
  gap: 10px;
}

/* Grade card */
.rv-grade-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rv-grade-row {
  display: flex;
  gap: 10px;
}

.rv-grade-btn {
  flex: 1;
  padding: 14px 0;
  border-radius: var(--radius-sm);
  border: 2px solid #E0E0E0;
  background: var(--c-white);
  font-size: 20px;
  font-weight: 700;
  color: var(--c-text-dark);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  font-family: var(--font-main);

  &:hover { border-color: var(--c-purple-text); }

  &--active {
    border-color: var(--c-purple-text);
    background: var(--c-purple-light);
    color: var(--c-purple-text);
  }
}

/* Field */
.rv-field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label {
    font-size: 13px;
    color: var(--c-text-gray);
    font-weight: 500;
  }

  &__hint {
    font-size: 12px;
    color: var(--c-text-gray);
  }
}

.rv-input {
  padding: 10px 14px;
  border: 1.5px solid #E0E0E0;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-main);
  color: var(--c-text-dark);
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: var(--c-purple); }
}

.rv-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #E0E0E0;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--font-main);
  color: var(--c-text-dark);
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  line-height: 1.55;

  &::placeholder { color: #BDBDBD; }
  &:focus { border-color: var(--c-purple); }
}

/* Buttons */
.rv-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 22px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
  font-family: var(--font-main);

  &--filled {
    background: var(--c-purple-text);
    color: var(--c-white);
    &:hover { opacity: 0.88; }
  }

  &--outline {
    border: 1.5px solid var(--c-purple-text);
    color: var(--c-purple-text);
    background: transparent;
    &:hover { background: var(--c-purple-light); }
  }

  &--full { width: 100%; }
}

/* Toast */
.rv-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--c-green);
  color: var(--c-white);
  font-size: 14px;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 999;
  white-space: nowrap;

  &--error { background: var(--c-red); }
}

.toast-enter-active, .toast-leave-active { transition: opacity 0.25s, transform 0.25s; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(-50%) translateY(12px); }

@media (max-width: 900px) {
  .rv-cols { grid-template-columns: 1fr; }
  .rv-right { order: -1; }
}

@media (max-width: 600px) {
  .rv-header { flex-wrap: wrap; gap: 12px; }
  .rv-card { padding: 20px; }
  .rv-grade-btn { padding: 10px 0; font-size: 17px; }
}
</style>
