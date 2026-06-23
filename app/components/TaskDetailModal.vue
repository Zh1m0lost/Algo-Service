<script setup lang="ts">
defineProps<{ task: any | null }>()
defineEmits<{ (e: 'close'): void }>()
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
  width: 100%; max-width: 460px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);

  &__close {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border: none; border-radius: 50%;
    background: var(--c-bg); color: var(--c-text-gray); cursor: pointer; font-size: 14px;
    transition: background 0.15s, color 0.15s;
    &:hover { background: var(--c-purple-light); color: var(--c-purple-text); }
  }

  &__label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--c-purple-text); }
  &__title { font-family: var(--font-heading); font-size: 20px; font-weight: 800; color: var(--c-text-dark); margin: 8px 0 12px; }
  &__desc { font-size: 14px; color: var(--c-text-dark); line-height: 1.6; margin-bottom: 18px; &--muted { color: var(--c-text-gray); } }

  &__rows { display: flex; flex-direction: column; gap: 10px; }
  &__row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    font-size: 14px; padding: 10px 14px; border-radius: var(--radius-sm); background: var(--c-bg);
    span { color: var(--c-text-gray); }
    b { color: var(--c-text-dark); text-align: right; }
  }
}
</style>
