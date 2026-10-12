<script setup>
import { ref } from 'vue'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

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

    <AdminNavbar
        @toggle-sidebar="toggleSidebar"
    />

    <AdminSidebar
        :open="sidebarOpen"
        @close="closeSidebar"
    />

    <main>
      <RouterView />
    </main>

  </div>
</template>