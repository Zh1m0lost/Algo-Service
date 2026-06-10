<script setup lang="ts">
definePageMeta({ layout: 'teacher' })

// Редактор
const taskName = ref('Распределите методы массива по их назначению')
const points   = ref(25)

const leftItems = ref([
  { id: 1, label: 'Метод 1', value: 'map()'    },
  { id: 2, label: 'Метод 2', value: 'filter()'  },
  { id: 3, label: 'Метод 3', value: 'reduce()'  },
  { id: 4, label: 'Метод 4', value: 'find()'    }
])

const rightItems = ref([
  { id: 1, label: 'Вариант 1',  value: 'Возвращает новый массив'  },
  { id: 2, label: 'Вариант 2',  value: 'Фильтрует элементы'       },
  { id: 3, label: 'Вариант 3',  value: 'Возвращает одно значение' },
  { id: 4, label: 'Вариант 4',  value: 'Находит первый элемент'   }
])

let nextLeftId  = 5
let nextRightId = 5

function addLeft() {
  leftItems.value.push({ id: nextLeftId++, label: `Метод ${leftItems.value.length + 1}`, value: '' })
}
function addRight() {
  rightItems.value.push({ id: nextRightId++, label: `Вариант ${rightItems.value.length + 1}`, value: '' })
}
function removeLeft(id: number) {
  leftItems.value = leftItems.value.filter(i => i.id !== id)
  assignments.value = {}
}
function removeRight(id: number) {
  rightItems.value = rightItems.value.filter(i => i.id !== id)
  assignments.value = {}
}

// Превью — логика сопоставления
// assignments: leftIndex → rightIndex
const assignments  = ref<Record<number, number>>({})
const selectedLeft = ref<number | null>(null)

function clickLeft(idx: number) {
  selectedLeft.value = selectedLeft.value === idx ? null : idx
}

function clickRight(rIdx: number) {
  if (selectedLeft.value === null) return
  const lIdx = selectedLeft.value

  // Снять предыдущее назначение этого правого слота
  for (const [k, v] of Object.entries(assignments.value)) {
    if (v === rIdx) { delete assignments.value[+k] }
  }
  // Если уже назначен — снять
  if (assignments.value[lIdx] === rIdx) {
    delete assignments.value[lIdx]
  } else {
    assignments.value[lIdx] = rIdx
  }
  assignments.value = { ...assignments.value }
  selectedLeft.value = null
}

function isLeftAssigned(idx: number)  { return idx in assignments.value }
function isRightAssigned(rIdx: number) { return Object.values(assignments.value).includes(rIdx) }
function isLeftCorrect(lIdx: number)  { return lIdx in assignments.value && assignments.value[lIdx] === lIdx }
function isLeftWrong(lIdx: number)    { return lIdx in assignments.value && assignments.value[lIdx] !== lIdx }
function isRightCorrect(rIdx: number) {
  const e = Object.entries(assignments.value).find(([, v]) => v === rIdx)
  return e ? +e[0] === rIdx : false
}
function isRightWrong(rIdx: number) {
  const e = Object.entries(assignments.value).find(([, v]) => v === rIdx)
  return e ? +e[0] !== rIdx : false
}
function getLeftForRight(rIdx: number) {
  const e = Object.entries(assignments.value).find(([, v]) => v === rIdx)
  return e ? leftItems.value[+e[0]]?.value : null
}

const correctCount = computed(() =>
  Object.entries(assignments.value).filter(([l, r]) => +l === +r).length
)
const totalPairs = computed(() => Math.min(leftItems.value.length, rightItems.value.length))

const savedToast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function saveTask() {
  if (toastTimer) clearTimeout(toastTimer)
  savedToast.value = true
  toastTimer = setTimeout(() => { savedToast.value = false }, 2500)
}
</script>

<template>
  <div class="con-page">

    <!-- ── Редактор ──────────────────────────────── -->
    <div class="con-editor">
      <h1 class="con-editor__title">Конструктор задач</h1>

      <!-- Название задания -->
      <div class="con-name-wrap">
        <span class="con-name-label">Название задания:</span>
        <input v-model="taskName" class="con-name-input" />
      </div>

      <div class="con-cols">

        <!-- Левая колонка -->
        <div class="con-col">
          <p class="con-col__head">Элементы для сопоставления</p>
          <div class="con-items">
            <div v-for="(item, idx) in leftItems" :key="item.id" class="con-item">
              <span class="con-item__label">{{ item.label }}:</span>
              <input v-model="item.value" class="con-item__input" :placeholder="`Элемент ${idx + 1}`" />
              <button class="con-item__del" @click="removeLeft(item.id)">🗑️</button>
            </div>
          </div>
          <button class="con-add-btn" @click="addLeft">+ Добавить вариант</button>
        </div>

        <!-- Правая колонка -->
        <div class="con-col">
          <p class="con-col__head">Варианты ответов</p>
          <div class="con-items">
            <div v-for="(item, idx) in rightItems" :key="item.id" class="con-item">
              <span class="con-item__label">{{ item.label }}:</span>
              <input v-model="item.value" class="con-item__input" :placeholder="`Описание ${idx + 1}`" />
              <button class="con-item__del" @click="removeRight(item.id)">🗑️</button>
            </div>
          </div>
          <button class="con-add-btn" @click="addRight">+ Добавить вариант</button>
        </div>

      </div>

      <!-- Баллы -->
      <div class="con-points">
        <span class="con-points__label">Баллы на задание:</span>
        <input v-model.number="points" class="con-points__input" type="number" min="1" />
      </div>
    </div>

    <!-- ── Превью ──────────────────────────────── -->
    <div class="con-preview">
      <div class="con-preview__inner">

        <h2 class="con-preview__title">{{ taskName }}</h2>

        <div class="con-preview__cols">

          <!-- Левая: методы -->
          <div class="con-preview__col">
            <p class="con-preview__col-head">Методы</p>
            <div class="con-preview__items">
              <div
                v-for="(item, idx) in leftItems"
                :key="item.id"
                class="con-prev-item"
                :class="{
                  'con-prev-item--selected': selectedLeft === idx,
                  'con-prev-item--assigned': isLeftCorrect(idx),
                  'con-prev-item--wrong':    isLeftWrong(idx)
                }"
                @click="clickLeft(idx)"
              >
                <span class="con-prev-item__bar" />
                <span class="con-prev-item__text">{{ item.value || `Элемент ${idx+1}` }}</span>
                <span class="con-prev-item__drag">⋮⋮</span>
              </div>
              <p class="con-preview__hint">Выберите метод</p>
            </div>
          </div>

          <!-- Правая: назначение -->
          <div class="con-preview__col">
            <p class="con-preview__col-head">Назначение</p>
            <div class="con-preview__items">
              <div
                v-for="(item, rIdx) in rightItems"
                :key="item.id"
                class="con-prev-item con-prev-item--right"
                :class="{
                  'con-prev-item--matched':   isRightCorrect(rIdx),
                  'con-prev-item--wrong':     isRightWrong(rIdx),
                  'con-prev-item--droppable': selectedLeft !== null && !isRightAssigned(rIdx)
                }"
                @click="clickRight(rIdx)"
              >
                <span class="con-prev-item__bar" />
                <span class="con-prev-item__text">{{ item.value || `Описание ${rIdx+1}` }}</span>
                <span v-if="isRightAssigned(rIdx)" class="con-prev-item__matched-label">
                  {{ getLeftForRight(rIdx) }}
                </span>
                <span class="con-prev-item__arrow">←</span>
              </div>
              <p class="con-preview__hint">Нажмите сюда</p>
            </div>
          </div>

        </div>

        <!-- Счёт -->
        <div class="con-preview__score">
          Сопоставлено (верно): {{ correctCount }} / {{ totalPairs }}
        </div>

      </div>
    </div>

    <!-- Сохранить -->
    <div class="con-footer">
      <button class="con-save-btn" @click="saveTask">Сохранить задание</button>
    </div>

  </div>

  <!-- Toast -->
  <Transition name="toast">
    <div v-if="savedToast" class="con-toast">Задание сохранено</div>
  </Transition>
</template>

<style lang="scss">
.con-page {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Редактор ───────────────────────────────── */
.con-editor {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__title {
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--c-text-dark);
  }
}

/* Название задания */
.con-name-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--c-purple-light);
  border-radius: var(--radius-full);
  padding: 8px 18px;
  max-width: 100%;
}

.con-name-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-purple-text);
  white-space: nowrap;
  flex-shrink: 0;
}

.con-name-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--c-purple-text);
  font-family: var(--font-main);
  font-weight: 500;
  width: 360px;
  min-width: 0;
}

/* Колонки */
.con-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.con-col {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__head {
    font-size: 14px;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-bottom: 4px;
  }
}

/* Элементы */
.con-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.con-item {
  display: flex;
  align-items: center;
  gap: 10px;

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: var(--c-text-dark);
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 80px;
  }

  &__input {
    flex: 1;
    border: 1.5px solid #E0E0E0;
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-size: 13px;
    font-family: var(--font-main);
    color: var(--c-text-dark);
    outline: none;
    transition: border-color 0.2s;

    &:focus { border-color: var(--c-purple); }
  }

  &__del {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    opacity: 0.6;
    transition: opacity 0.2s;
    flex-shrink: 0;
    &:hover { opacity: 1; }
  }
}

/* Кнопка добавить */
.con-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--c-purple-text);
  background: transparent;
  color: var(--c-purple-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-main);
  align-self: flex-start;
  transition: background 0.15s;

  &:hover { background: var(--c-purple-light); }
}

/* Баллы */
.con-points {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--c-yellow-light);
  border-radius: var(--radius-full);
  padding: 8px 18px;
  align-self: flex-start;

  &__label {
    font-size: 13px;
    font-weight: 700;
    color: var(--c-yellow-text);
  }

  &__input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 13px;
    font-weight: 700;
    color: var(--c-yellow-text);
    font-family: var(--font-main);
    width: 40px;
    text-align: left;
  }
}

/* ── Превью ─────────────────────────────────── */
.con-preview {
  background: #DDD8EE;
  border-radius: var(--radius-md);
  padding: 24px;
}

.con-preview__inner {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.con-preview__title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--c-text-dark);
}

.con-preview__cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.con-preview__col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.con-preview__col-head {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-dark);
  margin-bottom: 4px;
}

.con-preview__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.con-preview__hint {
  font-size: 13px;
  color: #BBB;
  text-align: center;
  margin-top: 4px;
}

/* Превью-элементы */
.con-prev-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: #F8F8F8;
  border: 1.5px solid #EBEBEB;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  position: relative;

  &:hover { border-color: var(--c-purple); }

  &__bar {
    width: 4px;
    height: 32px;
    border-radius: 2px;
    background: var(--c-purple);
    flex-shrink: 0;
    margin-right: 4px;
  }

  &__text {
    flex: 1;
    font-size: 14px;
    color: var(--c-text-dark);
    font-weight: 500;
  }

  &__drag {
    font-size: 14px;
    color: #BBB;
    letter-spacing: -2px;
    flex-shrink: 0;
  }

  &__arrow {
    font-size: 16px;
    color: var(--c-text-gray);
    flex-shrink: 0;
  }

  &__matched-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--c-purple-text);
    background: var(--c-purple-light);
    padding: 2px 8px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &--selected {
    border-color: var(--c-purple);
    background: var(--c-purple-light);
  }

  &--assigned {
    border-color: var(--c-green);
    background: var(--c-green-light);
  }

  &--matched {
    border-color: var(--c-green);
    background: var(--c-green-light);
  }

  &--wrong {
    border-color: var(--c-red);
    background: #FFE0E0;

    .con-prev-item__matched-label {
      color: var(--c-red);
      background: #FFCCCC;
    }
  }

  &--droppable {
    border-color: var(--c-purple);
    border-style: dashed;
  }

  &--right { cursor: pointer; }
}

/* Счёт */
.con-preview__score {
  align-self: center;
  display: inline-flex;
  padding: 8px 24px;
  border-radius: var(--radius-full);
  background: var(--c-purple-text);
  color: var(--c-white);
  font-size: 14px;
  font-weight: 600;
}

/* ── Кнопка сохранить ───────────────────────── */
.con-footer {
  display: flex;
  justify-content: flex-end;
}

.con-save-btn {
  padding: 12px 32px;
  border-radius: var(--radius-full);
  background: var(--c-purple-text);
  color: var(--c-white);
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: var(--font-main);
  transition: opacity 0.2s;

  &:hover { opacity: 0.88; }
}

/* Toast */
.con-toast {
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
}

.toast-enter-active, .toast-leave-active { transition: opacity 0.25s, transform 0.25s; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(-50%) translateY(12px); }

@media (max-width: 768px) {
  .con-editor { padding: 20px; }

  .con-cols { grid-template-columns: 1fr; gap: 20px; }

  .con-preview__cols { grid-template-columns: 1fr; gap: 20px; }

  .con-preview__inner { padding: 20px; }

  .con-name-wrap { width: 100%; box-sizing: border-box; }

  .con-name-input { width: 100%; }

  .con-footer { justify-content: stretch; }

  .con-save-btn { width: 100%; }
}

@media (max-width: 480px) {
  .con-item {
    flex-wrap: wrap;
    &__label { min-width: 100%; }
  }
}
</style>
