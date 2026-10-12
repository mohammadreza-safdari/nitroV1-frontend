<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { imageUrl } from '@/services/api.js'
import { useCompareStore } from '@/stores/compare.js'

const route = useRoute()
const router = useRouter()

const compareStore = useCompareStore()

const vehicle = ref(null)
const loading = ref(true)
const error = ref(null)

const detail = computed(() => {
  if (!vehicle.value) {
    return null
  }

  return vehicle.value.car_detail || vehicle.value.motorcycle_detail
})

const vehicleType = computed(() => {
  if (!vehicle.value) {
    return ''
  }

  return vehicle.value.car_detail ? 'Car' : 'Motorcycle'
})

const activeOffer = computed(() => {
  if (!vehicle.value?.offers?.length) {
    return null
  }

  return vehicle.value.offers[0]
})

const isPreOrderOnly = computed(() => {
  const offers = vehicle.value?.offers || []
  const now = new Date()

  return offers.some(offer => {
    if (
        offer.type !== 'pre_order' ||
        !offer.is_active
    ) {
      return false
    }

    const startsAt = offer.starts_at
        ? new Date(offer.starts_at)
        : null

    const endsAt = offer.ends_at
        ? new Date(offer.ends_at)
        : null

    if (startsAt && startsAt > now) {
      return false
    }

    if (endsAt && endsAt < now) {
      return false
    }

    return true
  })
})

const hasDiscount = computed(() => {
  return (
      activeOffer.value?.type === 'discount' &&
      activeOffer.value.discount_type &&
      activeOffer.value.discount_value !== null &&
      activeOffer.value.discount_value !== undefined
  )
})

const formattedPrice = computed(() => {
  if (!vehicle.value) {
    return ''
  }

  const price = hasDiscount.value
      ? finalPrice.value
      : Number(vehicle.value.price)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
})

const originalFormattedPrice = computed(() => {
  if (!vehicle.value) {
    return ''
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(vehicle.value.price)
})

const finalPrice = computed(() => {
  if (!vehicle.value) {
    return 0
  }

  if (!hasDiscount.value) {
    return Number(vehicle.value.price)
  }

  const price = Number(vehicle.value.price)
  const value = Number(activeOffer.value.discount_value)

  if (activeOffer.value.discount_type === 'percentage') {
    return price - (price * value / 100)
  }

  if (activeOffer.value.discount_type === 'fixed') {
    return Math.max(price - value, 0)
  }

  return price
})

const discountLabel = computed(() => {
  if (!hasDiscount.value) {
    return ''
  }

  if (activeOffer.value.discount_type === 'percentage') {
    return `${Number(activeOffer.value.discount_value)}% OFF`
  }

  if (activeOffer.value.discount_type === 'fixed') {
    return `$${Number(activeOffer.value.discount_value).toLocaleString()} OFF`
  }

  return ''
})

const offerTypeLabel = computed(() => {
  if (!activeOffer.value) {
    return ''
  }

  const labels = {
    discount: 'Discount',
    limited_time: 'Limited Time',
    featured: 'Featured',
    reservation: 'Reservation',
    pre_order: 'Pre-Order',
  }

  return labels[activeOffer.value.type] || activeOffer.value.type
})

const primaryImage = computed(() => {
  if (!vehicle.value?.images?.length) {
    return null
  }

  return (
      vehicle.value.images.find(image => image.is_primary) ||
      vehicle.value.images[0]
  )
})

const secondaryImages = computed(() => {
  if (!vehicle.value?.images?.length) {
    return []
  }

  return vehicle.value.images
      .filter(image => !image.is_primary)
      .slice(0, 3)
})

const isInCompare = computed(() => {
  if (!vehicle.value) {
    return false
  }

  return compareStore.hasVehicle(vehicle.value.id)
})

const handleCompare = () => {
  if (!vehicle.value) {
    return
  }

  if (compareStore.hasVehicle(vehicle.value.id)) {
    compareStore.removeVehicle(vehicle.value.id)
    return
  }

  compareStore.addVehicle(vehicle.value)
}

const formatDate = (date) => {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

const loadVehicle = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/vehicles/${route.params.vehicle}`)
    vehicle.value = response.data.vehicle
  } catch (err) {
    error.value = 'Unable to load vehicle details.'
  } finally {
    loading.value = false
  }
}

const handleBuy = () => {
  if (!vehicle.value?.id || isPreOrderOnly.value) {
    return
  }

  router.push({
    name: 'buy',
    params: {
      vehicle: vehicle.value.id,
    },
  })
}

const handleReserve = () => {
  if (!vehicle.value?.id || isPreOrderOnly.value) {
    return
  }

  router.push({
    name: 'reservation',
    params: {
      vehicle: vehicle.value.id,
    },
  })
}

const handlePreOrder = () => {
  if (!vehicle.value?.id || !isPreOrderOnly.value) {
    return
  }

  router.push({
    name: 'pre-order',
    params: {
      vehicle: vehicle.value.id,
    },
  })
}

onMounted(loadVehicle)
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-16">

    <div
        v-if="loading"
        class="flex min-h-[60vh] items-center justify-center"
    >
      <p class="text-xs uppercase tracking-[0.3em] text-white/30">
        Loading vehicle
      </p>
    </div>

    <div
        v-else-if="error"
        class="flex min-h-[60vh] items-center justify-center"
    >
      <p class="text-sm text-white/40">
        {{ error }}
      </p>
    </div>

    <div v-else-if="vehicle">

      <!-- Header -->

      <div class="mb-10">

        <div
            class="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/30"
        >

          <span>{{ vehicleType }}</span>

          <span class="text-white/10">/</span>

          <span>
            {{ vehicle.vehicle_model?.brand?.name }}
          </span>

          <span class="text-white/10">/</span>

          <span>
            {{ vehicle.vehicle_model?.category?.name }}
          </span>

        </div>

        <h1 class="mt-4 text-5xl font-black tracking-[-0.04em]">
          {{ vehicle.vehicle_model?.name }}
        </h1>

        <p class="mt-3 text-sm text-white/40">
          {{ vehicle.stock_code }}
        </p>

      </div>


      <!-- Gallery + Main Info -->

      <div class="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">

        <!-- Gallery -->

        <div>

          <!-- Main Image -->

          <div
              class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
          >

            <img
                v-if="primaryImage"
                :src="imageUrl(primaryImage.path)"
                :alt="`${vehicle.vehicle_model?.brand?.name} ${vehicle.vehicle_model?.name}`"
                class="aspect-[16/10] w-full object-cover"
            />

            <div
                v-else
                class="flex aspect-[16/10] items-center justify-center"
            >
              <span class="text-xs uppercase tracking-[0.25em] text-white/20">
                Not exist yet
              </span>
            </div>


            <!-- Offer Badge -->

            <template v-if="activeOffer">

              <div class="absolute left-5 top-5">

                <span
                    class="rounded-full border border-white/15 bg-black/60 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur"
                >
                  {{ offerTypeLabel }}
                </span>

              </div>


              <div
                  v-if="discountLabel"
                  class="absolute right-5 top-5"
              >

                <span
                    class="rounded-full bg-white px-4 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-black"
                >
                  {{ discountLabel }}
                </span>

              </div>

            </template>

          </div>


          <!-- Secondary Images -->

          <div class="mt-4 grid grid-cols-3 gap-3">

            <div
                v-for="index in 3"
                :key="index"
                class="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
            >

              <img
                  v-if="secondaryImages[index - 1]"
                  :src="imageUrl(secondaryImages[index - 1].path)"
                  :alt="vehicle.vehicle_model?.name"
                  class="aspect-[4/3] w-full object-cover"
              />

              <div
                  v-else
                  class="flex aspect-[4/3] items-center justify-center"
              >

                <span
                    class="text-[10px] uppercase tracking-[0.2em] text-white/20"
                >
                  Not exist yet
                </span>

              </div>

            </div>

          </div>

        </div>


        <!-- Main Info -->

        <div class="flex flex-col">

          <!-- Offer -->

          <div
              v-if="activeOffer"
              class="mb-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5"
          >

            <div class="flex items-start justify-between gap-4">

              <div>

                <p
                    class="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/30"
                >
                  Special Offer
                </p>

                <h2 class="mt-2 text-lg font-bold text-white">
                  {{ activeOffer.title }}
                </h2>

              </div>

              <span
                  class="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-white/45"
              >
                {{ offerTypeLabel }}
              </span>

            </div>


            <p
                v-if="activeOffer.description"
                class="mt-3 text-xs leading-6 text-white/40"
            >
              {{ activeOffer.description }}
            </p>


            <div
                v-if="activeOffer.starts_at || activeOffer.ends_at"
                class="mt-5 grid grid-cols-2 gap-4 border-t border-white/[0.07] pt-4"
            >

              <div v-if="activeOffer.starts_at">

                <p
                    class="text-[8px] uppercase tracking-[0.16em] text-white/20"
                >
                  Starts
                </p>

                <p class="mt-1 text-[10px] text-white/45">
                  {{ formatDate(activeOffer.starts_at) }}
                </p>

              </div>


              <div
                  v-if="activeOffer.ends_at"
                  class="text-right"
              >

                <p
                    class="text-[8px] uppercase tracking-[0.16em] text-white/20"
                >
                  Ends
                </p>

                <p class="mt-1 text-[10px] text-white/45">
                  {{ formatDate(activeOffer.ends_at) }}
                </p>

              </div>

            </div>

          </div>


          <!-- Price -->

          <div class="border-b border-white/10 pb-8">

            <p class="text-xs uppercase tracking-[0.3em] text-white/30">
              {{ hasDiscount ? 'Offer Price' : 'Price' }}
            </p>


            <div
                v-if="hasDiscount"
                class="mt-4"
            >

              <p class="text-4xl font-black tracking-[-0.03em]">
                {{ formattedPrice }}
              </p>

              <div class="mt-2 flex items-center gap-3">

                <p class="text-sm text-white/25 line-through">
                  {{ originalFormattedPrice }}
                </p>

                <span
                    class="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50"
                >
                  {{ discountLabel }}
                </span>

              </div>

            </div>


            <p
                v-else
                class="mt-4 text-4xl font-black tracking-[-0.03em]"
            >
              {{ formattedPrice }}
            </p>

          </div>


          <!-- Vehicle Information -->

          <div
              class="grid grid-cols-2 gap-x-6 gap-y-7 border-b border-white/10 py-8"
          >

            <div>

              <p
                  class="text-[10px] uppercase tracking-[0.25em] text-white/25"
              >
                Year
              </p>

              <p class="mt-2 text-sm text-white/75">
                {{ vehicle.year }}
              </p>

            </div>


            <div>

              <p
                  class="text-[10px] uppercase tracking-[0.25em] text-white/25"
              >
                Condition
              </p>

              <p class="mt-2 text-sm capitalize text-white/75">
                {{ vehicle.condition }}
              </p>

            </div>


            <div>

              <p
                  class="text-[10px] uppercase tracking-[0.25em] text-white/25"
              >
                Color
              </p>

              <p class="mt-2 text-sm text-white/75">
                {{ vehicle.color }}
              </p>

            </div>


            <div>

              <p
                  class="text-[10px] uppercase tracking-[0.25em] text-white/25"
              >
                Mileage
              </p>

              <p class="mt-2 text-sm text-white/75">
                {{ vehicle.mileage.toLocaleString() }} km
              </p>

            </div>


            <div>

              <p
                  class="text-[10px] uppercase tracking-[0.25em] text-white/25"
              >
                Status
              </p>

              <p class="mt-2 text-sm capitalize text-white/75">
                {{ vehicle.status }}
              </p>

            </div>


            <div>

              <p
                  class="text-[10px] uppercase tracking-[0.25em] text-white/25"
              >
                Category
              </p>

              <p class="mt-2 text-sm text-white/75">
                {{ vehicle.vehicle_model?.category?.name }}
              </p>

            </div>

          </div>


          <!-- Actions -->

          <div class="mt-auto pt-8">

            <div class="grid gap-3 sm:grid-cols-2">

              <button
                  type="button"
                  @click="handleBuy"
                  :disabled="isPreOrderOnly"
                  class="rounded-xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Buy
              </button>


              <button
                  type="button"
                  @click="handleReserve"
                  :disabled="isPreOrderOnly"
                  class="rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:border-white/30 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Reserve
              </button>


              <button
                  type="button"
                  @click="handlePreOrder"
                  :disabled="!isPreOrderOnly"
                  class="rounded-xl border border-white/10 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/50 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Pre-order
              </button>


              <button
                  type="button"
                  @click="handleCompare"
                  :disabled="
                    !isInCompare &&
                    compareStore.vehicles.length >= 3
                  "
                  class="rounded-xl border border-white/10 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/50 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                {{ isInCompare ? 'Remove from Compare' : 'Add to Compare' }}
              </button>

            </div>

          </div>

        </div>

      </div>


      <!-- Description -->

      <div class="mt-20 grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">

        <div>

          <p class="text-xs uppercase tracking-[0.3em] text-white/30">
            Overview
          </p>

          <h2 class="mt-4 text-3xl font-black tracking-[-0.03em]">
            Built for the exceptional.
          </h2>

        </div>


        <div>

          <p class="max-w-3xl text-sm leading-8 text-white/45">
            {{ vehicle.description || 'No description available.' }}
          </p>

        </div>

      </div>


      <!-- Technical Specifications -->

      <div
          v-if="detail"
          class="mt-20 border-t border-white/10 pt-12"
      >

        <div class="mb-10">

          <p class="text-xs uppercase tracking-[0.3em] text-white/30">
            Specifications
          </p>

          <h2 class="mt-4 text-3xl font-black tracking-[-0.03em]">
            Technical details
          </h2>

        </div>


        <div
            class="grid gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3"
        >

          <div v-if="detail.engine">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Engine
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.engine }}
            </p>

          </div>


          <div v-if="detail.horsepower">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Horsepower
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.horsepower }} hp
            </p>

          </div>


          <div v-if="detail.torque">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Torque
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.torque }} Nm
            </p>

          </div>


          <div v-if="detail.transmission">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Transmission
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.transmission }}
            </p>

          </div>


          <div v-if="detail.fuel_type">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Fuel
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.fuel_type }}
            </p>

          </div>


          <div v-if="detail.drive_type">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Drive Type
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.drive_type }}
            </p>

          </div>


          <div v-if="detail.acceleration">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              0–100 km/h
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.acceleration }}
            </p>

          </div>


          <div v-if="detail.top_speed">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Top Speed
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.top_speed }}
            </p>

          </div>


          <div v-if="detail.doors">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Doors
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.doors }}
            </p>

          </div>


          <div v-if="detail.seats">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Seats
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.seats }}
            </p>

          </div>


          <div v-if="detail.cooling_system">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Cooling
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.cooling_system }}
            </p>

          </div>


          <div v-if="detail.seat_height">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Seat Height
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.seat_height }} mm
            </p>

          </div>


          <div v-if="detail.wheelbase">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Wheelbase
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.wheelbase }} mm
            </p>

          </div>


          <div v-if="detail.fuel_capacity">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Fuel Capacity
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.fuel_capacity }} L
            </p>

          </div>


          <div v-if="detail.weight">

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              Weight
            </p>

            <p class="mt-2 text-sm text-white/75">
              {{ detail.weight }} kg
            </p>

          </div>


          <div
              v-for="(value, key) in detail.additional_specs"
              :key="key"
          >

            <p
                class="text-[10px] uppercase tracking-[0.25em] text-white/25"
            >
              {{ key.replaceAll('_', ' ') }}
            </p>

            <p class="mt-2 text-sm capitalize text-white/75">
              {{ value }}
            </p>

          </div>

        </div>

      </div>

    </div>

  </section>
</template>