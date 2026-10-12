<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api, { imageUrl } from '@/services/api.js'

const router = useRouter()

const preOrders = ref([])
const selectedPreOrderId = ref(null)

const loading = ref(false)
const reviewing = ref(false)
const error = ref('')
const success = ref('')

const search = ref('')
const statusFilter = ref('')
const adminNote = ref('')

const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Fulfilled', value: 'fulfilled' },
]

const selectedPreOrder = computed(() =>
    preOrders.value.find(
        (preOrder) => preOrder.id === selectedPreOrderId.value,
    ) ?? null,
)

const canReview = computed(
    () => selectedPreOrder.value?.status === 'pending' && !reviewing.value,
)

let searchTimeout

watch([search, statusFilter], () => {
  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadPreOrders()
  }, 300)
})

watch(currentPage, () => {
  loadPreOrders()
})

onMounted(() => {
  loadPreOrders()
})

async function loadPreOrders() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/admin/pre-orders', {
      params: {
        search: search.value.trim() || undefined,
        status: statusFilter.value || undefined,
        page: currentPage.value,
      },
    })

    const paginator = response.data.pre_orders

    preOrders.value = paginator.data ?? []
    currentPage.value = paginator.current_page ?? 1
    lastPage.value = paginator.last_page ?? 1
    total.value = paginator.total ?? preOrders.value.length

    if (
        selectedPreOrderId.value &&
        !preOrders.value.some(
            (preOrder) => preOrder.id === selectedPreOrderId.value,
        )
    ) {
      selectedPreOrderId.value = null
      adminNote.value = ''
    }
  } catch (err) {
    error.value =
        err.response?.data?.message ?? 'Failed to load pre-orders.'
  } finally {
    loading.value = false
  }
}

function selectPreOrder(preOrder) {
  selectedPreOrderId.value = preOrder.id
  adminNote.value = preOrder.admin_note ?? ''
  error.value = ''
  success.value = ''
}

async function reviewPreOrder(action) {
  if (!selectedPreOrder.value || !canReview.value) {
    return
  }

  const actionLabel = action === 'approve' ? 'approve' : 'reject'

  if (
      !window.confirm(
          `Are you sure you want to ${actionLabel} pre-order #${selectedPreOrder.value.id}?`,
      )
  ) {
    return
  }

  reviewing.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await api.patch(
        `/admin/pre-orders/${selectedPreOrder.value.id}/${action}`,
        {
          admin_note: adminNote.value.trim() || null,
        },
    )

    const updatedPreOrder = response.data.pre_order

    preOrders.value = preOrders.value.map((preOrder) =>
        preOrder.id === updatedPreOrder.id
            ? { ...preOrder, ...updatedPreOrder }
            : preOrder,
    )

    adminNote.value = updatedPreOrder.admin_note ?? ''

    success.value =
        response.data.message ??
        `Pre-order ${actionLabel}d successfully.`
  } catch (err) {
    error.value =
        err.response?.data?.message ??
        err.response?.data?.errors?.pre_order?.[0] ??
        `Failed to ${actionLabel} pre-order.`
  } finally {
    reviewing.value = false
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

function formatDate(value) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function statusClass(status) {
  const classes = {
    pending: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    approved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    rejected: 'border-red-400/20 bg-red-400/10 text-red-300',
    cancelled: 'border-white/10 bg-white/5 text-white/40',
    fulfilled: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  }

  return classes[status] ?? classes.cancelled
}

function vehicleName(preOrder) {
  const vehicle = preOrder.vehicle
  const model = vehicle?.vehicle_model
  const brand = model?.brand?.name
  const modelName = model?.name

  return [brand, modelName, vehicle?.year].filter(Boolean).join(' ') ||
      `Vehicle #${vehicle?.id ?? '—'}`
}

function vehicleImage(preOrder) {
  const vehicle = preOrder.vehicle
  const primaryImage = vehicle?.images?.find((image) => image.is_primary)
  const firstImage = primaryImage ?? vehicle?.images?.[0]

  return firstImage?.path ? imageUrl(firstImage.path) : null
}

function customerName(preOrder) {
  return preOrder.user?.name ?? 'Unknown customer'
}

function goToPage(page) {
  if (page < 1 || page > lastPage.value || page === currentPage.value) {
    return
  }

  currentPage.value = page
}
</script>

<template>
  <section class="mx-auto max-w-[1600px] px-5 py-10 text-white sm:px-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p class="text-[10px] font-medium uppercase tracking-[0.3em] text-white/30">
          Administration / Sales
        </p>

        <h1 class="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Pre-orders
        </h1>

        <p class="mt-3 text-sm text-white/40">
          Review and manage customer pre-order requests.
        </p>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">
        <p class="text-[10px] uppercase tracking-[0.2em] text-white/35">
          Total Requests
        </p>
        <p class="mt-1 text-2xl font-bold tabular-nums">
          {{ total }}
        </p>
      </div>
    </div>

    <!-- Notifications -->
    <div
        v-if="error"
        class="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <div
        v-if="success"
        class="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
    >
      {{ success }}
    </div>

    <!-- Filters -->
    <div class="mb-6 grid gap-3 md:grid-cols-[1fr_220px_auto]">
      <input
          v-model="search"
          type="search"
          placeholder="Search customer, email or stock code..."
          class="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-white/25"
      />

      <select
          v-model="statusFilter"
          class="rounded-xl border border-white/10 bg-[#111216] px-4 py-3 text-sm text-white/75 outline-none focus:border-white/25"
      >
        <option
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <button
          type="button"
          :disabled="loading"
          @click="loadPreOrders"
          class="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:bg-white/5 disabled:opacity-40"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Main Layout -->
    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <!-- Pre-order Table -->
      <div class="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div class="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 class="text-sm font-semibold text-white/80">
            Customer Requests
          </h2>

          <span class="text-xs text-white/30">
            {{ preOrders.length }} shown
          </span>
        </div>

        <div v-if="loading" class="px-5 py-16 text-center text-sm text-white/35">
          Loading pre-orders...
        </div>

        <div
            v-else-if="preOrders.length === 0"
            class="px-5 py-16 text-center"
        >
          <p class="text-sm text-white/50">No pre-orders found.</p>
          <p class="mt-2 text-xs text-white/25">
            Try changing the search or status filter.
          </p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[760px] text-left">
            <thead>
            <tr class="border-b border-white/10 text-[10px] uppercase tracking-[0.16em] text-white/30">
              <th class="px-5 py-4 font-medium">Request</th>
              <th class="px-5 py-4 font-medium">Customer</th>
              <th class="px-5 py-4 font-medium">Vehicle</th>
              <th class="px-5 py-4 font-medium">Deposit</th>
              <th class="px-5 py-4 font-medium">Status</th>
            </tr>
            </thead>

            <tbody>
            <tr
                v-for="preOrder in preOrders"
                :key="preOrder.id"
                @click="selectPreOrder(preOrder)"
                :class="[
                  'cursor-pointer border-b border-white/[0.06] transition last:border-0 hover:bg-white/[0.04]',
                  selectedPreOrderId === preOrder.id
                    ? 'bg-white/[0.06]'
                    : '',
                ]"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                    <span
                        :class="[
                        'h-4 w-4 shrink-0 rounded-full border',
                        selectedPreOrderId === preOrder.id
                          ? 'border-white bg-white shadow-[inset_0_0_0_4px_#17181c]'
                          : 'border-white/20',
                      ]"
                    />
                  <div>
                    <p class="text-sm font-semibold">
                      #{{ preOrder.id }}
                    </p>
                    <p class="mt-1 text-xs text-white/30">
                      {{ formatDate(preOrder.created_at) }}
                    </p>
                  </div>
                </div>
              </td>

              <td class="px-5 py-4">
                <p class="text-sm text-white/75">
                  {{ customerName(preOrder) }}
                </p>
                <p class="mt-1 text-xs text-white/30">
                  {{ preOrder.user?.email ?? '—' }}
                </p>
              </td>

              <td class="px-5 py-4">
                <p class="text-sm text-white/75">
                  {{ vehicleName(preOrder) }}
                </p>
                <p class="mt-1 text-xs text-white/30">
                  {{ preOrder.vehicle?.stock_code ?? 'No stock code' }}
                </p>
              </td>

              <td class="px-5 py-4 text-sm font-semibold tabular-nums">
                {{ formatMoney(preOrder.deposit) }}
              </td>

              <td class="px-5 py-4">
                  <span
                      :class="[
                      'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize',
                      statusClass(preOrder.status),
                    ]"
                  >
                    {{ preOrder.status }}
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex flex-col justify-between gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center">
          <p class="text-xs text-white/30">
            Page {{ currentPage }} of {{ lastPage }}
          </p>

          <div class="flex gap-2">
            <button
                type="button"
                :disabled="currentPage <= 1 || loading"
                @click="goToPage(currentPage - 1)"
                class="rounded-lg border border-white/10 px-4 py-2 text-xs text-white/60 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-25"
            >
              Previous
            </button>

            <button
                type="button"
                :disabled="currentPage >= lastPage || loading"
                @click="goToPage(currentPage + 1)"
                class="rounded-lg border border-white/10 px-4 py-2 text-xs text-white/60 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-25"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Selected Pre-order -->
      <aside class="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02]">
        <div class="border-b border-white/10 px-5 py-4">
          <p class="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Review Request
          </p>

          <h2 class="mt-2 text-lg font-bold">
            {{ selectedPreOrder ? `Pre-order #${selectedPreOrder.id}` : 'Select a request' }}
          </h2>
        </div>

        <div
            v-if="!selectedPreOrder"
            class="px-6 py-14 text-center"
        >
          <p class="text-sm text-white/40">
            Select a pre-order from the list to review its details.
          </p>
        </div>

        <div v-else class="space-y-5 p-5">
          <!-- Vehicle -->
          <div>
            <div
                v-if="vehicleImage(selectedPreOrder)"
                class="mb-4 aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
            >
              <img
                  :src="vehicleImage(selectedPreOrder)"
                  :alt="vehicleName(selectedPreOrder)"
                  class="h-full w-full object-cover"
              />
            </div>

            <p class="text-[10px] uppercase tracking-[0.16em] text-white/30">
              Vehicle
            </p>

            <h3 class="mt-2 font-semibold text-white/85">
              {{ vehicleName(selectedPreOrder) }}
            </h3>

            <p class="mt-1 text-xs text-white/35">
              Stock code: {{ selectedPreOrder.vehicle?.stock_code ?? '—' }}
            </p>
          </div>

          <div class="border-t border-white/10" />

          <!-- Customer -->
          <div>
            <p class="text-[10px] uppercase tracking-[0.16em] text-white/30">
              Customer
            </p>

            <p class="mt-2 text-sm font-medium text-white/80">
              {{ customerName(selectedPreOrder) }}
            </p>

            <p class="mt-1 break-all text-xs text-white/40">
              {{ selectedPreOrder.user?.email ?? '—' }}
            </p>
          </div>

          <!-- Deposit -->
          <div class="rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <p class="text-[10px] uppercase tracking-[0.16em] text-white/35">
              Requested Deposit
            </p>

            <p class="mt-2 text-2xl font-bold tabular-nums">
              {{ formatMoney(selectedPreOrder.deposit) }}
            </p>
          </div>

          <!-- Address -->
          <div>
            <p class="text-[10px] uppercase tracking-[0.16em] text-white/30">
              Address
            </p>

            <p class="mt-2 text-sm leading-6 text-white/60">
              {{ selectedPreOrder.address?.address ?? 'No address provided' }}
            </p>
          </div>

          <!-- User Note -->
          <div v-if="selectedPreOrder.user_note">
            <p class="text-[10px] uppercase tracking-[0.16em] text-white/30">
              Customer Note
            </p>

            <p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/55">
              {{ selectedPreOrder.user_note }}
            </p>
          </div>

          <!-- Admin Note -->
          <div>
            <label
                for="admin-note"
                class="text-[10px] uppercase tracking-[0.16em] text-white/35"
            >
              Admin Note
            </label>

            <textarea
                id="admin-note"
                v-model="adminNote"
                rows="4"
                maxlength="5000"
                :disabled="!canReview"
                placeholder="Add a note about your decision..."
                class="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-white/20 focus:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <!-- Actions -->
          <div
              v-if="selectedPreOrder.status === 'pending'"
              class="grid grid-cols-2 gap-3"
          >
            <button
                type="button"
                :disabled="!canReview"
                @click="reviewPreOrder('approve')"
                class="rounded-xl bg-emerald-400 px-3 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {{ reviewing ? 'Processing...' : 'Approve' }}
            </button>

            <button
                type="button"
                :disabled="!canReview"
                @click="reviewPreOrder('reject')"
                class="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {{ reviewing ? 'Processing...' : 'Reject' }}
            </button>
          </div>

          <div
              v-else
              class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <p class="text-xs leading-5 text-white/45">
              This request has already been reviewed or is no longer pending.
              Approve and Reject are unavailable.
            </p>
          </div>

          <!-- Existing Admin Note -->
          <div
              v-if="selectedPreOrder.status !== 'pending' && selectedPreOrder.admin_note"
              class="border-t border-white/10 pt-4"
          >
            <p class="text-[10px] uppercase tracking-[0.16em] text-white/30">
              Saved Admin Note
            </p>

            <p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/50">
              {{ selectedPreOrder.admin_note }}
            </p>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>