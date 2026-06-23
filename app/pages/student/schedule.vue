<script setup lang="ts">
definePageMeta({ layout: 'student' })

const { data } = await useAsyncData('student-lessons', () =>
  useApi()<any>('/student/lessons'),
)

const upcoming = computed(() => data.value?.upcoming ?? [])
const past     = computed(() => data.value?.past ?? [])
</script>

<template>
  <div v-if="data" class="ssch">
    <div class="ssch__header">
      <h1 class="ssch__title">Моё расписание</h1>
      <p class="ssch__sub">Занятия группы, материалы прошедших уроков</p>
    </div>

    <!-- Предстоящие -->
    <section class="ssch-block">
      <p class="ssch-block__label">ПРЕДСТОЯЩИЕ ЗАНЯТИЯ</p>
      <div v-if="upcoming.length" class="ssch-list">
        <div v-for="l in upcoming" :key="l.id" class="ssch-card">
          <div class="ssch-card__date">
            <img src="~/assets/icons/PerpleCalendar.svg" alt="" />
            <span>{{ l.date }}</span>
            <span class="ssch-card__time">{{ l.time }}</span>
          </div>
          <h3 class="ssch-card__title">{{ l.title }}</h3>
          <div class="ssch-card__tags">
            <span v-for="t in l.tags" :key="t" class="ssch-tag">{{ t }}</span>
            <span class="ssch-card__group">{{ l.group }}</span>
          </div>
          <NuxtLink :to="`/student/lesson/${l.id}`" class="ssch-card__btn">Материалы урока</NuxtLink>
        </div>
      </div>
      <p v-else class="ssch-empty">Предстоящих занятий пока нет</p>
    </section>

    <!-- Прошедшие -->
    <section class="ssch-block">
      <p class="ssch-block__label">ПРОШЕДШИЕ ЗАНЯТИЯ</p>
      <div v-if="past.length" class="ssch-list ssch-list--past">
        <div v-for="l in past" :key="l.id" class="ssch-card ssch-card--past">
          <div class="ssch-card__date">
            <img src="~/assets/icons/PerpleCalendar.svg" alt="" />
            <span>{{ l.date }}</span>
            <span class="ssch-card__time">{{ l.time }}</span>
          </div>
          <h3 class="ssch-card__title">{{ l.title }}</h3>
          <div class="ssch-card__tags">
            <span v-for="t in l.tags" :key="t" class="ssch-tag">{{ t }}</span>
          </div>
          <NuxtLink :to="`/student/lesson/${l.id}`" class="ssch-card__btn ssch-card__btn--outline">Открыть материалы</NuxtLink>
        </div>
      </div>
      <p v-else class="ssch-empty">Прошедших занятий пока нет</p>
    </section>
  </div>
</template>

<style lang="scss">
.ssch {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__title {
    font-family: var(--font-heading);
    font-size: 26px;
    font-weight: 800;
    color: var(--c-text-dark);
  }

  &__sub {
    font-size: 14px;
    color: var(--c-text-gray);
    margin-top: 4px;
  }
}

.ssch-block {
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--c-purple-text);
  }
}

.ssch-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.ssch-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-left: 4px solid var(--c-purple);

  &--past { border-left-color: #D0D0D0; opacity: 0.96; }

  &__date {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--c-text-gray);
    img { width: 16px; height: 16px; }
  }

  &__time {
    margin-left: auto;
    font-weight: 600;
    color: var(--c-purple-text);
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--c-text-dark);
    line-height: 1.35;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__group {
    font-size: 12px;
    color: var(--c-text-gray);
    align-self: center;
  }

  &__btn {
    margin-top: 4px;
    align-self: flex-start;
    padding: 9px 20px;
    border-radius: var(--radius-full);
    background: var(--c-purple-text);
    color: var(--c-white);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }

    &--outline {
      background: transparent;
      border: 1.5px solid var(--c-purple-text);
      color: var(--c-purple-text);
      &:hover { background: var(--c-purple-light); opacity: 1; }
    }
  }
}

.ssch-tag {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: var(--c-purple-light);
  color: var(--c-purple-text);
}

.ssch-empty {
  font-size: 14px;
  color: var(--c-text-gray);
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 24px;
  text-align: center;
}
</style>
