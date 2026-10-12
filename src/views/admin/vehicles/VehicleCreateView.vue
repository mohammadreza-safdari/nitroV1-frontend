<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const vehicleModels = ref([])

const vehicleModelId = ref('')
const stockCode = ref('')
const year = ref('')
const color = ref('')
const mileage = ref(0)
const price = ref('')
const status = ref('available')
const condition = ref('new')
const description = ref('')

const loading = ref(true)
const saving = ref(false)
const error = ref('')

async function loadVehicleModels() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/admin/vehicle-models')

    vehicleModels.value = response.data.vehicle_models

    console.log('VEHICLE MODELS:', vehicleModels.value)
  } catch (err) {
    console.error('LOAD VEHICLE MODELS ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load vehicle models.'
  } finally {
    loading.value = false
  }
}

async function createVehicle() {
  error.value = ''

  if (!vehicleModelId.value) {
    error.value = 'Vehicle model is required.'
    return
  }

  if (!stockCode.value.trim()) {
    error.value = 'Stock code is required.'
    return
  }

  if (!year.value) {
    error.value = 'Year is required.'
    return
  }

  if (!color.value.trim()) {
    error.value = 'Color is required.'
    return
  }

  if (price.value === '') {
    error.value = 'Price is required.'
    return
  }

  saving.value = true

  try {
    const response = await api.post('/admin/vehicles', {
      vehicle_model_id: Number(vehicleModelId.value),
      stock_code: stockCode.value.trim(),
      year: Number(year.value),
      color: color.value.trim(),
      mileage: Number(mileage.value),
      price: Number(price.value),
      status: status.value,
      condition: condition.value,
      description: description.value.trim() || null,
    })

    const vehicle = response.data.vehicle

    router.push({
      name: 'admin-vehicles-show',
      params: {
        vehicle: vehicle.id,
      },
    })
  } catch (err) {
    console.error('CREATE VEHICLE ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to create vehicle.'
  } finally {
    saving.value = false
  }
}

onMounted(loadVehicleModels)
</script>

<template>
  <section class="mx-auto max-w-4xl px-8 py-12">

    <div class="flex items-end justify-between gap-6">

      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-white/30">
          Catalog / Vehicles
        </p>

        <h1 class="mt-3 text-4xl font-black tracking-[-0.04em]">
          Add Vehicle
        </h1>

        <p class="mt-3 text-sm text-white/40">
          Add an individual vehicle to the Nitro inventory.
        </p>
      </div>

      <RouterLink
          :to="{ name: 'admin-vehicles' }"
          class="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
      >
        Cancel
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
      Loading...
    </div>

    <form
        v-else
        @submit.prevent="createVehicle"
        class="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
    >

      <div class="grid gap-6 sm:grid-cols-2">

        <!-- Vehicle Model -->
        <div class="sm:col-span-2">
          <label class="text-xs text-white/40">
            Vehicle Model
          </label>

          <select
              v-model="vehicleModelId"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="">
              Select Vehicle Model
            </option>

            <option
                v-for="vehicleModel in vehicleModels"
                :key="vehicleModel.id"
                :value="vehicleModel.id"
            >
              {{ vehicleModel.brand?.name }} — {{ vehicleModel.name }}
            </option>
          </select>
        </div>

        <!-- Stock Code -->
        <div>
          <label class="text-xs text-white/40">
            Stock Code
          </label>

          <input
              v-model="stockCode"
              type="text"
              placeholder="LAM-REV-001"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />
        </div>

        <!-- Year -->
        <div>
          <label class="text-xs text-white/40">
            Year
          </label>

          <input
              v-model="year"
              type="number"
              min="1900"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />
        </div>

        <!-- Color -->
        <div>
          <label class="text-xs text-white/40">
            Color
          </label>

          <input
              v-model="color"
              type="text"
              placeholder="Black"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />
        </div>

        <!-- Mileage -->
        <div>
          <label class="text-xs text-white/40">
            Mileage
          </label>

          <input
              v-model="mileage"
              type="number"
              min="0"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />
        </div>

        <!-- Price -->
        <div>
          <label class="text-xs text-white/40">
            Price
          </label>

          <input
              v-model="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="608358"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />
        </div>

        <!-- Status -->
        <div>
          <label class="text-xs text-white/40">
            Status
          </label>

          <select
              v-model="status"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="available">
              Available
            </option>

            <option value="reserved">
              Reserved
            </option>

            <option value="sold">
              Sold
            </option>
          </select>
        </div>

        <!-- Condition -->
        <div>
          <label class="text-xs text-white/40">
            Condition
          </label>

          <select
              v-model="condition"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="new">
              New
            </option>

            <option value="used">
              Used
            </option>
          </select>
        </div>

        <!-- Description -->
        <div class="sm:col-span-2">
          <label class="text-xs text-white/40">
            Description
          </label>

          <textarea
              v-model="description"
              rows="6"
              placeholder="Describe this vehicle..."
              class="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          ></textarea>
        </div>

      </div>

      <div class="mt-8 flex justify-end gap-3">

        <RouterLink
            :to="{ name: 'admin-vehicles' }"
            class="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          Cancel
        </RouterLink>

        <button
            type="submit"
            :disabled="saving"
            class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Create Vehicle' }}
        </button>

      </div>

    </form>

  </section>
</template>