<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'

const categories = ref([])
const loading = ref(true)
const error = ref('')

async function loadCategories() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/admin/categories')

    categories.value = response.data.categories
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to load categories.'
  } finally {
    loading.value = false
  }
}

async function removeCategory(category) {
  const confirmed = window.confirm(
      `Delete "${category.name}"?`
  )

  if (!confirmed) {
    return
  }

  error.value = ''

  try {
    await api.delete(`/admin/categories/${category.id}`)

    await loadCategories()
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to delete category.'
  }
}

onMounted(loadCategories)
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-12">

    <!-- Header -->
    <div
        class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
    >

      <div>

        <p
            class="text-xs uppercase tracking-[0.3em] text-white/30"
        >
          Catalog
        </p>

        <h1
            class="mt-3 text-4xl font-black tracking-[-0.04em]"
        >
          Categories
        </h1>

        <p class="mt-3 text-sm text-white/40">
          Manage the vehicle categories used throughout Nitro.
        </p>

      </div>

      <RouterLink
          :to="{ name: 'admin-categories-create' }"
          class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
      >
        Add Category
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
      Loading categories...
    </div>

    <!-- Empty -->
    <div
        v-else-if="categories.length === 0"
        class="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center"
    >

      <p class="text-sm text-white/40">
        No categories have been added yet.
      </p>

      <RouterLink
          :to="{ name: 'admin-categories-create' }"
          class="mt-5 inline-block text-sm text-white/70 transition hover:text-white"
      >
        Add your first category →
      </RouterLink>

    </div>

    <!-- Categories -->
    <div
        v-else
        class="mt-10 overflow-hidden rounded-2xl border border-white/10"
    >

      <!-- Count -->
      <div class="border-b border-white/10 px-6 py-4">

        <p
            class="text-[10px] uppercase tracking-[0.25em] text-white/25"
        >
          {{ categories.length }} Root Categories
        </p>

      </div>

      <!-- Rows -->
      <div class="divide-y divide-white/10">

        <div
            v-for="category in categories"
            :key="category.id"
            class="px-6 py-5"
        >

          <!-- Parent -->
          <div class="flex items-center justify-between gap-6">

            <RouterLink
                :to="{
                  name: 'admin-categories-show',
                  params: {
                    category: category.id,
                  },
                }"
                class="min-w-0"
            >

              <h2
                  class="text-sm font-medium text-white/80 transition hover:text-white"
              >
                {{ category.name }}
              </h2>

              <p class="mt-1 text-xs text-white/30">
                Category #{{ category.id }}
              </p>

            </RouterLink>

            <div class="flex items-center gap-2">

              <RouterLink
                  :to="{
                    name: 'admin-categories-show',
                    params: {
                      category: category.id,
                    },
                  }"
                  class="rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white"
              >
                View
              </RouterLink>

              <RouterLink
                  :to="{
                    name: 'admin-categories-edit',
                    params: {
                      category: category.id,
                    },
                  }"
                  class="rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/5 hover:text-white"
              >
                Edit
              </RouterLink>

              <button
                  type="button"
                  @click="removeCategory(category)"
                  class="rounded-lg px-3 py-2 text-xs text-red-300/60 transition hover:bg-red-400/10 hover:text-red-300"
              >
                Delete
              </button>

            </div>

          </div>

          <!-- Children -->
          <div
              v-if="category.children?.length"
              class="mt-4 ml-5 border-l border-white/10 pl-5"
          >

            <div
                v-for="child in category.children"
                :key="child.id"
                class="flex items-center justify-between gap-6 py-3"
            >

              <RouterLink
                  :to="{
                    name: 'admin-categories-show',
                    params: {
                      category: child.id,
                    },
                  }"
                  class="min-w-0"
              >

                <h3
                    class="text-sm text-white/55 transition hover:text-white"
                >
                  {{ child.name }}
                </h3>

                <p class="mt-1 text-xs text-white/20">
                  Category #{{ child.id }}
                </p>

              </RouterLink>

              <div class="flex items-center gap-2">

                <RouterLink
                    :to="{
                      name: 'admin-categories-show',
                      params: {
                        category: child.id,
                      },
                    }"
                    class="rounded-lg px-3 py-2 text-xs text-white/35 transition hover:bg-white/5 hover:text-white"
                >
                  View
                </RouterLink>

                <RouterLink
                    :to="{
                      name: 'admin-categories-edit',
                      params: {
                        category: child.id,
                      },
                    }"
                    class="rounded-lg px-3 py-2 text-xs text-white/35 transition hover:bg-white/5 hover:text-white"
                >
                  Edit
                </RouterLink>

                <button
                    type="button"
                    @click="removeCategory(child)"
                    class="rounded-lg px-3 py-2 text-xs text-red-300/50 transition hover:bg-red-400/10 hover:text-red-300"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  </section>
</template>