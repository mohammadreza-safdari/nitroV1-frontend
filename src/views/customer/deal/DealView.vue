<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api, { imageUrl } from '@/services/api.js'

const router = useRouter()

const deals = ref([])
const loading = ref(true)
const error = ref(null)

const loadDeals = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/deals')

    deals.value = Array.isArray(response.data.deals)
        ? response.data.deals
        : response.data.deals?.data || []
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Unable to load your deals.'
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

const formatStatus = (status) => {
  if (!status) {
    return '—'
  }

  return status.replaceAll('_', ' ')
}

onMounted(loadDeals)
</script>

<template>
  <section class="mx-auto max-w-6xl px-8 py-16">

    <!-- Header -->

    <div class="mb-10">

      <p class="text-xs uppercase tracking-[0.3em] text-white/30">
        My Account
      </p>

      <h1 class="mt-4 text-4xl font-black tracking-[-0.04em]">
        My Deals
      </h1>

      <p class="mt-3 max-w-2xl text-sm leading-7 text-white/40">
        View the vehicle deals you have created and their current status.
      </p>

    </div>


    <!-- Loading -->

    <div
        v-if="loading"
        class="flex min-h-[40vh] items-center justify-center"
    >
      <p class="text-xs uppercase tracking-[0.3em] text-white/30">
        Loading deals
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
        v-else-if="deals.length === 0"
        class="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center"
    >
      <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
        No Deals
      </p>

      <h2 class="mt-3 text-xl font-bold">
        You have no deals yet.
      </h2>

      <p class="mt-3 text-sm text-white/35">
        Vehicle deals you create will appear here.
      </p>
    </div>


    <!-- Deals -->

    <div
        v-else
        class="grid gap-6 md:grid-cols-2"
    >

      <article
          v-for="deal in deals"
          :key="deal.id"
          class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
      >

        <!-- Image -->

        <div class="relative">

          <img
              v-if="deal.vehicle?.images?.length"
              :src="
              imageUrl(
                (
                  deal.vehicle.images.find(
                    image => image.is_primary
                  ) ||
                  deal.vehicle.images[0]
                ).path
              )
            "
              :alt="deal.vehicle?.vehicle_model?.name"
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
            {{ deal.vehicle?.vehicle_model?.brand?.name }}
          </p>

          <h2 class="mt-2 text-xl font-bold">
            {{ deal.vehicle?.vehicle_model?.name }}
          </h2>

          <p class="mt-2 text-xs text-white/30">
            {{ deal.vehicle?.stock_code }}
          </p>


          <div class="mt-6 space-y-4 border-t border-white/[0.07] pt-5">

            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase tracking-[0.2em] text-white/25">
                Status
              </span>

              <span class="text-xs font-semibold capitalize text-white/75">
                {{ formatStatus(deal.status) }}
              </span>
            </div>


            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase tracking-[0.2em] text-white/25">
                Deal Type
              </span>

              <span class="text-xs font-semibold capitalize text-white/75">
                {{ formatStatus(deal.type) }}
              </span>
            </div>


            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase tracking-[0.2em] text-white/25">
                Payment
              </span>

              <span class="text-xs font-semibold capitalize text-white/75">
                {{
                  deal.payment_method === 'installment'
                      ? 'Installment'
                      : 'Full Payment'
                }}
              </span>
            </div>


            <div
                v-if="
                  deal.payment_method === 'installment' &&
                  deal.installment_months
                "
                class="flex items-center justify-between"
            >
              <span class="text-[9px] uppercase tracking-[0.2em] text-white/25">
                Plan
              </span>

              <span class="text-xs font-semibold text-white/75">
                {{ deal.installment_months }} Months
              </span>
            </div>


            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase tracking-[0.2em] text-white/25">
                Final Amount
              </span>

              <span class="text-xs font-semibold text-white/75">
                {{ formatCurrency(deal.final_amount) }}
              </span>
            </div>


            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase tracking-[0.2em] text-white/25">
                Created
              </span>

              <span class="text-xs font-semibold text-white/75">
                {{ formatDate(deal.created_at) }}
              </span>
            </div>

          </div>


          <button
              type="button"
              @click="viewVehicle(deal.vehicle_id)"
              class="mt-6 w-full rounded-xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/85"
          >
            View Vehicle
          </button>

        </div>

      </article>

    </div>

  </section>
</template>