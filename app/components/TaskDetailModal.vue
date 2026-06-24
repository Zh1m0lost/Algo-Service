<script setup lang="ts">
const props = defineProps<{ task: any | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const api = useApi()

const statusOptions = [
  { value: 'todo',        label: 'К выполнению' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'done',        label: 'Готово' },
]

// Преподаватель не редактирует содержание задачи (это задаёт администратор),
// а только переносит её между статусами.
const status = ref('todo')
const saving = ref(false)
const error = ref('')

watch(() => props.task, (t) => {
  if (t) status.value = t.status ?? 'todo'
}, { immediate: true })

async function save() {
  saving.value = true
  error.value = ''
  try {
    await api(`/teacher/org-tasks/${props.task.id}`, { method: 'PUT', body: { status: status.value } })
    emit('saved')
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="task" class="tdm-overlay" @click.self="$emit('close')">
      <div class="tdm">
        <button class="tdm__close" aria-label="Закрыть" @click="$emit('close')">✕</button>
        <p class="tdm__label">ЗАДАЧА</p>
        <h2 class="tdm__title">{{ task.title }}</h2>
        <p v-if="task.description" class="tdm__desc">{{ task.description }}</p>
        <p v-else class="tdm__desc tdm__desc--muted">Описание не заполнено.</p>

        <div class="tdm__rows">
          <div v-if="task.meta" class="tdm__row"><span>Назначено</span><b>{{ task.meta }}</b></div>
          <div v-if="task.deadline" class="tdm__row"><span>Дедлайн</span><b>{{ task.deadline }}</b></div>
          <div v-if="task.recurrence" class="tdm__row"><span>Регулярность</span><b>{{ task.recurrence }}</b></div>
        </div>

        <label class="tdm__field">
          <span>Статус</span>
          <select v-model="status" class="tdm__input">
            <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </label>

        <p class="tdm__note">Содержание задачи задаёт администратор — преподаватель меняет только статус.</p>
        <p v-if="error" class="tdm__error">{{ error }}</p>

        <div class="tdm__actions">
          <button class="tdm__btn tdm__btn--cancel" @click="$emit('close')">Закрыть</button>
          <button class="tdm__btn tdm__btn--save" :disabled="saving" @click="save">
            {{ saving ? 'Сохранение…' : 'Сохранить статус' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.tdm-overlay {
  position: fixed; inset: 0; z-index: 1100;
  background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}

.tdm {
  position: relative;
  background: var(--c-white);
  border-radius: var(--radius-lg);
  padding: 32px;
  width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
  display: flex; flex-direction: column; gap: 12px;

  &__close {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border: none; border-radius: 50%;
    background: var(--c-bg); color: var(--c-text-gray); cursor: pointer; font-size: 14px;
    transition: background 0.15s, color 0.15s;
    &:hover { background: var(--c-purple-light); color: var(--c-purple-text); }
  }

  &__label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--c-purple-text); }
  &__title { font-family: var(--font-heading); font-size: 20px; font-weight: 800; color: var(--c-text-dark); }
  &__desc { font-size: 14px; color: var(--c-text-dark); line-height: 1.6; &--muted { color: var(--c-text-gray); } }

  &__rows { display: flex; flex-direction: column; gap: 10px; }
  &__row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    font-size: 14px; padding: 10px 14px; border-radius: var(--radius-sm); background: var(--c-bg);
    span { color: var(--c-text-gray); }
    b { color: var(--c-text-dark); text-align: right; }
  }

  &__field {
    display: flex; flex-direction: column; gap: 6px; margin-top: 4px;
    span { font-size: 13px; color: var(--c-text-gray); font-weight: 500; }
  }

  &__input {
    width: 100%; box-sizing: border-box;
    border: 1.5px solid #E0E0E0; border-radius: var(--radius-sm); padding: 10px 14px;
    font-size: 14px; font-family: var(--font-main); color: var(--c-text-dark);
    background: var(--c-white); outline: none; transition: border-color 0.2s;
    &:focus { border-color: var(--c-purple); }
  }

  &__note { font-size: 12px; color: var(--c-text-gray); }
  &__error { font-size: 13px; color: var(--c-red); }

  &__actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 4px; }

  &__btn {
    padding: 10px 24px; border-radius: var(--radius-full); font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: var(--font-main); border: none; transition: opacity 0.2s, background 0.2s;
    &--cancel { background: #F0F0F0; color: var(--c-text-dark); &:hover { background: #E0E0E0; } }
    &--save { background: var(--c-purple-text); color: #fff; &:hover { opacity: 0.88; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
  }
}
</style>
