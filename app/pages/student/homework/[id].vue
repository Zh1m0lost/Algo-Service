<script setup lang="ts">
import calendarIcon from '~/assets/icons/PerpleCalendar.svg'

definePageMeta({ layout: 'student' })

const route = useRoute()

type Step = { n: number; text: string; codes?: string[]; suffix?: string }
type Comment = { id: number; initials: string; author: string; role: string; roleLabel: string; date: string; text: string }
type Homework = {
  id: number; title: string; subject: string; status: string
  deadline: string; points: number; tags: string[]; description: string
  steps: Step[]
  answer: { statusLabel: string; grading: string; deadline: string; timeLeft: string; lastChange: string; file: { name: string; date: string } | null }
  comments: Comment[]
}

const api = useApi()
const id  = route.params.id as string

const { data, refresh } = await useAsyncData(`student-homework-${id}`, () =>
  api<any>(`/student/homework/${id}`),
)

const statusMap: Record<string, { label: string; cls: string }> = {
  completed:  { label: 'Выполнено',   cls: 'hw-badge--green'  },
  overdue:    { label: 'Просрочено',  cls: 'hw-badge--red'    },
  in_progress:{ label: 'В процессе',  cls: 'hw-badge--purple' },
  review:     { label: 'На проверке', cls: 'hw-badge--yellow' },
  pending:    { label: 'Не начато',   cls: 'hw-badge--gray'   }
}

const answer   = reactive<any>({})
const comments = ref<any[]>([])

watchEffect(() => {
  if (data.value) {
    Object.assign(answer, data.value.answer ?? {})
    comments.value = [...(data.value.comments ?? [])]
  }
})

const showEditModal     = ref(false)
const showDeleteConfirm = ref(false)
const newComment   = ref('')
const dragOver     = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput    = ref<HTMLInputElement | null>(null)
const actionError  = ref('')
const uploading    = ref(false)

// Сбрасываем ошибку при открытии модалки.
watch(showEditModal, (v) => { if (v) actionError.value = '' })

function openFilePicker() {
  fileInput.value?.click()
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) selectedFile.value = file
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) selectedFile.value = file
  input.value = '' // чтобы можно было выбрать тот же файл повторно
}

async function saveAnswer() {
  if (!selectedFile.value) { actionError.value = 'Сначала выберите файл.'; return }
  actionError.value = ''
  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', selectedFile.value)
    const res = await api<any>(`/student/homework/${id}/answer`, { method: 'POST', body: form })
    Object.assign(answer, res.answer)
    showEditModal.value = false
    selectedFile.value  = null
  } catch (e: any) {
    actionError.value =
      e?.data?.errors?.file?.[0] ||
      e?.data?.message ||
      'Не удалось загрузить файл. Проверьте размер (до 20 МБ) и попробуйте снова.'
  } finally {
    uploading.value = false
  }
}

async function deleteAnswer() {
  try {
    const res = await api<any>(`/student/homework/${id}/answer`, { method: 'DELETE' })
    Object.assign(answer, res.answer)
  } catch {
    // тихо — состояние обновится при следующем заходе
  }
  showDeleteConfirm.value = false
}

async function sendComment() {
  if (!newComment.value.trim()) return
  try {
    const comment = await api<any>(`/student/homework/${id}/comments`, {
      method: 'POST',
      body: { text: newComment.value.trim() },
    })
    comments.value.push(comment)
    newComment.value = ''
  } catch {
    // оставляем текст в поле, чтобы пользователь не потерял ввод
  }
}

async function deleteComment(commentId: string) {
  try {
    await api(`/student/homework/${id}/comments/${commentId}`, { method: 'DELETE' })
    comments.value = comments.value.filter(c => c.id !== commentId)
  } catch {
    // ignore
  }
}
</script>

<template>
  <div v-if="data" class="hw-detail">

    <!-- Задание -->
    <div class="hw-card">
      <div class="hw-card__header">
        <h1 class="hw-card__title">{{ data.title }}</h1>
        <span class="hw-badge" :class="statusMap[data.status].cls">
          <span class="hw-badge__dot" />
          {{ statusMap[data.status].label }}
        </span>
      </div>

      <div class="hw-card__meta">
        <span class="hw-card__meta-item">
          <img :src="calendarIcon" alt="" />
          Срок: <strong>{{ data.deadline }}</strong>
        </span>
        <span class="hw-card__meta-item">
          <span class="hw-card__star">⭐</span>
          <span class="hw-points-badge">{{ data.points }} баллов</span>
        </span>
        <span v-for="tag in data.tags" :key="tag" class="hw-tag">{{ tag }}</span>
      </div>

      <div class="hw-section-label">ОПИСАНИЕ ЗАДАНИЯ</div>
      <p class="hw-card__desc">{{ data.description }}</p>

      <ol class="hw-steps">
        <li v-for="step in data.steps" :key="step.n" class="hw-step">
          <span class="hw-step__num">{{ step.n }}</span>
          <span class="hw-step__text">
            {{ step.text }}
            <code v-for="c in (step.codes ?? [])" :key="c" class="hw-step__code">{{ c }}</code>
            <template v-if="step.suffix">{{ step.suffix }}</template>
          </span>
        </li>
      </ol>
    </div>

    <!-- Состояние ответа -->
    <div class="hw-card">
      <div class="hw-section-label">СОСТОЯНИЕ ОТВЕТА</div>

      <table class="hw-table">
        <tbody>
          <tr class="hw-table__row">
            <td class="hw-table__key">Статус ответа</td>
            <td class="hw-table__val hw-table__val--yellow">{{ answer.statusLabel }}</td>
          </tr>
          <tr class="hw-table__row">
            <td class="hw-table__key">Состояние оценивания</td>
            <td class="hw-table__val">{{ answer.grading }}</td>
          </tr>
          <tr class="hw-table__row">
            <td class="hw-table__key">Срок сдачи</td>
            <td class="hw-table__val">{{ answer.deadline }}</td>
          </tr>
          <tr class="hw-table__row">
            <td class="hw-table__key">Оставшееся время</td>
            <td class="hw-table__val">{{ answer.timeLeft }}</td>
          </tr>
          <tr class="hw-table__row">
            <td class="hw-table__key">Последнее изменение</td>
            <td class="hw-table__val">{{ answer.lastChange }}</td>
          </tr>
          <tr class="hw-table__row">
            <td class="hw-table__key">Ответ в виде файла</td>
            <td class="hw-table__val">
              <template v-if="answer.file">
                <span class="hw-file-link">📄 {{ answer.file.name }}</span>
                <span class="hw-file-date">· {{ answer.file.date }}</span>
              </template>
              <span v-else class="hw-file-date">— файл не прикреплён</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="hw-actions">
        <button class="hw-action-btn hw-action-btn--outline" @click="showEditModal = true">
          ✏️ Редактировать ответ
        </button>
        <button class="hw-action-btn hw-action-btn--red" @click="showDeleteConfirm = true">
          🗑️ Удалить ответ
        </button>
      </div>
    </div>

    <!-- Чат -->
    <div class="hw-card">
      <div class="hw-section-label">КОММЕНТАРИИ — ДИАЛОГ С ПРЕПОДАВАТЕЛЕМ</div>

      <div class="hw-chat">
        <div
          v-for="msg in comments"
          :key="msg.id"
          class="hw-msg"
          :class="msg.role === 'teacher' ? 'hw-msg--teacher' : 'hw-msg--student'"
        >
          <div class="hw-msg__avatar" :class="msg.role === 'teacher' ? 'hw-msg__avatar--teacher' : 'hw-msg__avatar--student'">
            {{ msg.initials }}
          </div>
          <div class="hw-msg__body">
            <div class="hw-msg__header">
              <span class="hw-msg__author">{{ msg.author }}</span>
              <span class="hw-msg__role" :class="msg.role === 'teacher' ? 'hw-msg__role--teacher' : 'hw-msg__role--student'">
                {{ msg.roleLabel }}
              </span>
              <span class="hw-msg__date">{{ msg.date }}</span>
              <button
                v-if="msg.role === 'student'"
                class="hw-msg__delete"
                title="Удалить комментарий"
                @click="deleteComment(msg.id)"
              >✕</button>
            </div>
            <p class="hw-msg__text">{{ msg.text }}</p>
          </div>
        </div>

        <!-- Поле ввода -->
        <div class="hw-chat__input-row">
          <div class="hw-msg__avatar hw-msg__avatar--student">ИИ</div>
          <div class="hw-chat__input-wrap">
            <textarea
              v-model="newComment"
              class="hw-chat__textarea"
              placeholder="Добавить комментарий..."
              rows="3"
            />
            <div class="hw-chat__btns">
              <button class="hw-btn hw-btn--filled" @click="sendComment">Отправить</button>
              <button class="hw-btn hw-btn--outline" @click="newComment = ''">Отмена</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Попап: редактировать ответ -->
    <Teleport to="body">
      <div v-if="showEditModal" class="hw-modal-overlay" @click.self="showEditModal = false">
        <div class="hw-modal">
          <h2 class="hw-modal__title">Ответ в виде файла</h2>
          <p class="hw-modal__hint">Максимальный размер файлов: 20 МБайт, максимальное количество прикреплённых файлов: 20</p>

          <div class="hw-modal__file-section">
            <div class="hw-modal__file-label">
              <span>📁</span> Файлы
            </div>
            <div
              class="hw-modal__drop"
              :class="{ 'hw-modal__drop--over': dragOver }"
              @click="openFilePicker"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop.prevent="onDrop"
            >
              <input ref="fileInput" type="file" class="hw-modal__file-input" @change="onFileChange" />
              <span class="hw-modal__drop-arrow">↓</span>
              <span v-if="selectedFile" class="hw-modal__drop-text">{{ selectedFile.name }}</span>
              <span v-else class="hw-modal__drop-text">Нажмите или перетащите файл сюда.</span>
            </div>
          </div>

          <p v-if="actionError" class="hw-modal__error">{{ actionError }}</p>

          <div class="hw-modal__footer">
            <button class="hw-btn hw-btn--outline" @click="showEditModal = false">Отмена</button>
            <button class="hw-btn hw-btn--filled" :disabled="uploading" @click="saveAnswer">
              {{ uploading ? 'Загрузка…' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Попап: подтверждение удаления -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="hw-modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="hw-modal hw-modal--sm">
          <h2 class="hw-modal__title">Удалить ответ?</h2>
          <p class="hw-modal__hint">Это действие нельзя отменить. Ваш файл будет удалён.</p>
          <div class="hw-modal__footer">
            <button class="hw-btn hw-btn--outline" @click="showDeleteConfirm = false">Отмена</button>
            <button class="hw-btn hw-btn--red" @click="deleteAnswer">Удалить</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style lang="scss">
.hw-detail {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hw-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 32px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 700;
    color: var(--c-text-dark);
    line-height: 1.35;
  }

  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid #EBEBEB;
  }

  &__meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--c-text-dark);

    img { width: 16px; height: 16px; }
  }

  &__star { font-size: 14px; line-height: 1; }

  &__desc {
    font-size: 15px;
    color: var(--c-text-dark);
    line-height: 1.6;
    margin-bottom: 20px;
  }
}

.hw-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-purple-text);
  margin-bottom: 16px;
}

.hw-points-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: var(--radius-full);
  background: var(--c-yellow-light);
  color: var(--c-yellow-text);
  font-size: 13px;
  font-weight: 600;
}

.hw-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: var(--radius-full);
  background: var(--c-purple-light);
  color: var(--c-purple-text);
  font-size: 13px;
  font-weight: 500;
}

/* Steps */
.hw-steps {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hw-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  color: var(--c-text-dark);
  line-height: 1.55;

  &__num {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--c-purple-light);
    color: var(--c-purple-text);
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
  }

  &__code {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 4px;
    background: #EBEBEB;
    color: var(--c-text-dark);
    font-family: monospace;
    font-size: 13px;
    margin: 0 3px;
  }
}

/* Table */
.hw-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;

  &__row {
    border-bottom: 1px solid #F0F0F0;

    &:last-child { border-bottom: none; }
  }

  &__key {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--c-text-gray);
    width: 200px;
    vertical-align: top;
  }

  &__val {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--c-text-dark);

    &--yellow { color: #B87A00; }
  }
}

.hw-file-link {
  color: var(--c-purple-text);
  font-weight: 500;
  cursor: pointer;
}

.hw-file-date {
  font-size: 13px;
  color: var(--c-text-gray);
  margin-left: 6px;
}

/* Action buttons */
.hw-actions {
  display: flex;
  gap: 12px;
}

.hw-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &--outline {
    background: transparent;
    border: 1.5px solid var(--c-purple-text);
    color: var(--c-purple-text);
    &:hover { background: var(--c-purple-light); }
  }

  &--red {
    background: transparent;
    border: 1.5px solid var(--c-red);
    color: var(--c-red);
    &:hover { background: var(--c-red-light); }
  }
}

/* Chat */
.hw-chat {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hw-msg {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--c-white);
    flex-shrink: 0;

    &--teacher { background: var(--c-purple); }
    &--student { background: var(--c-green); }
  }

  &__body {
    flex: 1;
    background: var(--c-bg);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  &__author {
    font-size: 14px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__role {
    font-size: 12px;
    font-weight: 500;
    padding: 2px 10px;
    border-radius: var(--radius-full);

    &--teacher { background: var(--c-purple-light); color: var(--c-purple-text); }
    &--student { background: var(--c-green-light);  color: var(--c-green-text); }
  }

  &__date {
    font-size: 12px;
    color: var(--c-text-gray);
    margin-left: auto;
  }

  &__delete {
    margin-left: 8px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: var(--c-text-gray);
    padding: 2px 4px;
    border-radius: 4px;
    line-height: 1;
    transition: color 0.15s, background 0.15s;
    flex-shrink: 0;

    &:hover { color: var(--c-red); background: var(--c-red-light); }
  }

  &__text {
    font-size: 14px;
    color: var(--c-text-dark);
    line-height: 1.55;
  }
}

.hw-chat__input-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 8px;
}

.hw-chat__input-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hw-chat__textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #DCDCDC;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--font-main);
  color: var(--c-text-dark);
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: var(--c-purple); }
}

.hw-chat__btns {
  display: flex;
  gap: 10px;
}

/* Buttons (shared) */
.hw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
  font-family: var(--font-main);

  &:disabled { opacity: 0.6; cursor: not-allowed; }

  &--outline {
    border: 1.5px solid var(--c-purple-text);
    color: var(--c-purple-text);
    background: transparent;
    &:hover { background: var(--c-purple-light); }
  }

  &--filled {
    background: var(--c-purple-text);
    color: var(--c-white);
    &:hover { opacity: 0.88; }
  }

  &--red {
    background: var(--c-red);
    color: var(--c-white);
    &:hover { opacity: 0.88; }
  }
}

/* Badges */
.hw-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }

  &--green  { background: var(--c-green-light);  color: var(--c-green);       border: 1px solid var(--c-green); }
  &--red    { background: var(--c-red-light);    color: var(--c-red);         border: 1px solid var(--c-red); }
  &--purple { background: var(--c-purple-light); color: var(--c-purple-text); border: 1px solid var(--c-purple-text); }
  &--yellow { background: var(--c-yellow-light); color: var(--c-yellow-text); border: 1px solid var(--c-yellow); }
  &--gray   { background: #F0F0F0;               color: #888;                 border: 1px solid #CCC; }
}

/* Modal */
.hw-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.hw-modal {
  background: var(--c-white);
  border-radius: var(--radius-lg);
  padding: 36px;
  width: 100%;
  max-width: 640px;

  &--sm { max-width: 420px; }

  &__title {
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--c-text-dark);
    text-align: center;
    margin-bottom: 8px;
  }

  &__hint {
    font-size: 13px;
    color: var(--c-text-gray);
    text-align: center;
    margin-bottom: 24px;
  }

  &__error {
    font-size: 13px;
    color: var(--c-red);
    text-align: center;
    margin-bottom: 12px;
  }

  &__file-section {
    border: 1px solid #E0E0E0;
    border-radius: var(--radius-sm);
    overflow: hidden;
    margin-bottom: 24px;
  }

  &__file-label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    color: var(--c-text-dark);
    border-bottom: 1px solid #E0E0E0;
    background: #FAFAFA;
  }

  &__drop {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 32px 24px;
    background: var(--c-bg);
    border: 2px dashed #C0C0C0;
    cursor: pointer;
    transition: border-color 0.2s;

    &--over { border-color: var(--c-purple); }
  }

  &__file-input {
    display: none;
  }

  &__drop-arrow {
    font-size: 28px;
    color: var(--c-text-dark);
    font-weight: 300;
  }

  &__drop-text {
    font-size: 14px;
    color: var(--c-text-gray);
  }

  &__footer {
    display: flex;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .hw-card {
    padding: 20px;

    &__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    &__title { font-size: 18px; }
  }

  .hw-actions {
    flex-direction: column;
    gap: 10px;

    .hw-action-btn {
      width: 100%;
      justify-content: center;
    }
  }

  .hw-chat__btns {
    flex-wrap: wrap;
    .hw-btn { flex: 1; min-width: 120px; }
  }

  .hw-modal {
    padding: 24px 20px;
    border-radius: var(--radius-md);

    &__footer { flex-direction: column; }
  }
}

@media (max-width: 480px) {
  .hw-table {
    display: block;

    tbody { display: block; }

    &__row {
      display: block;
      border-bottom: 1px solid #F0F0F0;
      padding: 4px 0;
    }

    &__key {
      display: block;
      width: auto;
      padding: 10px 0 2px;
      font-size: 12px;
      font-weight: 600;
      color: var(--c-text-gray);
    }

    &__val {
      display: block;
      padding: 0 0 10px;
    }
  }

  .hw-msg {
    &__date { margin-left: 0; font-size: 11px; }
    &__header { gap: 4px; }
  }

  .hw-card__meta { gap: 8px; }
}
</style>
