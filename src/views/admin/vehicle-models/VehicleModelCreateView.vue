<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '@/services/api'

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

function generateSlug(value) {
  return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
}

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

async function loadOptions() {
  loading.value = true
  error.value = ''

  try {
    const [brandsResponse, categoriesResponse] = await Promise.all([
      api.get('/admin/brands'),
      api.get('/admin/categories'),
    ])

    brands.value = brandsResponse.data.brands

    categories.value = flattenCategories(
        categoriesResponse.data.categories
    )
  } catch (err) {
    console.error('VEHICLE MODEL OPTIONS ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to load brands and categories.'
  } finally {
    loading.value = false
  }
}

function updateSlug() {
  slug.value = generateSlug(name.value)
}

async function createVehicleModel() {
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
    const response = await api.post('/admin/vehicle-models', {
      brand_id: Number(brandId.value),
      category_id: Number(categoryId.value),
      name: name.value.trim(),
      slug: slug.value.trim(),
      description: description.value.trim() || null,
    })

    const vehicleModel = response.data.vehicle_model

    router.push({
      name: 'admin-vehicle-models-show',
      params: {
        vehicleModel: vehicleModel.id,
      },
    })
  } catch (err) {
    console.error('CREATE VEHICLE MODEL ERROR:', err)

    error.value =
        err.response?.data?.message ||
        'Failed to create vehicle model.'
  } finally {
    saving.value = false
  }
}

onMounted(loadOptions)
</script>

<template>
  <section class="mx-auto max-w-4xl px-8 py-12">

    <!-- Header -->
    <div class="flex items-end justify-between gap-6">

      <div>
        <p
            class="text-xs uppercase tracking-[0.3em] text-white/30"
        >
          Catalog / Vehicle Models
        </p>

        <h1
            class="mt-3 text-4xl font-black tracking-[-0.04em]"
        >
          Add Vehicle Model
        </h1>

        <p class="mt-3 text-sm text-white/40">
          Create a vehicle model and connect it to a brand and category.
        </p>
      </div>

      <RouterLink
          :to="{ name: 'admin-vehicle-models' }"
          class="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
      >
        Cancel
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
      Loading...
    </div>

    <!-- Form -->
    <form
        v-else
        @submit.prevent="createVehicleModel"
        class="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
    >

      <div class="grid gap-6 sm:grid-cols-2">

        <!-- Name -->
        <div>
          <label class="text-xs text-white/40">
            Model Name
          </label>

          <input
              v-model="name"
              type="text"
              placeholder="Lamborghini Revuelto"
              @input="updateSlug"
              class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />
        </div>

        <!-- Slug -->
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

        <!-- Brand -->
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

        <!-- Category -->
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

        <!-- Description -->
        <div class="sm:col-span-2">
          <label class="text-xs text-white/40">
            Description
          </label>

          <textarea
              v-model="description"
              rows="6"
              placeholder="Describe this vehicle model..."
              class="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          ></textarea>
        </div>

      </div>

      <!-- Actions -->
      <div class="mt-8 flex justify-end gap-3">

        <RouterLink
            :to="{ name: 'admin-vehicle-models' }"
            class="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          Cancel
        </RouterLink>

        <button
            type="submit"
            :disabled="saving"
            class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ saving ? 'Creating...' : 'Create Vehicle Model' }}
        </button>

      </div>

    </form>

  </section>
</template>