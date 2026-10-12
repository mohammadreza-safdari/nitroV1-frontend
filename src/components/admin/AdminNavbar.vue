<script setup>
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const emit = defineEmits(['toggle-sidebar'])
</script>

<template>
  <header class="border-b border-white/10 bg-[#08090b]/90 backdrop-blur-xl">
    <div class="flex h-20 items-center justify-between px-8">

      <!-- Left -->
      <div class="flex items-center gap-8">

        <RouterLink
            :to="{ name: 'admin-dashboard' }"
            class="text-xl font-black tracking-[0.3em] text-white"
        >
          NITRO
        </RouterLink>

        <span class="hidden h-5 w-px bg-white/10 sm:block" />

        <span class="hidden text-xs font-medium uppercase tracking-[0.25em] text-white/30 sm:block">
          Admin Panel
        </span>

      </div>

      <!-- Right -->
      <div class="flex items-center gap-3">

        <button
            class="hidden rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/55 transition hover:bg-white/10 hover:text-white md:block"
        >
          Search
        </button>

        <button
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white/60 transition hover:bg-white hover:text-black"
        >
          ♧
        </button>

        <button
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white transition hover:bg-white hover:text-black"
        >
          {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
        </button>

        <button
            @click="emit('toggle-sidebar')"
            class="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white transition hover:bg-white hover:text-black"
            aria-label="Open admin menu"
        >
          ☰
        </button>

      </div>

    </div>
  </header>
</template>