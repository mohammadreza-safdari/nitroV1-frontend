<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const deals = ref([])
const currentPage = ref(1)
const lastPage = ref(1)

const loading = ref(true)
const error = ref('')

async function loadDeals(page = 1) {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/admin/deals', {
      params: { page },
    })

    console.log('DEALS RESPONSE:', response.data)

    const pagination = response.data.deals

    deals.value = pagination.data || []
    currentPage.value = pagination.current_page || 1
    lastPage.value = pagination.last_page || 1
  } catch (err) {
    console.error('DEALS ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load deals.'
  } finally {
    loading.value = false
  }
}

function statusClass(status) {
  switch (status) {
    case 'pending':
      return 'border-yellow-400/20 bg-yellow-400/5 text-yellow-300'

    case 'approved':
      return 'border-green-400/20 bg-green-400/5 text-green-300'

    case 'finalized':
      return 'border-blue-400/20 bg-blue-400/5 text-blue-300'

    case 'rejected':
      return 'border-red-400/20 bg-red-400/5 text-red-300'

    case 'cancelled':
      return 'border-white/10 bg-white/[0.03] text-white/35'

    default:
      return 'border-white/10 bg-white/[0.03] text-white/40'
  }
}

function customerName(deal) {
  return (
      deal.user?.name ||
      deal.user?.email ||
      'Unknown Customer'
  )
}

function vehicleName(deal) {
  return (
      deal.vehicle?.vehicle_model?.name ||
      deal.vehicle?.stock_code ||
      'Unknown Vehicle'
  )
}

function brandName(deal) {
  return (
      deal.vehicle?.vehicle_model?.brand?.name ||
      'Unknown Brand'
  )
}

function formatDate(date) {
  if (!date) return '—'

  return new Date(date).toLocaleDateString()
}

function formatPrice(price) {
  return `$${Number(price || 0).toLocaleString()}`
}

function goToPage(page) {
  if (
      page < 1 ||
      page > lastPage.value ||
      page === currentPage.value
  ) {
    return
  }

  loadDeals(page)
}

onMounted(() => {
  loadDeals()
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-12">

    <div class="mb-10">
      <p class="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
        Admin
      </p>

      <h1 class="mt-2 text-4xl font-bold tracking-tight text-white">
        Deals
      </h1>

      <p class="mt-2 text-sm text-white/50">
        Review and manage customer vehicle deals.
      </p>
    </div>

    <div
        v-if="loading"
        class="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-white/50"
    >
      Loading deals...
    </div>

    <div
        v-else-if="error"
        class="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <div
        v-else-if="deals.length === 0"
        class="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center"
    >
      <p class="text-sm text-white/50">
        No deals found.
      </p>
    </div>

    <div v-else class="space-y-4">

      <RouterLink
          v-for="deal in deals"
          :key="deal.id"
          :to="{
            name: 'admin-deal-detail',
            params: {
              deal: deal.id,
            },
          }"
          class="block rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20 hover:bg-white/[0.04]"
      >
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div class="min-w-0">

            <div class="flex flex-wrap items-center gap-3">
              <span class="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                Deal #{{ deal.id }}
              </span>

              <span
                  class="rounded-full border px-3 py-1 text-xs font-medium capitalize"
                  :class="statusClass(deal.status)"
              >
                {{ deal.status }}
              </span>
            </div>

            <h2 class="mt-3 text-xl font-semibold text-white">
              {{ brandName(deal) }}
              {{ vehicleName(deal) }}
            </h2>

            <p class="mt-1 text-sm text-white/40">
              {{ deal.vehicle?.stock_code || 'No stock code' }}
            </p>

            <div class="mt-5 grid gap-4 sm:grid-cols-4">

              <div>
                <p class="text-xs uppercase tracking-wider text-white/30">
                  Customer
                </p>

                <p class="mt-1 text-sm text-white/80">
                  {{ customerName(deal) }}
                </p>
              </div>

              <div>
                <p class="text-xs uppercase tracking-wider text-white/30">
                  Type
                </p>

                <p class="mt-1 text-sm capitalize text-white/80">
                  {{ deal.type || '—' }}
                </p>
              </div>

              <div>
                <p class="text-xs uppercase tracking-wider text-white/30">
                  Payment
                </p>

                <p class="mt-1 text-sm capitalize text-white/80">
                  {{ deal.payment_method || '—' }}
                </p>
              </div>

              <div>
                <p class="text-xs uppercase tracking-wider text-white/30">
                  Created
                </p>

                <p class="mt-1 text-sm text-white/80">
                  {{ formatDate(deal.created_at) }}
                </p>
              </div>

            </div>

          </div>

          <div class="shrink-0 text-right">
            <p class="text-xs uppercase tracking-wider text-white/30">
              Final Price
            </p>

            <p class="mt-1 text-lg font-semibold text-white">
              {{ formatPrice(deal.final_price) }}
            </p>

            <p class="mt-3 text-sm font-medium text-white/50">
              View Deal →
            </p>
          </div>

        </div>
      </RouterLink>

    </div>

    <div
        v-if="!loading && !error && deals.length > 0"
        class="mt-8 flex items-center justify-between"
    >
      <button
          type="button"
          class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
      >
        Previous
      </button>

      <span class="text-sm text-white/40">
        Page {{ currentPage }} of {{ lastPage }}
      </span>

      <button
          type="button"
          class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
          :disabled="currentPage === lastPage"
          @click="goToPage(currentPage + 1)"
      >
        Next
      </button>
    </div>

  </section>
</template>