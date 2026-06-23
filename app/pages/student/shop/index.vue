<script setup lang="ts">
import checkIcon  from '~/assets/icons/YellowGalochka.svg'
import cartIcon   from '~/assets/icons/shopping-cart.svg'

definePageMeta({ layout: 'student' })

const api = useApi()
const { data: shop } = await useAsyncData('student-shop', () => api<any>('/student/shop'))

const balance = reactive({ total: 0, thisMonth: 0, level: '', toNext: 0 })
const transactions = ref<any[]>([])
const products = ref<any[]>([])

watchEffect(() => {
  if (shop.value) {
    Object.assign(balance, shop.value.balance)
    transactions.value = [...shop.value.transactions]
    products.value = [...shop.value.products]
  }
})

const badgeMap: Record<string, { label: string; cls: string }> = {
  hit:  { label: 'Хит',     cls: 'shop-product__badge--hit'  },
  new:  { label: 'Новинка', cls: 'shop-product__badge--new'  },
  sale: { label: 'Скидка',  cls: 'shop-product__badge--sale' }
}

const selectedProduct = ref<any | null>(null)
const purchaseDone    = ref(false)
const purchaseError   = ref('')

function openBuy(product: any) {
  if (product.price > balance.total || product.stock === 0) return
  selectedProduct.value = product
  purchaseDone.value = false
  purchaseError.value = ''
}

async function confirmPurchase() {
  if (!selectedProduct.value) return
  purchaseError.value = ''
  try {
    const res = await api<any>('/student/shop/buy', {
      method: 'POST',
      body: { productId: selectedProduct.value.id },
    })
    balance.total = res.balance
    transactions.value.unshift(res.transaction)
    purchaseDone.value = true
    setTimeout(() => { selectedProduct.value = null }, 1200)
  } catch (e: any) {
    purchaseError.value =
      e?.data?.errors?.productId?.[0] || e?.data?.message || 'Не удалось оформить покупку'
  }
}

function remainder(price: number) {
  return balance.total - price
}

function shortage(price: number) {
  return price - balance.total
}
</script>

<template>
  <div class="shop-page">

    <!-- Верхний блок: баланс + транзакции -->
    <div class="shop-top">

      <!-- Карточка баланса -->
      <div class="shop-balance">
        <p class="shop-balance__label">Накопительный счёт</p>
        <div class="shop-balance__total">
          <span class="shop-balance__num">{{ balance.total.toLocaleString('ru') }}</span>
          <span class="shop-balance__star">⭐</span>
        </div>
        <p class="shop-balance__sub">Ваши баллы за выполненные задания</p>
        <div class="shop-balance__tags">
          <span class="shop-balance__tag shop-balance__tag--green">+{{ balance.thisMonth }} в этом месяце</span>
          <span class="shop-balance__tag shop-balance__tag--yellow">Уровень: {{ balance.level }}</span>
          <span class="shop-balance__tag shop-balance__tag--outline">До следующего: {{ balance.toNext }} баллов</span>
        </div>
      </div>

      <!-- История транзакций -->
      <div class="shop-history">
        <div class="shop-history__head">
          <span class="shop-history__title">История транзакций</span>
          <span class="shop-history__count">{{ transactions.length }} операций</span>
        </div>
        <div class="shop-history__list">
          <div v-for="tx in transactions.slice(0, 4)" :key="tx.id" class="shop-tx">
            <img
              :src="tx.type === 'purchase' ? cartIcon : checkIcon"
              alt=""
              class="shop-tx__icon"
              :class="tx.type === 'purchase' ? 'shop-tx__icon--red' : 'shop-tx__icon--green'"
            />
            <div class="shop-tx__info">
              <p class="shop-tx__title">{{ tx.title }}</p>
              <p class="shop-tx__date">{{ tx.date }}</p>
            </div>
            <span
              class="shop-tx__amount"
              :class="tx.amount > 0 ? 'shop-tx__amount--plus' : 'shop-tx__amount--minus'"
            >
              {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
            </span>
          </div>
        </div>
      </div>

    </div>

    <!-- Магазин мерча -->
    <div class="shop-merch">
      <div class="shop-merch__header">
        <div>
          <h2 class="shop-merch__title">Магазин мерча</h2>
          <p class="shop-merch__sub">Обменивайте баллы на крутые вещи</p>
        </div>
        <span class="shop-merch__balance">
          Ваш баланс: <strong>{{ balance.total.toLocaleString('ru') }}</strong> ⭐
        </span>
      </div>

      <div class="shop-grid">
        <div
          v-for="product in products"
          :key="product.id"
          class="shop-product"
          :style="product.cardBg ? { background: product.cardBg } : {}"
        >
          <!-- Бейдж -->
          <span
            v-if="product.badge"
            class="shop-product__badge"
            :class="badgeMap[product.badge].cls"
          >
            {{ badgeMap[product.badge].label }}
          </span>

          <!-- Картинка -->
          <div class="shop-product__img" :style="product.image ? {} : { background: product.bg }">
            <img v-if="product.image" :src="product.image" :alt="product.title" class="shop-product__photo" />
            <span v-else class="shop-product__emoji">{{ product.emoji }}</span>
          </div>

          <!-- Инфо -->
          <div class="shop-product__body">
            <h3 class="shop-product__name">{{ product.title }}</h3>
            <p class="shop-product__desc">{{ product.desc }}</p>
          </div>

          <!-- Цена + кнопка -->
          <div class="shop-product__footer">
            <span class="shop-product__price">⭐ {{ product.price }}</span>
            <div class="shop-product__buy-wrap">
              <button v-if="product.stock === 0" class="shop-product__btn shop-product__btn--disabled" disabled>
                Нет в наличии
              </button>
              <button
                v-else-if="product.price <= balance.total"
                class="shop-product__btn"
                @click="openBuy(product)"
              >
                🛒 Купить
              </button>
              <template v-else>
                <button class="shop-product__btn shop-product__btn--disabled" disabled>
                  Не хватает {{ shortage(product.price) }} б.
                </button>
                <p class="shop-product__shortage">Нужно ещё {{ shortage(product.price) }} баллов</p>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Попап подтверждения покупки -->
    <Teleport to="body">
      <div v-if="selectedProduct" class="shop-modal-overlay" @click.self="selectedProduct = null">
        <div class="shop-modal">
          <template v-if="!purchaseDone">
            <h2 class="shop-modal__title">Подтвердить покупку</h2>
            <p class="shop-modal__product">{{ selectedProduct.title }}</p>

            <div class="shop-modal__table">
              <div class="shop-modal__row">
                <span class="shop-modal__key">Стоимость</span>
                <span class="shop-modal__val shop-modal__val--red">−{{ selectedProduct.price }}</span>
              </div>
              <div class="shop-modal__row">
                <span class="shop-modal__key">Текущий баланс</span>
                <span class="shop-modal__val">{{ balance.total.toLocaleString('ru') }}</span>
              </div>
              <div class="shop-modal__row">
                <span class="shop-modal__key">Остаток после покупки</span>
                <span class="shop-modal__val shop-modal__val--green">{{ remainder(selectedProduct.price).toLocaleString('ru') }}</span>
              </div>
            </div>

            <p v-if="purchaseError" class="shop-modal__error">{{ purchaseError }}</p>

            <div class="shop-modal__footer">
              <button class="shop-modal__btn shop-modal__btn--outline" @click="selectedProduct = null">Отмена</button>
              <button class="shop-modal__btn shop-modal__btn--filled" @click="confirmPurchase">Подтвердить</button>
            </div>
          </template>

          <div v-else class="shop-modal__success">
            <p class="shop-modal__success-icon">✅</p>
            <p class="shop-modal__success-text">Покупка оформлена!</p>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style lang="scss">
.shop-page {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ── Верхний блок ─────────────────────────────────── */
.shop-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Баланс */
.shop-balance {
  background: var(--c-purple);
  border-radius: var(--radius-md);
  padding: 28px 32px;
  color: var(--c-white);

  &__label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--c-text-white-dim);
    margin-bottom: 12px;
    text-transform: uppercase;
  }

  &__total {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }

  &__num {
    font-family: var(--font-heading);
    font-size: 52px;
    font-weight: 800;
    line-height: 1;
  }

  &__star { font-size: 36px; }

  &__sub {
    font-size: 14px;
    color: var(--c-text-white-dim);
    margin-bottom: 20px;
  }

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

    &--green   { background: rgba(86, 184, 53, 0.25); color: #ffffff; }
    &--yellow  { background: var(--c-yellow-light); color: var(--c-yellow); }
    &--outline { border: 1.5px solid rgba(255,255,255,0.4); color: var(--c-white); }
  }
}

/* История транзакций */
.shop-history {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__count {
    font-size: 13px;
    color: var(--c-purple-text);
    font-weight: 600;
    cursor: pointer;

    &:hover { text-decoration: underline; }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.shop-tx {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--c-blue-stripe);

  &__icon {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    padding: 5px;
    border-radius: 50%;

    &--green { background: var(--c-green-light); }
    &--red   { background: var(--c-red-light); }
  }

  &__info { flex: 1; }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--c-text-dark);
  }

  &__date {
    font-size: 12px;
    color: var(--c-text-gray);
    margin-top: 2px;
  }

  &__amount {
    font-size: 15px;
    font-weight: 700;
    flex-shrink: 0;

    &--plus  { color: var(--c-green); }
    &--minus { color: var(--c-red);   }
  }
}

/* ── Магазин мерча ────────────────────────────────── */
.shop-merch {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  &__title {
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-bottom: 4px;
  }

  &__sub {
    font-size: 14px;
    color: var(--c-text-gray);
  }

  &__balance {
    font-size: 14px;
    color: var(--c-text-dark);

    strong { color: var(--c-purple-text); }
  }
}

/* Грид товаров */
.shop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* Карточка товара */
.shop-product {
  position: relative;
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__badge {
    position: absolute;
    top: 14px;
    right: 14px;
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: 12px;
    font-weight: 700;

    &--hit  { background: var(--c-red);         color: var(--c-white); }
    &--new  { background: var(--c-green);        color: var(--c-white); }
    &--sale { background: var(--c-yellow);       color: var(--c-yellow-text); }
  }

  &__img {
    height: 120px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__emoji { font-size: 56px; line-height: 1; }

  &__photo {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: var(--radius-sm);
  }

  &__body { flex: 1; }

  &__name {
    font-size: 15px;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-bottom: 6px;
  }

  &__desc {
    font-size: 13px;
    color: var(--c-text-gray);
    line-height: 1.5;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__price {
    font-size: 15px;
    font-weight: 700;
    color: var(--c-text-dark);
  }

  &__buy-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: var(--radius-full);
    font-size: 13px;
    font-weight: 600;
    border: none;
    background: var(--c-purple-text);
    color: var(--c-white);
    cursor: pointer;
    transition: opacity 0.2s;
    font-family: var(--font-main);

    &:hover { opacity: 0.88; }

    &--disabled {
      background: #E0E0E0;
      color: #888;
      cursor: not-allowed;

      &:hover { opacity: 1; }
    }
  }

  &__shortage {
    font-size: 11px;
    color: var(--c-red);
    font-weight: 500;
  }
}

/* ── Попап покупки ────────────────────────────────── */
.shop-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.shop-modal {
  background: var(--c-white);
  border-radius: var(--radius-lg);
  padding: 36px 40px;
  width: 100%;
  max-width: 480px;

  &__title {
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 700;
    color: var(--c-text-dark);
    text-align: center;
    margin-bottom: 6px;
  }

  &__product {
    font-size: 15px;
    color: var(--c-purple-text);
    text-align: center;
    margin-bottom: 24px;
  }

  &__table {
    background: var(--c-bg);
    border-radius: var(--radius-sm);
    overflow: hidden;
    margin-bottom: 28px;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(0,0,0,0.05);

    &:last-child { border-bottom: none; }
  }

  &__key {
    font-size: 14px;
    color: var(--c-text-dark);
  }

  &__val {
    font-size: 16px;
    font-weight: 700;
    color: var(--c-text-dark);

    &--red   { color: var(--c-red);   }
    &--green { color: var(--c-green); }
  }

  &__error {
    font-size: 13px;
    color: var(--c-red);
    text-align: center;
    margin-bottom: 12px;
  }

  &__footer {
    display: flex;
    gap: 12px;
  }

  &__btn {
    flex: 1;
    height: 50px;
    border-radius: var(--radius-full);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
    font-family: var(--font-main);
    border: none;

    &--outline {
      background: transparent;
      border: 1.5px solid var(--c-purple-text);
      color: var(--c-purple-text);
      &:hover { background: var(--c-purple-light); }
    }

    &--filled {
      background: var(--c-purple-text);
      color: var(--c-white);
      &:hover { opacity: 0.88; }
    }
  }

  &__success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
  }

  &__success-icon { font-size: 48px; }

  &__success-text {
    font-size: 18px;
    font-weight: 700;
    color: var(--c-green);
  }
}

@media (max-width: 768px) {
  .shop-top { grid-template-columns: 1fr; }

  .shop-grid { grid-template-columns: repeat(2, 1fr); }

  .shop-merch__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .shop-history__list { gap: 8px; }
}

@media (max-width: 480px) {
  .shop-balance {
    padding: 20px;

    &__num { font-size: 40px; }
    &__star { font-size: 28px; }
  }

  .shop-grid { grid-template-columns: 1fr; }

  .shop-product {
    &__img { height: 100px; }
    &__emoji { font-size: 46px; }
  }

  .shop-modal {
    padding: 24px 20px;
    border-radius: var(--radius-md);

    &__footer { flex-direction: column; }
    &__btn { height: 46px; }
  }

  .shop-tx__title { font-size: 12px; }
}
</style>
