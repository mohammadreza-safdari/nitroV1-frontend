<script setup>
import { ref } from 'vue'
import CustomerNavbar from '@/components/customer/CustomerNavbar.vue'
import CustomerSidebar from '@/components/customer/CustomerSidebar.vue'

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-[#08090b] text-white">

    <CustomerNavbar
        @toggle-sidebar="toggleSidebar"
    />

    <CustomerSidebar
        :open="sidebarOpen"
        @close="closeSidebar"
    />

    <main>
      <RouterView />
    </main>

  </div>
</template>