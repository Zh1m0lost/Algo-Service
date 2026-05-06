<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'outline' | 'ghost'
  type?: 'button' | 'submit'
  loading?: boolean
}>()
</script>

<template>
  <button
    class="ui-btn"
    :class="`ui-btn--${variant ?? 'primary'}`"
    :type="type ?? 'button'"
    :disabled="loading"
  >
    <slot />
  </button>
</template>

<style lang="scss">
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 52px;
  border: none;
  border-radius: var(--radius-full);
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-main);
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled { opacity: 0.6; cursor: not-allowed; }

  &--primary {
    background: var(--c-purple);
    color: var(--c-white);
    &:hover { opacity: 0.88; }
  }

  &--outline {
    background: transparent;
    color: var(--c-purple);
    border: 1.5px solid var(--c-purple);
    &:hover { background: var(--c-purple-light); }
  }

  &--ghost {
    background: transparent;
    color: var(--c-purple-text);
    &:hover { opacity: 0.75; }
  }
}
</style>
