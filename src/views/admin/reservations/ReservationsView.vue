<script setup>
console.log('RESERVATION VIEW LOADED')
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const reservations = ref([])
const currentPage = ref(1)
const lastPage = ref(1)
const loading = ref(true)
const error = ref('')

async function loadReservations(page = 1) {
  console.log('LOADING RESERVATIONS')
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/admin/reservations', {
      params: {
        page,
      },
    })

    console.log('RESERVATIONS RESPONSE:', response.data)

    const pagination = response.data.reservations

    reservations.value = pagination.data
    currentPage.value = pagination.current_page
    lastPage.value = pagination.last_page

    console.log('RESERVATIONS:', reservations.value)
  } catch (err) {
    console.error('RESERVATIONS ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load reservations.'
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

    case 'rejected':
      return 'border-red-400/20 bg-red-400/5 text-red-300'

    case 'cancelled':
      return 'border-white/10 bg-white/[0.03] text-white/35'

    default:
      return 'border-white/10 bg-white/[0.03] text-white/40'
  }
}

function formatDate(date) {
  if (!date) {
    return '—'
  }

  return new Date(date).toLocaleDateString()
}

function customerName(reservation) {
  if (!reservation.user) {
    return 'Unknown Customer'
  }

  return (
      reservation.user.name ||
      reservation.user.email ||
      'Unknown Customer'
  )
}

function vehicleName(reservation) {
  return (
      reservation.vehicle?.vehicle_model?.name ||
      reservation.vehicle?.stock_code ||
      'Unknown Vehicle'
  )
}

function goToPage(page) {
  if (page < 1 || page > lastPage.value || page === currentPage.value) {
    return
  }

  loadReservations(page)
}

onMounted(loadReservations)
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-12">

    <div>
      <p class="text-xs uppercase tracking-[0.3em] text-white/30">
        Sales
      </p>

      <h1 class="mt-3 text-4xl font-black tracking-[-0.04em]">
        Reservations
      </h1>

      <p class="mt-3 text-sm text-white/40">
        Review and manage customer vehicle reservations.
      </p>
    </div>

    <div
        v-if="error"
        class="mt-8 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <div
        v-if="loading"
        class="mt-10 text-sm text-white/35"
    >
      Loading reservations...
    </div>

    <div
        v-else-if="reservations.length === 0"
        class="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center"
    >
      <p class="text-sm text-white/40">
        No reservations have been submitted yet.
      </p>
    </div>

    <div
        v-else
        class="mt-10 overflow-hidden rounded-2xl border border-white/10"
    >

      <div class="border-b border-white/10 px-6 py-4">
        <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
          Reservations
        </p>
      </div>

      <div class="divide-y divide-white/10">

        <div
            v-for="reservation in reservations"
            :key="reservation.id"
            class="flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-white/[0.03]"
        >

          <RouterLink
              :to="{
                  name: 'admin-reservation-detail',
                  params: {
                      reservation: reservation.id,
                  },
              }"
              class="min-w-0"
          >
            <h2 class="text-sm font-medium text-white/80 transition hover:text-white">
              {{ vehicleName(reservation) }}
            </h2>

            <p class="mt-1 text-xs text-white/30">
              {{ customerName(reservation) }}
              ·
              Reservation #{{ reservation.id }}
            </p>
          </RouterLink>

          <div class="flex items-center gap-2">

            <span
                class="hidden rounded-lg border px-3 py-2 text-xs sm:block"
                :class="statusClass(reservation.status)"
            >
              {{ reservation.status }}
            </span>

            <RouterLink
                :to="{
                    name: 'admin-reservation-detail',
                    params: {
                        reservation: reservation.id,
                    },
                }"
                class="rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white"
            >
              View
            </RouterLink>

          </div>

        </div>

      </div>

    </div>

    <div
        v-if="!loading && reservations.length > 0 && lastPage > 1"
        class="mt-6 flex items-center justify-between"
    >

      <button
          type="button"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          class="rounded-lg px-4 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        Previous
      </button>

      <p class="text-xs text-white/25">
        Page {{ currentPage }} of {{ lastPage }}
      </p>

      <button
          type="button"
          :disabled="currentPage === lastPage"
          @click="goToPage(currentPage + 1)"
          class="rounded-lg px-4 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next
      </button>

    </div>

  </section>
</template>