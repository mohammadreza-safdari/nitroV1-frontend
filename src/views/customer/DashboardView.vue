<script setup>
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
</script>

<template>
  <section class="mx-auto max-w-7xl px-8 py-20">

    <div class="mb-12">
      <p class="text-xs uppercase tracking-[0.3em] text-white/30">
        Dashboard
      </p>

      <h1 class="mt-4 text-5xl font-black tracking-[-0.04em]">
        Welcome{{ authStore.user?.name ? `, ${authStore.user.name}` : '' }}.
      </h1>

      <p class="mt-5 max-w-xl text-sm leading-7 text-white/45">
        Explore vehicles, manage your reservations, track your purchases,
        and discover your next machine.
      </p>
    </div>

    <div class="grid gap-5 md:grid-cols-3">

      <RouterLink
          :to="{ name: 'vehicles' }"
          class="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
      >
        <p class="text-xs uppercase tracking-[0.2em] text-white/30">
          Explore
        </p>

        <h2 class="mt-4 text-xl font-semibold">
          Vehicles
        </h2>

        <p class="mt-2 text-sm leading-6 text-white/40">
          Discover cars and motorcycles available through Nitro.
        </p>

        <span class="mt-6 block text-sm text-white/50 transition group-hover:text-white">
          Browse vehicles →
        </span>
      </RouterLink>

      <RouterLink
          :to="{ name: 'compare' }"
          class="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
      >
        <p class="text-xs uppercase tracking-[0.2em] text-white/30">
          Compare
        </p>

        <h2 class="mt-4 text-xl font-semibold">
          Compare Vehicles
        </h2>

        <p class="mt-2 text-sm leading-6 text-white/40">
          Compare your favorite machines side by side.
        </p>

        <span class="mt-6 block text-sm text-white/50 transition group-hover:text-white">
          Start comparing →
        </span>
      </RouterLink>

      <RouterLink
          :to="{ name: 'offers' }"
          class="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
      >
        <p class="text-xs uppercase tracking-[0.2em] text-white/30">
          Discover
        </p>

        <h2 class="mt-4 text-xl font-semibold">
          Special Offers
        </h2>

        <p class="mt-2 text-sm leading-6 text-white/40">
          Explore current offers and featured vehicles.
        </p>

        <span class="mt-6 block text-sm text-white/50 transition group-hover:text-white">
          View offers →
        </span>
      </RouterLink>

    </div>

  </section>
</template>