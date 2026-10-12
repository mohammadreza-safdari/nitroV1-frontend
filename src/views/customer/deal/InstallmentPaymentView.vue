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
const installments = ref([])
const payments = ref([])
const selectedInstallmentIds = ref([])

const method = ref('bank')
const transactionReference = ref('')

const loading = ref(true)
const submitting = ref(false)
const error = ref(null)
const success = ref(null)

const visibleInstallmentStatuses = ref([
  'pending',
  'paid',
])

const installmentStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
]

const vehicle = computed(() => deal.value?.vehicle)

const activePayment = computed(() => {
  return payments.value.find(payment =>
      ['pending', 'approved'].includes(payment.status)
  ) || null
})

const isInstallmentSelectable = (installment) => {
  if (installment.status !== 'pending' || activePayment.value) {
    return false
  }

  if (installment.payment_id === null || installment.payment_id === undefined) {
    return true
  }

  const payment = payments.value.find(
      item => Number(item.id) === Number(installment.payment_id)
  )

  return ['rejected', 'cancelled', 'failed'].includes(
      payment?.status
  )
}

const availableInstallments = computed(() => {
  return installments.value.filter(isInstallmentSelectable)
})

const filteredInstallments = computed(() => {
  return installments.value.filter(installment =>
      visibleInstallmentStatuses.value.includes(installment.status)
  )
})

const selectedInstallments = computed(() => {
  return installments.value.filter(installment =>
      selectedInstallmentIds.value.includes(installment.id)
  )
})

const selectedAmount = computed(() => {
  return selectedInstallments.value.reduce(
      (total, installment) => total + Number(installment.amount || 0),
      0
  )
})

const canSubmitRequest = computed(() => {
  return !activePayment.value
      && selectedInstallmentIds.value.length > 0
      && selectedInstallments.value.every(isInstallmentSelectable)
})

const vehicleImage = computed(() => {
  const image = vehicle.value?.images?.find(item => item.is_primary)
      || vehicle.value?.images?.[0]

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
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const formatInstallmentDate = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
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
    pending: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    approved: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    paid: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    rejected: 'bg-red-500/10 border-red-500/20 text-red-400',
    failed: 'bg-red-500/10 border-red-500/20 text-red-400',
    cancelled: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400',
  }[status] || 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
}

const installmentStatusClass = (installment) => {
  return statusClass(installment.status)
}

const installmentStatusBadgeClass = (installment) => {
  return statusBadgeClass(installment.status)
}

const isSelected = (installmentId) => {
  return selectedInstallmentIds.value.includes(installmentId)
}

const toggleInstallment = (installment) => {
  if (!isInstallmentSelectable(installment)) {
    return
  }

  if (isSelected(installment.id)) {
    selectedInstallmentIds.value =
        selectedInstallmentIds.value.filter(id => id !== installment.id)

    return
  }

  selectedInstallmentIds.value.push(installment.id)
}

const isInstallmentStatusVisible = (status) => {
  return visibleInstallmentStatuses.value.includes(status)
}

const toggleInstallmentStatus = (status) => {
  if (isInstallmentStatusVisible(status)) {
    visibleInstallmentStatuses.value =
        visibleInstallmentStatuses.value.filter(item => item !== status)

    return
  }

  visibleInstallmentStatuses.value.push(status)
}

const showAllInstallmentStatuses = () => {
  visibleInstallmentStatuses.value =
      installmentStatuses.map(status => status.value)
}

const loadData = async () => {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const dealResponse = await api.get(`/deals/${dealId.value}`)
    deal.value = dealResponse.data.deal

    if (deal.value.payment_method !== 'installment') {
      error.value = 'This deal is not configured for installment payment.'
      return
    }

    installments.value = deal.value.installments || []

    const paymentsResponse = await api.get(`/deals/${dealId.value}/payments`)
    payments.value = paymentsResponse.data.payments || []

    if (activePayment.value) {
      selectedInstallmentIds.value =
          activePayment.value.installments?.map(item => item.id) || []
    } else {
      selectedInstallmentIds.value = []
    }
  } catch (err) {
    error.value =
        err.response?.data?.message
        || 'Failed to load installment payment information.'
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
      transaction_reference: transactionReference.value || null,
      installment_ids: [...selectedInstallmentIds.value],
    })

    const newPayment = response.data.payment

    payments.value.unshift(newPayment)

    const updatedInstallments = newPayment.installments || []

    updatedInstallments.forEach(paymentInstallment => {
      const index = installments.value.findIndex(
          installment => installment.id === paymentInstallment.id
      )

      if (index !== -1) {
        installments.value[index] = {
          ...installments.value[index],
          ...paymentInstallment,
        }
      }
    })

    selectedInstallmentIds.value = []
    transactionReference.value = ''

    success.value =
        'Your payment request has been submitted and is waiting for administrator approval.'
  } catch (err) {
    error.value =
        err.response?.data?.message
        || 'Failed to submit payment request.'
  } finally {
    submitting.value = false
  }
}

const continueToBank = () => {
  if (!activePayment.value || activePayment.value.status !== 'approved') {
    return
  }

  router.push({
    name: 'bank-payment',
    params: {
      paymentId: activePayment.value.id,
    },
  })
}

onMounted(loadData)
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white px-6 py-10">
    <div class="max-w-6xl mx-auto">
      <div v-if="loading" class="py-20 text-center">
        <p class="text-zinc-400">Loading installment information...</p>
      </div>

      <div v-else-if="error" class="space-y-6">
        <div class="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <p class="text-red-400">{{ error }}</p>
          <button
              type="button"
              class="mt-4 rounded-lg border border-red-500/30 px-4 py-2 text-sm hover:bg-red-500/10"
              @click="loadData"
          >
            Retry
          </button>
        </div>
      </div>

      <div v-else-if="deal" class="space-y-8">
        <div>
          <p class="text-sm uppercase tracking-[0.25em] text-zinc-500">
            Payment
          </p>
          <h1 class="mt-2 text-4xl font-bold">Installment Payment</h1>
          <p class="mt-2 text-zinc-400">
            Manage your installments, payment requests, and payment history.
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
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
                  <p class="text-sm text-zinc-500">Vehicle</p>
                  <h2 class="text-2xl font-semibold mt-1">
                    {{ vehicle?.vehicle_model?.brand?.name }}
                    {{ vehicle?.vehicle_model?.name }}
                  </h2>
                  <p class="text-zinc-400 mt-2">{{ vehicle?.year }}</p>
                </div>
              </div>
            </div>

            <div
                v-if="activePayment"
                class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm text-zinc-500">Current Payment Request</p>
                  <h2 class="text-xl font-semibold mt-1">
                    {{ formatPrice(activePayment.amount) }}
                  </h2>
                  <p class="text-xs text-zinc-500 mt-1">
                    Payment #{{ activePayment.id }}
                  </p>
                </div>

                <span
                    class="px-3 py-1.5 rounded-full border text-sm"
                    :class="statusBadgeClass(activePayment.status)"
                >
                  {{ statusLabel(activePayment.status) }}
                </span>
              </div>

              <div class="mt-5">
                <button
                    v-if="activePayment.status === 'approved'"
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
              </div>
            </div>

            <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div class="flex items-start justify-between gap-6">
                <div>
                  <h2 class="text-xl font-semibold">Installment History</h2>
                  <p class="text-sm text-zinc-500 mt-1">
                    All installments for this deal.
                  </p>
                </div>
                <span class="text-sm text-zinc-500">
                  {{ filteredInstallments.length }} shown
                </span>
              </div>

              <div class="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div class="flex items-center justify-between gap-4 mb-4">
                  <p class="text-xs uppercase tracking-wide text-zinc-500">
                    Show Statuses
                  </p>
                  <button
                      type="button"
                      class="text-xs text-zinc-400 hover:text-white transition"
                      @click="showAllInstallmentStatuses"
                  >
                    Show All
                  </button>
                </div>

                <div class="flex flex-wrap gap-3">
                  <label
                      v-for="status in installmentStatuses"
                      :key="status.value"
                      class="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 cursor-pointer hover:border-zinc-600 transition"
                  >
                    <input
                        type="checkbox"
                        :checked="isInstallmentStatusVisible(status.value)"
                        class="accent-white"
                        @change="toggleInstallmentStatus(status.value)"
                    >
                    <span class="text-xs text-zinc-300">{{ status.label }}</span>
                  </label>
                </div>
              </div>

              <div v-if="filteredInstallments.length" class="mt-6 space-y-3">
                <div
                    v-for="installment in filteredInstallments"
                    :key="installment.id"
                    class="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                    :class="{ 'border-white/30': isSelected(installment.id) }"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start gap-4">
                      <input
                          v-if="isInstallmentSelectable(installment)"
                          type="checkbox"
                          :checked="isSelected(installment.id)"
                          class="mt-1 accent-white"
                          @change="toggleInstallment(installment)"
                      >

                      <div>
                        <p class="text-sm text-zinc-500">
                          Installment #{{ installment.installment_number }}
                        </p>
                        <p class="text-xl font-semibold mt-1">
                          {{ formatPrice(installment.amount) }}
                        </p>
                      </div>
                    </div>

                    <span
                        class="px-3 py-1.5 rounded-full border text-sm"
                        :class="installmentStatusBadgeClass(installment)"
                    >
                      {{ statusLabel(installment.status) }}
                    </span>
                  </div>

                  <div class="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-zinc-800">
                    <div>
                      <p class="text-xs uppercase tracking-wide text-zinc-600">
                        Due Date
                      </p>
                      <p class="text-sm text-zinc-300 mt-1">
                        {{ formatInstallmentDate(installment.due_date) }}
                      </p>
                    </div>

                    <div v-if="installment.paid_at">
                      <p class="text-xs uppercase tracking-wide text-zinc-600">
                        Paid At
                      </p>
                      <p class="text-sm text-zinc-300 mt-1">
                        {{ formatDate(installment.paid_at) }}
                      </p>
                    </div>

                    <div v-if="installment.payment_id">
                      <p class="text-xs uppercase tracking-wide text-zinc-600">
                        Previous Payment
                      </p>
                      <p class="text-sm text-zinc-300 mt-1">
                        #{{ installment.payment_id }}
                      </p>
                    </div>

                    <div
                        v-if="isInstallmentSelectable(installment) && installment.payment_id"
                        class="sm:col-span-2"
                    >
                      <p class="text-xs text-emerald-400">
                        This installment is available again because its previous payment was not completed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="mt-6 rounded-xl bg-zinc-950 border border-zinc-800 p-5">
                <p class="text-zinc-400">
                  No installments match the selected filters.
                </p>
              </div>
            </div>

            <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div class="flex items-start justify-between gap-6">
                <div>
                  <h2 class="text-xl font-semibold">Payment History</h2>
                  <p class="text-sm text-zinc-500 mt-1">
                    All payment requests for this deal.
                  </p>
                </div>
                <span class="text-sm text-zinc-500">{{ payments.length }}</span>
              </div>

              <div v-if="payments.length" class="mt-6 space-y-3">
                <div
                    v-for="item in payments"
                    :key="item.id"
                    class="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <p class="text-sm text-zinc-500">Payment #{{ item.id }}</p>
                      <p class="text-xl font-semibold mt-1">
                        {{ formatPrice(item.amount) }}
                      </p>
                    </div>
                    <span
                        class="px-3 py-1.5 rounded-full border text-sm"
                        :class="statusBadgeClass(item.status)"
                    >
                      {{ statusLabel(item.status) }}
                    </span>
                  </div>

                  <div class="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-zinc-800">
                    <div>
                      <p class="text-xs uppercase tracking-wide text-zinc-600">Method</p>
                      <p class="text-sm text-zinc-300 mt-1">{{ item.method }}</p>
                    </div>

                    <div>
                      <p class="text-xs uppercase tracking-wide text-zinc-600">Requested</p>
                      <p class="text-sm text-zinc-300 mt-1">
                        {{ formatDate(item.created_at) }}
                      </p>
                    </div>

                    <div v-if="item.paid_at">
                      <p class="text-xs uppercase tracking-wide text-zinc-600">Paid At</p>
                      <p class="text-sm text-zinc-300 mt-1">
                        {{ formatDate(item.paid_at) }}
                      </p>
                    </div>

                    <div v-if="item.transaction_reference">
                      <p class="text-xs uppercase tracking-wide text-zinc-600">
                        Transaction Reference
                      </p>
                      <p class="text-sm text-zinc-300 mt-1 break-all">
                        {{ item.transaction_reference }}
                      </p>
                    </div>
                  </div>

                  <div
                      v-if="item.installments?.length"
                      class="mt-5 pt-5 border-t border-zinc-800"
                  >
                    <p class="text-xs uppercase tracking-wide text-zinc-600">
                      Covered Installments
                    </p>
                    <div class="flex flex-wrap gap-2 mt-3">
                      <span
                          v-for="installment in item.installments"
                          :key="installment.id"
                          class="px-3 py-1.5 rounded-lg bg-zinc-800 text-sm text-zinc-300"
                      >
                        #{{ installment.installment_number }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="mt-6 rounded-xl bg-zinc-950 border border-zinc-800 p-5">
                <p class="text-zinc-400">No payment requests have been created.</p>
              </div>
            </div>

            <div
                v-if="canSubmitRequest"
                class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <h2 class="text-xl font-semibold">New Payment Request</h2>
              <p class="text-sm text-zinc-500 mt-1">
                Select one or more installments and submit them for administrator approval.
              </p>

              <div class="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-zinc-400">Selected Amount</span>
                  <span class="text-2xl font-semibold">
                    {{ formatPrice(selectedAmount) }}
                  </span>
                </div>
              </div>

              <div class="mt-5">
                <label class="flex items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                  <input
                      v-model="method"
                      type="radio"
                      value="bank"
                      class="accent-white"
                  >
                  <div>
                    <p class="font-medium">Bank Payment</p>
                    <p class="text-sm text-zinc-400 mt-1">
                      You will enter the bank payment page after administrator approval.
                    </p>
                  </div>
                </label>
              </div>

              <div class="mt-5">
                <label class="block text-sm text-zinc-400 mb-2">
                  Transaction Reference
                  <span class="text-zinc-600">(optional)</span>
                </label>
                <input
                    v-model="transactionReference"
                    type="text"
                    maxlength="255"
                    class="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
                    placeholder="Transaction reference"
                >
              </div>

              <div
                  v-if="success"
                  class="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5"
              >
                <p class="text-emerald-400">{{ success }}</p>
              </div>

              <div v-if="error" class="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-5">
                <p class="text-red-400">{{ error }}</p>
              </div>

              <button
                  type="button"
                  :disabled="submitting || !canSubmitRequest"
                  class="mt-5 w-full rounded-xl bg-white text-black py-3 font-semibold hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="submitPaymentRequest"
              >
                {{ submitting ? 'Submitting...' : 'Submit Payment Request' }}
              </button>
            </div>

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

            <div
                v-else-if="!availableInstallments.length"
                class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <p class="text-zinc-400">
                There are currently no unpaid installments available for payment.
              </p>
            </div>
          </div>

          <div>
            <div class="sticky top-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p class="text-sm text-zinc-500">Deal Total</p>
              <p class="mt-2 text-3xl font-bold">
                {{ formatPrice(deal.final_amount) }}
              </p>

              <div class="border-t border-zinc-800 my-6"></div>

              <div class="space-y-4">
                <div class="flex justify-between gap-4">
                  <span class="text-zinc-400">Installments</span>
                  <span class="font-medium">{{ installments.length }}</span>
                </div>

                <div class="flex justify-between gap-4">
                  <span class="text-zinc-400">Selectable Installments</span>
                  <span class="font-medium">{{ availableInstallments.length }}</span>
                </div>

                <div class="flex justify-between gap-4">
                  <span class="text-zinc-400">Paid Installments</span>
                  <span class="text-emerald-400 font-medium">
                    {{
                      installments.filter(item => item.status === 'paid').length
                    }}
                  </span>
                </div>

                <div class="flex justify-between gap-4">
                  <span class="text-zinc-400">Pending Installments</span>
                  <span class="text-yellow-400 font-medium">
                    {{
                      installments.filter(item => item.status === 'pending').length
                    }}
                  </span>
                </div>

                <div class="flex justify-between gap-4">
                  <span class="text-zinc-400">Payment Requests</span>
                  <span class="font-medium">{{ payments.length }}</span>
                </div>

                <div v-if="payments.length" class="flex justify-between gap-4">
                  <span class="text-zinc-400">Paid Payments</span>
                  <span class="text-emerald-400 font-medium">
                    {{ payments.filter(item => item.status === 'paid').length }}
                  </span>
                </div>

                <div v-if="payments.length" class="flex justify-between gap-4">
                  <span class="text-zinc-400">Rejected Payments</span>
                  <span class="text-red-400 font-medium">
                    {{ payments.filter(item => item.status === 'rejected').length }}
                  </span>
                </div>

                <div v-if="activePayment" class="flex justify-between gap-4">
                  <span class="text-zinc-400">Current Status</span>
                  <span :class="statusClass(activePayment.status)">
                    {{ statusLabel(activePayment.status) }}
                  </span>
                </div>
              </div>

              <div class="border-t border-zinc-800 my-6"></div>

              <button
                  type="button"
                  :disabled="submitting || !canSubmitRequest"
                  class="w-full rounded-xl bg-white text-black py-3 font-semibold hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="submitPaymentRequest"
              >
                {{ submitting ? 'Submitting...' : 'Submit Payment Request' }}
              </button>

              <p class="mt-4 text-xs leading-5 text-zinc-500">
                Each payment request is reviewed separately by an administrator.
                An approved request can continue to the bank.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>