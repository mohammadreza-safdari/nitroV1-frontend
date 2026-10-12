<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const register = async () => {
  await authStore.register(form)

  router.push({
    name: 'dashboard',
  })
}

const goToLogin = () => {
  router.push({
    name: 'login',
  })
}

const goToWelcome = () => {
  router.push({
    name: 'welcome',
  })
}
</script>

<template>
  <main class="min-h-screen bg-[#08090b] text-white">

    <!-- Background -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">

      <div
          class="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-3xl"
      />

      <div
          class="absolute inset-0 opacity-[0.035]"
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

    <!-- Form -->
    <section class="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-6 py-12">

      <div class="w-full max-w-lg">

        <!-- Heading -->
        <div class="mb-10">

          <p
              class="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/35"
          >
            Join Nitro
          </p>

          <h1
              class="text-4xl font-black tracking-[-0.04em] sm:text-5xl"
          >
            Create your account.
          </h1>

          <p class="mt-4 text-sm leading-7 text-white/40">
            Create your Nitro account and start exploring your next machine.
          </p>

        </div>

        <!-- Form -->
        <form
            @submit.prevent="register"
            class="space-y-5"
        >

          <!-- Name -->
          <div>

            <label
                for="name"
                class="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/40"
            >
              Name
            </label>

            <input
                id="name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                required
                class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.06]"
                placeholder="Your name"
            />

          </div>

          <!-- Email -->
          <div>

            <label
                for="email"
                class="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/40"
            >
              Email
            </label>

            <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.06]"
                placeholder="you@example.com"
            />

          </div>

          <!-- Password -->
          <div>

            <label
                for="password"
                class="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/40"
            >
              Password
            </label>

            <input
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                required
                class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.06]"
                placeholder="Create a password"
            />

          </div>

          <!-- Confirm Password -->
          <div>

            <label
                for="password_confirmation"
                class="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/40"
            >
              Confirm Password
            </label>

            <input
                id="password_confirmation"
                v-model="form.password_confirmation"
                type="password"
                autocomplete="new-password"
                required
                class="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.06]"
                placeholder="Confirm your password"
            />

          </div>

          <!-- Submit -->
          <button
              type="submit"
              class="group mt-3 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Create account

            <span
                class="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </button>

        </form>

        <!-- Footer -->
        <div class="mt-8 text-center text-sm text-white/35">
          Already have an account?

          <button
              @click="goToLogin"
              class="ml-1 text-white transition hover:text-white/60"
          >
            Sign in
          </button>
        </div>

      </div>

    </section>

  </main>
</template>