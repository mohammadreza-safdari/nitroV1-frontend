<script setup>
import { useRouter } from 'vue-router'
import carImage from '@/assets/images/car-three.jpg'

const router = useRouter()

const goToLogin = () => {
  router.push({
    name: 'login',
  })
}

const goToRegister = () => {
  router.push({
    name: 'register',
  })
}
</script>

<template>
  <main class="min-h-screen overflow-hidden bg-[#08090b] text-white">

    <!-- Navigation -->
    <header class="absolute left-0 right-0 top-0 z-20">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-8 py-7">

        <button
            @click="router.push({ name: 'welcome' })"
            class="text-2xl font-black tracking-[0.35em]"
        >
          NITRO
        </button>

        <nav class="hidden items-center gap-10 text-sm text-white/60 md:flex">

          <a
              href="#"
              class="transition hover:text-white"
          >
            About
          </a>

          <button
              @click="goToRegister"
              class="transition hover:text-white"
          >
            Sign up
          </button>

          <button
              @click="goToLogin"
              class="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white hover:text-black"
          >
            Sign in
          </button>

        </nav>

        <!-- Mobile -->
        <button
            @click="goToLogin"
            class="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white hover:text-black md:hidden"
        >
          Sign in
        </button>

      </div>
    </header>

    <!-- Hero -->
    <section class="relative flex min-h-screen items-center">

      <!-- Background -->
      <div class="absolute inset-0">

        <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(255,255,255,0.09),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.04),transparent_30%)]"
        />

        <div
            class="absolute right-[-15%] top-[8%] h-[650px] w-[650px] rounded-full bg-white/[0.025] blur-3xl"
        />

        <div
            class="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#08090b] to-transparent"
        />

      </div>

      <!-- Decorative Grid -->
      <div
          class="absolute inset-0 opacity-[0.035]"
          style="
          background-image:
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
          background-size: 80px 80px;
        "
      />

      <!-- Hero Content -->
      <div class="relative z-10 mx-auto w-full max-w-7xl px-8 pt-20">

        <div class="max-w-3xl">

          <div class="mb-7 flex items-center gap-4">

            <span class="h-px w-12 bg-white/50"></span>

            <span
                class="text-xs font-semibold uppercase tracking-[0.35em] text-white/50"
            >
              The Automotive Marketplace
            </span>

          </div>

          <h1
              class="text-6xl font-black leading-[0.88] tracking-[-0.055em] sm:text-7xl lg:text-8xl"
          >
            YOUR NEXT

            <span class="block text-white/35">
              MACHINE.
            </span>
          </h1>

          <p
              class="mt-8 max-w-xl text-base leading-8 text-white/55 sm:text-lg"
          >
            Discover exceptional cars and motorcycles.
            Buy, reserve, or pre-order your next machine
            through a smarter automotive experience.
          </p>

          <div class="mt-10">

            <button
                @click="router.push({ name: 'dashboard' })"
                class="group flex items-center gap-4 rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Explore Vehicles

              <span
                  class="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </button>

          </div>

        </div>

      </div>

      <!-- Vehicle Visual -->
      <!-- Vehicle Visual -->
      <div
          class="pointer-events-none absolute bottom-[8%] right-[-8%] z-[1] w-[58%] max-w-[900px]"
      >
        <div
            class="absolute inset-0 rounded-full bg-white/[0.035] blur-[100px]"
        />

        <div class="relative">
          <!--

          -->
          <img
              :src="carImage"
              alt="Nitro vehicle"
              class="relative w-150 object-contain opacity-100"
          />

          <div
              class="absolute inset-x-[10%] bottom-[10%] h-20 rounded-full bg-black/80 blur-2xl"
          />

        </div>
      </div>

      <!-- Bottom Information -->
      <div class="absolute bottom-8 left-0 right-0 z-10">

        <div
            class="mx-auto flex max-w-7xl items-end justify-between px-8"
        >

          <div
              class="hidden items-center gap-5 text-xs text-white/30 sm:flex"
          >
            <span>01</span>
            <span class="h-px w-20 bg-white/15"></span>
            <span>DISCOVER</span>
          </div>

          <div class="flex items-center gap-3 text-xs text-white/30">
            <span>Scroll to explore</span>
            <span class="animate-bounce">↓</span>
          </div>

        </div>

      </div>

    </section>

    <!-- Feature Strip -->
    <section class="border-t border-white/[0.07] bg-[#0b0c0e]">

      <div class="mx-auto max-w-7xl px-8 py-8">

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">

          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-white/30">
              Curated
            </p>

            <p class="mt-2 text-sm text-white/70">
              Exceptional vehicles
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-white/30">
              Flexible
            </p>

            <p class="mt-2 text-sm text-white/70">
              Buy · Reserve · Pre-order
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-white/30">
              Nitro
            </p>

            <p class="mt-2 text-sm text-white/70">
              Built for enthusiasts
            </p>
          </div>

        </div>

      </div>

    </section>

  </main>
</template>