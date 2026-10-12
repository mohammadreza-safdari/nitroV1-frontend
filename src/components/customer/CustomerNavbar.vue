<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const emit = defineEmits(['toggle-sidebar'])

const userInitial = computed(() => {
  return authStore.user?.name?.trim()?.charAt(0)?.toUpperCase() || '?'
})

const menuOpen = ref(false)
</script>

<template>
  <header class="border-b border-blue-400/20 bg-[#071a35]/95 backdrop-blur-xl">
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">

      <!-- Logo -->
      <RouterLink
          :to="{ name: 'welcome' }"
          class="text-xl font-black tracking-[0.35em] text-white"
      >
        NITRO
      </RouterLink>

      <!-- Main Navigation -->
      <nav class="hidden items-center gap-8 md:flex">
        <RouterLink
            :to="{ name: 'dashboard' }"
            class="text-sm text-white/55 transition hover:text-white"
        >
          Home
        </RouterLink>

        <RouterLink
            :to="{ name: 'vehicles' }"
            class="text-sm text-white/55 transition hover:text-white"
        >
          Vehicles
        </RouterLink>

        <RouterLink
            :to="{ name: 'compare' }"
            class="text-sm text-white/55 transition hover:text-white"
        >
          Compare
        </RouterLink>

        <RouterLink
            :to="{ name: 'offers' }"
            class="text-sm text-white/55 transition hover:text-white"
        >
          Offers
        </RouterLink>
      </nav>

      <!-- Right Actions -->
      <div class="flex items-center gap-3">

        <!-- Guest -->
        <template v-if="!authStore.isAuthenticated">
          <RouterLink
              :to="{ name: 'login' }"
              class="rounded-full px-5 py-2.5 text-sm text-white/65 transition hover:text-white"
          >
            Sign in
          </RouterLink>

          <RouterLink
              :to="{ name: 'register' }"
              class="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Sign up
          </RouterLink>
        </template>

        <!-- Authenticated -->
        <template v-else>
          <RouterLink
              :to="{ name: 'profile' }"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white transition hover:bg-white/10"
              aria-label="Profile"
          >
            {{ userInitial }}
          </RouterLink>
        </template>

        <!-- Hamburger -->
        <button
            @click="emit('toggle-sidebar')"
            class="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#4da3ff]/20 bg-[#0b2a4d] text-white transition hover:bg-[#4da3ff] hover:text-black"
            aria-label="Open menu"
        >
          <span class="text-lg">☰</span>
        </button>

      </div>

    </div>
  </header>
</template>