<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const brand = ref(null)

const name = ref('')
const slug = ref('')

const loading = ref(true)
const saving = ref(false)
const error = ref('')

async function loadBrand() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
        `/admin/brands/${route.params.brand}`
    )

    brand.value = response.data.brand
    name.value = response.data.brand.name
    slug.value = response.data.brand.slug
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to load brand.'
  } finally {
    loading.value = false
  }
}

async function updateBrand() {
  if (!name.value.trim()) {
    error.value = 'Brand name is required.'
    return
  }

  if (!slug.value.trim()) {
    error.value = 'Brand slug is required.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const response = await api.put(
        `/admin/brands/${route.params.brand}`,
        {
          name: name.value.trim(),
          slug: slug.value.trim(),
        }
    )

    const updatedBrand = response.data.brand

    router.push({
      name: 'admin-brands',
      params: {
        brand: updatedBrand.id,
      },
    })
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to update brand.'
  } finally {
    saving.value = false
  }
}

onMounted(loadBrand)
</script>

<template>
  <section class="mx-auto max-w-3xl px-8 py-12">

    <!-- Loading -->
    <div
        v-if="loading"
        class="text-sm text-white/35"
    >
      Loading brand...
    </div>

    <!-- Error -->
    <div
        v-else-if="error && !brand"
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
          Catalog / Brands
        </p>

        <h1
            class="mt-3 text-4xl font-black tracking-[-0.04em]"
        >
          Edit Brand
        </h1>

        <p class="mt-3 text-sm text-white/40">
          Update {{ brand?.name }}.
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
          @submit.prevent="updateBrand"
      >

        <!-- Name -->
        <label class="block">

          <span class="text-xs text-white/45">
            Brand Name
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
            Unique URL-friendly identifier for this brand.
          </p>

        </label>

        <!-- Actions -->
        <div class="mt-8 flex justify-end gap-3">

          <RouterLink
              :to="{
                name: 'admin-brands-show',
                params: {
                  brand: route.params.brand,
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