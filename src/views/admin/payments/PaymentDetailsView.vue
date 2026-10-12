<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()

const payment = ref(null)

const loading = ref(true)
const actionLoading = ref(false)
const error = ref('')
const actionError = ref('')

async function loadPayment() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
        `/admin/payments/${route.params.payment}`
    )

    console.log('PAYMENT RESPONSE:', response.data)

    payment.value = response.data.payment
  } catch (err) {
    console.error('PAYMENT ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load payment.'
  } finally {
    loading.value = false
  }
}

async function performAction(action) {
  if (!payment.value) return

  actionLoading.value = true
  actionError.value = ''

  try {
    const response = await api.post(
        `/admin/payments/${payment.value.id}/${action}`
    )

    payment.value = response.data.payment

    await loadPayment()
  } catch (err) {
    console.error(
        `PAYMENT ${action.toUpperCase()} ERROR:`,
        err
    )

    actionError.value =
        err.response?.data?.message ||
        `Failed to ${action} payment.`
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

function canReject() {
  return payment.value?.status === 'pending'
}

function customerName() {
  return (
      payment.value?.deal?.user?.name ||
      payment.value?.deal?.user?.email ||
      'Unknown Customer'
  )
}

function vehicleName() {
  return (
      payment.value?.deal?.vehicle?.vehicle_model?.name ||
      payment.value?.deal?.vehicle?.stock_code ||
      'Unknown Vehicle'
  )
}

function brandName() {
  return (
      payment.value?.deal?.vehicle?.vehicle_model?.brand?.name ||
      'Unknown Brand'
  )
}

function isInstallmentDeal() {
  return payment.value?.deal?.payment_method === 'installment'
}

function installments() {
  return payment.value?.deal?.installments || []
}

onMounted(loadPayment)
</script>

<template>
  <section class="mx-auto max-w-5xl px-8 py-12">

    <div class="mb-8">
      <RouterLink
          v-if="payment?.deal?.id"
          :to="{
            name: 'admin-deal-payments',
            params: { deal: payment.deal.id }
          }"
          class="text-sm text-white/40 transition hover:text-white/70"
      >
        ← Back to Payments
      </RouterLink>

      <RouterLink
          v-else
          :to="{ name: 'admin-deals' }"
          class="text-sm text-white/40 transition hover:text-white/70"
      >
        ← Back to Deals
      </RouterLink>
    </div>

    <div
        v-if="loading"
        class="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-white/50"
    >
      Loading payment...
    </div>

    <div
        v-else-if="error"
        class="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <div v-else-if="payment" class="space-y-6">

      <!-- Header -->

      <div
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <div
            class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
        >

          <div>
            <p
                class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35"
            >
              Payment #{{ payment.id }}
            </p>

            <h1 class="mt-2 text-3xl font-bold tracking-tight text-white">
              {{ formatPrice(payment.amount) }}
            </h1>

            <p class="mt-2 text-sm text-white/40">
              Deal #{{ payment.deal_id }}
            </p>
          </div>

          <span
              class="w-fit rounded-full border px-4 py-2 text-sm font-medium capitalize"
              :class="statusClass(payment.status)"
          >
            {{ payment.status }}
          </span>

        </div>
      </div>

      <!-- Actions -->

      <div
          v-if="canReject()"
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <p
            class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35"
        >
          Actions
        </p>

        <div class="mt-5 flex flex-wrap gap-3">

          <button
              type="button"
              :disabled="actionLoading"
              class="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
              @click="performAction('reject')"
          >
            <span v-if="actionLoading">
              Processing...
            </span>

            <span v-else>
              Reject Payment
            </span>
          </button>

        </div>

        <p
            v-if="actionLoading"
            class="mt-4 text-sm text-white/40"
        >
          Processing action...
        </p>

        <div
            v-if="actionError"
            class="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300"
        >
          {{ actionError }}
        </div>
      </div>

      <!-- Payment Information -->

      <div
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <p
            class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35"
        >
          Payment Information
        </p>

        <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Amount
            </p>

            <p class="mt-1 text-lg font-semibold text-white">
              {{ formatPrice(payment.amount) }}
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Method
            </p>

            <p class="mt-1 text-sm text-white/80">
              {{ paymentMethodLabel(payment.method) }}
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Status
            </p>

            <p class="mt-1 text-sm capitalize text-white/80">
              {{ payment.status }}
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Transaction Reference
            </p>

            <p class="mt-1 text-sm text-white/80">
              {{ payment.transaction_reference || '—' }}
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Paid At
            </p>

            <p class="mt-1 text-sm text-white/80">
              {{ formatDate(payment.paid_at) }}
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Created
            </p>

            <p class="mt-1 text-sm text-white/80">
              {{ formatDate(payment.created_at) }}
            </p>
          </div>

        </div>
      </div>

      <!-- Customer -->

      <div
          v-if="payment.deal?.user"
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <p
            class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35"
        >
          Customer
        </p>

        <h2 class="mt-2 text-xl font-semibold text-white">
          {{ customerName() }}
        </h2>

        <div class="mt-5 grid gap-5 sm:grid-cols-2">

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Name
            </p>

            <p class="mt-1 text-sm text-white/80">
              {{ payment.deal.user.name || '—' }}
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Email
            </p>

            <p class="mt-1 text-sm text-white/80">
              {{ payment.deal.user.email || '—' }}
            </p>
          </div>

        </div>
      </div>

      <!-- Deal -->

      <div
          v-if="payment.deal"
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <div class="flex items-center justify-between gap-4">

          <div>
            <p
                class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35"
            >
              Related Deal
            </p>

            <h2 class="mt-2 text-xl font-semibold text-white">
              {{ brandName() }} {{ vehicleName() }}
            </h2>

            <p class="mt-2 text-sm text-white/40">
              Deal #{{ payment.deal.id }}
            </p>
          </div>

          <RouterLink
              :to="{
                name: 'admin-deal-detail',
                params: { deal: payment.deal.id }
              }"
              class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white"
          >
            View Deal
          </RouterLink>

        </div>

        <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Deal Status
            </p>

            <p class="mt-1 text-sm capitalize text-white/80">
              {{ payment.deal.status || '—' }}
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Deal Type
            </p>

            <p class="mt-1 text-sm capitalize text-white/80">
              {{ payment.deal.type || '—' }}
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wider text-white/30">
              Payment Method
            </p>

            <p class="mt-1 text-sm text-white/80">
              {{ paymentMethodLabel(payment.deal.payment_method) }}
            </p>
          </div>

        </div>
      </div>

      <!-- Installment Schedule -->

      <div
          v-if="isInstallmentDeal()"
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <div class="flex items-center justify-between gap-4">

          <div>
            <p
                class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35"
            >
              Installments
            </p>

            <h2 class="mt-2 text-xl font-semibold text-white">
              Installment Schedule
            </h2>

            <p class="mt-2 text-sm text-white/40">
              Payment schedule for this deal.
            </p>
          </div>

          <span
              class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/50"
          >
            {{ installments().length }} installments
          </span>

        </div>

        <div
            v-if="!installments().length"
            class="mt-6 rounded-xl border border-white/10 bg-black/10 p-5 text-sm text-white/35"
        >
          No installments found for this deal.
        </div>

        <div
            v-else
            class="mt-6 space-y-3"
        >

          <div
              v-for="(installment, index) in installments()"
              :key="installment.id"
              class="rounded-xl border border-white/10 bg-black/10 p-4"
          >

            <div
                class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >

              <div>

                <div class="flex items-center gap-3">

                  <p class="text-sm font-semibold text-white">
                    Installment #{{ index + 1 }}
                  </p>

                  <span
                      class="rounded-full border px-3 py-1 text-xs font-medium capitalize"
                      :class="statusClass(installment.status)"
                  >
                    {{ installment.status || 'pending' }}
                  </span>

                </div>

                <p class="mt-2 text-sm font-semibold text-white">
                  {{ formatPrice(installment.amount) }}
                </p>

                <p
                    v-if="installment.due_date"
                    class="mt-1 text-xs text-white/35"
                >
                  Due: {{ formatDate(installment.due_date) }}
                </p>

              </div>

              <div class="text-right">

                <p class="text-xs uppercase tracking-wider text-white/30">
                  Installment ID
                </p>

                <p class="mt-1 text-sm text-white/70">
                  #{{ installment.id }}
                </p>

              </div>

            </div>

          </div>

        </div>
      </div>

    </div>

  </section>
</template>
<script setup lang="ts">
</script>