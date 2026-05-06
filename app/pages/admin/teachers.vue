<script setup lang="ts">
definePageMeta({ layout: 'admin' })

// TODO: заменить на useFetch('/api/admin/teachers')
const data = {
  total: 7, onProbation: 2,
  items: [
    { id:1, initials:'АВ', color:'#F5A623', name:'Алексей Воронцов',  subject:'Программирование (Python)', email:'alex.v@algorithmika.ru',  phone:'+7 (916) 555-12-34', status:'active',     rate:1450 },
    { id:2, initials:'ЕГ', color:'#7B5EA7', name:'Екатерина Громова', subject:'Web-разработка',            email:'e.gromova@algo.ru',        phone:'+7 (903) 220-45-67', status:'active',     rate:1580 },
    { id:3, initials:'ДС', color:'#E8823A', name:'Дмитрий Соболев',   subject:'Robotics',                  email:'d.sobolev@algo.ru',        phone:'+7 (925) 780-90-12', status:'probation',  rate:1200 },
    { id:4, initials:'АФ', color:'#D4A017', name:'Анна Филатова',     subject:'GameDev',                   email:'anna.f@algo.com',          phone:'+7 (917) 342-78-90', status:'active',     rate:1650 },
    { id:5, initials:'МО', color:'#6B8FA8', name:'Максим Орлов',      subject:'Scratch & логика',          email:'m.orlov@algorithmika.ru',  phone:'+7 (929) 111-22-33', status:'pending',    rate:1100 },
    { id:6, initials:'ТС', color:'#3A9A8A', name:'Татьяна Смирнова',  subject:'AI / ML',                   email:'t.smirnova@algokids.ru',   phone:'+7 (916) 988-45-67', status:'active',     rate:1750 },
    { id:7, initials:'ИМ', color:'#8A8A9A', name:'Игорь Морозов',     subject:'Web-разработка',            email:'igor.m@code-school.ru',    phone:'+7 (903) 777-33-88', status:'probation',  rate:1250 }
  ]
}

const statusMap: Record<string, { label: string; cls: string }> = {
  active:     { label: 'активный',   cls: 'al-badge--green'  },
  probation:  { label: 'Исп. срок',  cls: 'al-badge--yellow' },
  pending:    { label: 'ожидает',    cls: 'al-badge--blue'   }
}

const tabs = [
  { key: 'all',       label: 'Все',         count: 7 },
  { key: 'active',    label: 'Активные',    count: 4 },
  { key: 'probation', label: 'Исп. срок',   count: 2 },
  { key: 'pending',   label: 'Ожидает',     count: 1 }
]

const activeTab = ref('all')
const search = ref('')

const filtered = computed(() => {
  let list = activeTab.value === 'all' ? data.items : data.items.filter(i => i.status === activeTab.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.subject.toLowerCase().includes(q) || i.email.toLowerCase().includes(q))
  }
  return list
})
</script>

<template>
  <div class="al-page">

    <div class="al-hero">
      <h1 class="al-hero__title">Преподаватели</h1>
      <div class="al-hero__badges">
        <span class="al-hero__badge">Всего: {{ data.total }}</span>
        <span class="al-hero__badge al-hero__badge--light">На испытании: {{ data.onProbation }}</span>
      </div>
    </div>

    <div class="al-card">
      <div class="al-card__head">
        <h2 class="al-card__title">Список преподавателей</h2>
        <div class="al-card__controls">
          <div class="al-search">
            <span class="al-search__icon">🔍</span>
            <input v-model="search" class="al-search__input" placeholder="Поиск" />
          </div>
          <button class="al-add-btn">+</button>
        </div>
      </div>

      <div class="al-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="al-tab"
          :class="{ 'al-tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }} <span class="al-tab__count">{{ tab.count }}</span>
        </button>
      </div>

      <table class="al-table">
        <thead>
          <tr>
            <th>ПРЕПОДАВАТЕЛЬ</th>
            <th>ПРЕДМЕТ</th>
            <th>КОНТАКТ / EMAIL</th>
            <th>СТАТУС</th>
            <th>СТАВКА (Р/ЧАС)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in filtered" :key="t.id" class="al-table__row">
            <td>
              <div class="al-person">
                <div class="al-avatar" :style="{ background: t.color }">{{ t.initials }}</div>
                <span class="al-table__name">{{ t.name }}</span>
              </div>
            </td>
            <td>{{ t.subject }}</td>
            <td class="al-table__gray">{{ t.email }} {{ t.phone }}</td>
            <td>
              <span class="al-badge" :class="statusMap[t.status].cls">
                <span v-if="t.status !== 'probation'" class="al-badge__dot" />
                {{ statusMap[t.status].label }}
              </span>
            </td>
            <td class="al-table__name">{{ t.rate.toLocaleString('ru') }} ₽</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>
