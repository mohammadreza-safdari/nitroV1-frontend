<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api, { imageUrl } from '@/services/api.js'

const router = useRouter()

const vehicles = ref([])
const brands = ref([])
const categories = ref([])
const vehicleModels = ref([])

const pagination = ref({
  current_page: 1,
  last_page: 1,
})

const filters = reactive({
  search: '',
  brand_id: '',
  category_id: '',
  vehicle_model_id: '',
  condition: '',
  min_price: '',
  max_price: '',
})

const loading = ref(false)
const error = ref(null)

const filteredModels = computed(() => {
  return vehicleModels.value.filter((model) => {

    const matchesBrand =
        !filters.brand_id ||
        model.brand_id === Number(filters.brand_id)

    const matchesCategory =
        !filters.category_id ||
        model.category_id === Number(filters.category_id)

    return matchesBrand && matchesCategory
  })
})

const fetchCatalog = async () => {

  const [
    brandsResponse,
    categoriesResponse,
    modelsResponse,
  ] = await Promise.all([
    api.get('/brands'),
    api.get('/categories'),
    api.get('/vehicle-models'),
  ])

  brands.value = brandsResponse.data.brands
  categories.value = categoriesResponse.data.categories
  vehicleModels.value = modelsResponse.data.vehicle_models
}

const fetchVehicles = async (page = 1) => {

  loading.value = true
  error.value = null

  try {

    const response = await api.get('/vehicles', {
      params: {
        page,

        search:
            filters.search || undefined,

        brand_id:
            filters.brand_id || undefined,

        category_id:
            filters.category_id || undefined,

        vehicle_model_id:
            filters.vehicle_model_id || undefined,

        condition:
            filters.condition || undefined,

        min_price:
            filters.min_price || undefined,

        max_price:
            filters.max_price || undefined,
      },
    })

    const result = response.data.vehicles

    vehicles.value = result.data

    pagination.value = {
      current_page: result.current_page,
      last_page: result.last_page,
    }

  } catch (err) {

    error.value = 'Failed to load vehicles.'

  } finally {

    loading.value = false

  }
}

const applyFilters = () => {
  fetchVehicles(1)
}

const resetFilters = () => {

  filters.search = ''
  filters.brand_id = ''
  filters.category_id = ''
  filters.vehicle_model_id = ''
  filters.condition = ''
  filters.min_price = ''
  filters.max_price = ''

  fetchVehicles(1)
}

const goToVehicle = (vehicle) => {
  router.push({
    name: 'vehicle-details',
    params: {
      vehicle: vehicle.id,
    },
  })
}

const goToPage = (page) => {

  if (
      page < 1 ||
      page > pagination.value.last_page
  ) {
    return
  }

  fetchVehicles(page)
}

const handleBrandChange = () => {

  const model = vehicleModels.value.find(
      (model) =>
          model.id === Number(filters.vehicle_model_id)
  )

  if (
      model &&
      filters.brand_id &&
      model.brand_id !== Number(filters.brand_id)
  ) {

    filters.vehicle_model_id = ''

  }

  applyFilters()
}

const handleCategoryChange = () => {

  const model = vehicleModels.value.find(
      (model) =>
          model.id === Number(filters.vehicle_model_id)
  )

  if (
      model &&
      filters.category_id &&
      model.category_id !== Number(filters.category_id)
  ) {

    filters.vehicle_model_id = ''

  }

  applyFilters()
}

const handleModelChange = () => {
  applyFilters()
}

const getActiveOffer = (vehicle) => {
  if (!vehicle?.offers?.length) {
    return null
  }

  return vehicle.offers[0]
}

const hasDiscount = (vehicle) => {
  const offer = getActiveOffer(vehicle)

  return (
      offer?.type === 'discount' &&
      offer.discount_type &&
      offer.discount_value !== null &&
      offer.discount_value !== undefined
  )
}

const getFinalPrice = (vehicle) => {
  const offer = getActiveOffer(vehicle)

  if (!offer || !hasDiscount(vehicle)) {
    return Number(vehicle.price)
  }

  const price = Number(vehicle.price)
  const value = Number(offer.discount_value)

  if (offer.discount_type === 'percentage') {
    return price - (price * value / 100)
  }

  if (offer.discount_type === 'fixed') {
    return Math.max(price - value, 0)
  }

  return price
}

const getDiscountLabel = (vehicle) => {
  const offer = getActiveOffer(vehicle)

  if (!offer || !hasDiscount(vehicle)) {
    return null
  }

  if (offer.discount_type === 'percentage') {
    return `${Number(offer.discount_value)}% OFF`
  }

  if (offer.discount_type === 'fixed') {
    return `$${Number(offer.discount_value).toLocaleString()} OFF`
  }

  return null
}

const getOfferLabel = (offer) => {

  const labels = {
    discount: 'Discount',
    limited_time: 'Limited Time',
    featured: 'Featured',
    reservation: 'Reservation',
    pre_order: 'Pre-Order',
  }

  return labels[offer?.type] || offer?.type
}

onMounted(async () => {

  try {

    await fetchCatalog()

    await fetchVehicles()

  } catch (err) {

    error.value =
        'Failed to load vehicle catalog.'

  }

})
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-16">

    <!-- Header -->

    <div class="mb-12">

      <p class="text-xs uppercase tracking-[0.3em] text-white/30">
        Collection
      </p>

      <h1
          class="mt-4 text-5xl font-black tracking-[-0.04em] text-white"
      >
        Vehicles
      </h1>

      <p class="mt-5 max-w-2xl text-sm leading-7 text-white/45">
        Explore the Nitro collection and find the vehicle that fits your style.
      </p>

    </div>


    <!-- Filters -->

    <div
        class="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
    >

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <!-- Search -->

        <div>

          <label
              class="mb-2 block text-xs uppercase tracking-wider text-white/35"
          >
            Search
          </label>

          <input
              v-model="filters.search"
              @keyup.enter="applyFilters"
              type="text"
              placeholder="Search vehicles..."
              class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
          />

        </div>


        <!-- Category -->

        <div>

          <label
              class="mb-2 block text-xs uppercase tracking-wider text-white/35"
          >
            Category
          </label>

          <select
              v-model="filters.category_id"
              @change="handleCategoryChange"
              class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          >

            <option
                value=""
                class="bg-[#111]"
            >
              All categories
            </option>

            <optgroup
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
            >

              <option
                  v-for="child in category.children"
                  :key="child.id"
                  :value="child.id"
                  class="bg-[#111]"
              >
                {{ child.name }}
              </option>

            </optgroup>

          </select>

        </div>


        <!-- Brand -->

        <div>

          <label
              class="mb-2 block text-xs uppercase tracking-wider text-white/35"
          >
            Brand
          </label>

          <select
              v-model="filters.brand_id"
              @change="handleBrandChange"
              class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          >

            <option
                value=""
                class="bg-[#111]"
            >
              All brands
            </option>

            <option
                v-for="brand in brands"
                :key="brand.id"
                :value="brand.id"
                class="bg-[#111]"
            >
              {{ brand.name }}
            </option>

          </select>

        </div>


        <!-- Vehicle Model -->

        <div>

          <label
              class="mb-2 block text-xs uppercase tracking-wider text-white/35"
          >
            Vehicle Model
          </label>

          <select
              v-model="filters.vehicle_model_id"
              @change="handleModelChange"
              class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          >

            <option
                value=""
                class="bg-[#111]"
            >
              All models
            </option>

            <option
                v-for="model in filteredModels"
                :key="model.id"
                :value="model.id"
                class="bg-[#111]"
            >
              {{ model.name }}
            </option>

          </select>

        </div>

      </div>


      <div class="mt-4 grid gap-4 md:grid-cols-3">

        <!-- Condition -->

        <div>

          <label
              class="mb-2 block text-xs uppercase tracking-wider text-white/35"
          >
            Condition
          </label>

          <select
              v-model="filters.condition"
              @change="applyFilters"
              class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          >

            <option
                value=""
                class="bg-[#111]"
            >
              All conditions
            </option>

            <option
                value="new"
                class="bg-[#111]"
            >
              New
            </option>

            <option
                value="used"
                class="bg-[#111]"
            >
              Used
            </option>

          </select>

        </div>


        <!-- Min Price -->

        <div>

          <label
              class="mb-2 block text-xs uppercase tracking-wider text-white/35"
          >
            Min Price
          </label>

          <input
              v-model="filters.min_price"
              type="number"
              min="0"
              placeholder="Minimum price"
              class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30"
          />

        </div>


        <!-- Max Price -->

        <div>

          <label
              class="mb-2 block text-xs uppercase tracking-wider text-white/35"
          >
            Max Price
          </label>

          <input
              v-model="filters.max_price"
              type="number"
              min="0"
              placeholder="Maximum price"
              class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
          />

        </div>

      </div>


      <!-- Filter Actions -->

      <div class="mt-4 flex justify-end gap-3">

        <button
            @click="resetFilters"
            class="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
        >
          Reset
        </button>

        <button
            @click="applyFilters"
            class="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Search
        </button>

      </div>

    </div>


    <!-- Error -->

    <div
        v-if="error"
        class="mb-8 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400"
    >
      {{ error }}
    </div>


    <!-- Loading -->

    <div
        v-if="loading"
        class="py-20 text-center text-sm text-white/40"
    >
      Loading vehicles...
    </div>


    <!-- Empty -->

    <div
        v-else-if="vehicles.length === 0"
        class="rounded-2xl border border-white/10 bg-white/[0.02] py-20 text-center"
    >

      <p class="text-lg font-medium text-white/70">
        No vehicles found.
      </p>

      <p class="mt-2 text-sm text-white/35">
        Try changing your filters.
      </p>

    </div>


    <!-- Vehicles -->

    <div
        v-else
        class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >

      <article
          v-for="vehicle in vehicles"
          :key="vehicle.id"
          @click="goToVehicle(vehicle)"
          class="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/20"
      >

        <!-- Image -->

        <div class="relative aspect-[16/10] overflow-hidden bg-white/[0.03]">

          <img
              v-if="vehicle.images?.length"
              :src="imageUrl(vehicle.images[0].path)"
              :alt="vehicle.vehicle_model?.name"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />

          <div
              v-else
              class="flex h-full items-center justify-center text-sm text-white/20"
          >
            No image
          </div>


          <!-- Offer Badges -->

          <template v-if="getActiveOffer(vehicle)">

            <div class="absolute left-4 top-4">

              <span
                  class="rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/75 backdrop-blur"
              >
                {{ getOfferLabel(getActiveOffer(vehicle)) }}
              </span>

            </div>


            <div
                v-if="getDiscountLabel(vehicle)"
                class="absolute right-4 top-4"
            >

              <span
                  class="rounded-full bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-black"
              >
                {{ getDiscountLabel(vehicle) }}
              </span>

            </div>

          </template>

        </div>


        <!-- Content -->

        <div class="p-6">

          <p class="text-xs uppercase tracking-[0.2em] text-white/30">
            {{ vehicle.vehicle_model?.brand?.name }}
          </p>

          <h2 class="mt-2 text-xl font-bold text-white">
            {{ vehicle.vehicle_model?.name }}
          </h2>

          <p class="mt-3 text-sm text-white/40">
            {{ vehicle.year }} · {{ vehicle.color }}
          </p>


          <!-- Offer Title -->

          <div
              v-if="getActiveOffer(vehicle)"
              class="mt-5 border-t border-white/[0.07] pt-4"
          >

            <p
                class="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/25"
            >
              Special Offer
            </p>

            <p class="mt-1 text-xs font-medium text-white/65">
              {{ getActiveOffer(vehicle).title }}
            </p>

          </div>


          <!-- Price -->

          <div class="mt-6 flex items-end justify-between gap-4">

            <!-- Discount Price -->

            <div
                v-if="
                  getActiveOffer(vehicle) &&
                  hasDiscount(vehicle)
                "
            >

              <p class="text-[9px] uppercase tracking-[0.16em] text-white/25">
                Offer Price
              </p>

              <p class="mt-1 text-xl font-bold text-white">
                ${{ getFinalPrice(vehicle).toLocaleString() }}
              </p>

              <p class="mt-1 text-[10px] text-white/25 line-through">
                ${{ Number(vehicle.price).toLocaleString() }}
              </p>

            </div>


            <!-- Normal Price -->

            <div v-else>

              <p class="text-[9px] uppercase tracking-[0.16em] text-white/25">
                Price
              </p>

              <p class="mt-1 text-lg font-semibold text-white">
                ${{ Number(vehicle.price).toLocaleString() }}
              </p>

            </div>


            <!-- Condition / Offer Type -->

            <div class="text-right">

              <span
                  v-if="getActiveOffer(vehicle)"
                  class="text-[9px] uppercase tracking-[0.14em] text-white/45"
              >
                {{ getOfferLabel(getActiveOffer(vehicle)) }}
              </span>

              <span
                  v-else
                  class="text-xs uppercase tracking-wider text-white/30"
              >
                {{ vehicle.condition }}
              </span>

            </div>

          </div>

        </div>

      </article>

    </div>


    <!-- Pagination -->

    <div
        v-if="pagination.last_page > 1"
        class="mt-12 flex items-center justify-center gap-2"
    >

      <button
          @click="goToPage(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Previous
      </button>


      <span class="px-4 text-sm text-white/40">
        Page {{ pagination.current_page }}
        of
        {{ pagination.last_page }}
      </span>


      <button
          @click="goToPage(pagination.current_page + 1)"
          :disabled="
            pagination.current_page === pagination.last_page
          "
          class="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next
      </button>

    </div>

  </section>
</template>