<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api.js'

const router = useRouter()

const discountCodes = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const deletingId = ref(null)

const filteredCodes = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) {
    return discountCodes.value
  }

  return discountCodes.value.filter(code =>
      code.code?.toLowerCase().includes(term)
  )
})

const formatDate = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

const formatValue = (code) => {
  const value = Number(code.value || 0)

  return code.type === 'percentage'
      ? `${value}%`
      : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(value)
}

const isExpired = (code) => {
  return code.expires_at && new Date(code.expires_at) < new Date()
}

const statusLabel = (code) => {
  if (!code.is_active) return 'Inactive'
  if (isExpired(code)) return 'Expired'

  return 'Active'
}

const statusClass = (code) => {
  if (!code.is_active || isExpired(code)) {
    return 'bg-red-500/10 border-red-500/20 text-red-400'
  }

  return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
}

const loadDiscountCodes = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/admin/discount-codes')

    const result = response.data.discount_codes

    discountCodes.value = Array.isArray(result)
        ? result
        : result?.data || []
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to load discount codes.'
  } finally {
    loading.value = false
  }
}

const createDiscountCode = () => {
  router.push({ name: 'admin-discount-code-create' })
}

const editDiscountCode = (id) => {
  router.push({
    name: 'admin-discount-code-edit',
    params: { discountCodeId: id },
  })
}

const deleteDiscountCode = async (code) => {
  if (!window.confirm(`Delete discount code "${code.code}"?`)) {
    return
  }

  deletingId.value = code.id
  error.value = null

  try {
    await api.delete(`/admin/discount-codes/${code.id}`)

    discountCodes.value = discountCodes.value.filter(
        item => item.id !== code.id
    )
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to delete discount code.'
  } finally {
    deletingId.value = null
  }
}

onMounted(loadDiscountCodes)
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white px-6 py-10">
    <div class="max-w-7xl mx-auto space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <p class="text-sm uppercase tracking-[0.25em] text-zinc-500">
            Nitro Admin
          </p>
          <h1 class="mt-2 text-3xl font-bold">Discount Codes</h1>
          <p class="mt-2 text-zinc-400">
            Create and manage promotional discount codes.
          </p>
        </div>

        <button
            type="button"
            class="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200 transition"
            @click="createDiscountCode"
        >
          + Create Discount Code
        </button>
      </div>

      <div
          v-if="error"
          class="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400"
      >
        {{ error }}
      </div>

      <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div class="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <input
              v-model="search"
              type="search"
              placeholder="Search discount codes..."
              class="w-full sm:max-w-sm rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500"
          >

          <div class="text-sm text-zinc-500">
            {{ filteredCodes.length }} discount codes
          </div>
        </div>

        <div v-if="loading" class="py-16 text-center text-zinc-400">
          Loading discount codes...
        </div>

        <div v-else-if="filteredCodes.length" class="mt-6 overflow-x-auto">
          <table class="w-full min-w-[850px] text-left">
            <thead>
            <tr class="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
              <th class="px-4 py-4 font-medium">Code</th>
              <th class="px-4 py-4 font-medium">Discount</th>
              <th class="px-4 py-4 font-medium">Usage Limit</th>
              <th class="px-4 py-4 font-medium">Start Date</th>
              <th class="px-4 py-4 font-medium">Expiry Date</th>
              <th class="px-4 py-4 font-medium">Status</th>
              <th class="px-4 py-4 font-medium text-right">Actions</th>
            </tr>
            </thead>

            <tbody>
            <tr
                v-for="code in filteredCodes"
                :key="code.id"
                class="border-b border-zinc-800/70 last:border-0 hover:bg-zinc-800/30"
            >
              <td class="px-4 py-5">
                  <span class="font-semibold tracking-wide">
                    {{ code.code }}
                  </span>
              </td>

              <td class="px-4 py-5">
                <span class="font-medium">{{ formatValue(code) }}</span>
                <p class="mt-1 text-xs text-zinc-500">
                  {{ code.type === 'percentage' ? 'Percentage' : 'Fixed amount' }}
                </p>
              </td>

              <td class="px-4 py-5 text-zinc-300">
                {{ code.max_uses ?? 'Unlimited' }}
              </td>

              <td class="px-4 py-5 text-sm text-zinc-400">
                {{ formatDate(code.starts_at) }}
              </td>

              <td class="px-4 py-5 text-sm text-zinc-400">
                {{ formatDate(code.expires_at) }}
              </td>

              <td class="px-4 py-5">
                  <span
                      class="inline-flex rounded-full border px-3 py-1 text-xs font-medium"
                      :class="statusClass(code)"
                  >
                    {{ statusLabel(code) }}
                  </span>
              </td>

              <td class="px-4 py-5">
                <div class="flex justify-end gap-2">
                  <button
                      type="button"
                      class="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
                      @click="editDiscountCode(code.id)"
                  >
                    Edit
                  </button>

                  <button
                      type="button"
                      :disabled="deletingId === code.id"
                      class="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      @click="deleteDiscountCode(code)"
                  >
                    {{ deletingId === code.id ? 'Deleting...' : 'Delete' }}
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="!loading" class="py-16 text-center">
          <p class="text-zinc-300 font-medium">No discount codes found.</p>
          <p class="mt-2 text-sm text-zinc-500">
            Create a discount code or try another search.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>