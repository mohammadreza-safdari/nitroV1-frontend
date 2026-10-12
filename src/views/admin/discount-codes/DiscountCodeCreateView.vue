<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api.js'

const router = useRouter()

const form = ref({
  code: '',
  type: 'percentage',
  value: '',
  max_uses: '',
  starts_at: '',
  expires_at: '',
  is_active: true,
})

const loading = ref(false)
const error = ref(null)
const validationErrors = ref({})

const submit = async () => {
  loading.value = true
  error.value = null
  validationErrors.value = {}

  try {
    await api.post('/admin/discount-codes', {
      code: form.value.code.trim(),
      type: form.value.type,
      value: Number(form.value.value),
      max_uses: form.value.max_uses === ''
          ? null
          : Number(form.value.max_uses),
      starts_at: form.value.starts_at || null,
      expires_at: form.value.expires_at || null,
      is_active: form.value.is_active,
    })

    await router.push({ name: 'admin-discount-codes' })
  } catch (err) {
    validationErrors.value = err.response?.data?.errors || {}
    error.value =
        err.response?.data?.message ||
        'Failed to create discount code.'
  } finally {
    loading.value = false
  }
}

const fieldError = (field) => {
  return validationErrors.value[field]?.[0] || ''
}
</script>

<template>
  <div class="min-h-screen bg-zinc-950 px-6 py-10 text-white">
    <div class="mx-auto max-w-3xl space-y-8">
      <div>
        <button
            type="button"
            class="text-sm text-zinc-400 hover:text-white"
            @click="router.push({ name: 'admin-discount-codes' })"
        >
          ← Back to Discount Codes
        </button>

        <p class="mt-6 text-sm uppercase tracking-[0.25em] text-zinc-500">
          Nitro Admin
        </p>
        <h1 class="mt-2 text-3xl font-bold">Create Discount Code</h1>
        <p class="mt-2 text-zinc-400">
          Configure a new promotional code.
        </p>
      </div>

      <div
          v-if="error"
          class="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400"
      >
        {{ error }}
      </div>

      <form
          class="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8"
          @submit.prevent="submit"
      >
        <div>
          <label for="code" class="mb-2 block text-sm text-zinc-300">
            Discount Code
          </label>
          <input
              id="code"
              v-model="form.code"
              type="text"
              maxlength="50"
              required
              autocomplete="off"
              placeholder="e.g. NITRO10"
              class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 uppercase outline-none focus:border-zinc-500"
          >
          <p v-if="fieldError('code')" class="mt-2 text-sm text-red-400">
            {{ fieldError('code') }}
          </p>
        </div>

        <div class="grid sm:grid-cols-2 gap-5">
          <div>
            <label for="type" class="mb-2 block text-sm text-zinc-300">
              Discount Type
            </label>
            <select
                id="type"
                v-model="form.type"
                required
                class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount (USD)</option>
            </select>
            <p v-if="fieldError('type')" class="mt-2 text-sm text-red-400">
              {{ fieldError('type') }}
            </p>
          </div>

          <div>
            <label for="value" class="mb-2 block text-sm text-zinc-300">
              {{ form.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount (USD)' }}
            </label>
            <input
                id="value"
                v-model="form.value"
                type="number"
                min="0"
                :max="form.type === 'percentage' ? 100 : undefined"
                step="0.01"
                required
                placeholder="0"
                class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500"
            >
            <p v-if="fieldError('value')" class="mt-2 text-sm text-red-400">
              {{ fieldError('value') }}
            </p>
            <p v-else-if="form.type === 'percentage'" class="mt-2 text-xs text-zinc-500">
              Enter a value from 0 to 100.
            </p>
          </div>
        </div>

        <div>
          <label for="max_uses" class="mb-2 block text-sm text-zinc-300">
            Maximum Uses
          </label>
          <input
              id="max_uses"
              v-model="form.max_uses"
              type="number"
              min="1"
              step="1"
              placeholder="Leave empty for unlimited usage"
              class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500"
          >
          <p v-if="fieldError('max_uses')" class="mt-2 text-sm text-red-400">
            {{ fieldError('max_uses') }}
          </p>
        </div>

        <div class="grid sm:grid-cols-2 gap-5">
          <div>
            <label for="starts_at" class="mb-2 block text-sm text-zinc-300">
              Start Date
            </label>
            <input
                id="starts_at"
                v-model="form.starts_at"
                type="datetime-local"
                class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
            >
            <p v-if="fieldError('starts_at')" class="mt-2 text-sm text-red-400">
              {{ fieldError('starts_at') }}
            </p>
          </div>

          <div>
            <label for="expires_at" class="mb-2 block text-sm text-zinc-300">
              Expiry Date
            </label>
            <input
                id="expires_at"
                v-model="form.expires_at"
                type="datetime-local"
                :min="form.starts_at || undefined"
                class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
            >
            <p v-if="fieldError('expires_at')" class="mt-2 text-sm text-red-400">
              {{ fieldError('expires_at') }}
            </p>
          </div>
        </div>

        <label class="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div>
            <p class="font-medium">Active</p>
            <p class="mt-1 text-sm text-zinc-500">
              Allow customers to use this discount code when eligible.
            </p>
          </div>
          <input
              v-model="form.is_active"
              type="checkbox"
              class="h-5 w-5 accent-white"
          >
        </label>

        <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-zinc-800 pt-6">
          <button
              type="button"
              class="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
              @click="router.push({ name: 'admin-discount-codes' })"
          >
            Cancel
          </button>

          <button
              type="submit"
              :disabled="loading"
              class="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {{ loading ? 'Creating...' : 'Create Discount Code' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>