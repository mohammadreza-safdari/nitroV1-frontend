<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api, { imageUrl } from '@/services/api.js'
import { useCompareStore } from '@/stores/compare.js'

const router = useRouter()
const compareStore = useCompareStore()

const comparisonVehicles = ref([])
const comparisonLoading = ref(false)
const error = ref(null)

const activeTab = ref('specifications')
const activeSection = ref('general')

const maxVehicles = 3

const selectedVehicles = computed(() => compareStore.vehicles)

const tabs = [
  {
    key: 'specifications',
    label: 'Specifications',
  },
  {
    key: 'dimensions',
    label: 'Dimensions',
  },
  {
    key: 'features',
    label: 'Features',
  },
  {
    key: 'images',
    label: 'Images',
  },
]

const sections = [
  {
    key: 'general',
    label: 'General',
  },
  {
    key: 'performance',
    label: 'Performance',
  },
  {
    key: 'engine',
    label: 'Engine',
  },
  {
    key: 'transmission',
    label: 'Transmission',
  },
  {
    key: 'fuel',
    label: 'Fuel & Capacity',
  },
  {
    key: 'dimensions',
    label: 'Dimensions & Weight',
  },
  {
    key: 'exterior',
    label: 'Exterior',
  },
  {
    key: 'interior',
    label: 'Interior',
  },
  {
    key: 'safety',
    label: 'Safety & Technology',
  },
]

const getPrimaryImage = (vehicle) => {
  if (!vehicle?.images?.length) {
    return null
  }

  return (
      vehicle.images.find(image => image.is_primary) ||
      vehicle.images[0]
  )
}

const getDetail = (vehicle) => {
  return vehicle?.car_detail || vehicle?.motorcycle_detail
}

const vehicleType = (vehicle) => {
  if (vehicle?.car_detail) {
    return 'Car'
  }

  if (vehicle?.motorcycle_detail) {
    return 'Motorcycle'
  }

  return null
}

const formatPrice = (price) => {
  if (price === null || price === undefined) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

const formatNumber = (value) => {
  if (value === null || value === undefined) {
    return '—'
  }

  return Number(value).toLocaleString()
}

const getValue = (vehicle, key) => {
  const detail = getDetail(vehicle)

  switch (key) {
    case 'type':
      return vehicleType(vehicle)

    case 'brand':
      return vehicle.vehicle_model?.brand?.name

    case 'model':
      return vehicle.vehicle_model?.name

    case 'category':
      return vehicle.vehicle_model?.category?.name

    case 'year':
      return vehicle.year

    case 'condition':
      return vehicle.condition

    case 'color':
      return vehicle.color

    case 'mileage':
      return vehicle.mileage !== null &&
      vehicle.mileage !== undefined
          ? `${formatNumber(vehicle.mileage)} km`
          : null

    case 'price':
      return formatPrice(vehicle.price)

    case 'engine':
      return detail?.engine

    case 'horsepower':
      return detail?.horsepower !== null &&
      detail?.horsepower !== undefined
          ? `${detail.horsepower} hp`
          : null

    case 'torque':
      return detail?.torque !== null &&
      detail?.torque !== undefined
          ? `${detail.torque} Nm`
          : null

    case 'transmission':
      return detail?.transmission

    case 'fuel':
      return detail?.fuel_type

    case 'cooling_system':
      return detail?.cooling_system

    case 'drive_type':
      return detail?.drive_type

    case 'acceleration':
      return detail?.acceleration

    case 'top_speed':
      return detail?.top_speed

    case 'doors':
      return detail?.doors

    case 'seats':
      return detail?.seats

    case 'seat_height':
      return detail?.seat_height !== null &&
      detail?.seat_height !== undefined
          ? `${detail.seat_height} mm`
          : null

    case 'wheelbase':
      return detail?.wheelbase !== null &&
      detail?.wheelbase !== undefined
          ? `${detail.wheelbase} mm`
          : null

    case 'fuel_capacity':
      return detail?.fuel_capacity !== null &&
      detail?.fuel_capacity !== undefined
          ? `${detail.fuel_capacity} L`
          : null

    case 'weight':
      return detail?.weight !== null &&
      detail?.weight !== undefined
          ? `${detail.weight} kg`
          : null

    default:
      return null
  }
}

const sectionRows = computed(() => {
  const hasCar = comparisonVehicles.value.some(
      vehicle => vehicle.car_detail
  )

  const hasMotorcycle = comparisonVehicles.value.some(
      vehicle => vehicle.motorcycle_detail
  )

  if (activeSection.value === 'general') {
    return [
      { label: 'Year', key: 'year' },
      { label: 'Brand', key: 'brand' },
      { label: 'Model', key: 'model' },
      { label: 'Category', key: 'category' },
      { label: 'Type', key: 'type' },
      { label: 'Condition', key: 'condition' },
      { label: 'Color', key: 'color' },
      { label: 'Mileage', key: 'mileage' },
      { label: 'Price', key: 'price' },
    ]
  }

  if (activeSection.value === 'performance') {
    return [
      { label: 'Top Speed', key: 'top_speed' },
      { label: '0 - 100 km/h', key: 'acceleration' },
      { label: 'Horsepower', key: 'horsepower' },
      { label: 'Torque', key: 'torque' },
    ]
  }

  if (activeSection.value === 'engine') {
    return [
      { label: 'Engine', key: 'engine' },
      { label: 'Fuel Type', key: 'fuel' },
      ...(hasMotorcycle
          ? [
            {
              label: 'Cooling System',
              key: 'cooling_system',
            },
          ]
          : []),
    ]
  }

  if (activeSection.value === 'transmission') {
    return [
      { label: 'Transmission', key: 'transmission' },
      ...(hasCar
          ? [
            {
              label: 'Drive Type',
              key: 'drive_type',
            },
          ]
          : []),
    ]
  }

  if (activeSection.value === 'fuel') {
    return [
      { label: 'Fuel Type', key: 'fuel' },
      ...(hasMotorcycle
          ? [
            {
              label: 'Fuel Capacity',
              key: 'fuel_capacity',
            },
          ]
          : []),
    ]
  }

  if (activeSection.value === 'dimensions') {
    return [
      ...(hasMotorcycle
          ? [
            {
              label: 'Weight',
              key: 'weight',
            },
            {
              label: 'Seat Height',
              key: 'seat_height',
            },
            {
              label: 'Wheelbase',
              key: 'wheelbase',
            },
          ]
          : []),
      ...(hasCar
          ? [
            {
              label: 'Doors',
              key: 'doors',
            },
            {
              label: 'Seats',
              key: 'seats',
            },
          ]
          : []),
    ]
  }

  return []
})

const loadComparisonVehicles = async () => {
  if (!selectedVehicles.value.length) {
    comparisonVehicles.value = []
    return
  }

  comparisonLoading.value = true
  error.value = null

  try {
    const responses = await Promise.all(
        selectedVehicles.value.map(vehicle =>
            api.get(`/vehicles/${vehicle.id}`)
        )
    )

    comparisonVehicles.value = responses.map(
        response => response.data.vehicle
    )
  } catch (err) {
    error.value = 'Failed to load comparison data.'
    comparisonVehicles.value = []
  } finally {
    comparisonLoading.value = false
  }
}

const removeVehicle = async (vehicle) => {
  compareStore.removeVehicle(vehicle.id)

  await loadComparisonVehicles()
}

const goToVehicle = (vehicle) => {
  router.push({
    name: 'vehicle-details',
    params: {
      vehicle: vehicle.id,
    },
  })
}

const goToVehicles = () => {
  router.push({
    name: 'vehicles',
  })
}

const clearAll = () => {
  compareStore.clearVehicles()
  comparisonVehicles.value = []
}

const setTab = (tab) => {
  activeTab.value = tab

  if (tab === 'dimensions') {
    activeSection.value = 'dimensions'
    return
  }

  if (tab === 'specifications') {
    activeSection.value = 'general'
  }
}

const setSection = (section) => {
  activeSection.value = section
  activeTab.value = 'specifications'
}

onMounted(() => {
  loadComparisonVehicles()
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">

    <!-- Header -->
    <div class="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

      <div class="max-w-xl">
        <p class="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/30">
          Vehicle Comparison
        </p>

        <h1
            class="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl"
        >
          Compare Your
          <span class="block">Machines.</span>
        </h1>

        <p class="mt-5 max-w-lg text-sm leading-7 text-white/40">
          See how your selected vehicles stack up side by side.
          Compare specifications, dimensions, equipment and more.
        </p>
      </div>

      <div class="flex items-center gap-3">
                <span class="text-xs text-white/35">
                    {{ selectedVehicles.length }} / {{ maxVehicles }} selected
                </span>

        <button
            v-if="selectedVehicles.length"
            type="button"
            @click="clearAll"
            class="rounded-xl border border-white/10 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45 transition hover:border-white/20 hover:text-white"
        >
          Clear All
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
        v-if="!selectedVehicles.length"
        class="rounded-3xl border border-white/10 bg-white/[0.025] px-8 py-20 text-center"
    >
      <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25">
        Nothing to compare
      </p>

      <h2 class="mt-4 text-2xl font-bold text-white">
        Add vehicles from their Details page.
      </h2>

      <p class="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/35">
        Go to the Vehicles page, open a vehicle's Details page,
        and select Add to Compare. You can compare up to three
        vehicles at the same time.
      </p>

      <button
          type="button"
          @click="goToVehicles"
          class="mt-8 rounded-xl bg-white px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white/90"
      >
        Browse Vehicles
      </button>
    </div>

    <template v-else>

      <!-- Selected Vehicle Cards -->
      <div class="grid gap-4 md:grid-cols-3">

        <article
            v-for="vehicle in comparisonVehicles"
            :key="vehicle.id"
            class="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
        >
          <div class="relative">

            <img
                v-if="getPrimaryImage(vehicle)"
                :src="imageUrl(getPrimaryImage(vehicle).path)"
                :alt="vehicle.vehicle_model?.name"
                class="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />

            <div
                v-else
                class="flex aspect-[16/9] items-center justify-center bg-white/[0.025] text-[10px] uppercase tracking-[0.2em] text-white/20"
            >
              No image
            </div>

            <button
                type="button"
                @click="removeVehicle(vehicle)"
                class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/50 backdrop-blur transition hover:bg-black/80 hover:text-white"
            >
              ×
            </button>

          </div>

          <div class="p-5">

            <div class="flex items-center gap-2">
              <p class="text-[10px] uppercase tracking-[0.2em] text-white/30">
                {{ vehicle.vehicle_model?.brand?.name }}
              </p>

              <span
                  class="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/35"
              >
                                {{ vehicleType(vehicle) }}
                            </span>
            </div>

            <h2 class="mt-2 text-lg font-bold text-white">
              {{ vehicle.vehicle_model?.name }}
            </h2>

            <p class="mt-1 text-xs text-white/30">
              {{ vehicle.year }}
              <span class="mx-1">·</span>
              {{ vehicle.vehicle_model?.brand?.name }}
            </p>

            <div class="mt-5 flex items-center justify-between">
              <p class="text-sm font-semibold text-white/80">
                {{ formatPrice(vehicle.price) }}
              </p>

              <button
                  type="button"
                  @click="goToVehicle(vehicle)"
                  class="rounded-lg border border-white/10 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45 transition hover:border-white/20 hover:text-white"
              >
                View Details →
              </button>
            </div>

          </div>
        </article>

      </div>

      <!-- Comparison Workspace -->
      <div
          v-if="!comparisonLoading && comparisonVehicles.length"
          class="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
      >

        <!-- Main Tabs -->
        <div
            class="flex overflow-x-auto border-b border-white/10"
        >
          <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              @click="setTab(tab.key)"
              class="relative whitespace-nowrap px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.14em] transition"
              :class="
                            activeTab === tab.key
                                ? 'text-white'
                                : 'text-white/30 hover:text-white/60'
                        "
          >
            {{ tab.label }}

            <span
                v-if="activeTab === tab.key"
                class="absolute inset-x-6 bottom-0 h-px bg-white"
            />
          </button>
        </div>

        <!-- Specifications -->
        <div
            v-if="activeTab === 'specifications' || activeTab === 'dimensions'"
            class="grid lg:grid-cols-[220px_minmax(0,1fr)]"
        >

          <!-- Sidebar -->
          <aside
              class="border-b border-white/10 bg-white/[0.015] p-5 lg:border-b-0 lg:border-r"
          >
            <p class="mb-4 px-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25">
              Specifications
            </p>

            <nav class="space-y-1">

              <button
                  v-for="section in sections"
                  :key="section.key"
                  type="button"
                  @click="setSection(section.key)"
                  class="w-full rounded-lg px-3 py-2.5 text-left text-xs transition"
                  :class="
                                    activeSection === section.key
                                        ? 'bg-white/[0.08] text-white'
                                        : 'text-white/35 hover:bg-white/[0.04] hover:text-white/70'
                                "
              >
                {{ section.label }}
              </button>

            </nav>
          </aside>

          <!-- Comparison Data -->
          <div class="min-w-0">

            <!-- Vehicle mini headers -->
            <div
                class="grid border-b border-white/10"
                :class="{
                                'grid-cols-1': comparisonVehicles.length === 1,
                                'grid-cols-2': comparisonVehicles.length === 2,
                                'grid-cols-3': comparisonVehicles.length === 3,
                            }"
            >

              <div
                  v-for="vehicle in comparisonVehicles"
                  :key="`mini-${vehicle.id}`"
                  class="border-r border-white/10 p-5 last:border-r-0"
              >
                <div class="flex items-center gap-4">

                  <img
                      v-if="getPrimaryImage(vehicle)"
                      :src="imageUrl(getPrimaryImage(vehicle).path)"
                      :alt="vehicle.vehicle_model?.name"
                      class="h-14 w-20 rounded-lg object-cover"
                  />

                  <div>
                    <p class="text-[9px] uppercase tracking-[0.18em] text-white/30">
                      {{ vehicle.vehicle_model?.brand?.name }}
                    </p>

                    <h3 class="mt-1 text-sm font-bold text-white">
                      {{ vehicle.vehicle_model?.name }}
                    </h3>

                    <span
                        class="mt-1 inline-block text-[9px] uppercase tracking-wider text-white/25"
                    >
                                            {{ vehicleType(vehicle) }}
                                        </span>
                  </div>

                </div>
              </div>

            </div>

            <!-- Section title -->
            <div class="px-6 pt-7">
              <p class="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25">
                {{ sections.find(section => section.key === activeSection)?.label }}
              </p>
            </div>

            <!-- Rows -->
            <div class="mt-4">

              <div
                  v-for="row in sectionRows"
                  :key="row.key"
                  class="grid border-t border-white/[0.07]"
                  :class="{
                                    'grid-cols-[150px_repeat(1,minmax(0,1fr))]':
                                        comparisonVehicles.length === 1,
                                    'grid-cols-[150px_repeat(2,minmax(0,1fr))]':
                                        comparisonVehicles.length === 2,
                                    'grid-cols-[150px_repeat(3,minmax(0,1fr))]':
                                        comparisonVehicles.length === 3,
                                }"
              >

                <div
                    class="bg-white/[0.015] px-6 py-4 text-[10px] font-medium uppercase tracking-[0.12em] text-white/30"
                >
                  {{ row.label }}
                </div>

                <div
                    v-for="vehicle in comparisonVehicles"
                    :key="`${vehicle.id}-${row.key}`"
                    class="border-l border-white/[0.07] px-6 py-4 text-sm text-white/65"
                >
                  {{ getValue(vehicle, row.key) ?? '—' }}
                </div>

              </div>

            </div>

            <!-- Footer -->
            <div class="p-5">
              <div
                  class="rounded-lg border border-white/[0.07] bg-white/[0.015] px-4 py-3 text-[10px] leading-5 text-white/25"
              >
                Specifications shown above are based on the
                available vehicle data and may vary depending
                on market, configuration and model year.
              </div>
            </div>

          </div>
        </div>

        <!-- Features -->
        <div
            v-else-if="activeTab === 'features'"
            class="px-6 py-16 text-center"
        >
          <p class="text-[10px] uppercase tracking-[0.25em] text-white/25">
            Features
          </p>

          <h3 class="mt-3 text-xl font-bold text-white">
            Feature comparison is coming next.
          </h3>

          <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-white/35">
            This section will be connected to the vehicle feature
            data once those specifications are available.
          </p>
        </div>

        <!-- Images -->
        <div
            v-else-if="activeTab === 'images'"
            class="grid gap-5 p-6 md:grid-cols-3"
        >
          <div
              v-for="vehicle in comparisonVehicles"
              :key="`images-${vehicle.id}`"
          >
            <div class="overflow-hidden rounded-xl border border-white/10">
              <img
                  v-if="getPrimaryImage(vehicle)"
                  :src="imageUrl(getPrimaryImage(vehicle).path)"
                  :alt="vehicle.vehicle_model?.name"
                  class="aspect-[16/10] w-full object-cover"
              />

              <div
                  v-else
                  class="flex aspect-[16/10] items-center justify-center bg-white/[0.03] text-[10px] uppercase tracking-wider text-white/20"
              >
                No image
              </div>
            </div>

            <p class="mt-3 text-xs font-semibold text-white/70">
              {{ vehicle.vehicle_model?.name }}
            </p>

            <p class="mt-1 text-[10px] uppercase tracking-wider text-white/25">
              {{ vehicle.images?.length || 0 }} image(s)
            </p>
          </div>
        </div>

      </div>

      <!-- Loading -->
      <div
          v-else-if="comparisonLoading"
          class="py-24 text-center text-sm text-white/35"
      >
        Loading comparison data...
      </div>

      <!-- Error -->
      <div
          v-if="error"
          class="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400"
      >
        {{ error }}
      </div>

    </template>

  </section>
</template>