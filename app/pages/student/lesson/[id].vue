<script setup lang="ts">
definePageMeta({ layout: 'student' })

const route  = useRoute()
const router = useRouter()

type Lesson = {
  title: string; group: string; time: string; date: string; color: string
  goals: string[]
  plan: { time: string; title: string; desc: string }[]
  links: { icon: string; label: string; href: string; tag: string }[]
  tags: string[]
}

const lessons: Record<number, Lesson> = {
  1: {
    title: 'JavaScript — Асинхронность и промисы',
    group: 'WebDev-B', time: '18:00–19:30', date: 'Понедельник, 27 апреля 2026',
    color: '#5B2D8E',
    tags: ['JavaScript', 'Async', 'Promise'],
    goals: [
      'Понять разницу между синхронным и асинхронным кодом',
      'Научиться создавать и цеплять промисы через .then() и .catch()',
      'Освоить синтаксис async/await и обработку ошибок через try/catch',
      'Применить знания в практическом задании с fetch API'
    ],
    plan: [
      { time: '10 мин', title: 'Разминка и повторение',      desc: 'Опрос по прошлой теме — колбэки и Event Loop' },
      { time: '20 мин', title: 'Теория: промисы',             desc: 'Что такое Promise, состояния: pending / fulfilled / rejected' },
      { time: '25 мин', title: 'Практика: цепочки промисов',  desc: 'Живое кодирование — запрос к API через fetch + цепочка .then()' },
      { time: '20 мин', title: 'async / await',               desc: 'Переписываем тот же код на async/await, сравниваем читаемость' },
      { time: '10 мин', title: 'Задание на дом',              desc: 'Объяснение ДЗ: реализовать загрузку данных с обработкой ошибок' },
      { time: '5 мин',  title: 'Вопросы и итог',              desc: 'Краткое резюме, сбор вопросов' }
    ],
    links: [
      { icon: '📘', label: 'MDN — Promise',          href: 'https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise', tag: 'Документация' },
      { icon: '🎬', label: 'Видео: Event Loop',      href: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ', tag: 'Видео' },
      { icon: '💻', label: 'Задача на CodeSandbox',  href: 'https://codesandbox.io', tag: 'Практика' },
      { icon: '📄', label: 'Конспект урока (Notion)', href: 'https://notion.so',     tag: 'Конспект' }
    ],
  },
  2: {
    title: 'Python — ООП и классы',
    group: 'Python-A', time: '20:00–21:30', date: 'Понедельник, 27 апреля 2026',
    color: '#2E6E16',
    tags: ['Python', 'ООП', 'Классы'],
    goals: [
      'Разобраться с понятиями класс, объект, атрибут, метод',
      'Освоить принципы инкапсуляции и наследования',
      'Написать иерархию классов для реального сценария',
      'Понять магические методы: __init__, __str__, __repr__'
    ],
    plan: [
      { time: '10 мин', title: 'Повторение прошлого занятия', desc: 'Функции, модули, области видимости' },
      { time: '20 мин', title: 'Введение в ООП',              desc: 'Парадигмы программирования, зачем нужны классы' },
      { time: '25 мин', title: 'Практика: первый класс',      desc: 'Пишем класс Animal, наследники Dog и Cat' },
      { time: '20 мин', title: 'Инкапсуляция и свойства',     desc: 'Приватные атрибуты, @property, сеттеры' },
      { time: '10 мин', title: 'Домашнее задание',            desc: 'Система классов интернет-магазина' },
      { time: '5 мин',  title: 'Итог',                        desc: 'Вопросы, краткое резюме' }
    ],
    links: [
      { icon: '📘', label: 'docs.python.org — Classes',   href: 'https://docs.python.org/3/tutorial/classes.html', tag: 'Документация' },
      { icon: '🎬', label: 'Corey Schafer: OOP Python',   href: 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM',    tag: 'Видео' },
      { icon: '💻', label: 'Replit: практика классов',    href: 'https://replit.com',                             tag: 'Практика' },
      { icon: '📄', label: 'Слайды урока',                 href: 'https://notion.so',                             tag: 'Конспект' }
    ],
  },
  3: {
    title: 'HTML/CSS — Основы вёрстки',
    group: 'WebDev-A', time: '16:00–17:30', date: 'Вторник, 28 апреля 2026',
    color: '#7A6100',
    tags: ['HTML', 'CSS', 'Вёрстка'],
    goals: [
      'Понять структуру HTML-документа и семантические теги',
      'Освоить базовые CSS-свойства: цвет, размер, отступы',
      'Научиться строить макеты с Flexbox',
      'Написать первую адаптивную страницу'
    ],
    plan: [
      { time: '10 мин', title: 'Знакомство с группой',     desc: 'Вводное слово, цели курса, инструменты' },
      { time: '20 мин', title: 'HTML-структура',            desc: 'Теги, атрибуты, семантика: header, main, footer' },
      { time: '25 мин', title: 'CSS: стилизация',           desc: 'Селекторы, свойства, блочная модель' },
      { time: '25 мин', title: 'Flexbox на практике',       desc: 'Верстаем простую навигацию и карточки' },
      { time: '10 мин', title: 'ДЗ и итог',                 desc: 'Сверстать личную страницу по макету' }
    ],
    links: [
      { icon: '📘', label: 'MDN — HTML Basics',      href: 'https://developer.mozilla.org/ru/docs/Learn/HTML/Introduction_to_HTML', tag: 'Документация' },
      { icon: '🎮', label: 'Flexbox Froggy',          href: 'https://flexboxfroggy.com/#ru', tag: 'Игра' },
      { icon: '💻', label: 'CodePen: шаблон',         href: 'https://codepen.io',            tag: 'Практика' },
      { icon: '🎨', label: 'Figma-макет занятия',     href: 'https://figma.com',             tag: 'Дизайн' }
    ],
  },
  4: {
    title: 'Python — Функции и области видимости',
    group: 'Python-B', time: '20:00–21:30', date: 'Вторник, 28 апреля 2026',
    color: '#1A5A8E',
    tags: ['Python', 'Функции', 'LEGB'],
    goals: [
      'Понять синтаксис определения и вызова функций',
      'Разобраться с аргументами: позиционные, именованные, *args, **kwargs',
      'Освоить правило видимости LEGB',
      'Написать функции высшего порядка: map, filter, lambda'
    ],
    plan: [
      { time: '10 мин', title: 'Повторение',           desc: 'Списки, словари, условия' },
      { time: '20 мин', title: 'Функции',               desc: 'def, return, аргументы по умолчанию' },
      { time: '20 мин', title: 'Области видимости',     desc: 'LEGB, global и nonlocal' },
      { time: '20 мин', title: 'Функции высшего порядка', desc: 'map, filter, lambda — практика' },
      { time: '10 мин', title: 'ДЗ',                    desc: 'Калькулятор через функции' },
      { time: '10 мин', title: 'Q&A',                   desc: 'Вопросы и итог' }
    ],
    links: [
      { icon: '📘', label: 'docs.python.org — Functions', href: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions', tag: 'Документация' },
      { icon: '🎬', label: 'Видео: *args и **kwargs',      href: 'https://www.youtube.com/watch?v=WcTXxX3vYgY', tag: 'Видео' },
      { icon: '💻', label: 'Задачи на Replit',             href: 'https://replit.com',  tag: 'Практика' },
      { icon: '📄', label: 'Конспект',                     href: 'https://notion.so',   tag: 'Конспект' }
    ],
  },
  5: {
    title: 'JavaScript — Промисы и async/await',
    group: 'WebDev-B', time: '18:00–19:30', date: 'Среда, 29 апреля 2026',
    color: '#2E6E16',
    tags: ['JavaScript', 'Promise', 'Fetch'],
    goals: [
      'Закрепить работу с промисами на практическом проекте',
      'Освоить Promise.all и Promise.race',
      'Научиться работать с fetch API и обрабатывать ошибки',
      'Написать мини-приложение с реальным API'
    ],
    plan: [
      { time: '10 мин', title: 'Разбор ДЗ',            desc: 'Обсуждение решений прошлого задания' },
      { time: '20 мин', title: 'Promise.all / race',    desc: 'Параллельные запросы, гонка промисов' },
      { time: '30 мин', title: 'Практика: fetch API',   desc: 'Пишем приложение — список пользователей с JSONPlaceholder' },
      { time: '20 мин', title: 'Обработка ошибок',      desc: 'try/catch, .finally(), fallback данные' },
      { time: '10 мин', title: 'ДЗ и итог',             desc: 'Задание: приложение с несколькими параллельными запросами' }
    ],
    links: [
      { icon: '📘', label: 'MDN — Promise.all',            href: 'https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/all', tag: 'Документация' },
      { icon: '🔗', label: 'JSONPlaceholder API',           href: 'https://jsonplaceholder.typicode.com', tag: 'API' },
      { icon: '💻', label: 'Стартовый CodeSandbox',         href: 'https://codesandbox.io', tag: 'Практика' },
      { icon: '📄', label: 'Конспект',                      href: 'https://notion.so',      tag: 'Конспект' }
    ],
  },
  6: {
    title: 'React — Компоненты и Props',
    group: 'React-2025', time: '16:00–17:30', date: 'Четверг, 30 апреля 2026',
    color: '#1A5A8E',
    tags: ['React', 'JSX', 'Props'],
    goals: [
      'Понять концепцию компонентного подхода',
      'Научиться создавать функциональные компоненты',
      'Передавать данные через props и типизировать их',
      'Научиться разбивать UI на переиспользуемые части'
    ],
    plan: [
      { time: '10 мин', title: 'Повторение JSX',          desc: 'Быстрый опрос по прошлому материалу' },
      { time: '20 мин', title: 'Компоненты',               desc: 'Функциональные vs классовые, когда что использовать' },
      { time: '25 мин', title: 'Props и children',         desc: 'Передача данных, деструктуризация, defaultProps' },
      { time: '20 мин', title: 'Практика: UI-kit',         desc: 'Строим Button, Card, Badge компоненты' },
      { time: '15 мин', title: 'ДЗ и разбор',              desc: 'Задание: разбить готовую страницу на компоненты' }
    ],
    links: [
      { icon: '📘', label: 'React Docs — Components',   href: 'https://react.dev/learn/your-first-component', tag: 'Документация' },
      { icon: '🎬', label: 'React за 1 час (Traversy)', href: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',  tag: 'Видео' },
      { icon: '💻', label: 'StackBlitz: стартер',       href: 'https://stackblitz.com',                      tag: 'Практика' },
      { icon: '📄', label: 'Слайды',                     href: 'https://notion.so',                           tag: 'Конспект' }
    ],
  },
  7: {
    title: 'Алгоритмы — Графы и обходы',
    group: 'Алро-Adv', time: '20:00–21:30', date: 'Четверг, 30 апреля 2026',
    color: '#7A6100',
    tags: ['Алгоритмы', 'Граф', 'BFS', 'DFS'],
    goals: [
      'Понять структуру данных "граф" — вершины и рёбра',
      'Освоить обход в ширину (BFS) и обход в глубину (DFS)',
      'Научиться представлять граф через матрицу смежности и список',
      'Решить задачи: кратчайший путь, обнаружение цикла'
    ],
    plan: [
      { time: '10 мин', title: 'Повторение деревьев',      desc: 'BST, рекурсия, обход дерева' },
      { time: '20 мин', title: 'Введение в графы',          desc: 'Виды графов, способы представления' },
      { time: '25 мин', title: 'BFS',                       desc: 'Реализация на Python/JS, задача: кратчайший путь' },
      { time: '25 мин', title: 'DFS',                       desc: 'Рекурсивный и итеративный обход, обнаружение цикла' },
      { time: '10 мин', title: 'ДЗ',                        desc: 'LeetCode: задачи на BFS/DFS' }
    ],
    links: [
      { icon: '📘', label: 'Visualgo — Graph Traversal',   href: 'https://visualgo.net/en/dfsbfs', tag: 'Визуализация' },
      { icon: '🧩', label: 'LeetCode: Number of Islands',  href: 'https://leetcode.com/problems/number-of-islands/', tag: 'Задача' },
      { icon: '🎬', label: 'BFS и DFS за 10 минут',        href: 'https://www.youtube.com/watch?v=pcKY4hjDrxk',      tag: 'Видео' },
      { icon: '📄', label: 'Конспект с псевдокодом',        href: 'https://notion.so', tag: 'Конспект' }
    ],
  },
  8: {
    title: 'Проектная работа — Финальный спринт',
    group: 'WebDev-A', time: '18:00–19:30', date: 'Пятница, 1 мая 2026',
    color: '#5B2D8E',
    tags: ['Проект', 'HTML', 'CSS', 'JS'],
    goals: [
      'Завершить основной функционал проектной работы',
      'Провести code review в парах',
      'Подготовить презентацию проекта',
      'Задеплоить проект на GitHub Pages'
    ],
    plan: [
      { time: '10 мин', title: 'Статус-апдейт',           desc: 'Каждый кратко рассказывает что сделано' },
      { time: '30 мин', title: 'Работа над проектом',      desc: 'Самостоятельная работа, преподаватель помогает индивидуально' },
      { time: '20 мин', title: 'Code Review в парах',      desc: 'Обмен кодом, обратная связь' },
      { time: '20 мин', title: 'Деплой на GitHub Pages',   desc: 'Пошаговый деплой, проверка результата' },
      { time: '10 мин', title: 'Итог и ДЗ',                desc: 'Подготовить 3-минутную презентацию к следующему занятию' }
    ],
    links: [
      { icon: '📘', label: 'GitHub Pages — Docs',       href: 'https://docs.github.com/en/pages', tag: 'Документация' },
      { icon: '🎨', label: 'Figma-макеты проектов',     href: 'https://figma.com',                tag: 'Дизайн' },
      { icon: '💻', label: 'GitHub: репозиторий курса', href: 'https://github.com',               tag: 'Репозиторий' },
      { icon: '📄', label: 'Чеклист проекта',           href: 'https://notion.so',                tag: 'Чеклист' }
    ],
  }
}

const id     = Number(route.params.id)
const lesson = lessons[id] ?? lessons[1]

const tagColors: Record<string, string> = {
  'Документация': '#EDE7FF',
  'Видео':        '#FFE8D0',
  'Практика':     '#D0E8FF',
  'Конспект':     '#D8F5D0',
  'API':          '#D8EEFF',
  'Игра':         '#FFE0F0',
  'Дизайн':       '#FFF5C2',
  'Визуализация': '#E2F5D8',
  'Задача':       '#FFE0E0',
  'Репозиторий':  '#EDE7FF',
  'Чеклист':      '#D8F5D0',
}

const tagTextColors: Record<string, string> = {
  'Документация': '#5B2D8E',
  'Видео':        '#A0480A',
  'Практика':     '#1A5A8E',
  'Конспект':     '#2E6E16',
  'API':          '#1A5A8E',
  'Игра':         '#8E1A5A',
  'Дизайн':       '#7A6100',
  'Визуализация': '#2E6E16',
  'Задача':       '#8E1A1A',
  'Репозиторий':  '#5B2D8E',
  'Чеклист':      '#2E6E16',
}
</script>

<template>
  <div class="lsn-page">

    <!-- Шапка -->
    <div class="lsn-hero" :style="{ background: lesson.color }">
      <div class="lsn-hero__circles">
        <span class="lsn-hero__circle lsn-hero__circle--1" />
        <span class="lsn-hero__circle lsn-hero__circle--2" />
      </div>
      <div class="lsn-hero__content">
        <button class="lsn-back" @click="router.back()">← Назад</button>
        <div class="lsn-hero__tags">
          <span v-for="tag in lesson.tags" :key="tag" class="lsn-hero__tag">{{ tag }}</span>
        </div>
        <h1 class="lsn-hero__title">{{ lesson.title }}</h1>
        <div class="lsn-hero__meta">
          <span class="lsn-hero__meta-item">👥 {{ lesson.group }}</span>
          <span class="lsn-hero__meta-item">🕐 {{ lesson.time }}</span>
          <span class="lsn-hero__meta-item">📅 {{ lesson.date }}</span>
        </div>
      </div>
    </div>

    <div class="lsn-cols">

      <!-- Левая колонка -->
      <div class="lsn-left">

        <!-- Цели урока -->
        <div class="lsn-card">
          <div class="lsn-card__icon-wrap" :style="{ background: lesson.color + '20' }">
            <span class="lsn-card__icon">🎯</span>
          </div>
          <p class="lsn-section-label">ЦЕЛИ УРОКА</p>
          <ul class="lsn-goals">
            <li v-for="(goal, i) in lesson.goals" :key="i" class="lsn-goal">
              <span class="lsn-goal__num" :style="{ background: lesson.color + '20', color: lesson.color }">{{ i + 1 }}</span>
              <span class="lsn-goal__text">{{ goal }}</span>
            </li>
          </ul>
        </div>

        <!-- План урока -->
        <div class="lsn-card">
          <div class="lsn-card__icon-wrap" :style="{ background: lesson.color + '20' }">
            <span class="lsn-card__icon">📋</span>
          </div>
          <p class="lsn-section-label">ПЛАН УРОКА</p>
          <div class="lsn-plan">
            <div v-for="(step, i) in lesson.plan" :key="i" class="lsn-plan-step">
              <div class="lsn-plan-step__left">
                <div class="lsn-plan-step__dot" :style="{ background: lesson.color }" />
                <div v-if="i < lesson.plan.length - 1" class="lsn-plan-step__line" />
              </div>
              <div class="lsn-plan-step__body">
                <div class="lsn-plan-step__header">
                  <span class="lsn-plan-step__title">{{ step.title }}</span>
                  <span class="lsn-plan-step__time" :style="{ color: lesson.color }">{{ step.time }}</span>
                </div>
                <p class="lsn-plan-step__desc">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Правая колонка -->
      <div class="lsn-right">

        <!-- Материалы и ссылки -->
        <div class="lsn-card">
          <div class="lsn-card__icon-wrap" :style="{ background: lesson.color + '20' }">
            <span class="lsn-card__icon">🔗</span>
          </div>
          <p class="lsn-section-label">МАТЕРИАЛЫ И ССЫЛКИ</p>
          <div class="lsn-links">
            <a
              v-for="link in lesson.links"
              :key="link.label"
              :href="link.href"
              target="_blank"
              rel="noopener"
              class="lsn-link"
            >
              <span class="lsn-link__icon">{{ link.icon }}</span>
              <span class="lsn-link__label">{{ link.label }}</span>
              <span
                class="lsn-link__tag"
                :style="{ background: tagColors[link.tag] ?? '#F0F0F0', color: tagTextColors[link.tag] ?? '#555' }"
              >{{ link.tag }}</span>
              <span class="lsn-link__arrow">↗</span>
            </a>
          </div>
        </div>

        <!-- Статистика -->
        <div class="lsn-stats">
          <div class="lsn-stat" :style="{ borderTopColor: lesson.color }">
            <span class="lsn-stat__num">{{ lesson.plan.length }}</span>
            <span class="lsn-stat__label">Блоков в плане</span>
          </div>
          <div class="lsn-stat" :style="{ borderTopColor: lesson.color }">
            <span class="lsn-stat__num">{{ lesson.goals.length }}</span>
            <span class="lsn-stat__label">Целей урока</span>
          </div>
          <div class="lsn-stat" :style="{ borderTopColor: lesson.color }">
            <span class="lsn-stat__num">{{ lesson.links.length }}</span>
            <span class="lsn-stat__label">Ссылок</span>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style lang="scss">
.lsn-page {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Hero */
.lsn-hero {
  border-radius: var(--radius-md);
  padding: 36px 40px;
  position: relative;
  overflow: hidden;

  &__circles { position: absolute; inset: 0; pointer-events: none; }

  &__circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);

    &--1 { width: 320px; height: 320px; right: -60px;  top: -120px; }
    &--2 { width: 180px; height: 180px; right: 180px; bottom: -70px; }
  }

  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__tag {
    padding: 4px 12px;
    border-radius: var(--radius-full);
    background: rgba(255,255,255,0.18);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    backdrop-filter: blur(4px);
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    line-height: 1.25;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  &__meta-item {
    font-size: 14px;
    color: rgba(255,255,255,0.8);
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.lsn-back {
  align-self: flex-start;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: var(--radius-full);
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  font-family: var(--font-main);
  transition: background 0.2s;
  backdrop-filter: blur(4px);

  &:hover { background: rgba(255,255,255,0.25); }
}

/* Columns */
.lsn-cols {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
}

.lsn-left, .lsn-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card */
.lsn-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon { font-size: 22px; }
}

.lsn-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-purple-text);
}

/* Goals */
.lsn-goals {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lsn-goal {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  &__num {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
  }

  &__text {
    font-size: 15px;
    color: var(--c-text-dark);
    line-height: 1.55;
  }
}

/* Plan */
.lsn-plan {
  display: flex;
  flex-direction: column;
}

.lsn-plan-step {
  display: flex;
  gap: 16px;

  &__left {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 16px;
  }

  &__dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;
  }

  &__line {
    width: 2px;
    flex: 1;
    background: #EBEBEB;
    margin: 4px 0;
    min-height: 20px;
  }

  &__body {
    padding-bottom: 20px;
    flex: 1;
  }

  &:last-child &__body { padding-bottom: 0; }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 4px;
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__time {
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    background: currentColor;
    background-clip: text;
    opacity: 0.9;
  }

  &__desc {
    font-size: 13px;
    color: var(--c-text-gray);
    line-height: 1.5;
  }
}

/* Links */
.lsn-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lsn-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px solid #EBEBEB;
  text-decoration: none;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: var(--c-purple-text);
    transform: translateX(2px);
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  }

  &__icon { font-size: 18px; flex-shrink: 0; }

  &__label {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: var(--c-text-dark);
  }

  &__tag {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  &__arrow {
    font-size: 14px;
    color: var(--c-text-gray);
    flex-shrink: 0;
  }
}

/* Stats */
.lsn-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.lsn-stat {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 20px 16px;
  text-align: center;
  border-top: 3px solid;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__num {
    font-family: var(--font-heading);
    font-size: 32px;
    font-weight: 800;
    color: var(--c-text-dark);
    line-height: 1;
  }

  &__label {
    font-size: 12px;
    color: var(--c-text-gray);
    font-weight: 500;
  }
}

@media (max-width: 900px) {
  .lsn-cols { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .lsn-hero { padding: 24px 20px; &__title { font-size: 20px; } }
  .lsn-card { padding: 20px; }
  .lsn-stats { grid-template-columns: repeat(3, 1fr); }
}
</style>
