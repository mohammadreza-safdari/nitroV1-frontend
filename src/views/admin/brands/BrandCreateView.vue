<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const name = ref('')
const slug = ref('')

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

watch(name, (value) => {
  slug.value = generateSlug(value)
})

async function createBrand() {
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
    const response = await api.post('/admin/brands', {
      name: name.value.trim(),
      slug: slug.value.trim(),
    })

    const brand = response.data.brand

    router.push({
      name: 'admin-brands',
      params: {
        brand: brand.id,
      },
    })
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to create brand.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-8 py-12">

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
        Add Brand
      </h1>

      <p class="mt-3 text-sm text-white/40">
        Add a new vehicle manufacturer to Nitro.
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
        @submit.prevent="createBrand"
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
            placeholder="e.g. Lamborghini"
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
            placeholder="e.g. lamborghini"
            class="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
        />

        <p class="mt-2 text-xs text-white/25">
          Used as the unique URL-friendly identifier for this brand.
        </p>

      </label>

      <!-- Actions -->
      <div class="mt-8 flex justify-end gap-3">

        <RouterLink
            :to="{ name: 'admin-brands' }"
            class="rounded-xl px-4 py-3 text-sm text-white/45 transition hover:text-white"
        >
          Cancel
        </RouterLink>

        <button
            type="submit"
            :disabled="saving"
            class="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ saving ? 'Creating...' : 'Create Brand' }}
        </button>

      </div>

    </form>

  </section>
</template>