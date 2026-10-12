<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { imageUrl } from '@/services/api.js'

const route = useRoute()
const router = useRouter()

const vehicle = ref(null)
const preOrder = ref(null)

const loading = ref(true)
const submitting = ref(false)
const cancelling = ref(false)

const error = ref(null)
const success = ref(null)

const deposit = ref('')
const userNote = ref('')

const vehicleImage = computed(() => {
  if (!vehicle.value?.images?.length) {
    return null
  }

  return (
      vehicle.value.images.find(image => image.is_primary) ||
      vehicle.value.images[0]
  )
})

const preOrderOffer = computed(() => {
  const offers = vehicle.value?.offers || []
  const now = new Date()

  return offers.find(offer => {
    if (offer.type !== 'pre_order' || !offer.is_active) {
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
  }) || null
})

const isPreOrderAvailable = computed(() => {
  return !!preOrderOffer.value
})

const hasExistingPreOrder = computed(() => {
  return !!preOrder.value
})

const canCancel = computed(() => {
  return (
      preOrder.value &&
      ['pending', 'approved'].includes(preOrder.value.status) &&
      !cancelling.value
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
  if (!preOrder.value) {
    return ''
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(preOrder.value.deposit))
})

const canSubmit = computed(() => {
  return (
      !loading.value &&
      !submitting.value &&
      !!vehicle.value?.id &&
      isPreOrderAvailable.value &&
      !hasExistingPreOrder.value &&
      Number(deposit.value) >= 0
  )
})

const loadVehicle = async () => {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const vehicleResponse = await api.get(
        `/vehicles/${route.params.vehicle}`
    )

    vehicle.value = vehicleResponse.data.vehicle

    const preOrdersResponse = await api.get('/pre-orders')

    const preOrders =
        preOrdersResponse.data.pre_orders?.data ||
        preOrdersResponse.data.pre_orders ||
        []

    preOrder.value =
        preOrders.find(item => {
          return (
              Number(item.vehicle_id) === Number(vehicle.value.id) &&
              ['pending', 'approved'].includes(item.status)
          )
        }) || null
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Unable to load pre-order information.'
  } finally {
    loading.value = false
  }
}

const submitPreOrder = async () => {
  if (!canSubmit.value) {
    return
  }

  submitting.value = true
  error.value = null
  success.value = null

  try {
    const response = await api.post('/pre-orders', {
      vehicle_id: vehicle.value.id,
      deposit: Number(deposit.value),
      user_note: userNote.value || null,
    })

    preOrder.value = response.data.pre_order

    success.value =
        response.data.message ||
        'Your pre-order has been submitted successfully.'

    deposit.value = ''
    userNote.value = ''
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        err.response?.data?.errors?.vehicle_id?.[0] ||
        err.response?.data?.errors?.deposit?.[0] ||
        err.response?.data?.errors?.user_note?.[0] ||
        'Unable to create the pre-order.'
  } finally {
    submitting.value = false
  }
}

const cancelPreOrder = async () => {
  if (!canCancel.value) {
    return
  }

  cancelling.value = true
  error.value = null
  success.value = null

  try {
    const response = await api.post(
        `/pre-orders/${preOrder.value.id}/cancel`
    )

    preOrder.value.status = 'cancelled'

    success.value =
        response.data.message ||
        'Your pre-order has been cancelled successfully.'
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Unable to cancel the pre-order.'
  } finally {
    cancelling.value = false
  }
}

const goToPreOrders = () => {
  router.push({
    name: 'pre-orders',
  })
}

const goToVehicle = () => {
  if (!vehicle.value?.id) {
    return
  }

  router.push({
    name: 'vehicle-details',
    params: {
      vehicle: vehicle.value.id,
    },
  })
}

const goBack = () => {
  router.back()
}

onMounted(loadVehicle)
</script>

<template>
  <section class="mx-auto max-w-6xl px-8 py-16">

    <div
        v-if="loading"
        class="flex min-h-[70vh] items-center justify-center"
    >
      <p class="text-xs uppercase tracking-[0.3em] text-white/30">
        Loading pre-order
      </p>
    </div>

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

        <div class="flex flex-wrap items-center gap-3">

          <p class="text-xs uppercase tracking-[0.3em] text-white/30">
            Vehicle Pre-Order
          </p>

          <span
              v-if="isPreOrderAvailable"
              class="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60"
          >
            PRE-ORDER
          </span>

        </div>

        <h1 class="mt-4 text-4xl font-black tracking-[-0.04em]">
          Reserve your place in line.
        </h1>

        <p class="mt-3 max-w-2xl text-sm leading-7 text-white/40">
          This vehicle is currently available for pre-order.
          Submit your request and become the buyer when the vehicle
          becomes available.
        </p>

      </div>


      <!-- Existing Pre-order -->

      <div
          v-if="hasExistingPreOrder"
          class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
      >

        <!-- Vehicle -->

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

            <div class="absolute left-5 top-5">

              <span
                  class="rounded-full border border-white/15 bg-black/60 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur"
              >
                PRE-ORDER
              </span>

            </div>

          </div>

          <div class="p-6">

            <p
                class="text-[9px] uppercase tracking-[0.25em] text-white/25"
            >
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
                  Availability
                </span>

                <span class="text-sm font-semibold text-white/60">
                  Pre-Order
                </span>

              </div>

            </div>

          </div>

        </div>


        <!-- Existing Pre-order -->

        <div
            class="rounded-2xl border border-white/10 bg-white/[0.025] p-7"
        >

          <div class="mb-8">

            <p
                class="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25"
            >
              Existing Pre-Order
            </p>

            <h2 class="mt-3 text-2xl font-bold">
              Your pre-order already exists.
            </h2>

            <p class="mt-3 text-xs leading-6 text-white/35">
              You already have an active pre-order for this vehicle.
              You cannot submit another request while this one is active.
            </p>

          </div>


          <!-- Status -->

          <div
              class="rounded-xl border border-white/[0.07] bg-black/20 p-5"
          >

            <p
                class="text-[9px] uppercase tracking-[0.2em] text-white/25"
            >
              Pre-Order Status
            </p>

            <p class="mt-2 text-lg font-bold capitalize text-white">
              {{ preOrder.status }}
            </p>

            <div class="mt-5 border-t border-white/[0.07] pt-4">

              <p
                  class="text-[9px] uppercase tracking-[0.2em] text-white/25"
              >
                Deposit
              </p>

              <p class="mt-2 text-xl font-bold">
                {{ formattedDeposit }}
              </p>

            </div>

          </div>


          <!-- Success -->

          <div
              v-if="success"
              class="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p class="text-xs leading-6 text-white/50">
              {{ success }}
            </p>
          </div>


          <!-- Error -->

          <div
              v-if="error"
              class="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p class="text-xs leading-6 text-white/50">
              {{ error }}
            </p>
          </div>


          <!-- Actions -->

          <div class="mt-7 flex flex-wrap gap-3">

            <button
                type="button"
                @click="goToPreOrders"
                class="rounded-xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/85"
            >
              View Pre-Orders
            </button>

            <button
                v-if="canCancel"
                type="button"
                @click="cancelPreOrder"
                :disabled="cancelling"
                class="rounded-xl border border-white/10 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span v-if="cancelling">
                Cancelling...
              </span>

              <span v-else>
                Cancel Pre-Order
              </span>
            </button>

            <button
                type="button"
                @click="goToVehicle"
                class="rounded-xl border border-white/10 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-white/20 hover:text-white"
            >
              Vehicle Details
            </button>

          </div>

        </div>

      </div>


      <!-- Pre-order unavailable -->

      <div
          v-else-if="!isPreOrderAvailable"
          class="rounded-2xl border border-white/10 bg-white/[0.025] p-8"
      >

        <p
            class="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30"
        >
          Pre-order unavailable
        </p>

        <h2 class="mt-3 text-2xl font-bold">
          This vehicle is not available for pre-order.
        </h2>

        <p class="mt-3 max-w-xl text-sm leading-7 text-white/40">
          This vehicle does not currently have an active pre-order offer.
        </p>

        <button
            type="button"
            @click="goToVehicle"
            class="mt-7 rounded-xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/85"
        >
          Vehicle Details
        </button>

      </div>


      <!-- New Pre-order -->

      <div
          v-else
          class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
      >

        <!-- Vehicle -->

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

            <div class="absolute left-5 top-5">

              <span
                  class="rounded-full border border-white/15 bg-black/60 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur"
              >
                PRE-ORDER
              </span>

            </div>

          </div>

          <div class="p-6">

            <p
                class="text-[9px] uppercase tracking-[0.25em] text-white/25"
            >
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
                  Availability
                </span>

                <span class="text-sm font-semibold text-white/60">
                  Pre-Order
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
              Pre-Order Request
            </p>

            <h2 class="mt-3 text-2xl font-bold">
              Secure your place.
            </h2>

            <p class="mt-3 text-xs leading-6 text-white/35">
              Submit your deposit and request. Nitro will review the
              pre-order before it becomes approved.
            </p>

          </div>


          <!-- Offer -->

          <div
              v-if="preOrderOffer"
              class="mb-7 rounded-xl border border-white/[0.07] bg-black/20 p-5"
          >

            <p
                class="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30"
            >
              Current Offer
            </p>

            <h3 class="mt-2 text-sm font-semibold text-white/80">
              {{ preOrderOffer.title }}
            </h3>

            <p
                v-if="preOrderOffer.description"
                class="mt-2 text-xs leading-6 text-white/35"
            >
              {{ preOrderOffer.description }}
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


          <form
              class="space-y-6"
              @submit.prevent="submitPreOrder"
          >

            <!-- Deposit -->

            <div>

              <label
                  for="deposit"
                  class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35"
              >
                Pre-Order Deposit
              </label>

              <div class="relative mt-3">

                <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/25"
                >
                  $
                </span>

                <input
                    id="deposit"
                    v-model="deposit"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="500"
                    class="w-full rounded-xl border border-white/10 bg-black/20 py-4 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-white/25"
                />

              </div>

              <p class="mt-2 text-[10px] leading-5 text-white/25">
                Enter the deposit amount required for this pre-order.
              </p>

            </div>


            <!-- Note -->

            <div>

              <label
                  for="user-note"
                  class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35"
              >
                Note
              </label>

              <textarea
                  id="user-note"
                  v-model="userNote"
                  rows="5"
                  maxlength="2000"
                  placeholder="Add any notes for your pre-order..."
                  class="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/15 focus:border-white/25"
              ></textarea>

            </div>


            <!-- How it works -->

            <div
                class="rounded-xl border border-white/[0.07] bg-black/20 p-5"
            >

              <p
                  class="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30"
              >
                How Pre-Order Works
              </p>

              <div class="mt-4 space-y-4">

                <div class="flex gap-3">

                  <span
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-[9px] text-white/50"
                  >
                    1
                  </span>

                  <p class="text-xs leading-6 text-white/35">
                    Submit your pre-order request and deposit.
                  </p>

                </div>

                <div class="flex gap-3">

                  <span
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-[9px] text-white/50"
                  >
                    2
                  </span>

                  <p class="text-xs leading-6 text-white/35">
                    Nitro reviews your request.
                  </p>

                </div>

                <div class="flex gap-3">

                  <span
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-[9px] text-white/50"
                  >
                    3
                  </span>

                  <p class="text-xs leading-6 text-white/35">
                    Once approved, you remain the intended buyer when
                    the vehicle becomes available.
                  </p>

                </div>

              </div>

            </div>


            <!-- Submit -->

            <button
                type="submit"
                :disabled="!canSubmit"
                class="w-full rounded-xl bg-white px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-30"
            >

              <span v-if="submitting">
                Submitting Pre-Order...
              </span>

              <span v-else>
                Submit Pre-Order
              </span>

            </button>

          </form>

        </div>

      </div>

    </div>

  </section>
</template>
