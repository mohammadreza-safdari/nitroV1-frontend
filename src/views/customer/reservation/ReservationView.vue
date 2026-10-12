<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { imageUrl } from '@/services/api.js'

const route = useRoute()
const router = useRouter()

const vehicle = ref(null)
const reservation = ref(null)

const loading = ref(true)
const submitting = ref(false)
const cancelling = ref(false)

const error = ref(null)
const success = ref(null)

const depositAmount = ref('')
const notes = ref('')

const vehicleImage = computed(() => {
  if (!vehicle.value?.images?.length) {
    return null
  }

  return (
      vehicle.value.images.find(image => image.is_primary) ||
      vehicle.value.images[0]
  )
})

const formattedVehiclePrice = computed(() => {
  if (!vehicle.value) {
    return ''
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(vehicle.value.price))
})

const formattedDeposit = computed(() => {
  if (!reservation.value) {
    return ''
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(reservation.value.deposit_amount))
})

const formattedReservedUntil = computed(() => {
  if (!reservation.value?.reserved_until) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(reservation.value.reserved_until))
})

const isAvailable = computed(() => {
  return vehicle.value?.status === 'available'
})

const hasExistingReservation = computed(() => {
  return (
      !!reservation.value &&
      ['pending', 'approved'].includes(reservation.value.status)
  )
})

const canCancel = computed(() => {
  return (
      hasExistingReservation.value &&
      !cancelling.value
  )
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

const canSubmit = computed(() => {
  return (
      !loading.value &&
      !submitting.value &&
      !hasExistingReservation.value &&
      !isPreOrderOnly.value &&
      vehicle.value?.id &&
      isAvailable.value &&
      Number(depositAmount.value) >= 0
  )
})

const loadVehicle = async () => {
  const response = await api.get(
      `/vehicles/${route.params.vehicle}`
  )

  vehicle.value = response.data.vehicle
}

const loadReservation = async () => {
  const response = await api.get('/reservations')

  const reservations = Array.isArray(response.data.reservations)
      ? response.data.reservations
      : response.data.reservations?.data || []

  reservation.value =
      reservations.find(item => {
        return (
            Number(item.vehicle_id) === Number(route.params.vehicle) &&
            ['pending', 'approved'].includes(item.status)
        )
      }) || null
}

const loadPage = async () => {
  loading.value = true
  error.value = null

  try {
    await Promise.all([
      loadVehicle(),
      loadReservation(),
    ])
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Unable to load reservation information.'
  } finally {
    loading.value = false
  }
}

const submitReservation = async () => {
  if (!canSubmit.value) {
    return
  }

  submitting.value = true
  error.value = null
  success.value = null

  try {
    const response = await api.post('/reservations', {
      vehicle_id: vehicle.value.id,
      deposit_amount: Number(depositAmount.value),
      notes: notes.value || null,
    })

    reservation.value = response.data.reservation

    success.value =
        response.data.message ||
        'Your reservation has been submitted successfully.'
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        err.response?.data?.errors?.vehicle_id?.[0] ||
        err.response?.data?.errors?.deposit_amount?.[0] ||
        'Unable to create the reservation.'
  } finally {
    submitting.value = false
  }
}

const cancelReservation = async () => {
  if (!canCancel.value) {
    return
  }

  cancelling.value = true
  error.value = null
  success.value = null

  try {
    const response = await api.post(
        `/reservations/${reservation.value.id}/cancel`
    )

    success.value =
        response.data.message ||
        'Your reservation has been cancelled successfully.'

    reservation.value = null
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Unable to cancel the reservation.'
  } finally {
    cancelling.value = false
  }
}

const goToReservations = () => {
  router.push({
    name: 'reservations',
  })
}

const goToPreOrder = () => {
  router.push({
    name: 'pre-order',
    params: {
      vehicle: vehicle.value.id,
    },
  })
}

const goBack = () => {
  router.back()
}

onMounted(loadPage)
</script>

<template>
  <section class="mx-auto max-w-6xl px-8 py-16">

    <!-- Loading -->

    <div
        v-if="loading"
        class="flex min-h-[70vh] items-center justify-center"
    >
      <p class="text-xs uppercase tracking-[0.3em] text-white/30">
        Loading reservation
      </p>
    </div>


    <!-- Error -->

    <div
        v-else-if="error && !vehicle"
        class="flex min-h-[70vh] items-center justify-center"
    >
      <div class="text-center">

        <p class="text-sm text-white/50">
          {{ error }}
        </p>

        <button
            type="button"
            @click="goBack"
            class="mt-6 rounded-xl border border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Back
        </button>

      </div>
    </div>


    <div v-else-if="vehicle">

      <!-- Header -->

      <div class="mb-10">

        <button
            type="button"
            @click="goBack"
            class="mb-8 text-[10px] uppercase tracking-[0.2em] text-white/30 transition hover:text-white"
        >
          ← Back
        </button>

        <p class="text-xs uppercase tracking-[0.3em] text-white/30">
          Vehicle Reservation
        </p>

        <h1 class="mt-4 text-4xl font-black tracking-[-0.04em]">
          Reserve your vehicle.
        </h1>

        <p class="mt-3 max-w-2xl text-sm leading-7 text-white/40">
          Secure this vehicle with a reservation deposit.
          The vehicle will be held for the reservation period.
        </p>

      </div>


      <!-- Existing Reservation -->

      <div
          v-if="hasExistingReservation"
          class="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
      >

        <div
            class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between"
        >

          <div>

            <div
                class="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.05]"
            >
              <span class="text-lg text-white">
                ✓
              </span>
            </div>

            <p
                class="mt-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30"
            >
              Existing Reservation
            </p>

            <h2 class="mt-3 text-2xl font-bold">
              This vehicle is already reserved.
            </h2>

            <p class="mt-3 max-w-xl text-sm leading-7 text-white/40">
              You already have an active reservation for this vehicle.
              You cannot create another reservation until this one is cancelled.
            </p>

          </div>


          <div
              class="min-w-[240px] rounded-xl border border-white/10 bg-black/20 p-5"
          >

            <p
                class="text-[9px] uppercase tracking-[0.2em] text-white/25"
            >
              Reservation Status
            </p>

            <p
                class="mt-2 text-sm font-semibold capitalize text-white"
            >
              {{ reservation.status }}
            </p>


            <div class="mt-5 border-t border-white/[0.07] pt-4">

              <p
                  class="text-[9px] uppercase tracking-[0.2em] text-white/25"
              >
                Deposit
              </p>

              <p class="mt-2 text-lg font-bold">
                {{ formattedDeposit }}
              </p>

            </div>


            <div
                v-if="reservation.reserved_until"
                class="mt-5 border-t border-white/[0.07] pt-4"
            >

              <p
                  class="text-[9px] uppercase tracking-[0.2em] text-white/25"
              >
                Reserved Until
              </p>

              <p class="mt-2 text-sm font-semibold text-white/80">
                {{ formattedReservedUntil }}
              </p>

            </div>

          </div>

        </div>


        <div
            v-if="error"
            class="mt-7 rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
          <p class="text-xs leading-6 text-white/50">
            {{ error }}
          </p>
        </div>


        <div
            v-if="success"
            class="mt-7 rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
          <p class="text-xs leading-6 text-white/50">
            {{ success }}
          </p>
        </div>


        <div class="mt-8 flex flex-wrap gap-3">

          <button
              type="button"
              @click="goToReservations"
              class="rounded-xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/85"
          >
            View Reservations
          </button>


          <button
              v-if="canCancel"
              type="button"
              @click="cancelReservation"
              :disabled="cancelling"
              class="rounded-xl border border-white/10 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <span v-if="cancelling">
              Cancelling...
            </span>

            <span v-else>
              Cancel Reservation
            </span>
          </button>


          <button
              type="button"
              @click="router.push({
              name: 'vehicle-details',
              params: { vehicle: vehicle.id }
            })"
              class="rounded-xl border border-white/10 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-white/20 hover:text-white"
          >
            Vehicle Details
          </button>

        </div>

      </div>


      <!-- Pre-order Only -->

      <div
          v-else-if="isPreOrderOnly"
          class="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
      >

        <p
            class="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30"
        >
          Pre-order Only
        </p>

        <h2 class="mt-3 text-2xl font-bold">
          This vehicle is currently available for pre-order only.
        </h2>

        <p class="mt-3 max-w-xl text-sm leading-7 text-white/40">
          This vehicle cannot currently be reserved because it is
          available through Nitro's pre-order program.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">

          <button
              type="button"
              @click="goToPreOrder"
              class="rounded-xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/85"
          >
            Pre-order Vehicle
          </button>

          <button
              type="button"
              @click="router.push({
              name: 'vehicle-details',
              params: { vehicle: vehicle.id }
            })"
              class="rounded-xl border border-white/10 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-white/20 hover:text-white"
          >
            Vehicle Details
          </button>

        </div>

      </div>


      <!-- Reservation Form -->

      <div
          v-else
          class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
      >

        <!-- Vehicle Card -->

        <div
            class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
        >

          <div class="relative">

            <img
                v-if="vehicleImage"
                :src="imageUrl(vehicleImage.path)"
                :alt="vehicle.vehicle_model?.name"
                class="aspect-[16/10] w-full object-cover"
            />

            <div
                v-else
                class="flex aspect-[16/10] items-center justify-center"
            >
              <span
                  class="text-[10px] uppercase tracking-[0.2em] text-white/20"
              >
                Not exist yet
              </span>
            </div>

          </div>


          <div class="p-6">

            <p class="text-[9px] uppercase tracking-[0.25em] text-white/25">
              {{ vehicle.vehicle_model?.brand?.name }}
            </p>

            <h2 class="mt-2 text-2xl font-bold">
              {{ vehicle.vehicle_model?.name }}
            </h2>

            <p class="mt-2 text-xs text-white/30">
              {{ vehicle.stock_code }}
            </p>


            <div class="mt-6 border-t border-white/[0.07] pt-5">

              <div class="flex items-center justify-between">

                <span
                    class="text-[9px] uppercase tracking-[0.2em] text-white/25"
                >
                  Vehicle Price
                </span>

                <span class="text-sm font-semibold text-white/75">
                  {{ formattedVehiclePrice }}
                </span>

              </div>


              <div class="mt-4 flex items-center justify-between">

                <span
                    class="text-[9px] uppercase tracking-[0.2em] text-white/25"
                >
                  Status
                </span>

                <span
                    class="text-sm font-semibold capitalize"
                    :class="
                    isAvailable
                      ? 'text-white'
                      : 'text-white/30'
                  "
                >
                  {{ vehicle.status }}
                </span>

              </div>

            </div>

          </div>

        </div>


        <!-- Form -->

        <div
            class="rounded-2xl border border-white/10 bg-white/[0.025] p-7"
        >

          <div class="mb-8">

            <p
                class="text-[9px] uppercase tracking-[0.25em] text-white/25"
            >
              Reservation
            </p>

            <h2 class="mt-3 text-2xl font-bold">
              Secure this vehicle
            </h2>

            <p class="mt-3 text-xs leading-6 text-white/35">
              Enter your reservation deposit and any additional notes.
            </p>

          </div>


          <!-- Vehicle unavailable -->

          <div
              v-if="!isAvailable"
              class="mb-7 rounded-xl border border-white/10 bg-white/[0.03] p-5"
          >

            <p
                class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50"
            >
              Reservation unavailable
            </p>

            <p class="mt-2 text-xs leading-6 text-white/35">
              This vehicle is currently not available for reservation.
            </p>

          </div>


          <!-- API Error -->

          <div
              v-if="error"
              class="mb-7 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >

            <p class="text-xs leading-6 text-white/50">
              {{ error }}
            </p>

          </div>


          <!-- Success -->

          <div
              v-if="success"
              class="mb-7 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >

            <p class="text-xs leading-6 text-white/50">
              {{ success }}
            </p>

          </div>


          <form
              v-if="isAvailable"
              @submit.prevent="submitReservation"
              class="space-y-6"
          >

            <!-- Deposit -->

            <div>

              <label
                  for="deposit"
                  class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35"
              >
                Reservation Deposit
              </label>

              <div class="relative mt-3">

                <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/25"
                >
                  $
                </span>

                <input
                    id="deposit"
                    v-model="depositAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="5000"
                    class="w-full rounded-xl border border-white/10 bg-black/20 py-4 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-white/25"
                />

              </div>

              <p class="mt-2 text-[10px] leading-5 text-white/25">
                Enter the reservation deposit amount.
              </p>

            </div>


            <!-- Notes -->

            <div>

              <label
                  for="notes"
                  class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35"
              >
                Notes
              </label>

              <textarea
                  id="notes"
                  v-model="notes"
                  rows="5"
                  maxlength="2000"
                  placeholder="Add any notes for your reservation..."
                  class="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/15 focus:border-white/25"
              ></textarea>

            </div>


            <!-- Terms -->

            <div
                class="rounded-xl border border-white/[0.07] bg-black/20 p-5"
            >

              <p
                  class="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30"
              >
                Reservation Terms
              </p>

              <p class="mt-3 text-xs leading-6 text-white/35">
                Submitting this reservation will place the vehicle under
                reservation. The reservation remains subject to Nitro's
                reservation process and status approval.
              </p>

            </div>


            <!-- Submit -->

            <button
                type="submit"
                :disabled="!canSubmit"
                class="w-full rounded-xl bg-white px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span v-if="submitting">
                Submitting Reservation...
              </span>

              <span v-else>
                Request Reservation
              </span>
            </button>

          </form>

        </div>

      </div>

    </div>

  </section>
</template>