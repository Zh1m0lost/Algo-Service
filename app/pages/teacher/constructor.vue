<script setup lang="ts">
import { assignPair, countCorrect } from '~/utils/matchTask'

definePageMeta({ layout: 'teacher' })

type Pair = { id: number; left: string; right: string }

let nextId = 1
const blankPair = (): Pair => ({ id: nextId++, left: '', right: '' })

const taskName = ref('')
const points   = ref(20)
const pairs    = ref<Pair[]>([blankPair(), blankPair(), blankPair()])

// Для превью и сохранения берём только полностью заполненные пары.
const completePairs = computed(() => pairs.value.filter(p => p.left.trim() && p.right.trim()))
const leftItems  = computed(() => completePairs.value.map(p => ({ id: p.id, value: p.left.trim() })))
const rightItems = computed(() => completePairs.value.map(p => ({ id: p.id, value: p.right.trim() })))

function addPair() {
  pairs.value.push(blankPair())
}
function removePair(id: number) {
  pairs.value = pairs.value.filter(p => p.id !== id)
  if (!pairs.value.length) pairs.value.push(blankPair())
}

// ── Превью: интерактивная проверка сопоставления ──
// assignments: индекс слева → индекс справа; правильная пара — одинаковые индексы.
const assignments  = ref<Record<number, number>>({})
const selectedLeft = ref<number | null>(null)

function resetPreview() {
  assignments.value = {}
  selectedLeft.value = null
}

// Если набор заполненных пар изменился — сбрасываем превью, чтобы индексы не разъезжались.
watch(() => completePairs.value.length, resetPreview)

function clickLeft(idx: number) {
  selectedLeft.value = selectedLeft.value === idx ? null : idx
}
function clickRight(rIdx: number) {
  if (selectedLeft.value === null) return
  assignments.value = assignPair(assignments.value, selectedLeft.value, rIdx)
  selectedLeft.value = null
}

function isRightAssigned(rIdx: number) { return Object.values(assignments.value).includes(rIdx) }
function isLeftCorrect(lIdx: number)   { return lIdx in assignments.value && assignments.value[lIdx] === lIdx }
function isLeftWrong(lIdx: number)     { return lIdx in assignments.value && assignments.value[lIdx] !== lIdx }
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

const correctCount = computed(() => countCorrect(assignments.value))
const totalPairs   = computed(() => Math.min(leftItems.value.length, rightItems.value.length))

// ── Валидация и сохранение ──
const canSave = computed(() =>
  taskName.value.trim().length > 0 && completePairs.value.length >= 2 && points.value > 0,
)

const saving = ref(false)
const toast  = reactive({ show: false, text: '', ok: true })
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(text: string, ok = true) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text
  toast.ok = ok
  toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

function clearAll() {
  taskName.value = ''
  points.value = 20
  pairs.value = [blankPair(), blankPair()]
  resetPreview()
}

async function saveTask() {
  if (!canSave.value) {
    showToast('Заполните название и минимум 2 полные пары', false)
    return
  }
  saving.value = true
  try {
    await useApi()('/teacher/tasks', {
      method: 'POST',
      body: {
        name: taskName.value.trim(),
        points: points.value,
        leftItems:  leftItems.value.map(i => ({ value: i.value })),
        rightItems: rightItems.value.map(i => ({ value: i.value })),
      },
    })
    showToast('Задание сохранено')
    clearAll()
  } catch {
    showToast('Не удалось сохранить задание', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="con-page">

    <!-- ── Редактор ──────────────────────────────── -->
    <div class="con-editor">
      <div class="con-editor__head">
        <h1 class="con-editor__title">Конструктор задач</h1>
        <span class="con-editor__type">Тип: сопоставление</span>
      </div>

      <!-- Название и баллы -->
      <div class="con-meta">
        <label class="con-field con-field--grow">
          <span class="con-field__label">Название задания</span>
          <input
            v-model="taskName"
            class="con-field__input"
            placeholder="Например: сопоставьте методы массива с их назначением"
          />
        </label>
        <label class="con-field">
          <span class="con-field__label">Баллы</span>
          <input v-model.number="points" type="number" min="1" class="con-field__input con-field__input--num" />
        </label>
      </div>

      <!-- Пары -->
      <div class="con-pairs">
        <p class="con-hint">
          Каждая строка — правильная пара: слева элемент, справа верное соответствие. Нужно минимум 2 пары.
        </p>

        <div class="con-pairs__head">
          <span>Элемент</span>
          <span>Правильное соответствие</span>
        </div>

        <div v-for="(pair, idx) in pairs" :key="pair.id" class="con-pair">
          <span class="con-pair__num">{{ idx + 1 }}</span>
          <input v-model="pair.left" class="con-pair__input" :placeholder="`Элемент ${idx + 1}`" />
          <span class="con-pair__arrow">↔</span>
          <input v-model="pair.right" class="con-pair__input" :placeholder="`Соответствие ${idx + 1}`" />
          <button class="con-pair__del" title="Удалить пару" @click="removePair(pair.id)">🗑️</button>
        </div>

        <button class="con-add-btn" @click="addPair">+ Добавить пару</button>
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
        <div class="con-preview__score-row">
          <span class="con-preview__score">Сопоставлено (верно): {{ correctCount }} / {{ totalPairs }}</span>
          <button class="con-reset-btn" @click="resetPreview">Сбросить</button>
        </div>

      </div>
    </div>

    <!-- Действия -->
    <div class="con-footer">
      <button class="con-clear-btn" @click="clearAll">Очистить</button>
      <button class="con-save-btn" :disabled="!canSave || saving" @click="saveTask">
        {{ saving ? 'Сохранение…' : 'Сохранить задание' }}
      </button>
    </div>

  </div>

  <!-- Toast -->
  <Transition name="toast">
    <div v-if="toast.show" class="con-toast" :class="{ 'con-toast--error': !toast.ok }">{{ toast.text }}</div>
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

/* ── Кнопки действий ───────────────────────── */
.con-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

  .con-footer { flex-direction: column-reverse; }

  .con-save-btn,
  .con-clear-btn { width: 100%; }
}

@media (max-width: 480px) {
  .con-item {
    flex-wrap: wrap;
    &__label { min-width: 100%; }
  }
}

/* ── Шапка редактора ── */
.con-editor__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.con-editor__type {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-purple-text);
  background: var(--c-purple-light);
  padding: 5px 12px;
  border-radius: var(--radius-full);
}

/* ── Название + баллы ── */
.con-meta {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.con-field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--grow { flex: 1; min-width: 240px; }

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: var(--c-text-gray);
  }

  &__input {
    border: 1.5px solid #E0E0E0;
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    font-size: 14px;
    font-family: var(--font-main);
    color: var(--c-text-dark);
    outline: none;
    transition: border-color 0.2s;

    &:focus { border-color: var(--c-purple); }
    &--num { width: 90px; }
  }
}

/* ── Пары ── */
.con-pairs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.con-hint {
  font-size: 13px;
  color: var(--c-text-gray);
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}

.con-pairs__head {
  display: grid;
  grid-template-columns: 28px 1fr 28px 1fr 36px;
  gap: 10px;
  padding: 0 2px;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-text-gray);
  text-transform: uppercase;
  letter-spacing: 0.04em;

  span:first-of-type { grid-column: 2; }
  span:last-of-type  { grid-column: 4; }
}

.con-pair {
  display: grid;
  grid-template-columns: 28px 1fr 28px 1fr 36px;
  gap: 10px;
  align-items: center;

  &__num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--c-purple-light);
    color: var(--c-purple-text);
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__input {
    width: 100%;
    box-sizing: border-box;
    border: 1.5px solid #E0E0E0;
    border-radius: var(--radius-sm);
    padding: 9px 12px;
    font-size: 14px;
    font-family: var(--font-main);
    color: var(--c-text-dark);
    outline: none;
    transition: border-color 0.2s;

    &:focus { border-color: var(--c-purple); }
  }

  &__arrow {
    text-align: center;
    color: var(--c-purple-text);
    font-size: 16px;
  }

  &__del {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    opacity: 0.6;
    transition: opacity 0.2s;
    &:hover { opacity: 1; }
  }
}

/* ── Счёт превью + сброс ── */
.con-preview__score-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.con-reset-btn {
  padding: 7px 18px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--c-purple-text);
  background: transparent;
  color: var(--c-purple-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-main);
  transition: background 0.15s;
  &:hover { background: rgba(255, 255, 255, 0.5); }
}

/* ── Очистить + disabled + ошибка ── */
.con-clear-btn {
  padding: 12px 28px;
  border-radius: var(--radius-full);
  background: transparent;
  border: 1.5px solid #D0D0D0;
  color: var(--c-text-dark);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-main);
  transition: border-color 0.2s, color 0.2s;
  &:hover { border-color: var(--c-purple-text); color: var(--c-purple-text); }
}

.con-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.con-toast--error { background: var(--c-red); }

/* ── Адаптив пар ── */
@media (max-width: 600px) {
  .con-pairs__head { display: none; }

  .con-pair {
    grid-template-columns: 28px 1fr 36px;
    grid-template-areas:
      "num left del"
      "num right del";
    row-gap: 8px;

    &__num   { grid-area: num; align-self: start; }
    &__del   { grid-area: del; align-self: start; }
    &__arrow { display: none; }
  }

  .con-pair__input:nth-of-type(1) { grid-area: left; }
  .con-pair__input:nth-of-type(2) { grid-area: right; }
}
</style>
