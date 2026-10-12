<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()

const deal = ref(null)
const loading = ref(true)
const error = ref('')
const actionError = ref('')
const actionLoading = ref('')

const statusClasses = {
  pending: 'border-yellow-400/20 bg-yellow-400/5 text-yellow-300',
  approved: 'border-green-400/20 bg-green-400/5 text-green-300',
  finalized: 'border-blue-400/20 bg-blue-400/5 text-blue-300',
  rejected: 'border-red-400/20 bg-red-400/5 text-red-300',
  cancelled: 'border-white/10 bg-white/[0.03] text-white/40',
  paid: 'border-green-400/20 bg-green-400/5 text-green-300',
  failed: 'border-red-400/20 bg-red-400/5 text-red-300',
  rejected_request: 'border-red-400/20 bg-red-400/5 text-red-300',
}

const changeRequests = computed(() => deal.value?.change_requests ?? [])

const pendingChangeRequests = computed(() =>
    changeRequests.value.filter(request => request.status === 'pending')
)

const paidAmount = computed(() =>
    (deal.value?.payments ?? [])
        .filter(payment => payment.status === 'paid')
        .reduce((total, payment) => total + Number(payment.amount || 0), 0)
)

const displayedRemainingAmount = computed(() => {
  if (deal.value?.remaining_amount !== null &&
      deal.value?.remaining_amount !== undefined) {
    return Number(deal.value.remaining_amount)
  }

  return Math.max(0, Number(deal.value?.final_amount || 0) - paidAmount.value)
})

const primaryImage = computed(() =>
    deal.value?.vehicle?.images?.find(image => image.is_primary) ??
    deal.value?.vehicle?.images?.[0] ??
    null
)

const vehicleName = computed(() =>
    deal.value?.vehicle?.vehicle_model?.name ??
    deal.value?.vehicle?.stock_code ??
    'Unknown Vehicle'
)

const brandName = computed(() =>
    deal.value?.vehicle?.vehicle_model?.brand?.name ?? 'Unknown Brand'
)

const customerName = computed(() =>
    deal.value?.user?.name ??
    deal.value?.user?.email ??
    'Unknown Customer'
)

const canApproveDeal = computed(() => deal.value?.status === 'pending')
const canRejectDeal = computed(() => deal.value?.status === 'pending')

const canCancelDeal = computed(() =>
    ['pending', 'approved'].includes(deal.value?.status)
)

const canFinalizeDeal = computed(() => deal.value?.status === 'approved')

const canReviewChangeRequests = computed(() =>
    ['pending', 'approved'].includes(deal.value?.status)
)

const payments = computed(() => deal.value?.payments ?? [])
const installments = computed(() => deal.value?.installments ?? [])
const events = computed(() => deal.value?.events ?? [])

async function loadDeal() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(`/admin/deals/${route.params.deal}`)
    deal.value = response.data.deal
  } catch (err) {
    console.error('DEAL LOAD ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load deal details.'
  } finally {
    loading.value = false
  }
}

function getErrorMessage(err, fallback) {
  const errors = err.response?.data?.errors

  if (errors && typeof errors === 'object') {
    const firstError = Object.values(errors).flat()[0]

    if (firstError) return firstError
  }

  return err.response?.data?.message || fallback
}

async function performDealAction(action) {
  if (!deal.value || actionLoading.value) return

  const confirmations = {
    approve: 'Approve this deal?',
    reject: 'Reject this deal?',
    cancel: 'Cancel this deal?',
    finalize: 'Finalize this deal?',
  }

  if (!window.confirm(confirmations[action])) return

  actionLoading.value = `deal-${action}`
  actionError.value = ''

  try {
    await api.post(`/admin/deals/${deal.value.id}/${action}`)
    await loadDeal()
  } catch (err) {
    console.error(`DEAL ${action.toUpperCase()} ERROR:`, err)
    actionError.value = getErrorMessage(err, `Failed to ${action} deal.`)
  } finally {
    actionLoading.value = ''
  }
}

async function performChangeRequestAction(request, action) {
  if (!deal.value || actionLoading.value) return
  if (request.status !== 'pending') return

  if (!window.confirm(
      action === 'approve'
          ? `Approve change request #${request.id}? The requested terms will replace the current deal terms.`
          : `Reject change request #${request.id}?`
  )) {
    return
  }

  actionLoading.value = `change-${request.id}-${action}`
  actionError.value = ''

  try {
    await api.post(
        `/admin/deal-change-requests/${request.id}/${action}`
    )

    await loadDeal()
  } catch (err) {
    console.error(`CHANGE REQUEST ${action.toUpperCase()} ERROR:`, err)
    actionError.value = getErrorMessage(
        err,
        `Failed to ${action} change request #${request.id}.`
    )
  } finally {
    actionLoading.value = ''
  }
}

function statusClass(status) {
  return statusClasses[status] ??
      'border-white/10 bg-white/[0.03] text-white/50'
}

function formatStatus(status) {
  return status ? status.replaceAll('_', ' ') : '—'
}

function formatPrice(value) {
  return `$${Number(value ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleString()
}

function paymentMethodLabel(method) {
  if (!method) return '—'

  return method.charAt(0).toUpperCase() + method.slice(1)
}

function imageUrl(path) {
  if (!path) return ''

  if (/^https?:\/\//i.test(path)) return path

  return `http://127.0.0.1:8000/${path.replace(/^\/+/, '')}`
}

onMounted(loadDeal)
</script>

<template>
  <section class="mx-auto max-w-7xl space-y-6 px-5 py-10 sm:px-8">

    <!-- Navigation -->

    <div class="flex items-center justify-between gap-4">
      <RouterLink
          :to="{ name: 'admin-deals' }"
          class="text-sm text-white/45 transition hover:text-white"
      >
        ← Back to Deals
      </RouterLink>

      <button
          type="button"
          :disabled="loading || !!actionLoading"
          class="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5 disabled:opacity-40"
          @click="loadDeal"
      >
        Refresh
      </button>
    </div>

    <!-- Loading -->

    <div
        v-if="loading"
        class="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center text-sm text-white/45"
    >
      Loading deal details...
    </div>

    <!-- Error -->

    <div
        v-else-if="error"
        class="rounded-2xl border border-red-400/20 bg-red-400/5 p-6"
    >
      <p class="text-sm text-red-300">{{ error }}</p>

      <button
          type="button"
          class="mt-4 text-sm text-white/70 underline"
          @click="loadDeal"
      >
        Try again
      </button>
    </div>

    <template v-else-if="deal">

      <!-- Header -->

      <header
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8"
      >
        <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
              Nitro / Deal Management
            </p>

            <h1 class="mt-3 text-3xl font-bold tracking-tight text-white">
              Deal #{{ deal.id }}
            </h1>

            <p class="mt-2 text-sm text-white/45">
              {{ brandName }} {{ vehicleName }}
            </p>

            <p class="mt-1 text-xs text-white/30">
              Created {{ formatDate(deal.created_at) }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <span
                class="rounded-full border px-4 py-2 text-sm font-medium capitalize"
                :class="statusClass(deal.status)"
            >
              {{ formatStatus(deal.status) }}
            </span>

            <span
                class="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60"
            >
              {{ paymentMethodLabel(deal.payment_method) }}
            </span>
          </div>
        </div>
      </header>

      <!-- Global Action Error -->

      <div
          v-if="actionError"
          class="flex flex-col justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4 sm:flex-row sm:items-center"
      >
        <p class="text-sm text-red-300">{{ actionError }}</p>

        <button
            type="button"
            class="shrink-0 text-sm text-white/60 underline"
            @click="actionError = ''"
        >
          Dismiss
        </button>
      </div>

      <!-- Financial Summary -->

      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p class="text-xs uppercase tracking-wider text-white/35">
            Base Amount
          </p>

          <p class="mt-3 text-2xl font-semibold text-white">
            {{ formatPrice(deal.base_amount) }}
          </p>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p class="text-xs uppercase tracking-wider text-white/35">
            Total Discount
          </p>

          <p class="mt-3 text-2xl font-semibold text-white">
            {{ formatPrice(deal.discount_amount) }}
          </p>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p class="text-xs uppercase tracking-wider text-white/35">
            Contract Total
          </p>

          <p class="mt-3 text-2xl font-semibold text-white">
            {{ formatPrice(deal.final_amount) }}
          </p>

          <p class="mt-2 text-xs text-white/35">
            {{ deal.quantity ?? 1 }} vehicle(s)
          </p>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p class="text-xs uppercase tracking-wider text-white/35">
            Remaining Balance
          </p>

          <p class="mt-3 text-2xl font-semibold text-white">
            {{ formatPrice(displayedRemainingAmount) }}
          </p>

          <p class="mt-2 text-xs text-white/35">
            Paid: {{ formatPrice(paidAmount) }}
          </p>
        </div>
      </section>

      <!-- Original Deal Actions -->

      <section class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
              Original Deal
            </p>

            <h2 class="mt-2 text-xl font-semibold text-white">
              Contract Actions
            </h2>

            <p class="mt-2 max-w-2xl text-sm leading-6 text-white/40">
              Manage the original purchase request. These actions are separate
              from reviewing customer change requests below.
            </p>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <button
              v-if="canApproveDeal"
              type="button"
              :disabled="!!actionLoading"
              class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-40"
              @click="performDealAction('approve')"
          >
            {{ actionLoading === 'deal-approve' ? 'Approving...' : 'Approve Deal' }}
          </button>

          <button
              v-if="canRejectDeal"
              type="button"
              :disabled="!!actionLoading"
              class="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-40"
              @click="performDealAction('reject')"
          >
            {{ actionLoading === 'deal-reject' ? 'Rejecting...' : 'Reject Deal' }}
          </button>

          <button
              v-if="canCancelDeal"
              type="button"
              :disabled="!!actionLoading"
              class="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/65 transition hover:bg-white/5 disabled:opacity-40"
              @click="performDealAction('cancel')"
          >
            {{ actionLoading === 'deal-cancel' ? 'Cancelling...' : 'Cancel Deal' }}
          </button>

          <button
              v-if="canFinalizeDeal"
              type="button"
              :disabled="!!actionLoading"
              class="rounded-xl bg-blue-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-blue-300 disabled:opacity-40"
              @click="performDealAction('finalize')"
          >
            {{ actionLoading === 'deal-finalize' ? 'Finalizing...' : 'Finalize Deal' }}
          </button>

          <p
              v-if="!canApproveDeal && !canRejectDeal && !canCancelDeal && !canFinalizeDeal"
              class="py-2 text-sm text-white/35"
          >
            No contract actions are available for this status.
          </p>
        </div>

        <div
            v-if="deal.status === 'approved' && displayedRemainingAmount > 0"
            class="mt-5 rounded-xl border border-yellow-400/15 bg-yellow-400/[0.04] p-4 text-sm leading-6 text-yellow-200/70"
        >
          This deal still has an outstanding balance. Confirm the payment
          requirements before finalizing the contract.
        </div>
      </section>

      <!-- Change Requests -->

      <section class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
              Customer Requests
            </p>

            <h2 class="mt-2 text-2xl font-semibold text-white">
              Deal Change Requests
            </h2>

            <p class="mt-2 text-sm leading-6 text-white/40">
              Review requested contract changes separately. Approving a request
              updates the deal terms and recalculates its remaining balance.
            </p>
          </div>

          <span class="w-fit rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50">
            {{ pendingChangeRequests.length }} pending
          </span>
        </div>

        <div
            v-if="!changeRequests.length"
            class="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center"
        >
          <p class="text-sm text-white/45">
            No change requests have been submitted for this deal.
          </p>
        </div>

        <div v-else class="mt-6 space-y-5">
          <article
              v-for="request in changeRequests"
              :key="request.id"
              class="overflow-hidden rounded-2xl border border-white/10"
          >
            <!-- Request Header -->

            <div class="flex flex-col justify-between gap-4 border-b border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:items-center">
              <div>
                <div class="flex flex-wrap items-center gap-3">
                  <h3 class="font-semibold text-white">
                    Change Request #{{ request.id }}
                  </h3>

                  <span
                      class="rounded-full border px-3 py-1 text-xs capitalize"
                      :class="statusClass(request.status)"
                  >
                    {{ formatStatus(request.status) }}
                  </span>
                </div>

                <p class="mt-2 text-xs text-white/35">
                  Submitted {{ formatDate(request.created_at) }}
                </p>

                <p
                    v-if="request.user?.name || request.user?.email"
                    class="mt-1 text-xs text-white/45"
                >
                  By {{ request.user?.name || request.user?.email }}
                </p>
              </div>

              <div
                  v-if="request.status === 'pending' && canReviewChangeRequests"
                  class="flex flex-wrap gap-2"
              >
                <button
                    type="button"
                    :disabled="!!actionLoading"
                    class="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-40"
                    @click="performChangeRequestAction(request, 'approve')"
                >
                  {{
                    actionLoading === `change-${request.id}-approve`
                        ? 'Approving...'
                        : 'Approve Changes'
                  }}
                </button>

                <button
                    type="button"
                    :disabled="!!actionLoading"
                    class="rounded-lg border border-red-400/20 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-400/5 disabled:opacity-40"
                    @click="performChangeRequestAction(request, 'reject')"
                >
                  {{
                    actionLoading === `change-${request.id}-reject`
                        ? 'Rejecting...'
                        : 'Reject'
                  }}
                </button>
              </div>

              <p
                  v-else-if="request.status === 'pending'"
                  class="text-xs text-yellow-200/60"
              >
                This deal's current status does not allow reviewing changes.
              </p>
            </div>

            <!-- Request Financial Comparison -->

            <div class="grid gap-5 p-5 lg:grid-cols-2">
              <div class="rounded-xl border border-white/10 p-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-white/35">
                  Current Contract
                </p>

                <div class="mt-4 space-y-3">
                  <div class="flex justify-between gap-4 text-sm">
                    <span class="text-white/45">Base amount</span>
                    <span class="text-white/80">
                      {{ formatPrice(deal.base_amount) }}
                    </span>
                  </div>

                  <div class="flex justify-between gap-4 text-sm">
                    <span class="text-white/45">Discount</span>
                    <span class="text-white/80">
                      {{ formatPrice(deal.discount_amount) }}
                    </span>
                  </div>

                  <div class="flex justify-between gap-4 border-t border-white/10 pt-3 text-sm">
                    <span class="text-white/60">Contract total</span>
                    <span class="font-semibold text-white">
                      {{ formatPrice(deal.final_amount) }}
                    </span>
                  </div>

                  <div class="flex justify-between gap-4 text-sm">
                    <span class="text-white/45">Payment method</span>
                    <span class="text-white/80">
                      {{ paymentMethodLabel(deal.payment_method) }}
                    </span>
                  </div>

                  <div
                      v-if="deal.payment_method === 'installment'"
                      class="flex justify-between gap-4 text-sm"
                  >
                    <span class="text-white/45">Installment months</span>
                    <span class="text-white/80">
                      {{ deal.installment_months ?? '—' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-white/10 p-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-white/35">
                  Requested Contract
                </p>

                <div class="mt-4 space-y-3">
                  <div class="flex justify-between gap-4 text-sm">
                    <span class="text-white/45">Base amount</span>
                    <span class="text-white/80">
                      {{ formatPrice(request.base_amount) }}
                    </span>
                  </div>

                  <div class="flex justify-between gap-4 text-sm">
                    <span class="text-white/45">Discount</span>
                    <span class="text-white/80">
                      {{ formatPrice(request.discount_amount) }}
                    </span>
                  </div>

                  <div class="flex justify-between gap-4 border-t border-white/10 pt-3 text-sm">
                    <span class="text-white/60">Contract total</span>
                    <span class="font-semibold text-white">
                      {{ formatPrice(request.final_amount) }}
                    </span>
                  </div>

                  <div class="flex justify-between gap-4 text-sm">
                    <span class="text-white/45">Payment method</span>
                    <span class="text-white/80">
                      {{ paymentMethodLabel(request.payment_method) }}
                    </span>
                  </div>

                  <div
                      v-if="request.payment_method === 'installment'"
                      class="flex justify-between gap-4 text-sm"
                  >
                    <span class="text-white/45">Installment months</span>
                    <span class="text-white/80">
                      {{ request.installment_months ?? '—' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Request Address, Discount and Notes -->

            <div class="grid gap-5 border-t border-white/10 p-5 sm:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-wider text-white/35">
                  Requested Address
                </p>

                <div v-if="request.address" class="mt-2 text-sm leading-6 text-white/75">
                  <p>{{ request.address.name || 'Recipient not specified' }}</p>
                  <p>{{ request.address.phone || '' }}</p>
                  <p>{{ request.address.address || request.address.street || '' }}</p>
                </div>

                <p v-else class="mt-2 text-sm text-white/35">
                  No address change requested.
                </p>
              </div>

              <div>
                <p class="text-xs uppercase tracking-wider text-white/35">
                  Requested Discount Code
                </p>

                <p class="mt-2 text-sm text-white/75">
                  {{ request.discount_code?.code || 'No discount code' }}
                </p>
              </div>

              <div class="sm:col-span-2">
                <p class="text-xs uppercase tracking-wider text-white/35">
                  Customer Note
                </p>

                <p class="mt-2 whitespace-pre-line text-sm leading-6 text-white/70">
                  {{ request.user_note || 'No note provided.' }}
                </p>
              </div>

              <div
                  v-if="request.admin_note"
                  class="sm:col-span-2"
              >
                <p class="text-xs uppercase tracking-wider text-white/35">
                  Admin Note
                </p>

                <p class="mt-2 whitespace-pre-line text-sm leading-6 text-white/70">
                  {{ request.admin_note }}
                </p>
              </div>

              <div
                  v-if="request.reviewed_at"
                  class="sm:col-span-2"
              >
                <p class="text-xs text-white/35">
                  Reviewed {{ formatDate(request.reviewed_at) }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Vehicle and Customer -->

      <section class="grid gap-6 lg:grid-cols-2">
        <article class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <img
              v-if="primaryImage"
              :src="imageUrl(primaryImage.path)"
              :alt="vehicleName"
              class="h-64 w-full object-cover"
          />

          <div
              v-else
              class="flex h-48 items-center justify-center text-sm text-white/30"
          >
            No vehicle image available
          </div>

          <div class="p-6">
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
              Vehicle
            </p>

            <h2 class="mt-2 text-xl font-semibold text-white">
              {{ brandName }} {{ vehicleName }}
            </h2>

            <div class="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-white/35">Stock code</p>
                <p class="mt-1 text-sm text-white/80">
                  {{ deal.vehicle?.stock_code || '—' }}
                </p>
              </div>

              <div>
                <p class="text-xs text-white/35">Year</p>
                <p class="mt-1 text-sm text-white/80">
                  {{ deal.vehicle?.year || '—' }}
                </p>
              </div>

              <div>
                <p class="text-xs text-white/35">Color</p>
                <p class="mt-1 text-sm text-white/80">
                  {{ deal.vehicle?.color || '—' }}
                </p>
              </div>

              <div>
                <p class="text-xs text-white/35">Catalog price</p>
                <p class="mt-1 text-sm text-white/80">
                  {{ formatPrice(deal.vehicle?.price) }}
                </p>
              </div>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
            Customer
          </p>

          <h2 class="mt-2 text-xl font-semibold text-white">
            {{ customerName }}
          </h2>

          <div class="mt-6 space-y-5">
            <div>
              <p class="text-xs text-white/35">Customer name</p>
              <p class="mt-1 text-sm text-white/80">
                {{ deal.user?.name || '—' }}
              </p>
            </div>

            <div>
              <p class="text-xs text-white/35">Email</p>
              <p class="mt-1 break-all text-sm text-white/80">
                {{ deal.user?.email || '—' }}
              </p>
            </div>

            <div>
              <p class="text-xs text-white/35">Delivery address</p>

              <div v-if="deal.address" class="mt-1 text-sm leading-6 text-white/80">
                <p>{{ deal.address.name || '' }}</p>
                <p>{{ deal.address.phone || '' }}</p>
                <p>{{ deal.address.address || deal.address.street || '—' }}</p>
              </div>

              <p v-else class="mt-1 text-sm text-white/40">
                No address associated with this deal.
              </p>
            </div>

            <div>
              <p class="text-xs text-white/35">Customer note</p>
              <p class="mt-1 whitespace-pre-line text-sm leading-6 text-white/75">
                {{ deal.user_note || 'No note provided.' }}
              </p>
            </div>

            <div>
              <p class="text-xs text-white/35">Admin note</p>
              <p class="mt-1 whitespace-pre-line text-sm leading-6 text-white/75">
                {{ deal.admin_note || 'No admin note.' }}
              </p>
            </div>
          </div>
        </article>
      </section>

      <!-- Payments -->

      <section class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
              Financial Records
            </p>

            <h2 class="mt-2 text-xl font-semibold text-white">
              Payments
            </h2>

            <p class="mt-2 text-sm text-white/40">
              {{ payments.length }} payment record(s)
            </p>
          </div>

          <RouterLink
              v-if="['approved', 'finalized'].includes(deal.status)"
              :to="{
              name: 'admin-deal-payments',
              params: { deal: deal.id }
            }"
              class="w-fit rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Manage Payments
          </RouterLink>
        </div>

        <div v-if="!payments.length" class="mt-6 text-sm text-white/35">
          No payment records.
        </div>

        <div v-else class="mt-6 overflow-x-auto">
          <table class="w-full min-w-[600px] text-left text-sm">
            <thead class="text-xs uppercase tracking-wider text-white/35">
            <tr>
              <th class="pb-3 pr-4 font-medium">Payment</th>
              <th class="pb-3 pr-4 font-medium">Amount</th>
              <th class="pb-3 pr-4 font-medium">Method</th>
              <th class="pb-3 pr-4 font-medium">Status</th>
              <th class="pb-3 font-medium">Paid at</th>
            </tr>
            </thead>

            <tbody>
            <tr
                v-for="payment in payments"
                :key="payment.id"
                class="border-t border-white/10"
            >
              <td class="py-4 pr-4 text-white/75">
                #{{ payment.id }}
              </td>

              <td class="py-4 pr-4 text-white/75">
                {{ formatPrice(payment.amount) }}
              </td>

              <td class="py-4 pr-4 capitalize text-white/55">
                {{ payment.method || '—' }}
              </td>

              <td class="py-4 pr-4">
                  <span
                      class="rounded-full border px-2.5 py-1 text-xs capitalize"
                      :class="statusClass(payment.status)"
                  >
                    {{ formatStatus(payment.status) }}
                  </span>
              </td>

              <td class="py-4 text-white/45">
                {{ formatDate(payment.paid_at) }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Installments -->

      <section
          v-if="deal.payment_method === 'installment' || installments.length"
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8"
      >
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
            Payment Schedule
          </p>

          <h2 class="mt-2 text-xl font-semibold text-white">
            Installments
          </h2>

          <p class="mt-2 text-sm text-white/40">
            {{ installments.length }} installment record(s)
          </p>
        </div>

        <div v-if="!installments.length" class="mt-6 text-sm text-white/35">
          No installment schedule has been generated.
        </div>

        <div v-else class="mt-6 overflow-x-auto">
          <table class="w-full min-w-[600px] text-left text-sm">
            <thead class="text-xs uppercase tracking-wider text-white/35">
            <tr>
              <th class="pb-3 pr-4 font-medium">#</th>
              <th class="pb-3 pr-4 font-medium">Amount</th>
              <th class="pb-3 pr-4 font-medium">Due date</th>
              <th class="pb-3 pr-4 font-medium">Status</th>
              <th class="pb-3 font-medium">Paid at</th>
            </tr>
            </thead>

            <tbody>
            <tr
                v-for="installment in installments"
                :key="installment.id"
                class="border-t border-white/10"
            >
              <td class="py-4 pr-4 text-white/75">
                {{ installment.installment_number }}
              </td>

              <td class="py-4 pr-4 text-white/75">
                {{ formatPrice(installment.amount) }}
              </td>

              <td class="py-4 pr-4 text-white/55">
                {{ installment.due_date || '—' }}
              </td>

              <td class="py-4 pr-4">
                  <span
                      class="rounded-full border px-2.5 py-1 text-xs capitalize"
                      :class="statusClass(installment.status)"
                  >
                    {{ formatStatus(installment.status) }}
                  </span>
              </td>

              <td class="py-4 text-white/45">
                {{ formatDate(installment.paid_at) }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Activity History -->

      <section class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
          Audit Trail
        </p>

        <h2 class="mt-2 text-xl font-semibold text-white">
          Activity History
        </h2>

        <div v-if="!events.length" class="mt-6 text-sm text-white/35">
          No events recorded.
        </div>

        <div v-else class="mt-6 space-y-3">
          <article
              v-for="event in events"
              :key="event.id"
              class="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center"
          >
            <div>
              <p class="text-sm font-medium capitalize text-white">
                {{ formatStatus(event.event) }}
              </p>

              <p class="mt-1 text-xs text-white/40">
                {{ event.user?.name || event.user?.email || 'System' }}
              </p>
            </div>

            <p class="text-xs text-white/35">
              {{ formatDate(event.created_at) }}
            </p>
          </article>
        </div>
      </section>

    </template>
  </section>
</template>