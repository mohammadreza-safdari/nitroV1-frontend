<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const vehicleModel = ref(null)
const loading = ref(true)
const error = ref('')

async function loadVehicleModel() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
        `/admin/vehicle-models/${route.params.vehicleModel}`
    )

    console.log('VEHICLE MODEL RESPONSE:', response.data)

    vehicleModel.value = response.data.vehicle_model
  } catch (err) {
    console.error('VEHICLE MODEL ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load vehicle model.'
  } finally {
    loading.value = false
  }
}

async function removeVehicleModel() {
  const confirmed = window.confirm(
      `Delete "${vehicleModel.value.name}"?`
  )

  if (!confirmed) {
    return
  }

  error.value = ''

  try {
    await api.delete(
        `/admin/vehicle-models/${vehicleModel.value.id}`
    )

    router.push({
      name: 'admin-vehicle-models',
    })
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to delete vehicle model.'
  }
}

onMounted(loadVehicleModel)
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-12">

    <!-- Loading -->
    <div
        v-if="loading"
        class="text-sm text-white/35"
    >
      Loading vehicle model...
    </div>

    <!-- Error -->
    <div
        v-else-if="error"
        class="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <!-- Details -->
    <template v-else-if="vehicleModel">

      <!-- Header -->
      <div
          class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >

        <div>
          <p
              class="text-xs uppercase tracking-[0.3em] text-white/30"
          >
            Catalog / Vehicle Model
          </p>

          <h1
              class="mt-3 text-4xl font-black tracking-[-0.04em]"
          >
            {{ vehicleModel.name }}
          </h1>

          <p class="mt-3 text-sm text-white/30">
            {{ vehicleModel.slug }}
          </p>
        </div>

        <div class="flex items-center gap-2">

          <RouterLink
              :to="{ name: 'admin-vehicle-models' }"
              class="rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white"
          >
            Back
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
              @click="removeVehicleModel"
              class="rounded-lg px-3 py-2 text-xs text-red-300/60 transition hover:bg-red-400/10 hover:text-red-300"
          >
            Delete
          </button>

        </div>

      </div>

      <!-- Basic Info -->
      <div class="mt-10 grid gap-4 sm:grid-cols-3">

        <div
            class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
            Brand
          </p>

          <p class="mt-3 text-sm font-medium text-white/80">
            {{ vehicleModel.brand?.name || '—' }}
          </p>
        </div>

        <div
            class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
            Category
          </p>

          <p class="mt-3 text-sm font-medium text-white/80">
            {{ vehicleModel.category?.name || '—' }}
          </p>
        </div>

        <div
            class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
            Model ID
          </p>

          <p class="mt-3 text-sm font-medium text-white/80">
            #{{ vehicleModel.id }}
          </p>
        </div>

      </div>

      <!-- Description -->
      <div
          class="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >

        <p
            class="text-[10px] uppercase tracking-[0.25em] text-white/25"
        >
          Description
        </p>

        <p
            class="mt-4 whitespace-pre-line text-sm leading-7 text-white/50"
        >
          {{ vehicleModel.description || 'No description provided.' }}
        </p>

      </div>

      <!-- Vehicles -->
      <div
          class="mt-4 overflow-hidden rounded-2xl border border-white/10"
      >

        <div class="border-b border-white/10 px-6 py-4">
          <p
              class="text-[10px] uppercase tracking-[0.25em] text-white/25"
          >
            {{ vehicleModel.vehicles?.length || 0 }} Vehicles
          </p>
        </div>

        <div
            v-if="!vehicleModel.vehicles?.length"
            class="px-6 py-12 text-center"
        >
          <p class="text-sm text-white/40">
            No vehicles are connected to this model yet.
          </p>
        </div>

        <div
            v-else
            class="divide-y divide-white/10"
        >

          <div
              v-for="vehicle in vehicleModel.vehicles"
              :key="vehicle.id"
              class="flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-white/[0.03]"
          >

            <div>
              <p class="text-sm font-medium text-white/80">
                {{ vehicle.stock_code }}
              </p>

              <p class="mt-1 text-xs text-white/30">
                {{ vehicle.year }} ·
                {{ vehicle.color }} ·
                {{ vehicle.condition }}
              </p>
            </div>

            <div class="flex items-center gap-6">

              <p class="text-sm text-white/60">
                ${{ Number(vehicle.price).toLocaleString() }}
              </p>

              <span
                  class="rounded-lg bg-white/5 px-3 py-2 text-xs text-white/40"
              >
                {{ vehicle.status }}
              </span>

            </div>

          </div>

        </div>

      </div>

    </template>

  </section>
</template>