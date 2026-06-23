<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data } = await useAsyncData('admin-transactions', () =>
  useApi()<any[]>('/admin/transactions'),
)
const items = computed(() => data.value ?? [])

const typeMap: Record<string, { label: string; cls: string }> = {
  homework:   { label: 'За ДЗ',         cls: 'al-badge--green'  },
  manual:     { label: 'Вручную',       cls: 'al-badge--blue'   },
  purchase:   { label: 'Покупка',       cls: 'al-badge--red'    },
  correction: { label: 'Корректировка', cls: 'al-badge--yellow' },
}

const tabs = computed(() => [
  { key: 'all',    label: 'Все',         count: items.value.length },
  { key: 'earned', label: 'Начисления',  count: items.value.filter(i => i.amount > 0).length },
  { key: 'spent',  label: 'Списания',    count: items.value.filter(i => i.amount < 0).length },
])

const router    = useRouter()
const activeTab = ref('all')
const search    = ref('')

function openStudent(tx: any) {
  if (tx.studentId) router.push(`/admin/students/${tx.studentId}`)
}

const filtered = computed(() => {
  let list = items.value
  if (activeTab.value === 'earned') list = list.filter(i => i.amount > 0)
  else if (activeTab.value === 'spent') list = list.filter(i => i.amount < 0)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(i =>
      i.student.toLowerCase().includes(q) || String(i.comment ?? '').toLowerCase().includes(q),
    )
  }
  return list
})

const totalEarned = computed(() => items.value.filter(i => i.amount > 0).reduce((s, i) => s + i.amount, 0))
const totalSpent  = computed(() => Math.abs(items.value.filter(i => i.amount < 0).reduce((s, i) => s + i.amount, 0)))
</script>

<template>
  <div class="al-page">

    <div class="al-hero">
      <h1 class="al-hero__title">Транзакции</h1>
      <div class="al-hero__badges">
        <span class="al-hero__badge">Всего: {{ items.length }}</span>
        <span class="al-hero__badge al-hero__badge--light">+{{ totalEarned.toLocaleString('ru') }} начислено</span>
        <span class="al-hero__badge al-hero__badge--light">−{{ totalSpent.toLocaleString('ru') }} списано</span>
      </div>
    </div>

    <div class="al-card">
      <div class="al-card__head">
        <h2 class="al-card__title">История операций</h2>
        <div class="al-card__controls">
          <div class="al-search">
            <span class="al-search__icon">🔍</span>
            <input v-model="search" class="al-search__input" placeholder="Поиск по ученику или комментарию" />
          </div>
        </div>
      </div>

      <div class="al-tabs">
        <button
          v-for="tab in tabs" :key="tab.key"
          class="al-tab" :class="{ 'al-tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }} <span class="al-tab__count">{{ tab.count }}</span>
        </button>
      </div>

      <table class="al-table">
        <thead>
          <tr>
            <th>ДАТА</th><th>УЧЕНИК</th><th>ТИП</th><th>СУММА</th><th>КОММЕНТАРИЙ</th><th>КТО</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="tx in filtered"
            :key="tx.id"
            class="al-table__row"
            :class="{ 'al-table__row--link': tx.studentId }"
            @click="openStudent(tx)"
          >
            <td class="al-table__gray">{{ tx.date }}</td>
            <td class="al-table__name">{{ tx.student }}</td>
            <td>
              <span class="al-badge" :class="typeMap[tx.type]?.cls ?? 'al-badge--gray'">
                {{ typeMap[tx.type]?.label ?? tx.type }}
              </span>
            </td>
            <td :style="{ color: tx.amount > 0 ? 'var(--c-green)' : 'var(--c-red)', fontWeight: 700 }">
              {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
            </td>
            <td class="al-table__gray">{{ tx.comment || '—' }}</td>
            <td class="al-table__gray">{{ tx.actor }}</td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="6" class="tx-empty">Операций не найдено</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style lang="scss">
.tx-empty {
  text-align: center;
  color: var(--c-text-gray);
  padding: 32px 0;
}
</style>
