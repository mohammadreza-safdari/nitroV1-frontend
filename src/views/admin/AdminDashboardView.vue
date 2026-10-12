<script setup>
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const managementItems = [
  {
    name: 'admin-categories',
    label: 'Categories',
    description: 'Manage vehicle categories',
  },
  {
    name: 'admin-brands',
    label: 'Brands',
    description: 'Manage vehicle brands',
  },
  {
    name: 'admin-vehicle-models',
    label: 'Vehicle Models',
    description: 'Manage vehicle models',
  },
  {
    name: 'admin-vehicles',
    label: 'Vehicles',
    description: 'Manage vehicle inventory',
  },
  {
    name: 'admin-reservations',
    label: 'Reservations',
    description: 'Review customer reservations',
  },
  {
    name: 'admin-pre-orders',
    label: 'Pre-orders',
    description: 'Manage customer pre-orders',
  },
  {
    name: 'admin-deals',
    label: 'Deals',
    description: 'Manage customer deals',
  },

  {
    name: 'admin-discount-codes',
    label: 'Discount Codes',
    description: 'Manage promotional discounts',
  },
]
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-20">

    <!-- Header -->
    <div class="mb-12">
      <p class="text-xs uppercase tracking-[0.3em] text-white/30">
        Admin Dashboard
      </p>

      <h1 class="mt-4 text-5xl font-black tracking-[-0.04em]">
        Welcome{{ authStore.user?.name ? `, ${authStore.user.name}` : '' }}.
      </h1>

      <p class="mt-5 max-w-xl text-sm leading-7 text-white/45">
        Manage vehicles, reservations, deals, payments, and other Nitro
        operations from the administration panel.
      </p>
    </div>


    <!-- Management -->
    <div>

      <div class="mb-5">
        <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-white/25">
          Management
        </p>

        <div class="mt-3 h-px bg-white/10" />
      </div>


      <!-- Management Items -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <RouterLink
            v-for="item in managementItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
        >

          <div class="flex items-start justify-between gap-4">

            <div class="min-w-0">

              <h2
                  class="text-xl font-semibold text-white/80 transition group-hover:text-white"
              >
                {{ item.label }}
              </h2>

              <p class="mt-2 text-sm leading-6 text-white/35">
                {{ item.description }}
              </p>

            </div>

            <span
                class="mt-1 text-lg text-white/20 transition group-hover:translate-x-1 group-hover:text-white/60"
            >
              →
            </span>

          </div>

        </RouterLink>

      </div>

    </div>

  </section>
</template>