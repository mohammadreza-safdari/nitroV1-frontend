<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { imageUrl } from '@/services/api.js'

const route = useRoute()
const router = useRouter()

const dealId = computed(() => {
  return route.query.deal || route.params.dealId
})

const deal = ref(null)
const payments = ref([])

const method = ref('bank')
const transactionReference = ref('')

const loading = ref(true)
const submitting = ref(false)
const error = ref(null)
const success = ref(null)

const vehicle = computed(() => deal.value?.vehicle)

const activePayment = computed(() => {
  return payments.value.find(
      payment =>
          ['pending', 'approved'].includes(payment.status)
  ) || null
})

const canSubmitRequest = computed(() => {
  return !activePayment.value
})

const vehicleImage = computed(() => {
  const image =
      vehicle.value?.images?.find(
          image => image.is_primary
      ) || vehicle.value?.images?.[0]

  return image ? imageUrl(image.path) : null
})

const formatPrice = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const statusLabel = (status) => {
  return {
    pending: 'Pending',
    approved: 'Approved',
    paid: 'Paid',
    rejected: 'Rejected',
    failed: 'Failed',
    cancelled: 'Cancelled',
  }[status] || status
}

const statusClass = (status) => {
  return {
    pending: 'text-yellow-400',
    approved: 'text-emerald-400',
    paid: 'text-emerald-400',
    rejected: 'text-red-400',
    failed: 'text-red-400',
    cancelled: 'text-zinc-400',
  }[status] || 'text-zinc-400'
}

const statusBadgeClass = (status) => {
  return {
        pending:
            'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',

        approved:
            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',

        paid:
            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',

        rejected:
            'bg-red-500/10 border-red-500/20 text-red-400',

        failed:
            'bg-red-500/10 border-red-500/20 text-red-400',

        cancelled:
            'bg-zinc-500/10 border-zinc-500/20 text-zinc-400',
      }[status]
      || 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
}

const loadData = async () => {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const dealResponse = await api.get(
        `/deals/${dealId.value}`
    )

    deal.value = dealResponse.data.deal

    if (deal.value.payment_method !== 'full') {
      error.value =
          'This deal is not configured for full payment.'

      return
    }

    const paymentsResponse = await api.get(
        `/deals/${dealId.value}/payments`
    )

    payments.value =
        paymentsResponse.data.payments || []
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to load payment information.'
  } finally {
    loading.value = false
  }
}

const submitPaymentRequest = async () => {
  if (!canSubmitRequest.value) {
    return
  }

  submitting.value = true
  error.value = null
  success.value = null

  try {
    const response = await api.post('/payments', {
      deal_id: deal.value.id,
      method: method.value,
      transaction_reference:
          transactionReference.value || null,
    })

    const newPayment = response.data.payment

    payments.value.unshift(newPayment)

    transactionReference.value = ''

    success.value =
        'Your payment request has been submitted and is waiting for administrator approval.'
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to submit payment request.'
  } finally {
    submitting.value = false
  }
}

const continueToBank = () => {
  if (
      !activePayment.value ||
      activePayment.value.status !== 'approved'
  ) {
    return
  }

  router.push({
    name: 'bank-payment',
    params: {
      paymentId: activePayment.value.id,
    },
  })
}

const backToBuy = () => {
  if (!vehicle.value?.id) {
    return
  }

  router.push({
    name: 'buy',
    params: {
      vehicle: vehicle.value.id,
    },
  })
}

onMounted(loadData)
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white px-6 py-10">
    <div class="max-w-6xl mx-auto">

      <!-- Loading -->
      <div
          v-if="loading"
          class="py-20 text-center"
      >
        <p class="text-zinc-400">
          Loading payment information...
        </p>
      </div>

      <!-- Error -->
      <div
          v-else-if="error"
          class="space-y-6"
      >
        <div
            class="rounded-2xl border border-red-500/20 bg-red-500/10 p-6"
        >
          <p class="text-red-400">
            {{ error }}
          </p>
        </div>
      </div>

      <!-- Content -->
      <div
          v-else-if="deal"
          class="space-y-8"
      >

        <!-- Header -->
        <div>
          <p
              class="text-sm uppercase tracking-[0.25em] text-zinc-500"
          >
            Payment
          </p>

          <h1 class="mt-2 text-4xl font-bold">
            Full Payment
          </h1>

          <p class="mt-2 text-zinc-400">
            Manage your payment request and payment history.
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">

          <!-- Main -->
          <div class="lg:col-span-2 space-y-6">

            <!-- Vehicle -->
            <div
                class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div class="flex gap-5">

                <div
                    v-if="vehicleImage"
                    class="w-36 h-28 rounded-xl overflow-hidden bg-zinc-800 shrink-0"
                >
                  <img
                      :src="vehicleImage"
                      :alt="vehicle?.vehicle_model?.name"
                      class="w-full h-full object-cover"
                  >
                </div>

                <div>
                  <p class="text-sm text-zinc-500">
                    Vehicle
                  </p>

                  <h2
                      class="text-2xl font-semibold mt-1"
                  >
                    {{ vehicle?.vehicle_model?.brand?.name }}
                    {{ vehicle?.vehicle_model?.name }}
                  </h2>

                  <p class="text-zinc-400 mt-2">
                    {{ vehicle?.year }}
                  </p>
                </div>

              </div>
            </div>

            <!-- Current Payment -->
            <div
                v-if="activePayment"
                class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div
                  class="flex items-center justify-between gap-4"
              >

                <div>
                  <p class="text-sm text-zinc-500">
                    Current Payment Request
                  </p>

                  <h2
                      class="text-xl font-semibold mt-1"
                  >
                    {{ formatPrice(activePayment.amount) }}
                  </h2>
                </div>

                <span
                    class="px-3 py-1.5 rounded-full border text-sm"
                    :class="
                    statusBadgeClass(
                      activePayment.status
                    )
                  "
                >
                  {{ statusLabel(activePayment.status) }}
                </span>

              </div>

              <div class="mt-5">

                <button
                    v-if="
                    activePayment.status === 'approved'
                  "
                    type="button"
                    class="w-full rounded-xl bg-white text-black py-3 font-semibold hover:bg-zinc-200 transition"
                    @click="continueToBank"
                >
                  Continue to Bank
                </button>

                <div
                    v-else-if="
                    activePayment.status === 'pending'
                  "
                    class="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4"
                >
                  <p class="text-sm text-yellow-400">
                    Your payment request is waiting for administrator approval.
                  </p>
                </div>

              </div>
            </div>

            <!-- Payment History -->
            <div
                class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div
                  class="flex items-center justify-between"
              >
                <div>
                  <h2 class="text-xl font-semibold">
                    Payment History
                  </h2>

                  <p class="text-sm text-zinc-500 mt-1">
                    All payment requests for this deal.
                  </p>
                </div>

                <span class="text-sm text-zinc-500">
                  {{ payments.length }}
                  payment{{
                    payments.length === 1
                        ? ''
                        : 's'
                  }}
                </span>
              </div>

              <div
                  v-if="payments.length"
                  class="mt-6 space-y-3"
              >

                <div
                    v-for="item in payments"
                    :key="item.id"
                    class="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                >

                  <div
                      class="flex items-start justify-between gap-4"
                  >

                    <div>
                      <p class="text-sm text-zinc-500">
                        Payment #{{ item.id }}
                      </p>

                      <p
                          class="text-xl font-semibold mt-1"
                      >
                        {{ formatPrice(item.amount) }}
                      </p>
                    </div>

                    <span
                        class="px-3 py-1.5 rounded-full border text-sm"
                        :class="
                        statusBadgeClass(
                          item.status
                        )
                      "
                    >
                      {{ statusLabel(item.status) }}
                    </span>

                  </div>

                  <div
                      class="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-zinc-800"
                  >

                    <div>
                      <p
                          class="text-xs uppercase tracking-wide text-zinc-600"
                      >
                        Method
                      </p>

                      <p
                          class="text-sm text-zinc-300 mt-1"
                      >
                        {{ item.method }}
                      </p>
                    </div>

                    <div>
                      <p
                          class="text-xs uppercase tracking-wide text-zinc-600"
                      >
                        Requested
                      </p>

                      <p
                          class="text-sm text-zinc-300 mt-1"
                      >
                        {{ formatDate(item.created_at) }}
                      </p>
                    </div>

                    <div
                        v-if="item.paid_at"
                    >
                      <p
                          class="text-xs uppercase tracking-wide text-zinc-600"
                      >
                        Paid At
                      </p>

                      <p
                          class="text-sm text-zinc-300 mt-1"
                      >
                        {{ formatDate(item.paid_at) }}
                      </p>
                    </div>

                    <div
                        v-if="item.transaction_reference"
                    >
                      <p
                          class="text-xs uppercase tracking-wide text-zinc-600"
                      >
                        Transaction Reference
                      </p>

                      <p
                          class="text-sm text-zinc-300 mt-1 break-all"
                      >
                        {{ item.transaction_reference }}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              <div
                  v-else
                  class="mt-6 rounded-xl bg-zinc-950 border border-zinc-800 p-5"
              >
                <p class="text-zinc-400">
                  No payment requests have been submitted yet.
                </p>
              </div>
            </div>

            <!-- New Payment Request -->
            <div
                v-if="canSubmitRequest"
                class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >

              <h2 class="text-xl font-semibold">
                New Payment Request
              </h2>

              <p class="text-sm text-zinc-500 mt-1">
                Submit your full payment for administrator approval.
              </p>

              <!-- Amount -->
              <div
                  class="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <div
                    class="flex items-center justify-between gap-4"
                >
                  <span class="text-zinc-400">
                    Payment Amount
                  </span>

                  <span class="text-2xl font-semibold">
                    {{ formatPrice(deal.final_amount) }}
                  </span>
                </div>
              </div>

              <!-- Method -->
              <div class="mt-5">

                <label
                    class="flex items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4"
                >

                  <input
                      v-model="method"
                      type="radio"
                      value="bank"
                      class="accent-white"
                  >

                  <div>
                    <p class="font-medium">
                      Bank Payment
                    </p>

                    <p class="text-sm text-zinc-400 mt-1">
                      You will enter the bank payment page
                      after administrator approval.
                    </p>
                  </div>

                </label>

              </div>

              <!-- Transaction Reference -->
              <div class="mt-5">

                <label
                    class="block text-sm text-zinc-400 mb-2"
                >
                  Transaction Reference
                  <span class="text-zinc-600">
                    (optional)
                  </span>
                </label>

                <input
                    v-model="transactionReference"
                    type="text"
                    maxlength="255"
                    class="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
                    placeholder="Transaction reference"
                >

              </div>

              <!-- Success -->
              <div
                  v-if="success"
                  class="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5"
              >
                <p class="text-emerald-400">
                  {{ success }}
                </p>
              </div>

            </div>

            <!-- Active Payment blocks new request -->
            <div
                v-else-if="activePayment"
                class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <p class="text-zinc-400">
                {{
                  activePayment.status === 'approved'
                      ? 'This payment request has been approved. Continue to the bank to complete the payment.'
                      : 'This payment request is waiting for administrator approval.'
                }}
              </p>
            </div>

          </div>

          <!-- Sidebar -->
          <div>

            <div
                class="sticky top-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >

              <p class="text-sm text-zinc-500">
                Deal Total
              </p>

              <p class="mt-2 text-3xl font-bold">
                {{ formatPrice(deal.final_amount) }}
              </p>

              <div
                  class="border-t border-zinc-800 my-6"
              ></div>

              <div class="space-y-4">

                <div
                    class="flex justify-between gap-4"
                >
                  <span class="text-zinc-400">
                    Payment Requests
                  </span>

                  <span class="font-medium">
                    {{ payments.length }}
                  </span>
                </div>

                <div
                    v-if="payments.length"
                    class="flex justify-between gap-4"
                >
                  <span class="text-zinc-400">
                    Paid Payments
                  </span>

                  <span
                      class="text-emerald-400 font-medium"
                  >
                    {{
                      payments.filter(
                          payment =>
                              payment.status === 'paid'
                      ).length
                    }}
                  </span>
                </div>

                <div
                    v-if="payments.length"
                    class="flex justify-between gap-4"
                >
                  <span class="text-zinc-400">
                    Rejected Payments
                  </span>

                  <span
                      class="text-red-400 font-medium"
                  >
                    {{
                      payments.filter(
                          payment =>
                              payment.status === 'rejected'
                      ).length
                    }}
                  </span>
                </div>

                <div
                    v-if="payments.length"
                    class="flex justify-between gap-4"
                >
                  <span class="text-zinc-400">
                    Failed Payments
                  </span>

                  <span
                      class="text-red-400 font-medium"
                  >
                    {{
                      payments.filter(
                          payment =>
                              payment.status === 'failed'
                      ).length
                    }}
                  </span>
                </div>

                <div
                    v-if="payments.length"
                    class="flex justify-between gap-4"
                >
                  <span class="text-zinc-400">
                    Cancelled Payments
                  </span>

                  <span
                      class="text-zinc-400 font-medium"
                  >
                    {{
                      payments.filter(
                          payment =>
                              payment.status === 'cancelled'
                      ).length
                    }}
                  </span>
                </div>

                <div
                    v-if="activePayment"
                    class="flex justify-between gap-4"
                >
                  <span class="text-zinc-400">
                    Current Status
                  </span>

                  <span
                      :class="
                      statusClass(
                        activePayment.status
                      )
                    "
                  >
                    {{
                      statusLabel(
                          activePayment.status
                      )
                    }}
                  </span>
                </div>

              </div>

              <div
                  class="border-t border-zinc-800 my-6"
              ></div>

              <!-- Submit Payment Request -->
              <button
                  v-if="canSubmitRequest"
                  type="button"
                  :disabled="submitting"
                  class="w-full rounded-xl bg-white text-black py-3 font-semibold hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="submitPaymentRequest"
              >
                {{
                  submitting
                      ? 'Submitting...'
                      : 'Submit Payment Request'
                }}
              </button>

              <button
                  v-else-if="
                  activePayment &&
                  activePayment.status === 'approved'
                "
                  type="button"
                  class="w-full rounded-xl bg-white text-black py-3 font-semibold hover:bg-zinc-200 transition"
                  @click="continueToBank"
              >
                Continue to Bank
              </button>

              <div
                  v-else
                  class="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4"
              >
                <p class="text-sm text-yellow-400">
                  Your payment request is waiting for administrator approval.
                </p>
              </div>

              <button
                  type="button"
                  class="w-full mt-3 rounded-xl border border-zinc-700 text-zinc-300 py-3 font-medium hover:bg-zinc-800 transition"
                  @click="backToBuy"
              >
                Back to Purchase
              </button>

              <p class="mt-4 text-xs leading-5 text-zinc-500">
                Each payment request is reviewed separately
                by an administrator. An approved request can
                continue to the bank.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
</template>