<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()

const payments = ref([])
const loading = ref(true)
const error = ref('')
const actionLoading = ref(null)
const actionError = ref('')

const currentPage = ref(1)
const lastPage = ref(1)

async function loadPayments(page = 1) {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
        `/admin/deals/${route.params.deal}/payments?page=${page}`
    )

    const pagination = response.data.payments

    payments.value = pagination.data || []
    currentPage.value = pagination.current_page || 1
    lastPage.value = pagination.last_page || 1
  } catch (err) {
    console.error('PAYMENTS ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load payments.'
  } finally {
    loading.value = false
  }
}

async function performAction(payment, action) {
  actionLoading.value = `${payment.id}-${action}`
  actionError.value = ''

  try {
    const response = await api.post(
        `/admin/payments/${payment.id}/${action}`
    )

    const updatedPayment = response.data.payment

    const index = payments.value.findIndex(
        item => item.id === payment.id
    )

    if (index !== -1) {
      payments.value[index] = updatedPayment
    }

    await loadPayments(currentPage.value)
  } catch (err) {
    console.error(
        `PAYMENT ${action.toUpperCase()} ERROR:`,
        err
    )

    actionError.value =
        err.response?.data?.message ||
        `Failed to ${action} payment.`
  } finally {
    actionLoading.value = null
  }
}

function isActionLoading(payment, action) {
  return actionLoading.value === `${payment.id}-${action}`
}

function canManage(payment) {
  return payment.status === 'pending'
}

function statusClass(status) {
  switch (status) {
    case 'pending':
      return 'border-yellow-400/20 bg-yellow-400/5 text-yellow-300'

    case 'approved':
      return 'border-green-400/20 bg-green-400/5 text-green-300'

    case 'confirmed':
      return 'border-blue-400/20 bg-blue-400/5 text-blue-300'

    case 'paid':
      return 'border-green-400/20 bg-green-400/5 text-green-300'

    case 'cancelled':
      return 'border-white/10 bg-white/[0.03] text-white/35'

    case 'rejected':
      return 'border-red-400/20 bg-red-400/5 text-red-300'

    default:
      return 'border-white/10 bg-white/[0.03] text-white/40'
  }
}

function formatPrice(price) {
  return `$${Number(price || 0).toLocaleString()}`
}

function formatDate(date) {
  if (!date) return '—'

  return new Date(date).toLocaleString()
}

function paymentMethodLabel(method) {
  if (!method) return '—'

  return method.charAt(0).toUpperCase() + method.slice(1)
}

function goToPage(page) {
  if (
      page < 1 ||
      page > lastPage.value ||
      page === currentPage.value
  ) {
    return
  }

  loadPayments(page)
}

onMounted(() => {
  loadPayments()
})
</script>

<template>
  <section class="mx-auto max-w-5xl px-8 py-12">

    <!-- Back -->

    <div class="mb-8">
      <RouterLink
          :to="{
            name: 'admin-deal-detail',
            params: { deal: route.params.deal }
          }"
          class="text-sm text-white/40 transition hover:text-white/70"
      >
        ← Back to Deal
      </RouterLink>
    </div>

    <!-- Header -->

    <div class="mb-8">
      <p
          class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35"
      >
        Deal #{{ route.params.deal }}
      </p>

      <h1
          class="mt-2 text-3xl font-bold tracking-tight text-white"
      >
        Payments
      </h1>

      <p class="mt-2 text-sm text-white/40">
        Review and manage payment requests for this deal.
      </p>
    </div>

    <!-- Loading -->

    <div
        v-if="loading"
        class="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-white/50"
    >
      Loading payments...
    </div>

    <!-- Error -->

    <div
        v-else-if="error"
        class="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <!-- Empty -->

    <div
        v-else-if="!payments.length"
        class="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-white/35"
    >
      No payments found.
    </div>

    <!-- Payments -->

    <div
        v-else
        class="space-y-4"
    >

      <div
          v-for="payment in payments"
          :key="payment.id"
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20 hover:bg-white/[0.04]"
      >

        <!-- Payment Header -->

        <div
            class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
        >

          <div>
            <p
                class="text-xs font-semibold uppercase tracking-[0.2em] text-white/35"
            >
              Payment #{{ payment.id }}
            </p>

            <p class="mt-2 text-xl font-semibold text-white">
              {{ formatPrice(payment.amount) }}
            </p>

            <p class="mt-2 text-sm text-white/40">
              {{ paymentMethodLabel(payment.method) }}
            </p>
          </div>

          <div
              class="flex flex-col items-start gap-2 sm:items-end"
          >

            <span
                class="rounded-full border px-3 py-1 text-xs font-medium capitalize"
                :class="statusClass(payment.status)"
            >
              {{ payment.status }}
            </span>

            <p class="text-xs text-white/30">
              {{ formatDate(payment.created_at) }}
            </p>

          </div>

        </div>

        <!-- Payment Information -->

        <div
            class="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2"
        >

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Transaction Reference
            </p>

            <p class="mt-1 text-sm text-white/70">
              {{ payment.transaction_reference || '—' }}
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Paid At
            </p>

            <p class="mt-1 text-sm text-white/70">
              {{ formatDate(payment.paid_at) }}
            </p>
          </div>

        </div>

        <!-- Actions -->

        <div
            v-if="canManage(payment)"
            class="mt-5 border-t border-white/10 pt-5"
        >

          <div class="flex flex-wrap gap-3">

            <!-- Approve -->

            <button
                type="button"
                :disabled="actionLoading !== null"
                class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                @click="performAction(payment, 'approve')"
            >
              <span v-if="isActionLoading(payment, 'approve')">
                Processing...
              </span>

              <span v-else>
                Approve Payment
              </span>
            </button>

            <!-- Reject -->

            <button
                type="button"
                :disabled="actionLoading !== null"
                class="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                @click="performAction(payment, 'reject')"
            >
              <span v-if="isActionLoading(payment, 'reject')">
                Processing...
              </span>

              <span v-else>
                Reject Payment
              </span>
            </button>

            <!-- Cancel -->

            <button
                type="button"
                :disabled="actionLoading !== null"
                class="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                @click="performAction(payment, 'cancel')"
            >
              <span v-if="isActionLoading(payment, 'cancel')">
                Processing...
              </span>

              <span v-else>
                Cancel Payment
              </span>
            </button>

          </div>

        </div>

        <!-- Details -->

        <div
            class="mt-5 border-t border-white/10 pt-5"
        >

          <RouterLink
              :to="{
                name: 'admin-payment-detail',
                params: { payment: payment.id }
              }"
              class="inline-flex rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
          >
            View Details
          </RouterLink>

        </div>

      </div>

      <!-- Action Error -->

      <div
          v-if="actionError"
          class="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300"
      >
        {{ actionError }}
      </div>

      <!-- Pagination -->

      <div
          v-if="lastPage > 1"
          class="flex items-center justify-between pt-4"
      >

        <button
            type="button"
            :disabled="currentPage === 1 || actionLoading !== null"
            class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
            @click="goToPage(currentPage - 1)"
        >
          Previous
        </button>

        <span class="text-sm text-white/40">
          Page {{ currentPage }} of {{ lastPage }}
        </span>

        <button
            type="button"
            :disabled="
              currentPage === lastPage ||
              actionLoading !== null
            "
            class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
            @click="goToPage(currentPage + 1)"
        >
          Next
        </button>

      </div>

    </div>

  </section>
</template>