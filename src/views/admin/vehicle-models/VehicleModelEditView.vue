<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const brands = ref([])
const categories = ref([])

const name = ref('')
const slug = ref('')
const brandId = ref('')
const categoryId = ref('')
const description = ref('')

const loading = ref(true)
const saving = ref(false)
const error = ref('')

function flattenCategories(items) {
  const result = []

  for (const category of items) {
    result.push(category)

    if (category.children?.length) {
      result.push(...flattenCategories(category.children))
    }
  }

  return result
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    console.log('1. Loading vehicle model...')

    const vehicleModelResponse = await api.get(
        `/admin/vehicle-models/${route.params.vehicleModel}`
    )

    console.log(
        '2. Vehicle model response:',
        vehicleModelResponse.data
    )

    console.log('3. Loading brands...')

    const brandsResponse = await api.get('/admin/brands')

    console.log(
        '4. Brands response:',
        brandsResponse.data
    )

    console.log('5. Loading categories...')

    const categoriesResponse = await api.get('/admin/categories')

    console.log(
        '6. Categories response:',
        categoriesResponse.data
    )

    const vehicleModel =
        vehicleModelResponse.data.vehicle_model

    brands.value = brandsResponse.data.brands

    categories.value = flattenCategories(
        categoriesResponse.data.categories
    )

    name.value = vehicleModel.name
    slug.value = vehicleModel.slug
    brandId.value = String(vehicleModel.brand_id)
    categoryId.value = String(vehicleModel.category_id)
    description.value = vehicleModel.description || ''

  } catch (err) {
    console.error('EDIT VEHICLE MODEL ERROR:', err)

    error.value =
        err.response?.data?.message ||
        err.message ||
        'Failed to load vehicle model.'
  } finally {
    loading.value = false
  }
}

async function updateVehicleModel() {
  error.value = ''

  if (!name.value.trim()) {
    error.value = 'Model name is required.'
    return
  }

  if (!brandId.value) {
    error.value = 'Brand is required.'
    return
  }

  if (!categoryId.value) {
    error.value = 'Category is required.'
    return
  }

  if (!slug.value.trim()) {
    error.value = 'Slug is required.'
    return
  }

  saving.value = true

  try {
    await api.put(
        `/admin/vehicle-models/${route.params.vehicleModel}`,
        {
          brand_id: Number(brandId.value),
          category_id: Number(categoryId.value),
          name: name.value.trim(),
          slug: slug.value.trim(),
          description: description.value.trim() || null,
        }
    )

    router.push({
      name: 'admin-vehicle-models',
      params: {
        vehicleModel: route.params.vehicleModel,
      },
    })
  } catch (err) {
    console.error('UPDATE VEHICLE MODEL ERROR:', err)

    error.value =
        err.response?.data?.message ||
        err.message ||
        'Failed to update vehicle model.'
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <section class="mx-auto max-w-4xl px-8 py-12">

    <div class="flex items-end justify-between gap-6">

      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-white/30">
          Catalog / Vehicle Models
        </p>

        <h1 class="mt-3 text-4xl font-black tracking-[-0.04em]">
          Edit Vehicle Model
        </h1>

        <p class="mt-3 text-sm text-white/40">
          Update the model information, brand, category, or description.
        </p>
      </div>

      <RouterLink
          :to="{
              name: 'admin-vehicle-models',
              params: {
                  vehicleModel: route.params.vehicleModel,
              },
          }"
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
        @submit.prevent="updateVehicleModel"
        class="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
    >

      <div class="grid gap-6 sm:grid-cols-2">

        <div>
          <label class="text-xs text-white/40">
            Model Name
          </label>

          <input
              v-model="name"
              type="text"
              placeholder="Lamborghini Revuelto"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />
        </div>

        <div>
          <label class="text-xs text-white/40">
            Slug
          </label>

          <input
              v-model="slug"
              type="text"
              placeholder="lamborghini-revuelto"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />
        </div>

        <div>
          <label class="text-xs text-white/40">
            Brand
          </label>

          <select
              v-model="brandId"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="">
              Select Brand
            </option>

            <option
                v-for="brand in brands"
                :key="brand.id"
                :value="brand.id"
            >
              {{ brand.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="text-xs text-white/40">
            Category
          </label>

          <select
              v-model="categoryId"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="">
              Select Category
            </option>

            <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="sm:col-span-2">
          <label class="text-xs text-white/40">
            Description
          </label>

          <textarea
              v-model="description"
              rows="6"
              placeholder="Describe this vehicle model..."
              class="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20"
          ></textarea>
        </div>

      </div>

      <div class="mt-8 flex justify-end gap-3">

        <RouterLink
            :to="{
                name: 'admin-vehicle-models-show',
                params: {
                    vehicleModel: route.params.vehicleModel,
                },
            }"
            class="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          Cancel
        </RouterLink>

        <button
            type="submit"
            :disabled="saving"
            class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>

      </div>

    </form>

  </section>
</template>