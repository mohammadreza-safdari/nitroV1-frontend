<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const reservation = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const error = ref('')
const success = ref('')

async function loadReservation() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
        `/admin/reservations/${route.params.reservation}`
    )

    console.log('RESERVATION RESPONSE:', response.data)

    reservation.value = response.data.reservation

    console.log('RESERVATION:', reservation.value)
  } catch (err) {
    console.error('RESERVATION ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load reservation.'
  } finally {
    loading.value = false
  }
}

async function approveReservation() {
  const confirmed = window.confirm(
      'Approve this reservation?'
  )

  if (!confirmed) {
    return
  }

  await performAction(
      'approve',
      'Reservation approved successfully.'
  )
}

async function rejectReservation() {
  const confirmed = window.confirm(
      'Reject this reservation?'
  )

  if (!confirmed) {
    return
  }

  await performAction(
      'reject',
      'Reservation rejected successfully.'
  )
}

async function cancelReservation() {
  const confirmed = window.confirm(
      'Cancel this reservation?'
  )

  if (!confirmed) {
    return
  }

  await performAction(
      'cancel',
      'Reservation cancelled successfully.'
  )
}

async function performAction(action, successMessage) {
  actionLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await api.post(
        `/admin/reservations/${reservation.value.id}/${action}`
    )

    reservation.value =
        response.data.reservation ||
        reservation.value

    success.value =
        response.data.message ||
        successMessage

    await loadReservation()
  } catch (err) {
    console.error(
        `RESERVATION ${action.toUpperCase()} ERROR:`,
        err
    )

    error.value =
        err.response?.data?.message ||
        `Failed to ${action} reservation.`
  } finally {
    actionLoading.value = false
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

  return new Date(date).toLocaleString()
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) {
    return '—'
  }

  return Number(amount).toLocaleString()
}

function vehicleName() {
  return (
      reservation.value?.vehicle?.vehicleModel?.name ||
      reservation.value?.vehicle?.vehicle_model?.name ||
      reservation.value?.vehicle?.stock_code ||
      'Unknown Vehicle'
  )
}

function brandName() {
  return (
      reservation.value?.vehicle?.vehicleModel?.brand?.name ||
      reservation.value?.vehicle?.vehicle_model?.brand?.name ||
      'Unknown Brand'
  )
}

function customerName() {
  if (!reservation.value?.user) {
    return 'Unknown Customer'
  }

  return (
      reservation.value.user.name ||
      reservation.value.user.email ||
      'Unknown Customer'
  )
}

function primaryImage() {
  const images = reservation.value?.vehicle?.images || []

  const primary =
      images.find(image => image.is_primary) ||
      images[0]

  if (!primary?.path) {
    return null
  }

  return `http://127.0.0.1:8000/${primary.path}`
}

onMounted(loadReservation)
</script>

<template>
  <section class="mx-auto max-w-5xl px-8 py-12">

    <div class="flex items-center justify-between gap-6">

      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-white/30">
          Sales / Reservations
        </p>

        <h1 class="mt-3 text-4xl font-black tracking-[-0.04em]">
          Reservation Details
        </h1>

        <p class="mt-3 text-sm text-white/40">
          Review reservation information and manage its status.
        </p>
      </div>

      <RouterLink
          :to="{ name: 'admin-reservations' }"
          class="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
      >
        Reservations
      </RouterLink>

    </div>

    <div
        v-if="error"
        class="mt-8 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <div
        v-if="success"
        class="mt-8 rounded-xl border border-green-400/20 bg-green-400/5 px-5 py-4 text-sm text-green-300"
    >
      {{ success }}
    </div>

    <div
        v-if="loading"
        class="mt-10 text-sm text-white/35"
    >
      Loading reservation...
    </div>

    <div
        v-else-if="reservation"
        class="mt-10 space-y-6"
    >

      <div
          class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
      >

        <div class="grid gap-6 p-6 sm:grid-cols-[180px_1fr]">

          <div
              class="aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-black/20"
          >
            <img
                v-if="primaryImage()"
                :src="primaryImage()"
                :alt="vehicleName()"
                class="h-full w-full object-cover"
            >

            <div
                v-else
                class="flex h-full items-center justify-center text-xs text-white/20"
            >
              No Image
            </div>
          </div>

          <div class="min-w-0">

            <div class="flex flex-wrap items-start justify-between gap-4">

              <div>
                <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
                  Vehicle
                </p>

                <h2 class="mt-2 text-2xl font-bold text-white/90">
                  {{ vehicleName() }}
                </h2>

                <p class="mt-2 text-sm text-white/35">
                  {{ brandName() }}
                  ·
                  {{ reservation.vehicle?.stock_code || 'No Stock Code' }}
                </p>
              </div>

              <span
                  class="rounded-lg border px-3 py-2 text-xs"
                  :class="statusClass(reservation.status)"
              >
                {{ reservation.status }}
              </span>

            </div>

            <div class="mt-6 grid gap-4 sm:grid-cols-2">

              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-white/25">
                  Vehicle Year
                </p>

                <p class="mt-2 text-sm text-white/70">
                  {{ reservation.vehicle?.year || '—' }}
                </p>
              </div>

              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-white/25">
                  Vehicle Price
                </p>

                <p class="mt-2 text-sm text-white/70">
                  {{ formatAmount(reservation.vehicle?.price) }}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      <div
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >

        <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
          Customer
        </p>

        <div class="mt-5 grid gap-5 sm:grid-cols-2">

          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Name
            </p>

            <p class="mt-2 text-sm text-white/70">
              {{ customerName() }}
            </p>
          </div>

          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Email
            </p>

            <p class="mt-2 text-sm text-white/70">
              {{ reservation.user?.email || '—' }}
            </p>
          </div>

          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-white/25">
              User ID
            </p>

            <p class="mt-2 text-sm text-white/70">
              {{ reservation.user?.id || '—' }}
            </p>
          </div>

        </div>

      </div>

      <div
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >

        <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
          Reservation
        </p>

        <div class="mt-5 grid gap-5 sm:grid-cols-2">

          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Reservation ID
            </p>

            <p class="mt-2 text-sm text-white/70">
              #{{ reservation.id }}
            </p>
          </div>

          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Deposit Amount
            </p>

            <p class="mt-2 text-sm text-white/70">
              {{ formatAmount(reservation.deposit_amount) }}
            </p>
          </div>

          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Reserved Until
            </p>

            <p class="mt-2 text-sm text-white/70">
              {{ formatDate(reservation.reserved_until) }}
            </p>
          </div>

          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Created At
            </p>

            <p class="mt-2 text-sm text-white/70">
              {{ formatDate(reservation.created_at) }}
            </p>
          </div>

        </div>

        <div
            v-if="reservation.notes"
            class="mt-6 border-t border-white/10 pt-6"
        >
          <p class="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Notes
          </p>

          <p class="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/55">
            {{ reservation.notes }}
          </p>
        </div>

      </div>

      <div
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
              Reservation Actions
            </p>

            <p class="mt-2 text-sm text-white/35">
              Manage the current reservation status.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">

            <button
                v-if="reservation.status === 'pending'"
                type="button"
                :disabled="actionLoading"
                @click="approveReservation"
                class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Approve
            </button>

            <button
                v-if="reservation.status === 'pending'"
                type="button"
                :disabled="actionLoading"
                @click="rejectReservation"
                class="rounded-xl border border-red-400/20 px-5 py-3 text-sm text-red-300/70 transition hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reject
            </button>

            <button
                v-if="reservation.status === 'pending' || reservation.status === 'approved'"
                type="button"
                :disabled="actionLoading"
                @click="cancelReservation"
                class="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/45 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>

    </div>

  </section>
</template>
