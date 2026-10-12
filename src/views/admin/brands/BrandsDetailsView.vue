<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()

const brand = ref(null)
const loading = ref(true)
const error = ref('')

async function loadBrand() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
        `/admin/brands/${route.params.brand}`
    )

    brand.value = response.data.brand
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to load brand.'
  } finally {
    loading.value = false
  }
}

onMounted(loadBrand)
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-12">

    <!-- Loading -->
    <div
        v-if="loading"
        class="text-sm text-white/35"
    >
      Loading brand...
    </div>

    <!-- Error -->
    <div
        v-else-if="error"
        class="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <!-- Brand -->
    <template v-else-if="brand">

      <!-- Header -->
      <div
          class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >

        <div>

          <p
              class="text-xs uppercase tracking-[0.3em] text-white/30"
          >
            Catalog / Brands
          </p>

          <h1
              class="mt-3 text-4xl font-black tracking-[-0.04em]"
          >
            {{ brand.name }}
          </h1>

          <p class="mt-3 text-sm text-white/40">
            Brand #{{ brand.id }}
          </p>

        </div>

        <div class="flex items-center gap-3">

          <RouterLink
              :to="{ name: 'admin-brands' }"
              class="rounded-xl px-4 py-3 text-sm text-white/45 transition hover:bg-white/5 hover:text-white"
          >
            Back
          </RouterLink>

          <RouterLink
              :to="{
                            name: 'admin-brands-edit',
                            params: {
                                brand: brand.id,
                            },
                        }"
              class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Edit Brand
          </RouterLink>

        </div>

      </div>

      <!-- Overview -->
      <div class="mt-10 grid gap-4 sm:grid-cols-2">

        <div
            class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <p
              class="text-[10px] uppercase tracking-[0.25em] text-white/25"
          >
            Brand ID
          </p>

          <p class="mt-3 text-2xl font-semibold">
            #{{ brand.id }}
          </p>
        </div>

        <div
            class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <p
              class="text-[10px] uppercase tracking-[0.25em] text-white/25"
          >
            Vehicle Models
          </p>

          <p class="mt-3 text-2xl font-semibold">
            {{ brand.vehicle_models?.length || 0 }}
          </p>
        </div>

      </div>

      <!-- Vehicle Models -->
      <div class="mt-10">

        <div class="mb-5">

          <p
              class="text-[10px] uppercase tracking-[0.25em] text-white/25"
          >
            Vehicle Models
          </p>

          <div class="mt-3 h-px bg-white/10" />

        </div>

        <!-- Empty -->
        <div
            v-if="!brand.vehicle_models?.length"
            class="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center"
        >
          <p class="text-sm text-white/40">
            No vehicle models are associated with this brand yet.
          </p>
        </div>

        <!-- Models -->
        <div
            v-else
            class="overflow-hidden rounded-2xl border border-white/10"
        >

          <div class="divide-y divide-white/10">

            <div
                v-for="model in brand.vehicle_models"
                :key="model.id"
                class="flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-white/[0.03]"
            >

              <div>

                <h2
                    class="text-sm font-medium text-white/80"
                >
                  {{ model.name }}
                </h2>

                <p class="mt-1 text-xs text-white/30">
                  Model #{{ model.id }}
                </p>

              </div>

              <span class="text-xs text-white/25">
                                Vehicle Model
                            </span>

            </div>

          </div>

        </div>

      </div>

    </template>

  </section>
</template>