<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api, { imageUrl } from '@/services/api.js'

const router = useRouter()

const offers = ref([])
const loading = ref(false)
const error = ref(null)

const activeFilter = ref('all')

const filters = [
  {
    key: 'all',
    label: 'All Offers',
  },
  {
    key: 'discount',
    label: 'Discount',
  },
  {
    key: 'limited_time',
    label: 'Limited Time',
  },
  {
    key: 'featured',
    label: 'Featured',
  },
  {
    key: 'reservation',
    label: 'Reservation',
  },
  {
    key: 'pre_order',
    label: 'Pre-Order',
  },
]

const filteredOffers = computed(() => {
  if (activeFilter.value === 'all') {
    return offers.value
  }

  return offers.value.filter(
      offer => offer.type === activeFilter.value
  )
})

const getPrimaryImage = (vehicle) => {
  if (!vehicle?.images?.length) {
    return null
  }

  return (
      vehicle.images.find(image => image.is_primary) ||
      vehicle.images[0]
  )
}

const getVehicleName = (offer) => {
  return offer.vehicle?.vehicle_model?.name || 'Unknown Vehicle'
}

const getBrandName = (offer) => {
  return offer.vehicle?.vehicle_model?.brand?.name || 'Unknown Brand'
}

const formatPrice = (price) => {
  if (price === null || price === undefined) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

const formatDate = (date) => {
  if (!date) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

const formatOfferType = (type) => {
  const labels = {
    discount: 'Discount',
    limited_time: 'Limited Time',
    featured: 'Featured',
    reservation: 'Reservation',
    pre_order: 'Pre-Order',
  }

  return labels[type] || type
}

const hasDiscount = (offer) => {
  return (
      offer.type === 'discount' &&
      offer.discount_type &&
      offer.discount_value !== null &&
      offer.discount_value !== undefined
  )
}

const getDiscountLabel = (offer) => {
  if (!hasDiscount(offer)) {
    return null
  }

  if (offer.discount_type === 'percentage') {
    return `${Number(offer.discount_value)}% OFF`
  }

  if (offer.discount_type === 'fixed') {
    return `${formatPrice(offer.discount_value)} OFF`
  }

  return null
}

const getFinalPrice = (offer) => {
  const price = Number(offer.vehicle?.price)

  if (!price || !hasDiscount(offer)) {
    return null
  }

  if (offer.discount_type === 'percentage') {
    return price - (price * Number(offer.discount_value)) / 100
  }

  if (offer.discount_type === 'fixed') {
    return Math.max(price - Number(offer.discount_value), 0)
  }

  return null
}

const getOfferStatus = (offer) => {
  const now = new Date()

  if (offer.starts_at) {
    const startsAt = new Date(offer.starts_at)

    if (startsAt > now) {
      return 'Upcoming'
    }
  }

  if (offer.ends_at) {
    const endsAt = new Date(offer.ends_at)

    if (endsAt < now) {
      return 'Expired'
    }
  }

  return 'Active'
}

const goToVehicle = (offer) => {
  if (!offer.vehicle?.id) {
    return
  }

  router.push({
    name: 'vehicle-details',
    params: {
      vehicle: offer.vehicle.id,
    },
  })
}

const loadOffers = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/offers')

    offers.value = response.data.offers ?? response.data
  } catch (err) {
    error.value = 'Failed to load offers.'
    offers.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOffers()
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">

    <!-- Header -->
    <div class="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

      <div class="max-w-xl">
        <p class="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/30">
          Active Offers
        </p>

        <h1
            class="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl"
        >
          Exclusive
          <span class="block">Offers.</span>
        </h1>

        <p class="mt-5 max-w-lg text-sm leading-7 text-white/40">
          Discover special offers, limited-time deals and exclusive
          opportunities across our vehicle collection.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-xs text-white/35">
          {{ filteredOffers.length }} offer{{ filteredOffers.length === 1 ? '' : 's' }}
        </span>
      </div>

    </div>

    <!-- Filters -->
    <div
        v-if="!loading && offers.length"
        class="mb-8 overflow-x-auto border-b border-white/10"
    >
      <div class="flex min-w-max">

        <button
            v-for="filter in filters"
            :key="filter.key"
            type="button"
            @click="activeFilter = filter.key"
            class="relative whitespace-nowrap px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] transition"
            :class="
              activeFilter === filter.key
                ? 'text-white'
                : 'text-white/30 hover:text-white/60'
            "
        >
          {{ filter.label }}

          <span
              v-if="activeFilter === filter.key"
              class="absolute inset-x-5 bottom-0 h-px bg-white"
          />
        </button>

      </div>
    </div>

    <!-- Loading -->
    <div
        v-if="loading"
        class="py-24 text-center text-sm text-white/35"
    >
      Loading offers...
    </div>

    <template v-else>

      <!-- Empty -->
      <div
          v-if="!offers.length"
          class="rounded-3xl border border-white/10 bg-white/[0.025] px-8 py-20 text-center"
      >
        <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25">
          No Offers
        </p>

        <h2 class="mt-4 text-2xl font-bold text-white">
          There are no active offers right now.
        </h2>

        <p class="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/35">
          Check back later for new discounts, limited-time offers
          and special vehicle opportunities.
        </p>

        <button
            type="button"
            @click="router.push({ name: 'vehicles' })"
            class="mt-8 rounded-xl bg-white px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white/90"
        >
          Browse Vehicles
        </button>
      </div>

      <!-- Filter Empty -->
      <div
          v-else-if="!filteredOffers.length"
          class="rounded-2xl border border-white/10 bg-white/[0.025] px-8 py-16 text-center"
      >
        <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
          No Matches
        </p>

        <h2 class="mt-3 text-xl font-bold text-white">
          No offers in this category.
        </h2>

        <button
            type="button"
            @click="activeFilter = 'all'"
            class="mt-6 rounded-lg border border-white/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50 transition hover:border-white/20 hover:text-white"
        >
          View All Offers
        </button>
      </div>

      <!-- Offer Grid -->
      <div
          v-else
          class="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >

        <article
            v-for="offer in filteredOffers"
            :key="offer.id"
            class="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition hover:border-white/15"
        >

          <!-- Image -->
          <div class="relative overflow-hidden">

            <img
                v-if="getPrimaryImage(offer.vehicle)"
                :src="imageUrl(getPrimaryImage(offer.vehicle).path)"
                :alt="getVehicleName(offer)"
                class="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />

            <div
                v-else
                class="flex aspect-[16/10] items-center justify-center bg-white/[0.025] text-[10px] uppercase tracking-[0.2em] text-white/20"
            >
              No Image
            </div>

            <!-- Type Badge -->
            <div class="absolute left-4 top-4">
              <span
                  class="rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/70 backdrop-blur"
              >
                {{ formatOfferType(offer.type) }}
              </span>
            </div>

            <!-- Discount Badge -->
            <div
                v-if="getDiscountLabel(offer)"
                class="absolute right-4 top-4"
            >
              <span
                  class="rounded-full bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-black"
              >
                {{ getDiscountLabel(offer) }}
              </span>
            </div>

          </div>

          <!-- Content -->
          <div class="p-5">

            <!-- Vehicle -->
            <div class="flex items-center justify-between gap-3">

              <div>
                <p class="text-[9px] uppercase tracking-[0.2em] text-white/30">
                  {{ getBrandName(offer) }}
                </p>

                <h2 class="mt-1 text-lg font-bold text-white">
                  {{ getVehicleName(offer) }}
                </h2>
              </div>

              <span
                  class="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-wider text-white/30"
              >
                {{ offer.vehicle?.year }}
              </span>

            </div>

            <!-- Offer Title -->
            <div class="mt-6">

              <p class="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
                Special Offer
              </p>

              <h3 class="mt-2 text-base font-semibold text-white/85">
                {{ offer.title }}
              </h3>

              <p
                  v-if="offer.description"
                  class="mt-2 text-xs leading-6 text-white/35"
              >
                {{ offer.description }}
              </p>

            </div>

            <!-- Price -->
            <div class="mt-6 border-t border-white/[0.07] pt-5">

              <div
                  v-if="hasDiscount(offer) && getFinalPrice(offer)"
                  class="flex items-end justify-between gap-4"
              >
                <div>

                  <p class="text-[9px] uppercase tracking-[0.16em] text-white/25">
                    Offer Price
                  </p>

                  <p class="mt-1 text-xl font-bold text-white">
                    {{ formatPrice(getFinalPrice(offer)) }}
                  </p>

                  <p class="mt-1 text-[10px] text-white/25 line-through">
                    {{ formatPrice(offer.vehicle?.price) }}
                  </p>

                </div>

                <div class="text-right">
                  <p class="text-[9px] uppercase tracking-[0.16em] text-white/25">
                    Save
                  </p>

                  <p class="mt-1 text-xs font-semibold text-white/60">
                    {{ getDiscountLabel(offer) }}
                  </p>
                </div>

              </div>

              <div
                  v-else
                  class="flex items-end justify-between gap-4"
              >
                <div>

                  <p class="text-[9px] uppercase tracking-[0.16em] text-white/25">
                    Vehicle Price
                  </p>

                  <p class="mt-1 text-xl font-bold text-white">
                    {{ formatPrice(offer.vehicle?.price) }}
                  </p>

                </div>

                <span
                    class="text-[9px] uppercase tracking-[0.14em] text-white/30"
                >
                  {{ getOfferStatus(offer) }}
                </span>

              </div>

            </div>

            <!-- Dates -->
            <div
                v-if="offer.starts_at || offer.ends_at"
                class="mt-5 rounded-lg border border-white/[0.07] bg-white/[0.015] px-4 py-3"
            >
              <div class="flex items-center justify-between gap-4">

                <div v-if="offer.starts_at">
                  <p class="text-[8px] uppercase tracking-[0.15em] text-white/20">
                    Starts
                  </p>

                  <p class="mt-1 text-[10px] text-white/45">
                    {{ formatDate(offer.starts_at) }}
                  </p>
                </div>

                <div
                    v-if="offer.ends_at"
                    class="text-right"
                >
                  <p class="text-[8px] uppercase tracking-[0.15em] text-white/20">
                    Ends
                  </p>

                  <p class="mt-1 text-[10px] text-white/45">
                    {{ formatDate(offer.ends_at) }}
                  </p>
                </div>

              </div>
            </div>

            <!-- CTA -->
            <button
                type="button"
                @click="goToVehicle(offer)"
                class="mt-5 flex w-full items-center justify-between rounded-xl border border-white/10 px-4 py-3.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45 transition hover:border-white/20 hover:bg-white/[0.03] hover:text-white"
            >
              <span>View Vehicle</span>
              <span>→</span>
            </button>

          </div>

        </article>

      </div>

    </template>

    <!-- Error -->
    <div
        v-if="error"
        class="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400"
    >
      {{ error }}
    </div>

  </section>
</template>