<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()

const category = ref(null)

const loading = ref(true)
const error = ref('')

async function loadCategory() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
        `/admin/categories/${route.params.category}`
    )

    category.value = response.data.category
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to load category.'
  } finally {
    loading.value = false
  }
}

onMounted(loadCategory)
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-12">

    <!-- Loading -->
    <div
        v-if="loading"
        class="text-sm text-white/35"
    >
      Loading category...
    </div>

    <!-- Error -->
    <div
        v-else-if="error"
        class="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <!-- Category -->
    <template v-else-if="category">

      <!-- Header -->
      <div
          class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >

        <div>

          <p
              class="text-xs uppercase tracking-[0.3em] text-white/30"
          >
            Catalog / Categories
          </p>

          <h1
              class="mt-3 text-4xl font-black tracking-[-0.04em]"
          >
            {{ category.name }}
          </h1>

          <p class="mt-3 text-sm text-white/40">
            Category #{{ category.id }}
          </p>

        </div>

        <div class="flex items-center gap-3">

          <RouterLink
              :to="{ name: 'admin-categories' }"
              class="rounded-xl px-4 py-3 text-sm text-white/45 transition hover:bg-white/5 hover:text-white"
          >
            Back
          </RouterLink>

          <RouterLink
              :to="{
                name: 'admin-categories-edit',
                params: {
                  category: category.id,
                },
              }"
              class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Edit Category
          </RouterLink>

        </div>

      </div>

      <!-- Overview -->
      <div class="mt-10 grid gap-4 sm:grid-cols-3">

        <!-- ID -->
        <div
            class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >

          <p
              class="text-[10px] uppercase tracking-[0.25em] text-white/25"
          >
            Category ID
          </p>

          <p class="mt-3 text-2xl font-semibold">
            #{{ category.id }}
          </p>

        </div>

        <!-- Parent -->
        <div
            class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >

          <p
              class="text-[10px] uppercase tracking-[0.25em] text-white/25"
          >
            Parent
          </p>

          <RouterLink
              v-if="category.parent"
              :to="{
                name: 'admin-categories-show',
                params: {
                  category: category.parent.id,
                },
              }"
              class="mt-3 block text-lg font-semibold text-white/75 transition hover:text-white"
          >
            {{ category.parent.name }}
          </RouterLink>

          <p
              v-else
              class="mt-3 text-lg font-semibold text-white/50"
          >
            Root Category
          </p>

        </div>

        <!-- Models -->
        <div
            class="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >

          <p
              class="text-[10px] uppercase tracking-[0.25em] text-white/25"
          >
            Vehicle Models
          </p>

          <p class="mt-3 text-2xl font-semibold">
            {{ category.vehicle_models?.length || 0 }}
          </p>

        </div>

      </div>

      <!-- Children -->
      <div class="mt-10">

        <div class="mb-5">

          <p
              class="text-[10px] font-medium uppercase tracking-[0.25em] text-white/25"
          >
            Child Categories
          </p>

          <div class="mt-3 h-px bg-white/10" />

        </div>

        <div
            v-if="!category.children?.length"
            class="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center"
        >
          <p class="text-sm text-white/40">
            This category has no child categories.
          </p>
        </div>

        <div
            v-else
            class="overflow-hidden rounded-2xl border border-white/10"
        >

          <div class="divide-y divide-white/10">

            <div
                v-for="child in category.children"
                :key="child.id"
                class="flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-white/[0.03]"
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

                <h2 class="text-sm font-medium text-white/75">
                  {{ child.name }}
                </h2>

                <p class="mt-1 text-xs text-white/25">
                  Category #{{ child.id }}
                </p>

              </RouterLink>

              <RouterLink
                  :to="{
                    name: 'admin-categories-edit',
                    params: {
                      category: child.id,
                    },
                  }"
                  class="rounded-lg px-3 py-2 text-xs text-white/40 transition hover:bg-white/5 hover:text-white"
              >
                Edit
              </RouterLink>

            </div>

          </div>

        </div>

      </div>

      <!-- Vehicle Models -->
      <div class="mt-10">

        <div class="mb-5">

          <p
              class="text-[10px] font-medium uppercase tracking-[0.25em] text-white/25"
          >
            Vehicle Models
          </p>

          <div class="mt-3 h-px bg-white/10" />

        </div>

        <div
            v-if="!category.vehicle_models?.length"
            class="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center"
        >
          <p class="text-sm text-white/40">
            No vehicle models are associated with this category yet.
          </p>
        </div>

        <div
            v-else
            class="overflow-hidden rounded-2xl border border-white/10"
        >

          <div class="divide-y divide-white/10">

            <div
                v-for="model in category.vehicle_models"
                :key="model.id"
                class="flex items-center justify-between gap-6 px-6 py-5"
            >

              <div>

                <h2 class="text-sm font-medium text-white/75">
                  {{ model.name }}
                </h2>

                <p class="mt-1 text-xs text-white/25">
                  Vehicle Model #{{ model.id }}
                </p>

              </div>

              <span class="text-xs text-white/25">
                Vehicle Model
              </span>

            </div>

          </div>

        </div>

      </div>

    </template>

  </section>
</template>