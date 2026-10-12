<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const vehicles = ref([])
const loading = ref(true)
const error = ref('')

async function loadVehicles() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/admin/vehicles')

    console.log('VEHICLES RESPONSE:', response.data)

    vehicles.value = response.data.vehicles.data

    console.log('VEHICLES:', vehicles.value)
  } catch (err) {
    console.error('VEHICLES ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load vehicles.'
  } finally {
    loading.value = false
  }
}

async function removeVehicle(vehicle) {
  const confirmed = window.confirm(
      `Delete "${vehicle.vehicle_model?.name || vehicle.stock_code}"?`
  )

  if (!confirmed) {
    return
  }

  error.value = ''

  try {
    await api.delete(`/admin/vehicles/${vehicle.id}`)

    await loadVehicles()
  } catch (err) {
    console.error('DELETE VEHICLE ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to delete vehicle.'
  }
}

onMounted(loadVehicles)
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-12">

    <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-white/30">
          Catalog
        </p>

        <h1 class="mt-3 text-4xl font-black tracking-[-0.04em]">
          Vehicles
        </h1>

        <p class="mt-3 text-sm text-white/40">
          Manage individual vehicles available in Nitro inventory.
        </p>
      </div>

      <RouterLink
          :to="{ name: 'admin-vehicles-create' }"
          class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
      >
        Add Vehicle
      </RouterLink>

    </div>

    <div
        v-if="error"
        class="mt-8 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <div
        v-if="loading"
        class="mt-10 text-sm text-white/35"
    >
      Loading vehicles...
    </div>

    <div
        v-else-if="vehicles.length === 0"
        class="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center"
    >
      <p class="text-sm text-white/40">
        No vehicles have been added yet.
      </p>

      <RouterLink
          :to="{ name: 'admin-vehicles-create' }"
          class="mt-5 inline-block text-sm text-white/70 transition hover:text-white"
      >
        Add your first vehicle →
      </RouterLink>
    </div>

    <div
        v-else
        class="mt-10 overflow-hidden rounded-2xl border border-white/10"
    >

      <div class="border-b border-white/10 px-6 py-4">
        <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
          {{ vehicles.length }} Vehicles
        </p>
      </div>

      <div class="divide-y divide-white/10">

        <div
            v-for="vehicle in vehicles"
            :key="vehicle.id"
            class="flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-white/[0.03]"
        >

          <RouterLink
              :to="{
                  name: 'admin-vehicles-show',
                  params: {
                      vehicle: vehicle.id,
                  },
              }"
              class="min-w-0"
          >
            <h2 class="text-sm font-medium text-white/80 transition hover:text-white">
              {{ vehicle.vehicle_model?.name || 'Unknown Model' }}
            </h2>

            <p class="mt-1 text-xs text-white/30">
              {{ vehicle.stock_code }} · {{ vehicle.year }}
            </p>
          </RouterLink>

          <div class="flex items-center gap-2">

            <span
                class="hidden rounded-lg border border-white/10 px-3 py-2 text-xs text-white/40 sm:block"
            >
              {{ vehicle.status }}
            </span>

            <RouterLink
                :to="{
                    name: 'admin-vehicles-show',
                    params: {
                        vehicle: vehicle.id,
                    },
                }"
                class="rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white"
            >
              View
            </RouterLink>

            <RouterLink
                :to="{
                    name: 'admin-vehicles-edit',
                    params: {
                        vehicle: vehicle.id,
                    },
                }"
                class="rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white"
            >
              Edit
            </RouterLink>

            <button
                type="button"
                @click="removeVehicle(vehicle)"
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