<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const vehicleModels = ref([])
const loading = ref(true)
const error = ref('')

async function loadVehicleModels() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/admin/vehicle-models')

    console.log('VEHICLE MODELS RESPONSE:', response.data)

    vehicleModels.value = response.data.vehicle_models

    console.log('VEHICLE MODELS:', vehicleModels.value)
  } catch (err) {
    console.error('VEHICLE MODELS ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load vehicle models.'
  } finally {
    loading.value = false
  }
}

async function removeVehicleModel(vehicleModel) {
  const confirmed = window.confirm(
      `Delete "${vehicleModel.name}"?`
  )

  if (!confirmed) {
    return
  }

  error.value = ''

  try {
    await api.delete(`/admin/vehicle-models/${vehicleModel.id}`)

    await loadVehicleModels()
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to delete vehicle model.'
  }
}

onMounted(loadVehicleModels)
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
          Vehicle Models
        </h1>

        <p class="mt-3 text-sm text-white/40">
          Manage vehicle models connected to brands and categories.
        </p>
      </div>

      <RouterLink
          :to="{ name: 'admin-vehicle-models-create' }"
          class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
      >
        Add Vehicle Model
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
      Loading vehicle models...
    </div>

    <!-- Empty -->
    <div
        v-else-if="vehicleModels.length === 0"
        class="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center"
    >
      <p class="text-sm text-white/40">
        No vehicle models have been added yet.
      </p>

      <RouterLink
          :to="{ name: 'admin-vehicle-models-create' }"
          class="mt-5 inline-block text-sm text-white/70 transition hover:text-white"
      >
        Add your first vehicle model →
      </RouterLink>
    </div>

    <!-- Vehicle Models -->
    <div
        v-else
        class="mt-10 overflow-hidden rounded-2xl border border-white/10"
    >

      <!-- Count -->
      <div class="border-b border-white/10 px-6 py-4">
        <p
            class="text-[10px] uppercase tracking-[0.25em] text-white/25"
        >
          {{ vehicleModels.length }} Vehicle Models
        </p>
      </div>

      <!-- Rows -->
      <div class="divide-y divide-white/10">

        <div
            v-for="vehicleModel in vehicleModels"
            :key="vehicleModel.id"
            class="flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-white/[0.03]"
        >

          <!-- Vehicle Model -->
          <RouterLink
              :to="{
                  name: 'admin-vehicle-models-show',
                  params: {
                      vehicleModel: vehicleModel.id,
                  },
              }"
              class="min-w-0"
          >

            <h2
                class="text-sm font-medium text-white/80 transition hover:text-white"
            >
              {{ vehicleModel.name }}
            </h2>

            <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/30">
              <span>
                {{ vehicleModel.brand?.name || 'No Brand' }}
              </span>

              <span>
                {{ vehicleModel.category?.name || 'No Category' }}
              </span>

              <span>
                Model #{{ vehicleModel.id }}
              </span>
            </div>

          </RouterLink>

          <!-- Actions -->
          <div class="flex items-center gap-2">

            <RouterLink
                :to="{
                    name: 'admin-vehicle-models-show',
                    params: {
                        vehicleModel: vehicleModel.id,
                    },
                }"
                class="rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white"
            >
              View
            </RouterLink>

            <RouterLink
                :to="{
                    name: 'admin-vehicle-models-edit',
                    params: {
                        vehicleModel: vehicleModel.id,
                    },
                }"
                class="rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white"
            >
              Edit
            </RouterLink>

            <button
                type="button"
                @click="removeVehicleModel(vehicleModel)"
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