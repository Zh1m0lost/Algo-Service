<script setup lang="ts">
/**
 * Набор линейных SVG-иконок (вместо эмодзи). Цвет наследуется через currentColor,
 * поэтому иконка автоматически подхватывает цвет текста родителя.
 */
const props = withDefaults(defineProps<{ name: string; size?: number | string }>(), {
  size: 24,
})

const ICONS: Record<string, string> = {
  // Навигация / разделы
  calendar:  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v4M16 3v4"/>',
  document:  '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  gear:      '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19"/>',
  book:      '<path d="M12 6.5C10.5 5 8 4.5 4.5 5v13c3.5-.5 6 0 7.5 1.5 1.5-1.5 4-2 7.5-1.5V5c-3.5-.5-6 0-7.5 1.5z"/><path d="M12 6.5v13"/>',
  users:     '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 13.4a5.5 5.5 0 0 1 3 4.9"/>',
  cap:       '<path d="M12 4 2.5 9 12 14l9.5-5z"/><path d="M6.5 11.2V16c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.8M21.5 9.5V15"/>',
  teach:     '<rect x="3" y="3.5" width="18" height="12" rx="1.6"/><path d="M12 15.5V19M8 21h8M7 7.5h8M7 11h5"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5a3 3 0 0 1 6 0M8.5 12l2 2 4-4"/>',
  layers:    '<path d="M12 3 3 7.5l9 4.5 9-4.5z"/><path d="M3 12l9 4.5L21 12M3 16.5 12 21l9-4.5"/>',

  // Действия / мелочи
  star:      '<path fill="currentColor" stroke="none" d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 18.56 6.1 21.67l1.13-6.57L2.45 9.44l6.6-.96z"/>',
  plus:      '<path d="M12 5v14M5 12h14"/>',
  trash:     '<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6.5 7l1 12.5a2 2 0 0 0 2 1.5h5a2 2 0 0 0 2-1.5L19.5 7"/>',
  edit:      '<path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2z"/><path d="M14 6.5l3.5 3.5"/>',
  link:      '<path d="M9.5 14.5l5-5"/><path d="M11.5 7.5l1-1a3.5 3.5 0 0 1 5 5l-1 1M12.5 16.5l-1 1a3.5 3.5 0 0 1-5-5l1-1"/>',
  clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  target:    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  list:      '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  check:     '<path d="M5 12.5l4.5 4.5L19 6.5"/>',
}

const inner = computed(() => ICONS[props.name] ?? '')
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="ui-icon"
    aria-hidden="true"
    v-html="inner"
  />
</template>

<style>
.ui-icon { display: inline-block; flex-shrink: 0; vertical-align: middle; }
</style>
