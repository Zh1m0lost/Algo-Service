<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="ui-input">
    <label v-if="label" class="ui-input__label">{{ label }}</label>
    <input
      class="ui-input__field"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style lang="scss">
.ui-input {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: var(--c-text-dark);
  }

  &__field {
    width: 100%;
    height: 52px;
    border: 1.5px solid #D0D0E0;
    border-radius: var(--radius-full);
    padding: 0 20px;
    font-size: 15px;
    font-family: var(--font-main);
    color: var(--c-text-dark);
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: var(--c-purple);
    }
  }
}
</style>
