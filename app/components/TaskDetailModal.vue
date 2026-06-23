<script setup lang="ts">
const props = defineProps<{ task: any | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const api = useApi()

const statusOptions = [
  { value: 'todo',        label: 'К выполнению' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'done',        label: 'Готово' },
]

const form = reactive({ title: '', description: '', deadline: '', recurrence: '', status: 'todo' })
const saving = ref(false)
const error = ref('')

// Подставляем данные задачи в форму при открытии.
watch(() => props.task, (t) => {
  if (!t) return
  form.title = t.title ?? ''
  form.description = t.description ?? ''
  form.deadline = t.deadline ?? ''
  form.recurrence = t.recurrence ?? ''
  form.status = t.status ?? 'todo'
}, { immediate: true })

async function save() {
  if (!form.title.trim()) { error.value = 'Введите название'; return }
  saving.value = true
  error.value = ''
  try {
    await api(`/teacher/org-tasks/${props.task.id}`, {
      method: 'PUT',
      body: { ...form },
    })
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
        <p class="tdm__label">РЕДАКТИРОВАНИЕ ЗАДАЧИ</p>

        <label class="tdm__field">
          <span>Название</span>
          <input v-model="form.title" class="tdm__input" placeholder="Название задачи" />
        </label>

        <label class="tdm__field">
          <span>Описание</span>
          <textarea v-model="form.description" class="tdm__input tdm__textarea" rows="3" placeholder="Подробности…" />
        </label>

        <div class="tdm__row">
          <label class="tdm__field">
            <span>Статус</span>
            <select v-model="form.status" class="tdm__input">
              <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </label>
          <label class="tdm__field">
            <span>Дедлайн</span>
            <input v-model="form.deadline" class="tdm__input" placeholder="25 июня · 23:59" />
          </label>
        </div>

        <label class="tdm__field">
          <span>Регулярность</span>
          <input v-model="form.recurrence" class="tdm__input" placeholder="Однократно / Еженедельно…" />
        </label>

        <p v-if="error" class="tdm__error">{{ error }}</p>

        <div class="tdm__actions">
          <button class="tdm__btn tdm__btn--cancel" @click="$emit('close')">Отмена</button>
          <button class="tdm__btn tdm__btn--save" :disabled="saving" @click="save">
            {{ saving ? 'Сохранение…' : 'Сохранить' }}
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
  width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
  display: flex; flex-direction: column; gap: 14px;

  &__close {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border: none; border-radius: 50%;
    background: var(--c-bg); color: var(--c-text-gray); cursor: pointer; font-size: 14px;
    transition: background 0.15s, color 0.15s;
    &:hover { background: var(--c-purple-light); color: var(--c-purple-text); }
  }

  &__label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--c-purple-text); }

  &__field {
    display: flex; flex-direction: column; gap: 6px;
    span { font-size: 13px; color: var(--c-text-gray); font-weight: 500; }
  }

  &__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  &__input {
    width: 100%; box-sizing: border-box;
    border: 1.5px solid #E0E0E0; border-radius: var(--radius-sm); padding: 10px 14px;
    font-size: 14px; font-family: var(--font-main); color: var(--c-text-dark);
    background: var(--c-white); outline: none; transition: border-color 0.2s;
    &:focus { border-color: var(--c-purple); }
  }

  &__textarea { resize: vertical; line-height: 1.5; }

  &__error { font-size: 13px; color: var(--c-red); }

  &__actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 4px; }

  &__btn {
    padding: 10px 24px; border-radius: var(--radius-full); font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: var(--font-main); border: none; transition: opacity 0.2s, background 0.2s;
    &--cancel { background: #F0F0F0; color: var(--c-text-dark); &:hover { background: #E0E0E0; } }
    &--save { background: var(--c-purple-text); color: #fff; &:hover { opacity: 0.88; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
  }
}

@media (max-width: 480px) {
  .tdm__row { grid-template-columns: 1fr; }
}
</style>
