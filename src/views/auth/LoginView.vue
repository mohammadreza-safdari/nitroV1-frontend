<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const login = async () => {
  await authStore.login(form)

  router.push({
    name: 'dashboard',
  })
}

const goToWelcome = () => {
  router.push({
    name: 'welcome',
  })
}

const goToRegister = () => {
  router.push({
    name: 'register',
  })
}
</script>

<template>
  <main class="min-h-screen bg-[#08090b] text-white overflow-hidden">

    <!-- Background -->
    <div class="fixed inset-0 pointer-events-none">

      <div
          class="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.035] blur-[120px]"
      />

      <div
          class="absolute inset-0 opacity-[0.025]"
          style="
                    background-image:
                        linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
                    background-size: 80px 80px;
                "
      />
    </div>

    <!-- Header -->
    <header class="relative z-10">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-8 py-7">

        <button
            @click="goToWelcome"
            class="text-2xl font-black tracking-[0.35em]"
        >
          NITRO
        </button>

        <button
            @click="router.back()"
            class="text-sm text-white/45 transition hover:text-white"
        >
          Back
        </button>

      </div>
    </header>

    <!-- Login -->
    <section
        class="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-6 pb-16"
    >

      <div class="w-full max-w-md">

        <!-- Heading -->
        <div class="mb-10 text-center">

          <div
              class="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
          >
            <span class="text-lg">N</span>
          </div>

          <p
              class="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/35"
          >
            Welcome back
          </p>

          <h1
              class="text-4xl font-bold tracking-[-0.04em] sm:text-5xl"
          >
            Enter Nitro.
          </h1>

          <p class="mt-4 text-sm leading-6 text-white/40">
            Sign in to continue your automotive journey.
          </p>

        </div>

        <!-- Card -->
        <div
            class="rounded-3xl border border-white/[0.09] bg-white/[0.035] p-7 shadow-2xl backdrop-blur-xl sm:p-9"
        >

          <form
              @submit.prevent="login"
              class="space-y-5"
          >

            <!-- Email -->
            <div>
              <label
                  class="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-white/40"
              >
                Email
              </label>

              <input
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                  required
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.05]"
              >
            </div>

            <!-- Password -->
            <div>
              <div class="mb-2 flex items-center justify-between">

                <label
                    class="block text-xs font-medium uppercase tracking-[0.18em] text-white/40"
                >
                  Password
                </label>

                <button
                    type="button"
                    class="text-xs text-white/30 transition hover:text-white/60"
                >
                  Forgot?
                </button>

              </div>

              <input
                  v-model="form.password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  required
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.05]"
              >
            </div>

            <!-- Submit -->
            <button
                type="submit"
                class="group mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.99]"
            >
              Sign in

              <span
                  class="transition-transform group-hover:translate-x-1"
              >
                                →
              </span>
            </button>

          </form>

        </div>

        <!-- Bottom -->
        <p class="mt-7 text-center text-xs text-white/30">
          Don't have an account?

          <button
              @click="goToRegister"
              class="ml-1 text-white/65 transition hover:text-white"
          >
            Create account
          </button>
        </p>

      </div>

    </section>

  </main>
</template>