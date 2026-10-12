<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api, { imageUrl } from '@/services/api.js'

const router = useRouter()

const preOrders = ref([])
const loading = ref(true)
const error = ref(null)

const loadPreOrders = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/pre-orders')

    preOrders.value = Array.isArray(response.data.pre_orders)
        ? response.data.pre_orders
        : response.data.pre_orders?.data || []
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Unable to load your pre-orders.'
  } finally {
    loading.value = false
  }
}

const viewVehicle = (vehicleId) => {
  router.push({
    name: 'vehicle-details',
    params: {
      vehicle: vehicleId,
    },
  })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

const formatDate = (value) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

onMounted(loadPreOrders)
</script>

<template>
  <section class="mx-auto max-w-6xl px-8 py-16">

    <!-- Header -->

    <div class="mb-10">

      <p class="text-xs uppercase tracking-[0.3em] text-white/30">
        My Account
      </p>

      <h1 class="mt-4 text-4xl font-black tracking-[-0.04em]">
        My Pre-Orders
      </h1>

      <p class="mt-3 max-w-2xl text-sm leading-7 text-white/40">
        View the vehicles you have requested to pre-order.
      </p>

    </div>


    <!-- Loading -->

    <div
        v-if="loading"
        class="flex min-h-[40vh] items-center justify-center"
    >
      <p class="text-xs uppercase tracking-[0.3em] text-white/30">
        Loading pre-orders
      </p>
    </div>


    <!-- Error -->

    <div
        v-else-if="error"
        class="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
    >
      <p class="text-sm text-white/50">
        {{ error }}
      </p>
    </div>


    <!-- Empty -->

    <div
        v-else-if="preOrders.length === 0"
        class="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center"
    >
      <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
        No Pre-Orders
      </p>

      <h2 class="mt-3 text-xl font-bold">
        You have no pre-orders yet.
      </h2>

      <p class="mt-3 text-sm text-white/35">
        Vehicles you pre-order will appear here.
      </p>
    </div>


    <!-- Pre-Orders -->

    <div
        v-else
        class="grid gap-6 md:grid-cols-2"
    >

      <article
          v-for="preOrder in preOrders"
          :key="preOrder.id"
          class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
      >

        <!-- Image -->

        <div class="relative">

          <img
              v-if="preOrder.vehicle?.images?.length"
              :src="
              imageUrl(
                (
                  preOrder.vehicle.images.find(
                    image => image.is_primary
                  ) ||
                  preOrder.vehicle.images[0]
                ).path
              )
            "
              :alt="preOrder.vehicle?.vehicle_model?.name"
              class="aspect-[16/9] w-full object-cover"
          />

          <div
              v-else
              class="flex aspect-[16/9] items-center justify-center"
          >
            <span class="text-[10px] uppercase tracking-[0.2em] text-white/20">
              Not exist yet
            </span>
          </div>

        </div>


        <!-- Content -->

        <div class="p-6">

          <p class="text-[9px] uppercase tracking-[0.25em] text-white/25">
            {{ preOrder.vehicle?.vehicle_model?.brand?.name }}
          </p>

          <h2 class="mt-2 text-xl font-bold">
            {{ preOrder.vehicle?.vehicle_model?.name }}
          </h2>

          <p class="mt-2 text-xs text-white/30">
            {{ preOrder.vehicle?.stock_code }}
          </p>


          <div class="mt-6 space-y-4 border-t border-white/[0.07] pt-5">

            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase tracking-[0.2em] text-white/25">
                Status
              </span>

              <span class="text-xs font-semibold capitalize text-white/75">
                {{ preOrder.status }}
              </span>
            </div>


            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase tracking-[0.2em] text-white/25">
                Deposit
              </span>

              <span class="text-xs font-semibold text-white/75">
                {{ formatCurrency(preOrder.deposit) }}
              </span>
            </div>


            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase tracking-[0.2em] text-white/25">
                Requested
              </span>

              <span class="text-xs font-semibold text-white/75">
                {{ formatDate(preOrder.created_at) }}
              </span>
            </div>

          </div>


          <button
              type="button"
              @click="viewVehicle(preOrder.vehicle_id)"
              class="mt-6 w-full rounded-xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/85"
          >
            View Vehicle
          </button>

        </div>

      </article>

    </div>

  </section>
</template>
