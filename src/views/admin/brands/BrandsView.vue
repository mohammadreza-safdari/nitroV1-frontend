<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'

const brands = ref([])
const loading = ref(true)
const error = ref('')

async function loadBrands() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/admin/brands')

    console.log('BRANDS RESPONSE:', response.data)

    brands.value = response.data.brands

    console.log('BRANDS:', brands.value)
  } catch (err) {
    console.error('BRANDS ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load brands.'
  } finally {
    loading.value = false
  }
}

async function removeBrand(brand) {
  const confirmed = window.confirm(
      `Delete "${brand.name}"?`
  )

  if (!confirmed) {
    return
  }

  error.value = ''

  try {
    await api.delete(`/admin/brands/${brand.id}`)

    await loadBrands()
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to delete brand.'
  }
}

onMounted(loadBrands)
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-12">

    <!-- Header -->
    <div
        class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
    >

      <div>
        <p
            class="text-xs uppercase tracking-[0.3em] text-white/30"
        >
          Catalog
        </p>

        <h1
            class="mt-3 text-4xl font-black tracking-[-0.04em]"
        >
          Brands
        </h1>

        <p class="mt-3 text-sm text-white/40">
          Manage vehicle manufacturers available in Nitro.
        </p>
      </div>

      <RouterLink
          :to="{ name: 'admin-brands-create' }"
          class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
      >
        Add Brand
      </RouterLink>

    </div>

    <!-- Error -->
    <div
        v-if="error"
        class="mt-8 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <!-- Loading -->
    <div
        v-if="loading"
        class="mt-10 text-sm text-white/35"
    >
      Loading brands...
    </div>

    <!-- Empty -->
    <div
        v-else-if="brands.length === 0"
        class="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center"
    >
      <p class="text-sm text-white/40">
        No brands have been added yet.
      </p>

      <RouterLink
          :to="{ name: 'admin-brands-create' }"
          class="mt-5 inline-block text-sm text-white/70 transition hover:text-white"
      >
        Add your first brand →
      </RouterLink>
    </div>

    <!-- Brands -->
    <div
        v-else
        class="mt-10 overflow-hidden rounded-2xl border border-white/10"
    >

      <!-- Count -->
      <div class="border-b border-white/10 px-6 py-4">
        <p
            class="text-[10px] uppercase tracking-[0.25em] text-white/25"
        >
          {{ brands.length }} Brands
        </p>
      </div>

      <!-- Rows -->
      <div class="divide-y divide-white/10">

        <div
            v-for="brand in brands"
            :key="brand.id"
            class="flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-white/[0.03]"
        >

          <!-- Brand -->
          <RouterLink
              :to="{
                            name: 'admin-brands-show',
                            params: {
                                brand: brand.id,
                            },
                        }"
              class="min-w-0"
          >

            <h2
                class="text-sm font-medium text-white/80 transition hover:text-white"
            >
              {{ brand.name }}
            </h2>

            <p class="mt-1 text-xs text-white/30">
              Brand #{{ brand.id }}
            </p>

          </RouterLink>

          <!-- Actions -->
          <div class="flex items-center gap-2">

            <RouterLink
                :to="{
                                name: 'admin-brands-show',
                                params: {
                                    brand: brand.id,
                                },
                            }"
                class="rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white"
            >
              View
            </RouterLink>

            <RouterLink
                :to="{
                                name: 'admin-brands-edit',
                                params: {
                                    brand: brand.id,
                                },
                            }"
                class="rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white"
            >
              Edit
            </RouterLink>

            <button
                type="button"
                @click="removeBrand(brand)"
                class="rounded-lg px-3 py-2 text-xs text-red-300/60 transition hover:bg-red-400/10 hover:text-red-300"
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    </div>

  </section>
</template>