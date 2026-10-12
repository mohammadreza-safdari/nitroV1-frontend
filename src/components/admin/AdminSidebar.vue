<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const managementItems = [
  {
    name: 'admin-categories',
    label: 'Categories',
  },
  {
    name: 'admin-brands',
    label: 'Brands',
  },
  {
    name: 'admin-vehicle-models',
    label: 'Vehicle Models',
  },
  {
    name: 'admin-vehicles',
    label: 'Vehicles',
  },
  {
    name: 'admin-reservations',
    label: 'Reservations',
  },
  {
    name: 'admin-pre-orders',
    label: 'Pre-orders',
  },
  {
    name: 'admin-deals',
    label: 'Deals',
  },
  {
    name: 'admin-discount-codes',
    label: 'Discount Codes',
  },
]
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
        <div
            class="flex items-center justify-between border-b border-white/10 px-7 py-6"
        >

          <div>
            <p class="text-lg font-black tracking-[0.3em]">
              NITRO
            </p>

            <p
                class="mt-1 text-[9px] uppercase tracking-[0.25em] text-white/25"
            >
              Administration
            </p>
          </div>

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

          <!-- Management -->
          <p
              class="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/25"
          >
            Management
          </p>

          <div class="space-y-1">

            <!-- Dashboard -->
            <RouterLink
                :to="{ name: 'admin-dashboard' }"
                @click="emit('close')"
                class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Dashboard
            </RouterLink>

            <!-- Management Items -->
            <RouterLink
                v-for="item in managementItems"
                :key="item.name"
                :to="{ name: item.name }"
                @click="emit('close')"
                class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              {{ item.label }}
            </RouterLink>

          </div>

          <!-- Divider -->
          <div class="my-6 border-t border-white/10" />

          <!-- System -->
          <p
              class="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/25"
          >
            System
          </p>

          <div class="space-y-1">

            <RouterLink
                :to="{ name: 'admin-settings' }"
                @click="emit('close')"
                class="block rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Settings
            </RouterLink>

          </div>

        </nav>

        <!-- Bottom -->
        <div class="border-t border-white/10 p-4">

          <RouterLink
              :to="{ name: 'dashboard' }"
              @click="emit('close')"
              class="mb-1 block rounded-xl px-4 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            Back to Store
          </RouterLink>

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