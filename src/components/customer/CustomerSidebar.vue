<script setup>
import { useAuthStore } from '@/stores/auth.js'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const authStore = useAuthStore()
</script>

<template>
  <Teleport to="body">

    <!-- Overlay -->
    <Transition name="fade">
      <div
          v-if="open"
          @click="emit('close')"
          class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
    </Transition>

    <!-- Sidebar -->
    <Transition name="slide">
      <aside
          v-if="open"
          class="fixed inset-y-0 left-0 z-50 flex w-[320px] flex-col border-r border-white/10 bg-[#0b0c0f] shadow-2xl"
      >

        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 px-7 py-6">

          <span class="text-lg font-black tracking-[0.3em] text-white">
            NITRO
          </span>

          <button
              type="button"
              @click="emit('close')"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:bg-white hover:text-black"
          >
            ×
          </button>

        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto px-4 py-6">

          <!-- Public Navigation -->
          <p
              class="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/25"
          >
            Explore
          </p>

          <div class="space-y-1">

            <RouterLink
                :to="{ name: 'dashboard' }"
                @click="emit('close')"
                class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Home
            </RouterLink>

            <RouterLink
                :to="{ name: 'vehicles' }"
                @click="emit('close')"
                class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Vehicles
            </RouterLink>

            <RouterLink
                :to="{ name: 'offers' }"
                @click="emit('close')"
                class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Offers
            </RouterLink>

            <RouterLink
                :to="{ name: 'compare' }"
                @click="emit('close')"
                class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Compare
            </RouterLink>

          </div>

          <!-- Authenticated -->
          <template v-if="authStore.isAuthenticated">

            <!-- Account -->
            <div class="my-6 border-t border-white/10" />

            <p
                class="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/25"
            >
              Account
            </p>

            <div class="space-y-1">

              <RouterLink
                  :to="{ name: 'reservations' }"
                  @click="emit('close')"
                  class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                My Reservations
              </RouterLink>

              <RouterLink
                  :to="{ name: 'pre-orders' }"
                  @click="emit('close')"
                  class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                My Pre-orders
              </RouterLink>

              <RouterLink
                  :to="{ name: 'deals' }"
                  @click="emit('close')"
                  class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                My Deals
              </RouterLink>

            </div>

            <!-- Profile -->
            <div class="my-6 border-t border-white/10" />

            <p
                class="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/25"
            >
              Profile
            </p>

            <div class="space-y-1">

              <RouterLink
                  :to="{ name: 'profile' }"
                  @click="emit('close')"
                  class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                Profile
              </RouterLink>

              <RouterLink
                  :to="{ name: 'settings' }"
                  @click="emit('close')"
                  class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                Settings
              </RouterLink>

            </div>

            <!-- Admin -->
            <template v-if="authStore.isAdmin">

              <div class="my-6 border-t border-white/10" />

              <p
                  class="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/25"
              >
                Administration
              </p>

              <RouterLink
                  :to="{ name: 'admin-dashboard' }"
                  @click="emit('close')"
                  class="block rounded-xl bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
              >
                Admin Panel
              </RouterLink>

            </template>

          </template>

          <!-- Guest -->
          <template v-else>

            <div class="my-6 border-t border-white/10" />

            <p
                class="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/25"
            >
              Account
            </p>

            <div class="space-y-1">

              <RouterLink
                  :to="{ name: 'login' }"
                  @click="emit('close')"
                  class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                Sign in
              </RouterLink>

              <RouterLink
                  :to="{ name: 'register' }"
                  @click="emit('close')"
                  class="block rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
              >
                Sign up
              </RouterLink>

            </div>

            <!-- Guest Message -->
            <div class="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5">

              <p
                  class="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/30"
              >
                Unlock Nitro
              </p>

              <p class="mt-3 text-sm leading-6 text-white/55">
                Create an account to access the full Nitro experience,
                including buying, selling, reservations and account features.
              </p>

              <RouterLink
                  :to="{ name: 'register' }"
                  @click="emit('close')"
                  class="mt-5 block rounded-xl bg-white px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white/85"
              >
                Create Account
              </RouterLink>

            </div>

          </template>

        </nav>

        <!-- Bottom -->
        <div
            v-if="authStore.isAuthenticated"
            class="border-t border-white/10 p-4"
        >

          <div class="mb-3 px-4 py-2">

            <p class="text-[9px] uppercase tracking-[0.2em] text-white/25">
              Signed in as
            </p>

            <p class="mt-1 truncate text-xs text-white/50">
              {{ authStore.user?.name || authStore.user?.email }}
            </p>

          </div>

          <button
              type="button"
              @click="authStore.logout"
              class="w-full rounded-xl px-4 py-3 text-left text-sm text-red-400/80 transition hover:bg-red-500/10 hover:text-red-400"
          >
            Sign out
          </button>

        </div>

      </aside>
    </Transition>

  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>