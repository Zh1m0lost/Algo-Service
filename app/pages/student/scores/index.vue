<script setup lang="ts">
import cartIcon  from '~/assets/icons/shopping-cart.svg'
import checkIcon from '~/assets/icons/YellowGalochka.svg'

definePageMeta({ layout: 'student' })

const { data } = await useAsyncData('student-scores', () =>
  useApi()<any>('/student/scores'),
)

const activeTab = ref<'all' | 'earned' | 'spent'>('all')

const tabs = [
  { key: 'all',    label: 'Все операции' },
  { key: 'earned', label: 'Начисления'   },
  { key: 'spent',  label: 'Списания'     },
] as const

const filtered = computed(() => {
  const txs = data.value?.transactions ?? []
  if (activeTab.value === 'earned') return txs.filter((t: any) => t.amount > 0)
  if (activeTab.value === 'spent')  return txs.filter((t: any) => t.amount < 0)
  return txs
})

const grouped = computed(() => {
  const map: Record<string, any[]> = {}
  for (const tx of filtered.value) {
    if (!map[tx.month]) map[tx.month] = []
    map[tx.month].push(tx)
  }
  return map
})
</script>

<template>
  <div v-if="data" class="sc-page">

    <!-- Hero -->
    <div class="sc-hero">
      <div class="sc-hero__circles">
        <span class="sc-hero__circle sc-hero__circle--1" />
        <span class="sc-hero__circle sc-hero__circle--2" />
      </div>
      <div class="sc-hero__left">
        <p class="sc-hero__label">Накопительный счёт</p>
        <div class="sc-hero__total">
          <span class="sc-hero__num">{{ data.balance.total.toLocaleString('ru') }}</span>
          <span class="sc-hero__star">⭐</span>
        </div>
        <div class="sc-hero__tags">
          <span class="sc-hero__tag sc-hero__tag--green">+{{ data.stats.thisMonth }} в этом месяце</span>
          <span class="sc-hero__tag sc-hero__tag--yellow">Уровень: {{ data.balance.level }}</span>
          <span class="sc-hero__tag sc-hero__tag--outline">До следующего: {{ data.balance.toNext }} баллов</span>
        </div>
      </div>
      <div class="sc-hero__stats">
        <div class="sc-hero__stat">
          <span class="sc-hero__stat-num sc-hero__stat-num--green">+{{ data.stats.earned.toLocaleString('ru') }}</span>
          <span class="sc-hero__stat-label">Всего начислено</span>
        </div>
        <div class="sc-hero__stat">
          <span class="sc-hero__stat-num sc-hero__stat-num--red">−{{ data.stats.spent.toLocaleString('ru') }}</span>
          <span class="sc-hero__stat-label">Всего списано</span>
        </div>
      </div>
    </div>

    <!-- История -->
    <div class="sc-card">
      <div class="sc-card__head">
        <h2 class="sc-card__title">История баллов</h2>
        <span class="sc-card__total">{{ filtered.length }} операций</span>
      </div>

      <!-- Табы -->
      <div class="sc-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="sc-tab"
          :class="{ 'sc-tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Сгруппированный список -->
      <div class="sc-groups">
        <div v-for="(txs, month) in grouped" :key="month" class="sc-group">
          <div class="sc-group__month">{{ month }}</div>
          <div class="sc-group__list">
            <div v-for="tx in txs" :key="tx.id" class="sc-tx">
              <div
                class="sc-tx__icon-wrap"
                :class="tx.type === 'purchase' ? 'sc-tx__icon-wrap--red' : 'sc-tx__icon-wrap--green'"
              >
                <img :src="tx.type === 'purchase' ? cartIcon : checkIcon" alt="" class="sc-tx__icon" />
              </div>
              <div class="sc-tx__info">
                <p class="sc-tx__title">{{ tx.title }}</p>
                <p class="sc-tx__date">{{ tx.date }}</p>
              </div>
              <span
                class="sc-tx__amount"
                :class="tx.amount > 0 ? 'sc-tx__amount--plus' : 'sc-tx__amount--minus'"
              >
                {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="sc-empty">
          Операций пока нет
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
.sc-page {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Hero */
.sc-hero {
  position: relative;
  background: var(--c-purple);
  border-radius: var(--radius-md);
  padding: 28px 32px;
  color: var(--c-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  overflow: hidden;

  &__circles { position: absolute; inset: 0; pointer-events: none; }

  &__circle {
    position: absolute;
    border-radius: 50%;
    background: var(--c-circle-bg);

    &--1 { width: 220px; height: 220px; right: 280px; top: -70px; }
    &--2 { width: 140px; height: 140px; right: 200px; bottom: -50px; }
  }

  &__left {
    position: relative;
    z-index: 1;
    flex: 1;
  }

  &__label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--c-text-white-dim);
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  &__total {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__num {
    font-family: var(--font-heading);
    font-size: 52px;
    font-weight: 800;
    line-height: 1;
  }

  &__star { font-size: 36px; }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    padding: 5px 14px;
    border-radius: var(--radius-full);
    font-size: 12px;
    font-weight: 600;

    &--green   { background: rgba(86,184,53,0.25); color: #fff; }
    &--yellow  { background: var(--c-yellow-light); color: var(--c-yellow); }
    &--outline { border: 1.5px solid rgba(255,255,255,0.4); color: var(--c-white); }
  }

  &__stats {
    display: flex;
    gap: 12px;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }

  &__stat {
    background: rgba(255,255,255,0.12);
    border-radius: var(--radius-sm);
    padding: 16px 22px;
    text-align: center;
    min-width: 120px;
  }

  &__stat-num {
    display: block;
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 6px;

    &--green { color: #7BEE56; }
    &--red   { color: #FF8080; }
  }

  &__stat-label {
    font-size: 11px;
    color: var(--c-text-white-dim);
  }
}

/* Card */
.sc-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 24px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__total {
    font-size: 13px;
    color: var(--c-purple-text);
    font-weight: 600;
  }
}

/* Tabs */
.sc-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.sc-tab {
  padding: 7px 18px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid #E0E0E0;
  background: transparent;
  color: var(--c-text-dark);
  font-family: var(--font-main);
  transition: all 0.15s;

  &:hover { border-color: var(--c-purple-text); color: var(--c-purple-text); }

  &--active {
    background: var(--c-purple-text);
    border-color: var(--c-purple-text);
    color: var(--c-white);
  }
}

/* Groups */
.sc-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sc-group {
  &__month {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--c-text-gray);
    text-transform: uppercase;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #F0F0F0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}

/* Transaction row */
.sc-tx {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;

  &:hover { background: var(--c-bg); }

  &__icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--green { background: var(--c-green-light); }
    &--red   { background: var(--c-red-light); }
  }

  &__icon { width: 18px; height: 18px; }

  &__info { flex: 1; min-width: 0; }

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: var(--c-text-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__date {
    font-size: 12px;
    color: var(--c-text-gray);
    margin-top: 2px;
  }

  &__amount {
    font-size: 16px;
    font-weight: 700;
    flex-shrink: 0;

    &--plus  { color: var(--c-green); }
    &--minus { color: var(--c-red); }
  }
}

.sc-empty {
  text-align: center;
  color: var(--c-text-gray);
  font-size: 14px;
  padding: 40px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .sc-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    gap: 20px;

    &__stats { flex-direction: row; width: 100%; }
    &__stat  { flex: 1; }
    &__num   { font-size: 40px; }
    &__star  { font-size: 28px; }
  }
}

@media (max-width: 480px) {
  .sc-hero {
    &__circle { display: none; }
    &__num    { font-size: 34px; }
    &__stat-num { font-size: 22px; }
  }

  .sc-tx__title { font-size: 13px; }
  .sc-card { padding: 16px; }
}
</style>
