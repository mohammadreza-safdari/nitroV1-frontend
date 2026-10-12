<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const vehicle = ref(null)

const loading = ref(true)
const error = ref('')

async function loadVehicle() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
        `/admin/vehicles/${route.params.vehicle}`
    )

    console.log('VEHICLE RESPONSE:', response.data)

    vehicle.value = response.data.vehicle
  } catch (err) {
    console.error('VEHICLE DETAILS ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load vehicle.'
  } finally {
    loading.value = false
  }
}

async function removeVehicle() {
  if (!vehicle.value) {
    return
  }

  const confirmed = window.confirm(
      `Delete "${vehicle.value.vehicle_model?.name || vehicle.value.stock_code}"?`
  )

  if (!confirmed) {
    return
  }

  try {
    await api.delete(
        `/admin/vehicles/${vehicle.value.id}`
    )

    router.push({
      name: 'admin-vehicles',
    })
  } catch (err) {
    console.error('DELETE VEHICLE ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to delete vehicle.'
  }
}

function detailType() {
  if (vehicle.value?.car_detail) {
    return 'car'
  }

  if (vehicle.value?.motorcycle_detail) {
    return 'motorcycle'
  }

  const parentId =
      vehicle.value?.vehicle_model?.category?.parent_id

  if (parentId === 1) {
    return 'car'
  }

  if (parentId === 2) {
    return 'motorcycle'
  }

  return null
}

function technicalFields(detail) {
  if (!detail) {
    return []
  }

  return Object.entries(detail).filter(
      ([key]) =>
          ![
            'id',
            'vehicle_id',
            'created_at',
            'updated_at',
          ].includes(key)
  )
}

function formatLabel(key) {
  return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
}

function isObject(value) {
  return value !== null && typeof value === 'object'
}

function formatSimpleValue(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return value
}

onMounted(loadVehicle)
</script>

<template>
  <section class="mx-auto max-w-5xl px-8 py-12">

    <!-- Header -->
    <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-white/30">
          Catalog / Vehicles
        </p>

        <h1
            v-if="vehicle"
            class="mt-3 text-4xl font-black tracking-[-0.04em]"
        >
          {{ vehicle.vehicle_model?.name || 'Vehicle' }}
        </h1>

        <h1
            v-else
            class="mt-3 text-4xl font-black tracking-[-0.04em]"
        >
          Vehicle
        </h1>

        <p
            v-if="vehicle"
            class="mt-3 text-sm text-white/40"
        >
          {{ vehicle.stock_code }}
        </p>
      </div>

      <div
          v-if="vehicle"
          class="flex gap-2"
      >
        <RouterLink
            :to="{
            name: 'admin-vehicles-edit',
            params: {
              vehicle: vehicle.id,
            },
          }"
            class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Edit
        </RouterLink>

        <button
            type="button"
            @click="removeVehicle"
            class="rounded-xl border border-red-400/20 px-5 py-3 text-sm text-red-300/70 transition hover:bg-red-400/10 hover:text-red-300"
        >
          Delete
        </button>
      </div>

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
      Loading vehicle...
    </div>

    <!-- Content -->
    <div
        v-else-if="vehicle"
        class="mt-10 space-y-6"
    >

      <!-- Vehicle Information -->
      <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

        <div class="border-b border-white/10 pb-5">
          <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
            Vehicle Information
          </p>
        </div>

        <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          <div>
            <p class="text-xs text-white/30">
              Stock Code
            </p>

            <p class="mt-2 text-sm text-white/80">
              {{ vehicle.stock_code }}
            </p>
          </div>

          <div>
            <p class="text-xs text-white/30">
              Year
            </p>

            <p class="mt-2 text-sm text-white/80">
              {{ vehicle.year }}
            </p>
          </div>

          <div>
            <p class="text-xs text-white/30">
              Color
            </p>

            <p class="mt-2 text-sm text-white/80">
              {{ vehicle.color }}
            </p>
          </div>

          <div>
            <p class="text-xs text-white/30">
              Mileage
            </p>

            <p class="mt-2 text-sm text-white/80">
              {{ vehicle.mileage }}
            </p>
          </div>

          <div>
            <p class="text-xs text-white/30">
              Price
            </p>

            <p class="mt-2 text-sm text-white/80">
              {{ vehicle.price }}
            </p>
          </div>

          <div>
            <p class="text-xs text-white/30">
              Status
            </p>

            <p class="mt-2 text-sm text-white/80">
              {{ vehicle.status }}
            </p>
          </div>

          <div>
            <p class="text-xs text-white/30">
              Condition
            </p>

            <p class="mt-2 text-sm text-white/80">
              {{ vehicle.condition }}
            </p>
          </div>

          <div>
            <p class="text-xs text-white/30">
              Vehicle ID
            </p>

            <p class="mt-2 text-sm text-white/80">
              #{{ vehicle.id }}
            </p>
          </div>

        </div>

      </div>

      <!-- Model Information -->
      <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

        <div class="border-b border-white/10 pb-5">
          <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
            Model Information
          </p>
        </div>

        <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          <div>
            <p class="text-xs text-white/30">
              Model
            </p>

            <p class="mt-2 text-sm text-white/80">
              {{ vehicle.vehicle_model?.name || '—' }}
            </p>
          </div>

          <div>
            <p class="text-xs text-white/30">
              Brand
            </p>

            <p class="mt-2 text-sm text-white/80">
              {{ vehicle.vehicle_model?.brand?.name || '—' }}
            </p>
          </div>

          <div>
            <p class="text-xs text-white/30">
              Category
            </p>

            <p class="mt-2 text-sm text-white/80">
              {{ vehicle.vehicle_model?.category?.name || '—' }}
            </p>
          </div>

        </div>

      </div>

      <!-- Description -->
      <div
          v-if="vehicle.description"
          class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >

        <div class="border-b border-white/10 pb-5">
          <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
            Description
          </p>
        </div>

        <p class="mt-6 text-sm leading-7 text-white/50">
          {{ vehicle.description }}
        </p>

      </div>

      <!-- Images -->
      <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

        <div class="border-b border-white/10 pb-5">
          <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
            Images
          </p>
        </div>

        <div
            v-if="vehicle.images?.length"
            class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div
              v-for="image in vehicle.images"
              :key="image.id"
              class="overflow-hidden rounded-xl border border-white/10 bg-black/20"
          >
            <img
                :src="`http://127.0.0.1:8000/${image.path}`"
                :alt="vehicle.vehicle_model?.name || 'Vehicle'"
                class="h-48 w-full object-cover"
            />
          </div>
        </div>

        <p
            v-else
            class="mt-6 text-sm text-white/35"
        >
          No images have been added yet.
        </p>

      </div>

      <!-- Technical Details -->
      <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

        <!-- Technical Header -->
        <div class="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
              Technical Details
            </p>

            <p
                v-if="detailType() === 'car'"
                class="mt-2 text-sm text-white/50"
            >
              Vehicle-specific automotive specifications.
            </p>

            <p
                v-else-if="detailType() === 'motorcycle'"
                class="mt-2 text-sm text-white/50"
            >
              Vehicle-specific motorcycle specifications.
            </p>
          </div>

          <!-- Car Action -->
          <RouterLink
              v-if="detailType() === 'car'"
              :to="{
              name: vehicle.car_detail
                  ? 'admin-vehicles-car-detail-edit'
                  : 'admin-vehicles-car-detail-create',
              params: {
                vehicle: vehicle.id,
              },
            }"
              class="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            {{
              vehicle.car_detail
                  ? 'Edit Car Details'
                  : 'Add Car Details'
            }}
          </RouterLink>

          <!-- Motorcycle Action -->
          <RouterLink
              v-else-if="detailType() === 'motorcycle'"
              :to="{
              name: vehicle.motorcycle_detail
                  ? 'admin-vehicles-motorcycle-detail-edit'
                  : 'admin-vehicles-motorcycle-detail-create',
              params: {
                vehicle: vehicle.id,
              },
            }"
              class="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            {{
              vehicle.motorcycle_detail
                  ? 'Edit Motorcycle Details'
                  : 'Add Motorcycle Details'
            }}
          </RouterLink>

        </div>

        <!-- Car Details -->
        <div
            v-if="detailType() === 'car'"
            class="mt-6"
        >

          <template v-if="vehicle.car_detail">

            <div class="grid gap-4 sm:grid-cols-2">

              <template
                  v-for="[key, value] in technicalFields(vehicle.car_detail)"
                  :key="key"
              >

                <!-- Normal Field -->
                <div
                    v-if="!isObject(value)"
                    class="rounded-xl border border-white/5 bg-white/[0.015] p-4"
                >
                  <p class="text-xs text-white/30">
                    {{ formatLabel(key) }}
                  </p>

                  <p class="mt-2 text-sm text-white/70">
                    {{ formatSimpleValue(value) }}
                  </p>
                </div>

                <!-- Object / JSON Field -->
                <div
                    v-else
                    class="sm:col-span-2 rounded-xl border border-white/5 bg-white/[0.015] p-4"
                >
                  <p class="text-xs text-white/30">
                    {{ formatLabel(key) }}
                  </p>

                  <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <div
                        v-for="[subKey, subValue] in Object.entries(value)"
                        :key="subKey"
                    >
                      <p class="text-xs text-white/25">
                        {{ formatLabel(subKey) }}
                      </p>

                      <p class="mt-1 text-sm text-white/70">
                        {{ formatSimpleValue(subValue) }}
                      </p>
                    </div>

                  </div>
                </div>

              </template>

            </div>

          </template>

          <p
              v-else
              class="text-sm text-white/35"
          >
            No car details have been added yet.
          </p>

        </div>

        <!-- Motorcycle Details -->
        <div
            v-else-if="detailType() === 'motorcycle'"
            class="mt-6"
        >

          <template v-if="vehicle.motorcycle_detail">

            <div class="grid gap-4 sm:grid-cols-2">

              <template
                  v-for="[key, value] in technicalFields(vehicle.motorcycle_detail)"
                  :key="key"
              >

                <!-- Normal Field -->
                <div
                    v-if="!isObject(value)"
                    class="rounded-xl border border-white/5 bg-white/[0.015] p-4"
                >
                  <p class="text-xs text-white/30">
                    {{ formatLabel(key) }}
                  </p>

                  <p class="mt-2 text-sm text-white/70">
                    {{ formatSimpleValue(value) }}
                  </p>
                </div>

                <!-- Object / JSON Field -->
                <div
                    v-else
                    class="sm:col-span-2 rounded-xl border border-white/5 bg-white/[0.015] p-4"
                >
                  <p class="text-xs text-white/30">
                    {{ formatLabel(key) }}
                  </p>

                  <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <div
                        v-for="[subKey, subValue] in Object.entries(value)"
                        :key="subKey"
                    >
                      <p class="text-xs text-white/25">
                        {{ formatLabel(subKey) }}
                      </p>

                      <p class="mt-1 text-sm text-white/70">
                        {{ formatSimpleValue(subValue) }}
                      </p>
                    </div>

                  </div>
                </div>

              </template>

            </div>

          </template>

          <p
              v-else
              class="text-sm text-white/35"
          >
            No motorcycle details have been added yet.
          </p>

        </div>

        <!-- Unknown Category -->
        <p
            v-else
            class="mt-6 text-sm text-white/35"
        >
          No technical detail type is available for this vehicle category.
        </p>

      </div>

    </div>

  </section>
</template>