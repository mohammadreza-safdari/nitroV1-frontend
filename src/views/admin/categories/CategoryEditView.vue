<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const category = ref(null)

const name = ref('')
const slug = ref('')
const parentId = ref('')

const categories = ref([])

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

async function loadCategory() {
  loading.value = true
  error.value = ''

  try {
    const [categoryResponse, categoriesResponse] = await Promise.all([
      api.get(`/admin/categories/${route.params.category}`),
      api.get('/admin/categories'),
    ])

    category.value = categoryResponse.data.category

    name.value = category.value.name
    slug.value = category.value.slug
    parentId.value = category.value.parent_id
        ? String(category.value.parent_id)
        : ''

    const allCategories = flattenCategories(
        categoriesResponse.data.categories
    )

    categories.value = allCategories.filter(
        item => item.id !== category.value.id
    )
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to load category.'
  } finally {
    loading.value = false
  }
}

async function updateCategory() {
  if (!name.value.trim()) {
    error.value = 'Category name is required.'
    return
  }

  if (!slug.value.trim()) {
    error.value = 'Category slug is required.'
    return
  }

  if (
      parentId.value &&
      Number(parentId.value) === category.value.id
  ) {
    error.value = 'A category cannot be its own parent.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const response = await api.put(
        `/admin/categories/${route.params.category}`,
        {
          name: name.value.trim(),
          slug: slug.value.trim(),
          parent_id: parentId.value
              ? Number(parentId.value)
              : null,
        }
    )

    const updatedCategory = response.data.category

    router.push({
      name: 'admin-categories-show',
      params: {
        category: updatedCategory.id,
      },
    })
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to update category.'
  } finally {
    saving.value = false
  }
}

onMounted(loadCategory)
</script>

<template>
  <section class="mx-auto max-w-3xl px-8 py-12">

    <!-- Loading -->
    <div
        v-if="loading"
        class="text-sm text-white/35"
    >
      Loading category...
    </div>

    <!-- Error -->
    <div
        v-else-if="error && !category"
        class="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <!-- Form -->
    <template v-else>

      <!-- Header -->
      <div>

        <p
            class="text-xs uppercase tracking-[0.3em] text-white/30"
        >
          Catalog / Categories
        </p>

        <h1
            class="mt-3 text-4xl font-black tracking-[-0.04em]"
        >
          Edit Category
        </h1>

        <p class="mt-3 text-sm text-white/40">
          Update {{ category?.name }}.
        </p>

      </div>

      <!-- Error -->
      <div
          v-if="error"
          class="mt-8 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300"
      >
        {{ error }}
      </div>

      <!-- Form -->
      <form
          class="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-7"
          @submit.prevent="updateCategory"
      >

        <!-- Name -->
        <label class="block">

          <span class="text-xs text-white/45">
            Category Name
          </span>

          <input
              v-model="name"
              type="text"
              required
              autocomplete="off"
              class="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />

        </label>

        <!-- Slug -->
        <label class="mt-6 block">

          <span class="text-xs text-white/45">
            Slug
          </span>

          <input
              v-model="slug"
              type="text"
              required
              autocomplete="off"
              class="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />

          <p class="mt-2 text-xs text-white/25">
            Unique URL-friendly identifier for this category.
          </p>

        </label>

        <!-- Parent -->
        <label class="mt-6 block">

          <span class="text-xs text-white/45">
            Parent Category
          </span>

          <select
              v-model="parentId"
              class="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
          >

            <option
                value=""
                class="bg-neutral-900"
            >
              None — Root Category
            </option>

            <option
                v-for="item in categories"
                :key="item.id"
                :value="item.id"
                class="bg-neutral-900"
            >
              {{ item.name }}
            </option>

          </select>

        </label>

        <!-- Actions -->
        <div class="mt-8 flex justify-end gap-3">

          <RouterLink
              :to="{
                name: 'admin-categories-show',
                params: {
                  category: route.params.category,
                },
              }"
              class="rounded-xl px-4 py-3 text-sm text-white/45 transition hover:text-white"
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

    </template>

  </section>
</template>