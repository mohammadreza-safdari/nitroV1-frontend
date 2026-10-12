<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const vehicle = ref(null)

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const validationErrors = ref({})

const form = ref({
  engine: '',
  horsepower: '',
  torque: '',
  transmission: '',
  fuel_type: '',
  cooling_system: '',
  seat_height: '',
  wheelbase: '',
  fuel_capacity: '',
  weight: '',
  top_speed: '',
  additional_specs: [],
})

async function loadVehicle() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
        `/admin/vehicles/${route.params.vehicle}`
    )

    vehicle.value = response.data.vehicle
  } catch (err) {
    console.error('VEHICLE ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load vehicle.'
  } finally {
    loading.value = false
  }
}

function addAdditionalSpec() {
  form.value.additional_specs.push({
    key: '',
    value: '',
  })
}

function removeAdditionalSpec(index) {
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

function fieldError(field) {
  return validationErrors.value[field]?.[0] || ''
}

async function save() {
  saving.value = true
  error.value = ''
  validationErrors.value = {}

  const payload = {
    engine: form.value.engine,
    horsepower: form.value.horsepower,
    torque: form.value.torque,
    transmission: form.value.transmission,
    fuel_type: form.value.fuel_type,
    cooling_system: form.value.cooling_system,
    seat_height: form.value.seat_height,
    wheelbase: form.value.wheelbase,
    fuel_capacity: form.value.fuel_capacity,
    weight: form.value.weight,
    top_speed: form.value.top_speed,
    additional_specs: getAdditionalSpecs(),
  }

  try {
    await api.post(
        `/admin/vehicles/${route.params.vehicle}/motorcycle-detail`,
        payload
    )

    router.push({
      name: 'admin-vehicles-show',
      params: {
        vehicle: route.params.vehicle,
      },
    })
  } catch (err) {
    console.error('CREATE MOTORCYCLE DETAILS ERROR:', err)

    validationErrors.value =
        err.response?.data?.errors || {}

    error.value =
        err.response?.data?.message ||
        'Failed to create motorcycle details.'
  } finally {
    saving.value = false
  }
}

onMounted(loadVehicle)
</script>

<template>
  <section class="mx-auto max-w-5xl px-8 py-12">

    <!-- Header -->
    <div class="mb-10">
      <RouterLink
          :to="{
          name: 'admin-vehicles-show',
          params: {
            vehicle: route.params.vehicle,
          },
        }"
          class="text-sm text-white/40 transition hover:text-white"
      >
        ← Back to Vehicle
      </RouterLink>

      <p class="mt-8 text-xs uppercase tracking-[0.3em] text-white/30">
        Vehicle Catalog
      </p>

      <h1 class="mt-3 text-4xl font-black tracking-[-0.04em]">
        Add Motorcycle Details
      </h1>

      <p class="mt-3 text-sm text-white/40">
        Add technical specifications for this motorcycle.
      </p>
    </div>

    <!-- Loading -->
    <div
        v-if="loading"
        class="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center text-sm text-white/35"
    >
      Loading vehicle...
    </div>

    <template v-else>

      <!-- Vehicle -->
      <div
          v-if="vehicle"
          class="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
          Vehicle
        </p>

        <h2 class="mt-2 text-lg font-semibold text-white/80">
          {{ vehicle.vehicle_model?.name || 'Vehicle' }}
        </h2>

        <p class="mt-1 text-xs text-white/30">
          {{ vehicle.vehicle_model?.brand?.name || 'No Brand' }}
          <span class="mx-2">•</span>
          {{ vehicle.stock_code }}
        </p>
      </div>

      <!-- Error -->
      <div
          v-if="error"
          class="mb-8 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300"
      >
        {{ error }}
      </div>

      <form
          @submit.prevent="save"
          class="space-y-8"
      >

        <!-- Engine -->
        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

          <div class="mb-6">
            <h2 class="text-sm font-semibold text-white/80">
              Engine & Performance
            </h2>

            <p class="mt-1 text-xs text-white/30">
              Core engine and performance specifications.
            </p>
          </div>

          <div class="grid gap-5 md:grid-cols-2">

            <div class="md:col-span-2">
              <label class="text-xs text-white/40">
                Engine
              </label>

              <input
                  v-model="form.engine"
                  type="text"
                  placeholder="e.g. 998cc Inline 4"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('engine')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('engine') }}
              </p>
            </div>

            <div>
              <label class="text-xs text-white/40">
                Horsepower
              </label>

              <input
                  v-model="form.horsepower"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 200"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('horsepower')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('horsepower') }}
              </p>
            </div>

            <div>
              <label class="text-xs text-white/40">
                Torque
              </label>

              <input
                  v-model="form.torque"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 113"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('torque')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('torque') }}
              </p>
            </div>

            <div>
              <label class="text-xs text-white/40">
                Top Speed
              </label>

              <input
                  v-model="form.top_speed"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 299"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('top_speed')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('top_speed') }}
              </p>
            </div>

            <div>
              <label class="text-xs text-white/40">
                Acceleration
              </label>

              <input
                  v-model="form.acceleration"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 3.2"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('acceleration')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('acceleration') }}
              </p>
            </div>

          </div>
        </div>

        <!-- Motorcycle Specifications -->
        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

          <div class="mb-6">
            <h2 class="text-sm font-semibold text-white/80">
              Motorcycle Specifications
            </h2>

            <p class="mt-1 text-xs text-white/30">
              Transmission, fuel and physical specifications.
            </p>
          </div>

          <div class="grid gap-5 md:grid-cols-2">

            <div>
              <label class="text-xs text-white/40">
                Transmission
              </label>

              <input
                  v-model="form.transmission"
                  type="text"
                  placeholder="e.g. 6-Speed"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('transmission')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('transmission') }}
              </p>
            </div>

            <div>
              <label class="text-xs text-white/40">
                Fuel Type
              </label>

              <input
                  v-model="form.fuel_type"
                  type="text"
                  placeholder="e.g. Gasoline"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('fuel_type')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('fuel_type') }}
              </p>
            </div>

            <div>
              <label class="text-xs text-white/40">
                Cooling System
              </label>

              <input
                  v-model="form.cooling_system"
                  type="text"
                  placeholder="e.g. Liquid Cooled"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('cooling_system')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('cooling_system') }}
              </p>
            </div>

            <div>
              <label class="text-xs text-white/40">
                Seat Height
              </label>

              <input
                  v-model="form.seat_height"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 855"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('seat_height')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('seat_height') }}
              </p>
            </div>

            <div>
              <label class="text-xs text-white/40">
                Wheelbase
              </label>

              <input
                  v-model="form.wheelbase"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 1405"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('wheelbase')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('wheelbase') }}
              </p>
            </div>

            <div>
              <label class="text-xs text-white/40">
                Fuel Capacity
              </label>

              <input
                  v-model="form.fuel_capacity"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 17"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('fuel_capacity')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('fuel_capacity') }}
              </p>
            </div>

            <div>
              <label class="text-xs text-white/40">
                Weight
              </label>

              <input
                  v-model="form.weight"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 201"
                  class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p
                  v-if="fieldError('weight')"
                  class="mt-2 text-xs text-red-300"
              >
                {{ fieldError('weight') }}
              </p>
            </div>

          </div>
        </div>

        <!-- Additional Specs -->
        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

          <div class="flex items-start justify-between gap-6">

            <div>
              <h2 class="text-sm font-semibold text-white/80">
                Additional Specifications
              </h2>

              <p class="mt-1 text-xs text-white/30">
                Add custom specifications that are not included above.
              </p>
            </div>

            <button
                type="button"
                @click="addAdditionalSpec"
                class="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:bg-white/5 hover:text-white"
            >
              + Add Spec
            </button>

          </div>

          <div
              v-if="form.additional_specs.length"
              class="mt-6 space-y-3"
          >

            <div
                v-for="(spec, index) in form.additional_specs"
                :key="index"
                class="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
            >

              <input
                  v-model="spec.key"
                  type="text"
                  placeholder="Specification name"
                  class="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
              />

              <input
                  v-model="spec.value"
                  type="text"
                  placeholder="Value"
                  class="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
              />

              <button
                  type="button"
                  @click="removeAdditionalSpec(index)"
                  class="rounded-xl px-4 py-3 text-xs text-red-300/60 transition hover:bg-red-400/10 hover:text-red-300"
              >
                Remove
              </button>

            </div>

          </div>

          <p
              v-else
              class="mt-6 text-xs text-white/25"
          >
            No additional specifications added.
          </p>

        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">

          <RouterLink
              :to="{
              name: 'admin-vehicles-show',
              params: {
                vehicle: route.params.vehicle,
              },
            }"
              class="rounded-xl px-5 py-3 text-sm text-white/45 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </RouterLink>

          <button
              type="submit"
              :disabled="saving"
              class="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Create Motorcycle Details' }}
          </button>

        </div>

      </form>

    </template>

  </section>
</template>