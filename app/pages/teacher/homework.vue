<script setup lang="ts">
import calendarIcon from '~/assets/icons/PerpleCalendar.svg'

definePageMeta({ layout: 'teacher' })

const form = reactive({
  task: 'Frontend разработка',
  student: 'Иван Иванов',
  group: 'Web-1-2026',
  deadline: '07.05.2026',
  points: '100',
  attempts: 'Неограниченно',
  visibility: 'Сразу',
  comment: ''
})

const tasks = ['Frontend разработка', 'JavaScript: Массивы', 'Алгоритмы сортировки', 'Python ООП', 'CSS Grid']
const students = ['Иван Иванов', 'Мария Смирнова', 'Алексей Козлов', 'Дарья Михайлова', 'Пётр Николаев']
const groups = ['Web-1-2026', 'Web-2-2026', 'Python-A', 'Python-B', 'React-2025']
const pointsOptions = ['60', '80', '100', '120', '150']
const attemptsOptions = ['Неограниченно', '1', '2', '3', '5']
const visibilityOptions = ['Сразу', 'После дедлайна', 'Вручную']

const pendingReview = [
  { id: 1, name: 'Иван Иванов',     task: 'Frontend — Лендинг HTML/\nCSS Про' },
  { id: 2, name: 'Мария Смирнова',  task: 'JS — Работа с массивами' },
  { id: 3, name: 'Алексей Козлов',  task: 'Алгоритмы — Сортировки' },
  { id: 4, name: 'Дарья Михайлова', task: 'Python — ООП' },
  { id: 5, name: 'Пётр Николаев',   task: 'Frontend — Лендинг' }
]

function submit() { /* TODO: POST /api/teacher/homework */ }
function saveDraft() { /* TODO: POST /api/teacher/homework/draft */ }
function review(id: number) { /* TODO: navigate to review page */ }
</script>

<template>
  <div class="hw-page">

    <!-- Левая колонка: форма -->
    <div class="hw-form-card">
      <p class="hw-form-card__section-label">ВЫДАТЬ ДОМАШНЕЕ ЗАДАНИЕ</p>

      <!-- Выбор задачи -->
      <div class="hw-field">
        <label class="hw-field__label">Выбрать задачу из конструктора</label>
        <div class="hw-select-wrap">
          <select v-model="form.task" class="hw-select">
            <option v-for="t in tasks" :key="t" :value="t">{{ t }}</option>
          </select>
          <span class="hw-select-wrap__arrow">&#8964;</span>
        </div>
      </div>

      <!-- Ученик / Группа / Срок сдачи -->
      <div class="hw-row hw-row--3">
        <div class="hw-field">
          <label class="hw-field__label">Ученик</label>
          <div class="hw-select-wrap">
            <select v-model="form.student" class="hw-select">
              <option v-for="s in students" :key="s" :value="s">{{ s }}</option>
            </select>
            <span class="hw-select-wrap__arrow">&#8964;</span>
          </div>
        </div>
        <div class="hw-field">
          <label class="hw-field__label">Группа</label>
          <div class="hw-select-wrap">
            <select v-model="form.group" class="hw-select">
              <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
            </select>
            <span class="hw-select-wrap__arrow">&#8964;</span>
          </div>
        </div>
        <div class="hw-field">
          <label class="hw-field__label">Срок сдачи</label>
          <div class="hw-select-wrap hw-select-wrap--date">
            <input v-model="form.deadline" class="hw-select hw-select--date" type="text" />
            <img :src="calendarIcon" alt="" class="hw-select-wrap__cal" />
          </div>
        </div>
      </div>

      <!-- Баллы / Попытки / Видимость -->
      <div class="hw-row hw-row--3">
        <div class="hw-field">
          <label class="hw-field__label">Баллы</label>
          <div class="hw-select-wrap">
            <select v-model="form.points" class="hw-select">
              <option v-for="p in pointsOptions" :key="p" :value="p">{{ p }}</option>
            </select>
            <span class="hw-select-wrap__arrow">&#8964;</span>
          </div>
        </div>
        <div class="hw-field">
          <label class="hw-field__label">Попытки</label>
          <div class="hw-select-wrap">
            <select v-model="form.attempts" class="hw-select">
              <option v-for="a in attemptsOptions" :key="a" :value="a">{{ a }}</option>
            </select>
            <span class="hw-select-wrap__arrow">&#8964;</span>
          </div>
        </div>
        <div class="hw-field">
          <label class="hw-field__label">Видимость</label>
          <div class="hw-select-wrap">
            <select v-model="form.visibility" class="hw-select">
              <option v-for="v in visibilityOptions" :key="v" :value="v">{{ v }}</option>
            </select>
            <span class="hw-select-wrap__arrow">&#8964;</span>
          </div>
        </div>
      </div>

      <!-- Комментарий -->
      <div class="hw-field">
        <label class="hw-field__label">Комментарий к выдаче (необязательно)</label>
        <textarea
          v-model="form.comment"
          class="hw-textarea"
          placeholder="Напишите уточнения или советы для студентов..."
          rows="5"
        />
      </div>

      <!-- Кнопки -->
      <div class="hw-form-actions">
        <button class="hw-action-btn hw-action-btn--filled" @click="submit">Выдать задание</button>
        <button class="hw-action-btn hw-action-btn--light" @click="saveDraft">Сохранить черновик</button>
      </div>
    </div>

    <!-- Правая колонка: ожидают проверки -->
    <div class="hw-review-card">
      <p class="hw-review-card__label">ОЖИДАЮТ ПРОВЕРКИ</p>
      <div class="hw-review-list">
        <div v-for="item in pendingReview" :key="item.id" class="hw-review-item">
          <div class="hw-review-item__bar" />
          <div class="hw-review-item__info">
            <p class="hw-review-item__name">{{ item.name }}</p>
            <p class="hw-review-item__task">{{ item.task }}</p>
          </div>
          <button class="hw-review-item__btn" @click="review(item.id)">Проверить</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
.hw-page {
  padding-top: 20px;
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
  align-items: start;
}

/* ── Форма ─────────────────────────────────────── */
.hw-form-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__section-label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--c-purple-text);
  }
}

.hw-row {
  display: grid;
  gap: 16px;

  &--3 { grid-template-columns: repeat(3, 1fr); }
}

.hw-field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    font-size: 13px;
    color: var(--c-text-gray);
    font-weight: 500;
  }
}

.hw-select-wrap {
  position: relative;
  display: flex;
  align-items: center;

  &__arrow {
    position: absolute;
    right: 14px;
    font-size: 18px;
    color: var(--c-text-gray);
    pointer-events: none;
    line-height: 1;
  }

  &__cal {
    position: absolute;
    right: 12px;
    width: 18px;
    height: 18px;
    pointer-events: none;
  }

  &--date { }
}

.hw-select {
  width: 100%;
  padding: 11px 40px 11px 14px;
  border: 1.5px solid #E0E0E0;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--font-main);
  color: var(--c-text-dark);
  background: var(--c-white);
  appearance: none;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus { border-color: var(--c-purple); }

  &--date {
    padding-right: 42px;
    cursor: text;
  }
}

.hw-textarea {
  width: 100%;
  padding: 14px 16px;
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

.hw-form-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hw-action-btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-main);
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;

  &--filled {
    background: var(--c-purple-text);
    color: var(--c-white);
    &:hover { opacity: 0.88; }
  }

  &--light {
    background: #F0E8FF;
    color: var(--c-purple-text);
    &:hover { opacity: 0.85; }
  }
}

/* ── Ожидают проверки ────────────────────────── */
.hw-review-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--c-text-gray);
  }
}

.hw-review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hw-review-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--c-white);
  border: 1px solid #EBEBEB;

  &__bar {
    width: 4px;
    align-self: stretch;
    border-radius: 2px;
    background: var(--c-purple-text);
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-bottom: 3px;
  }

  &__task {
    font-size: 13px;
    color: var(--c-text-gray);
    line-height: 1.4;
    white-space: pre-line;
  }

  &__btn {
    flex-shrink: 0;
    padding: 9px 18px;
    border-radius: var(--radius-sm);
    background: var(--c-purple-text);
    color: var(--c-white);
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-main);
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover { opacity: 0.88; }
  }
}

@media (max-width: 900px) {
  .hw-page { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .hw-form-card { padding: 20px; }

  .hw-row--3 { grid-template-columns: 1fr 1fr; }

  .hw-form-actions { flex-direction: column; gap: 10px; }

  .hw-action-btn { width: 100%; }
}

@media (max-width: 480px) {
  .hw-row--3 { grid-template-columns: 1fr; }

  .hw-review-item {
    flex-wrap: wrap;
    gap: 10px;

    &__btn { width: 100%; text-align: center; }
  }
}
</style>
