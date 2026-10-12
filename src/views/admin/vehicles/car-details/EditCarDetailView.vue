<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const vehicle = ref(null)
const carDetail = ref(null)

const loading = ref(true)
const submitting = ref(false)
const error = ref('')

const form = ref({
  engine: '',
  horsepower: '',
  torque: '',
  transmission: '',
  fuel_type: '',
  drive_type: '',
  acceleration: '',
  top_speed: '',
  doors: '',
  seats: '',
  additional_specs: [],
})

function convertAdditionalSpecs(specs) {
  if (!specs || typeof specs !== 'object') {
    return []
  }

  return Object.entries(specs).map(([key, value]) => ({
    key,
    value,
  }))
}

function addSpec() {
  form.value.additional_specs.push({
    key: '',
    value: '',
  })
}

function removeSpec(index) {
  form.value.additional_specs.splice(index, 1)
}

function getAdditionalSpecs() {
  const specs = {}

  form.value.additional_specs.forEach((spec) => {
    const key = spec.key.trim()

    if (key !== '') {
      specs[key] = spec.value
    }
  })

  return Object.keys(specs).length > 0 ? specs : null
}

async function loadVehicle() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
        `/admin/vehicles/${route.params.vehicle}`
    )

    vehicle.value = response.data.vehicle
    carDetail.value = vehicle.value.car_detail

    if (!carDetail.value) {
      router.replace({
        name: 'admin-vehicles-car-detail-create',
        params: {
          vehicle: route.params.vehicle,
        },
      })

      return
    }

    form.value = {
      engine: carDetail.value.engine ?? '',
      horsepower: carDetail.value.horsepower ?? '',
      torque: carDetail.value.torque ?? '',
      transmission: carDetail.value.transmission ?? '',
      fuel_type: carDetail.value.fuel_type ?? '',
      drive_type: carDetail.value.drive_type ?? '',
      acceleration: carDetail.value.acceleration ?? '',
      top_speed: carDetail.value.top_speed ?? '',
      doors: carDetail.value.doors ?? '',
      seats: carDetail.value.seats ?? '',
      additional_specs: convertAdditionalSpecs(
          carDetail.value.additional_specs
      ),
    }
  } catch (err) {
    console.error('VEHICLE ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load vehicle.'
  } finally {
    loading.value = false
  }
}

async function updateCarDetail() {
  if (!carDetail.value) {
    return
  }

  submitting.value = true
  error.value = ''

  try {
    await api.put(
        `/admin/car-details/${carDetail.value.id}`,
        {
          engine: form.value.engine,
          horsepower: form.value.horsepower,
          torque: form.value.torque,
          transmission: form.value.transmission,
          fuel_type: form.value.fuel_type,
          drive_type: form.value.drive_type,
          acceleration: form.value.acceleration,
          top_speed: form.value.top_speed,
          doors: form.value.doors,
          seats: form.value.seats,
          additional_specs: getAdditionalSpecs(),
        }
    )

    router.push({
      name: 'admin-vehicles-show',
      params: {
        vehicle: route.params.vehicle,
      },
    })
  } catch (err) {
    console.error('UPDATE CAR DETAIL ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to update car details.'
  } finally {
    submitting.value = false
  }
}

onMounted(loadVehicle)
</script>

<template>
  <section class="mx-auto max-w-5xl px-8 py-12">
    <div class="mb-10">
      <RouterLink
          :to="{
          name: 'admin-vehicles-show',
          params: { vehicle: route.params.vehicle },
        }"
          class="text-xs font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        ← Back to Vehicle
      </RouterLink>

      <div class="mt-6">
        <p class="text-xs uppercase tracking-[0.3em] text-white/30">
          Vehicle Catalog
        </p>

        <h1 class="mt-2 text-4xl font-black tracking-[-0.04em] text-white">
          Edit Car Details
        </h1>

        <p
            v-if="vehicle"
            class="mt-2 text-sm text-white/40"
        >
          {{ vehicle.vehicle_model?.brand?.name }}
          {{ vehicle.vehicle_model?.name }}
        </p>
      </div>
    </div>

    <div
        v-if="loading"
        class="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-sm text-white/40"
    >
      Loading car details...
    </div>

    <div
        v-else
        class="space-y-6"
    >
      <div
          v-if="error"
          class="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300"
      >
        {{ error }}
      </div>

      <form
          class="space-y-6"
          @submit.prevent="updateCarDetail"
      >
        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 class="text-lg font-bold text-white">
            Engine & Performance
          </h2>

          <div class="mt-6 grid gap-5 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Engine
              </label>

              <input
                  v-model="form.engine"
                  type="text"
                  required
                  maxlength="255"
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
              />
            </div>

            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Horsepower
              </label>

              <input
                  v-model="form.horsepower"
                  type="number"
                  min="0"
                  step="any"
                  required
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Torque
              </label>

              <input
                  v-model="form.torque"
                  type="number"
                  min="0"
                  step="any"
                  required
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Acceleration
              </label>

              <input
                  v-model="form.acceleration"
                  type="number"
                  min="0"
                  step="any"
                  required
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />

              <p class="mt-2 text-xs text-white/25">
                0–100 km/h time in seconds.
              </p>
            </div>

            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Top Speed
              </label>

              <input
                  v-model="form.top_speed"
                  type="number"
                  min="0"
                  step="any"
                  required
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 class="text-lg font-bold text-white">
            Drivetrain & Transmission
          </h2>

          <div class="mt-6 grid gap-5 md:grid-cols-3">
            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Transmission
              </label>

              <input
                  v-model="form.transmission"
                  type="text"
                  required
                  maxlength="100"
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Fuel Type
              </label>

              <input
                  v-model="form.fuel_type"
                  type="text"
                  required
                  maxlength="100"
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Drive Type
              </label>

              <input
                  v-model="form.drive_type"
                  type="text"
                  required
                  maxlength="100"
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 class="text-lg font-bold text-white">
            Vehicle Layout
          </h2>

          <div class="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Doors
              </label>

              <input
                  v-model="form.doors"
                  type="number"
                  min="1"
                  required
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Seats
              </label>

              <input
                  v-model="form.seats"
                  type="number"
                  min="1"
                  required
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-white">
                Additional Specifications
              </h2>

              <p class="mt-1 text-sm text-white/35">
                Optional custom specifications.
              </p>
            </div>

            <button
                type="button"
                class="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 transition hover:border-white/25 hover:text-white"
                @click="addSpec"
            >
              + Add Specification
            </button>
          </div>

          <div
              v-if="form.additional_specs.length"
              class="mt-6 space-y-3"
          >
            <div
                v-for="(spec, index) in form.additional_specs"
                :key="index"
                class="flex gap-3"
            >
              <input
                  v-model="spec.key"
                  type="text"
                  placeholder="Specification name"
                  class="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
              />

              <input
                  v-model="spec.value"
                  type="text"
                  placeholder="Value"
                  class="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
              />

              <button
                  type="button"
                  class="rounded-xl border border-red-400/20 px-4 py-3 text-sm text-red-300 transition hover:bg-red-400/5"
                  @click="removeSpec(index)"
              >
                Remove
              </button>
            </div>
          </div>

          <p
              v-else
              class="mt-6 text-sm text-white/25"
          >
            No additional specifications added.
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <RouterLink
              :to="{
              name: 'admin-vehicles-show',
              params: { vehicle: route.params.vehicle },
            }"
              class="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
          >
            Cancel
          </RouterLink>

          <button
              type="submit"
              :disabled="submitting"
              class="rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ submitting ? 'Updating...' : 'Update Car Details' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>