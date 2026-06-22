<script setup lang="ts">
import { assignPair } from '~/utils/matchTask'

definePageMeta({ layout: 'teacher' })

const MAX_POINTS = 40

type TaskType = 'single' | 'multiple' | 'input' | 'match'
const types: { key: TaskType; label: string }[] = [
  { key: 'single',   label: 'Одиночный выбор' },
  { key: 'multiple', label: 'Множественный выбор' },
  { key: 'input',    label: 'Ввод ответа' },
  { key: 'match',    label: 'Сопоставление' },
]

const type     = ref<TaskType>('single')
const taskName = ref('')
const points   = ref(20)

watch(points, (v) => {
  if (typeof v !== 'number' || Number.isNaN(v)) return
  if (v > MAX_POINTS) points.value = MAX_POINTS
  else if (v < 1) points.value = 1
})

// ── Варианты (single / multiple) ──
let optId = 1
const blankOption = () => ({ id: optId++, value: '', correct: false })
const options   = ref([blankOption(), blankOption(), blankOption()])
const correctId = ref<number | null>(null) // выбранный правильный для single

function addOption() { options.value.push(blankOption()) }
function removeOption(id: number) {
  options.value = options.value.filter(o => o.id !== id)
  if (correctId.value === id) correctId.value = null
  if (!options.value.length) options.value.push(blankOption())
}
const completeOptions = computed(() => options.value.filter(o => o.value.trim()))

// ── Ответы (input) ──
let ansId = 1
const blankAnswer = () => ({ id: ansId++, value: '' })
const answers = ref([blankAnswer()])
function addAnswer() { answers.value.push(blankAnswer()) }
function removeAnswer(id: number) {
  answers.value = answers.value.filter(a => a.id !== id)
  if (!answers.value.length) answers.value.push(blankAnswer())
}
const completeAnswers = computed(() => answers.value.filter(a => a.value.trim()))

// ── Пары (match) ──
let pairId = 1
const blankPair = () => ({ id: pairId++, left: '', right: '' })
const pairs = ref([blankPair(), blankPair(), blankPair()])
function addPair() { pairs.value.push(blankPair()) }
function removePair(id: number) {
  pairs.value = pairs.value.filter(p => p.id !== id)
  if (!pairs.value.length) pairs.value.push(blankPair())
}
const completePairs = computed(() => pairs.value.filter(p => p.left.trim() && p.right.trim()))

// ── Превью сопоставления (с перемешиванием) ──
const previewLeft = computed(() =>
  completePairs.value.map((p, i) => ({ id: p.id, idx: i, value: p.left.trim() })),
)
const rightOrder = ref<number[]>([])
watch(() => completePairs.value.length, (n) => {
  rightOrder.value = Array.from({ length: n }, (_, i) => i)
  resetPreview()
}, { immediate: true })

const previewRight = computed(() =>
  rightOrder.value.map((origIdx, dr) => ({
    key: completePairs.value[origIdx]?.id ?? dr,
    origIdx,
    value: completePairs.value[origIdx]?.right.trim() ?? '',
  })),
)

function shuffle() {
  const arr = [...rightOrder.value]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  rightOrder.value = arr
  resetPreview()
}

const assignments  = ref<Record<number, number>>({}) // leftIdx → rightDisplayIdx
const selectedLeft = ref<number | null>(null)
function resetPreview() { assignments.value = {}; selectedLeft.value = null }

function clickLeft(li: number) { selectedLeft.value = selectedLeft.value === li ? null : li }
function clickRight(dr: number) {
  if (selectedLeft.value === null) return
  assignments.value = assignPair(assignments.value, selectedLeft.value, dr)
  selectedLeft.value = null
}
function leftOf(dr: number): number | null {
  const e = Object.entries(assignments.value).find(([, v]) => v === dr)
  return e ? +e[0] : null
}
function isLeftCorrect(li: number)  { return li in assignments.value && previewRight.value[assignments.value[li]]?.origIdx === li }
function isLeftWrong(li: number)    { return li in assignments.value && previewRight.value[assignments.value[li]]?.origIdx !== li }
function isRightAssigned(dr: number){ return Object.values(assignments.value).includes(dr) }
function isRightCorrect(dr: number) { const l = leftOf(dr); return l !== null && previewRight.value[dr]?.origIdx === l }
function isRightWrong(dr: number)   { const l = leftOf(dr); return l !== null && previewRight.value[dr]?.origIdx !== l }
function rightMatchedLabel(dr: number) { const l = leftOf(dr); return l !== null ? previewLeft.value[l]?.value : null }

const correctCount = computed(() =>
  Object.entries(assignments.value).filter(([l, dr]) => previewRight.value[dr]?.origIdx === +l).length,
)
const totalPairs = computed(() => completePairs.value.length)

// ── Валидация ──
const canSave = computed(() => {
  if (!taskName.value.trim() || points.value < 1) return false
  switch (type.value) {
    case 'single':   return completeOptions.value.length >= 2 && correctId.value !== null && !!options.value.find(o => o.id === correctId.value)?.value.trim()
    case 'multiple': return completeOptions.value.length >= 2 && completeOptions.value.some(o => o.correct)
    case 'input':    return completeAnswers.value.length >= 1
    case 'match':    return completePairs.value.length >= 2
  }
})

// ── Сохранение ──
const saving = ref(false)
const toast  = reactive({ show: false, text: '', ok: true })
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string, ok = true) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.text = text; toast.ok = ok; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

function clearAll() {
  taskName.value = ''
  points.value = 20
  options.value = [blankOption(), blankOption(), blankOption()]
  correctId.value = null
  answers.value = [blankAnswer()]
  pairs.value = [blankPair(), blankPair(), blankPair()]
  resetPreview()
}

function buildBody(): Record<string, any> {
  const base = { name: taskName.value.trim(), points: points.value, type: type.value }
  if (type.value === 'single') {
    const opts = completeOptions.value
    return { ...base, options: opts.map(o => ({ value: o.value.trim() })), correct: opts.findIndex(o => o.id === correctId.value) }
  }
  if (type.value === 'multiple') {
    const opts = completeOptions.value
    const correct = opts.map((o, i) => (o.correct ? i : -1)).filter(i => i >= 0)
    return { ...base, options: opts.map(o => ({ value: o.value.trim() })), correct }
  }
  if (type.value === 'input') {
    return { ...base, answers: completeAnswers.value.map(a => a.value.trim()) }
  }
  return {
    ...base,
    leftItems:  completePairs.value.map(p => ({ value: p.left.trim() })),
    rightItems: completePairs.value.map(p => ({ value: p.right.trim() })),
  }
}

async function saveTask() {
  if (!canSave.value) { showToast('Заполните название и условие задачи', false); return }
  saving.value = true
  try {
    await useApi()('/teacher/tasks', { method: 'POST', body: buildBody() })
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

    <!-- ── Редактор ── -->
    <div class="con-editor">
      <h1 class="con-editor__title">Конструктор задач</h1>

      <!-- Тип задачи -->
      <div class="con-types">
        <button
          v-for="t in types"
          :key="t.key"
          class="con-type"
          :class="{ 'con-type--active': type === t.key }"
          @click="type = t.key"
        >{{ t.label }}</button>
      </div>

      <!-- Название и баллы -->
      <div class="con-meta">
        <label class="con-field con-field--grow">
          <span class="con-field__label">Название задания</span>
          <input v-model="taskName" class="con-field__input" placeholder="Сформулируйте вопрос или задание" />
        </label>
        <label class="con-field">
          <span class="con-field__label">Баллы (до {{ MAX_POINTS }})</span>
          <input v-model.number="points" type="number" min="1" :max="MAX_POINTS" class="con-field__input con-field__input--num" />
        </label>
      </div>

      <!-- Single / Multiple -->
      <div v-if="type === 'single' || type === 'multiple'" class="con-block">
        <p class="con-hint">
          Впишите варианты и отметьте
          {{ type === 'single' ? 'один правильный' : 'все правильные' }} ответ{{ type === 'single' ? '' : 'ы' }}.
        </p>
        <div v-for="(opt, idx) in options" :key="opt.id" class="con-opt">
          <input
            v-if="type === 'single'"
            type="radio"
            class="con-opt__mark"
            :checked="correctId === opt.id"
            @change="correctId = opt.id"
          />
          <input v-else v-model="opt.correct" type="checkbox" class="con-opt__mark" />
          <input v-model="opt.value" class="con-opt__input" :placeholder="`Вариант ${idx + 1}`" />
          <button class="con-icon-btn" title="Удалить" @click="removeOption(opt.id)">🗑️</button>
        </div>
        <button class="con-add-btn" @click="addOption">+ Добавить вариант</button>
      </div>

      <!-- Input -->
      <div v-else-if="type === 'input'" class="con-block">
        <p class="con-hint">Перечислите допустимые правильные ответы (любой из них засчитывается).</p>
        <div v-for="(ans, idx) in answers" :key="ans.id" class="con-opt">
          <span class="con-opt__bullet">✓</span>
          <input v-model="ans.value" class="con-opt__input" :placeholder="`Правильный ответ ${idx + 1}`" />
          <button class="con-icon-btn" title="Удалить" @click="removeAnswer(ans.id)">🗑️</button>
        </div>
        <button class="con-add-btn" @click="addAnswer">+ Добавить ответ</button>
      </div>

      <!-- Match -->
      <div v-else class="con-block">
        <p class="con-hint">Каждая строка — правильная пара: слева элемент, справа верное соответствие. Нужно минимум 2 пары.</p>
        <div class="con-pairs__head">
          <span>Элемент</span>
          <span>Правильное соответствие</span>
        </div>
        <div v-for="(pair, idx) in pairs" :key="pair.id" class="con-pair">
          <span class="con-pair__num">{{ idx + 1 }}</span>
          <input v-model="pair.left" class="con-pair__input" :placeholder="`Элемент ${idx + 1}`" />
          <span class="con-pair__arrow">↔</span>
          <input v-model="pair.right" class="con-pair__input" :placeholder="`Соответствие ${idx + 1}`" />
          <button class="con-icon-btn" title="Удалить пару" @click="removePair(pair.id)">🗑️</button>
        </div>
        <button class="con-add-btn" @click="addPair">+ Добавить пару</button>
      </div>
    </div>

    <!-- ── Превью ── -->
    <div class="con-preview">
      <div class="con-preview__inner">
        <h2 class="con-preview__title">{{ taskName || 'Название задания' }}</h2>

        <!-- single / multiple -->
        <div v-if="type === 'single' || type === 'multiple'" class="con-preview__list">
          <div
            v-for="opt in completeOptions"
            :key="opt.id"
            class="con-prev-opt"
            :class="{ 'con-prev-opt--correct': opt.id === correctId || (type === 'multiple' && opt.correct) }"
          >
            <span class="con-prev-opt__mark">{{ type === 'single' ? '◉' : '☑' }}</span>
            <span>{{ opt.value }}</span>
            <span v-if="opt.id === correctId || (type === 'multiple' && opt.correct)" class="con-prev-opt__tag">верно</span>
          </div>
          <p v-if="!completeOptions.length" class="con-preview__empty">Добавьте варианты ответа</p>
        </div>

        <!-- input -->
        <div v-else-if="type === 'input'" class="con-preview__list">
          <input class="con-field__input" placeholder="Поле ввода ученика" disabled />
          <div class="con-prev-answers">
            <span v-for="a in completeAnswers" :key="a.id" class="con-prev-answer">{{ a.value }}</span>
            <p v-if="!completeAnswers.length" class="con-preview__empty">Добавьте правильные ответы</p>
          </div>
        </div>

        <!-- match -->
        <template v-else>
          <div class="con-preview__cols">
            <div class="con-preview__col">
              <p class="con-preview__col-head">Элементы</p>
              <div class="con-preview__items">
                <div
                  v-for="item in previewLeft"
                  :key="item.id"
                  class="con-prev-item"
                  :class="{
                    'con-prev-item--selected': selectedLeft === item.idx,
                    'con-prev-item--assigned': isLeftCorrect(item.idx),
                    'con-prev-item--wrong':    isLeftWrong(item.idx),
                  }"
                  @click="clickLeft(item.idx)"
                >
                  <span class="con-prev-item__bar" />
                  <span class="con-prev-item__text">{{ item.value }}</span>
                </div>
                <p v-if="!previewLeft.length" class="con-preview__empty">Добавьте пары</p>
              </div>
            </div>

            <div class="con-preview__col">
              <div class="con-preview__col-head con-preview__col-head--row">
                <span>Соответствия</span>
                <button v-if="previewRight.length" class="con-mini-btn" @click="shuffle">🔀 Перемешать</button>
              </div>
              <div class="con-preview__items">
                <div
                  v-for="(item, dr) in previewRight"
                  :key="item.key"
                  class="con-prev-item con-prev-item--right"
                  :class="{
                    'con-prev-item--matched':   isRightCorrect(dr),
                    'con-prev-item--wrong':     isRightWrong(dr),
                    'con-prev-item--droppable': selectedLeft !== null && !isRightAssigned(dr),
                  }"
                  @click="clickRight(dr)"
                >
                  <span class="con-prev-item__bar" />
                  <span class="con-prev-item__text">{{ item.value }}</span>
                  <span v-if="isRightAssigned(dr)" class="con-prev-item__matched-label">{{ rightMatchedLabel(dr) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="con-preview__score-row">
            <span class="con-preview__score">Сопоставлено (верно): {{ correctCount }} / {{ totalPairs }}</span>
            <button class="con-reset-btn" @click="resetPreview">Сбросить</button>
          </div>
        </template>
      </div>
    </div>

    <!-- ── Действия ── -->
    <div class="con-footer">
      <button class="con-clear-btn" @click="clearAll">Очистить</button>
      <button class="con-save-btn" :disabled="!canSave || saving" @click="saveTask">
        {{ saving ? 'Сохранение…' : 'Сохранить задание' }}
      </button>
    </div>
  </div>

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

/* ── Редактор ── */
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

.con-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.con-type {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid #E0E0E0;
  background: transparent;
  color: var(--c-text-dark);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-main);
  transition: all 0.15s;

  &:hover { border-color: var(--c-purple-text); color: var(--c-purple-text); }
  &--active { background: var(--c-purple-text); border-color: var(--c-purple-text); color: var(--c-white); }
}

/* Название + баллы */
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
    width: 100%;
    box-sizing: border-box;
    border: 1.5px solid #E0E0E0;
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    font-size: 14px;
    font-family: var(--font-main);
    color: var(--c-text-dark);
    outline: none;
    transition: border-color 0.2s;

    &:focus { border-color: var(--c-purple); }
    &--num { width: 110px; }
  }
}

.con-block {
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

/* Варианты / ответы */
.con-opt {
  display: flex;
  align-items: center;
  gap: 10px;

  &__mark {
    width: 18px;
    height: 18px;
    accent-color: var(--c-purple);
    cursor: pointer;
    flex-shrink: 0;
  }

  &__bullet {
    width: 18px;
    text-align: center;
    color: var(--c-green);
    font-weight: 700;
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
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
}

.con-icon-btn {
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

/* Пары */
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

  &__arrow { text-align: center; color: var(--c-purple-text); font-size: 16px; }
}

/* ── Превью ── */
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
  gap: 20px;
}

.con-preview__title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--c-text-dark);
}

.con-preview__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.con-preview__empty {
  font-size: 13px;
  color: #BBB;
  text-align: center;
  padding: 8px 0;
}

.con-prev-opt {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1.5px solid #EBEBEB;
  background: #F8F8F8;
  font-size: 14px;
  color: var(--c-text-dark);

  &__mark { color: var(--c-text-gray); }
  &__tag {
    margin-left: auto;
    font-size: 12px;
    font-weight: 600;
    color: var(--c-green-text);
    background: var(--c-green-light);
    padding: 2px 10px;
    border-radius: var(--radius-full);
  }

  &--correct { border-color: var(--c-green); background: var(--c-green-light); }
}

.con-prev-answers {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.con-prev-answer {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-green-text);
  background: var(--c-green-light);
  border-radius: var(--radius-full);
  padding: 5px 14px;
}

.con-preview__cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.con-preview__col { display: flex; flex-direction: column; gap: 10px; }

.con-preview__col-head {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-dark);

  &--row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
}

.con-mini-btn {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--c-purple-text);
  background: transparent;
  color: var(--c-purple-text);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-main);
  &:hover { background: var(--c-purple-light); }
}

.con-preview__items { display: flex; flex-direction: column; gap: 8px; }

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

  &:hover { border-color: var(--c-purple); }

  &__bar {
    width: 4px;
    height: 30px;
    border-radius: 2px;
    background: var(--c-purple);
    flex-shrink: 0;
  }

  &__text { flex: 1; font-size: 14px; color: var(--c-text-dark); font-weight: 500; }

  &__matched-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--c-purple-text);
    background: var(--c-purple-light);
    padding: 2px 8px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &--selected { border-color: var(--c-purple); background: var(--c-purple-light); }
  &--assigned,
  &--matched  { border-color: var(--c-green); background: var(--c-green-light); }
  &--wrong    { border-color: var(--c-red); background: #FFE0E0; }
  &--droppable { border-color: var(--c-purple); border-style: dashed; }
}

.con-preview__score-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.con-preview__score {
  display: inline-flex;
  padding: 8px 24px;
  border-radius: var(--radius-full);
  background: var(--c-purple-text);
  color: var(--c-white);
  font-size: 14px;
  font-weight: 600;
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
  &:hover { background: rgba(255, 255, 255, 0.5); }
}

/* ── Действия ── */
.con-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

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
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

/* ── Toast ── */
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

  &--error { background: var(--c-red); }
}

.toast-enter-active, .toast-leave-active { transition: opacity 0.25s, transform 0.25s; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(-50%) translateY(12px); }

@media (max-width: 768px) {
  .con-editor { padding: 20px; }
  .con-preview__inner { padding: 20px; }
  .con-preview__cols { grid-template-columns: 1fr; gap: 20px; }
  .con-footer { flex-direction: column-reverse; }
  .con-save-btn, .con-clear-btn { width: 100%; }
}

@media (max-width: 600px) {
  .con-pairs__head { display: none; }
  .con-pair {
    grid-template-columns: 28px 1fr 36px;
    grid-template-areas: "num left del" "num right del";
    row-gap: 8px;
    &__num { grid-area: num; align-self: start; }
    &__arrow { display: none; }
  }
  .con-pair .con-icon-btn { grid-area: del; align-self: start; }
  .con-pair__input:nth-of-type(1) { grid-area: left; }
  .con-pair__input:nth-of-type(2) { grid-area: right; }
}
</style>
