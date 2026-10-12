<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/services/api.js'

const authStore = useAuthStore()

const profile = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
})

const addresses = ref([])
const provinces = ref([])
const cities = ref([])

const addressForm = ref({
  id: null,
  title: '',
  recipient_name: '',
  phone: '',
  province: '',
  city: '',
  address: '',
  postal_code: '',
})

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const savingProfile = ref(false)
const savingAddress = ref(false)
const changingPassword = ref(false)

const loadingAddresses = ref(false)
const loadingProvinces = ref(false)
const loadingCities = ref(false)

const profileError = ref(null)
const addressError = ref(null)
const passwordError = ref(null)

const profileSuccess = ref(false)
const addressSuccess = ref(false)
const passwordSuccess = ref(false)

const editingAddress = computed(() => addressForm.value.id !== null)

const resetAddressForm = () => {
  addressForm.value = {
    id: null,
    title: '',
    recipient_name: '',
    phone: '',
    province: '',
    city: '',
    address: '',
    postal_code: '',
  }

  cities.value = []
  addressError.value = null
  addressSuccess.value = false
}

const loadProvinces = async () => {
  loadingProvinces.value = true

  try {
    const response = await api.get('/locations/provinces')

    provinces.value = response.data.provinces ?? []
  } catch (error) {
    console.error('PROVINCES ERROR:', error)

    addressError.value =
        error.response?.data?.message || 'Unable to load provinces.'
  } finally {
    loadingProvinces.value = false
  }
}

const loadCities = async () => {
  cities.value = []
  addressForm.value.city = ''

  if (!addressForm.value.province) {
    return
  }

  loadingCities.value = true

  try {
    const response = await api.get(
        `/locations/provinces/${addressForm.value.province}/cities`
    )

    cities.value = response.data.cities ?? []
  } catch (error) {
    console.error('CITIES ERROR:', error.response?.data || error)

    addressError.value =
        error.response?.data?.message || 'Unable to load cities.'

    cities.value = []
  } finally {
    loadingCities.value = false
  }
}

const loadAddresses = async () => {
  loadingAddresses.value = true

  try {
    const response = await api.get('/addresses')

    addresses.value = response.data.addresses ?? response.data
  } catch (error) {
    console.error('ADDRESSES ERROR:', error)

    addressError.value =
        error.response?.data?.message || 'Unable to load addresses.'
  } finally {
    loadingAddresses.value = false
  }
}

const editAddress = async (address) => {
  addressError.value = null
  addressSuccess.value = false
  cities.value = []

  const selectedProvince = provinces.value.find(
      province => province.name === address.province
  )

  addressForm.value = {
    id: address.id,
    title: address.title || '',
    recipient_name: address.recipient_name || '',
    phone: address.phone || '',
    province: selectedProvince?.id || '',
    city: '',
    address: address.address || '',
    postal_code: address.postal_code || '',
  }

  if (!selectedProvince) {
    return
  }

  loadingCities.value = true

  try {
    const response = await api.get(
        `/locations/provinces/${selectedProvince.id}/cities`
    )

    cities.value = response.data.cities ?? []

    const selectedCity = cities.value.find(
        city => city.name === address.city
    )

    addressForm.value.city = selectedCity?.id || ''
  } catch (error) {
    console.error('CITIES ERROR:', error)

    addressError.value =
        error.response?.data?.message || 'Unable to load cities.'

    cities.value = []
  } finally {
    loadingCities.value = false
  }
}

const deleteAddress = async (id) => {
  if (!confirm('Are you sure you want to delete this address?')) {
    return
  }

  addressError.value = null
  addressSuccess.value = false

  try {
    await api.delete(`/addresses/${id}`)

    addresses.value = addresses.value.filter(
        address => address.id !== id
    )

    if (addressForm.value.id === id) {
      resetAddressForm()
    }
  } catch (error) {
    console.error('DELETE ADDRESS ERROR:', error)

    addressError.value =
        error.response?.data?.message || 'Unable to delete address.'
  }
}

const saveProfile = async () => {
  savingProfile.value = true
  profileError.value = null
  profileSuccess.value = false

  try {
    const response = await api.patch('/auth/profile', {
      name: profile.value.name,
      email: profile.value.email,
    })

    if (response.data.user) {
      authStore.user = response.data.user

      profile.value.name = response.data.user.name
      profile.value.email = response.data.user.email
    }

    profileSuccess.value = true
  } catch (error) {
    console.error('PROFILE UPDATE ERROR:', error)

    profileError.value =
        error.response?.data?.message || 'Unable to save profile.'
  } finally {
    savingProfile.value = false
  }
}

const saveAddress = async () => {
  savingAddress.value = true
  addressError.value = null
  addressSuccess.value = false

  try {
    const selectedProvince = provinces.value.find(
        province => province.id === Number(addressForm.value.province)
    )

    const selectedCity = cities.value.find(
        city => city.id === Number(addressForm.value.city)
    )

    if (!selectedProvince || !selectedCity) {
      addressError.value = 'Please select a valid province and city.'
      return
    }

    const payload = {
      title: addressForm.value.title,
      recipient_name: addressForm.value.recipient_name,
      phone: addressForm.value.phone,
      province: selectedProvince.name,
      city: selectedCity.name,
      address: addressForm.value.address,
      postal_code: addressForm.value.postal_code,
    }

    let response

    if (editingAddress.value) {
      response = await api.put(
          `/addresses/${addressForm.value.id}`,
          payload
      )

      const updatedAddress = response.data.address ?? response.data

      const index = addresses.value.findIndex(
          address => address.id === updatedAddress.id
      )

      if (index !== -1) {
        addresses.value[index] = updatedAddress
      }
    } else {
      response = await api.post('/addresses', payload)

      const newAddress = response.data.address ?? response.data

      addresses.value.push(newAddress)
    }

    addressSuccess.value = true
    resetAddressForm()
  } catch (error) {
    console.error('SAVE ADDRESS ERROR:', error)

    addressError.value =
        error.response?.data?.message || 'Unable to save address.'
  } finally {
    savingAddress.value = false
  }
}

const changePassword = async () => {
  changingPassword.value = true
  passwordError.value = null
  passwordSuccess.value = false

  try {
    await api.put('/auth/password', passwordForm.value)

    passwordForm.value = {
      current_password: '',
      password: '',
      password_confirmation: '',
    }

    passwordSuccess.value = true
  } catch (error) {
    console.error('CHANGE PASSWORD ERROR:', error)

    passwordError.value =
        error.response?.data?.message || 'Unable to change password.'
  } finally {
    changingPassword.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadProvinces(),
    loadAddresses(),
  ])
})
</script>

<template>
  <div class="min-h-screen bg-[#08090b] text-white">

    <div class="mx-auto max-w-7xl px-6 py-12 lg:px-8">

      <div class="mb-10">
        <p class="text-[10px] font-medium uppercase tracking-[0.3em] text-white/30">
          Account
        </p>

        <h1 class="mt-3 text-3xl font-bold tracking-tight">
          Profile
        </h1>

        <p class="mt-2 max-w-xl text-sm leading-6 text-white/40">
          Manage your personal information, addresses and account security.
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">

        <!-- Personal Information -->
        <section class="rounded-3xl border border-white/10 bg-white/[0.025] p-6 lg:col-span-2 lg:p-8">

          <div class="mb-8">
            <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-white/25">
              Personal Information
            </p>

            <h2 class="mt-2 text-xl font-semibold">
              Account Details
            </h2>
          </div>

          <form
              class="space-y-6"
              @submit.prevent="saveProfile"
          >

            <div class="grid gap-5 md:grid-cols-2">

              <div>
                <label class="mb-2 block text-xs font-medium text-white/50">
                  Full Name
                </label>

                <input
                    v-model="profile.name"
                    type="text"
                    class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="Your full name"
                />
              </div>

              <div>
                <label class="mb-2 block text-xs font-medium text-white/50">
                  Email
                </label>

                <input
                    v-model="profile.email"
                    type="email"
                    autocomplete="email"
                    class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="Your email address"
                />
              </div>

            </div>

            <div
                v-if="profileError"
                class="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-300"
            >
              {{ profileError }}
            </div>

            <div
                v-if="profileSuccess"
                class="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-xs text-emerald-300"
            >
              Profile updated successfully.
            </div>

            <div class="flex justify-end border-t border-white/10 pt-6">

              <button
                  type="submit"
                  :disabled="savingProfile"
                  class="rounded-xl bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ savingProfile ? 'Saving...' : 'Save Changes' }}
              </button>

            </div>

          </form>

        </section>

        <!-- Account Summary -->
        <aside class="rounded-3xl border border-white/10 bg-white/[0.025] p-6">

          <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-white/25">
            Account
          </p>

          <div class="mt-6 flex items-center gap-4">

            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-black">
              {{ authStore.user?.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>

            <div class="min-w-0">

              <p class="truncate font-semibold">
                {{ authStore.user?.name || 'Nitro User' }}
              </p>

              <p class="mt-1 truncate text-xs text-white/35">
                {{ authStore.user?.email || '' }}
              </p>

            </div>

          </div>

          <div class="mt-8 border-t border-white/10 pt-6">

            <p class="text-xs leading-6 text-white/35">
              Your account information is used for reservations,
              purchases and other Nitro services.
            </p>

          </div>

        </aside>

        <!-- Addresses -->
        <section class="rounded-3xl border border-white/10 bg-white/[0.025] p-6 lg:col-span-3 lg:p-8">

          <div class="mb-8">

            <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-white/25">
              Delivery
            </p>

            <h2 class="mt-2 text-xl font-semibold">
              Addresses
            </h2>

            <p class="mt-2 text-sm text-white/35">
              Manage your addresses for reservations, purchases and deliveries.
            </p>

          </div>

          <div
              v-if="loadingAddresses"
              class="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-white/35"
          >
            Loading addresses...
          </div>

          <div
              v-else-if="addresses.length"
              class="grid gap-4 md:grid-cols-2"
          >

            <article
                v-for="item in addresses"
                :key="item.id"
                class="rounded-2xl border border-white/10 bg-black/20 p-5"
            >

              <div class="flex items-start justify-between gap-4">

                <div>

                  <p class="text-sm font-semibold">
                    {{ item.title }}
                  </p>

                  <p class="mt-1 text-xs text-white/35">
                    {{ item.recipient_name }}
                  </p>

                </div>

                <div class="flex gap-2">

                  <button
                      type="button"
                      class="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-white/50 transition hover:border-white/20 hover:text-white"
                      @click="editAddress(item)"
                  >
                    Edit
                  </button>

                  <button
                      type="button"
                      class="rounded-lg border border-red-400/10 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-red-400/60 transition hover:border-red-400/30 hover:text-red-300"
                      @click="deleteAddress(item.id)"
                  >
                    Delete
                  </button>

                </div>

              </div>

              <div class="mt-5 space-y-2 text-xs leading-5 text-white/40">

                <p>
                  {{ item.phone }}
                </p>

                <p>
                  {{ item.province }} · {{ item.city }}
                </p>

                <p>
                  {{ item.address }}
                </p>

                <p>
                  Postal Code: {{ item.postal_code }}
                </p>

              </div>

            </article>

          </div>

          <div
              v-else
              class="rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-center"
          >
            <p class="text-sm text-white/40">
              You don't have any saved addresses yet.
            </p>
          </div>

          <div class="mt-8 border-t border-white/10 pt-8">

            <div class="mb-6">

              <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-white/25">
                {{ editingAddress ? 'Edit Address' : 'New Address' }}
              </p>

              <h3 class="mt-2 text-lg font-semibold">
                {{ editingAddress ? 'Update Address' : 'Add Address' }}
              </h3>

            </div>

            <form
                class="space-y-6"
                @submit.prevent="saveAddress"
            >

              <div class="grid gap-5 md:grid-cols-3">

                <div>
                  <label class="mb-2 block text-xs font-medium text-white/50">
                    Address Title
                  </label>

                  <input
                      v-model="addressForm.title"
                      type="text"
                      class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                      placeholder="Home"
                  />
                </div>

                <div>
                  <label class="mb-2 block text-xs font-medium text-white/50">
                    Recipient Name
                  </label>

                  <input
                      v-model="addressForm.recipient_name"
                      type="text"
                      class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                      placeholder="Recipient name"
                  />
                </div>

                <div>
                  <label class="mb-2 block text-xs font-medium text-white/50">
                    Phone
                  </label>

                  <input
                      v-model="addressForm.phone"
                      type="tel"
                      class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                      placeholder="Phone number"
                  />
                </div>

              </div>

              <div class="grid gap-5 md:grid-cols-3">

                <div>
                  <label class="mb-2 block text-xs font-medium text-white/50">
                    Province
                  </label>

                  <select
                      v-model="addressForm.province"
                      :disabled="loadingProvinces"
                      class="w-full rounded-xl border border-white/10 bg-[#0b0c0f] px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                      @change="loadCities"
                  >

                    <option value="">
                      {{ loadingProvinces ? 'Loading...' : 'Select province' }}
                    </option>

                    <option
                        v-for="province in provinces"
                        :key="province.id"
                        :value="province.id"
                    >
                      {{ province.name }}
                    </option>

                  </select>
                </div>

                <div>
                  <label class="mb-2 block text-xs font-medium text-white/50">
                    City
                  </label>

                  <select
                      v-model="addressForm.city"
                      :disabled="!addressForm.province || loadingCities"
                      class="w-full rounded-xl border border-white/10 bg-[#0b0c0f] px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <option value="">
                      {{
                        loadingCities
                            ? 'Loading...'
                            : addressForm.province
                                ? 'Select city'
                                : 'Select province first'
                      }}
                    </option>

                    <option
                        v-for="city in cities"
                        :key="city.id"
                        :value="city.id"
                    >
                      {{ city.name }}
                    </option>

                  </select>
                </div>

                <div>
                  <label class="mb-2 block text-xs font-medium text-white/50">
                    Postal Code
                  </label>

                  <input
                      v-model="addressForm.postal_code"
                      type="text"
                      class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                      placeholder="Postal code"
                  />
                </div>

              </div>

              <div>

                <label class="mb-2 block text-xs font-medium text-white/50">
                  Full Address
                </label>

                <textarea
                    v-model="addressForm.address"
                    rows="4"
                    class="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="Street, building, apartment..."
                ></textarea>

              </div>

              <div
                  v-if="addressError"
                  class="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-300"
              >
                {{ addressError }}
              </div>

              <div
                  v-if="addressSuccess"
                  class="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-xs text-emerald-300"
              >
                Address saved successfully.
              </div>

              <div class="flex justify-end gap-3 border-t border-white/10 pt-6">

                <button
                    v-if="editingAddress"
                    type="button"
                    class="rounded-xl border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white/50 transition hover:border-white/20 hover:text-white"
                    @click="resetAddressForm"
                >
                  Cancel
                </button>

                <button
                    type="submit"
                    :disabled="savingAddress"
                    class="rounded-xl bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {{
                    savingAddress
                        ? 'Saving...'
                        : editingAddress
                            ? 'Update Address'
                            : 'Add Address'
                  }}
                </button>

              </div>

            </form>

          </div>

        </section>

        <!-- Security -->
        <section class="rounded-3xl border border-white/10 bg-white/[0.025] p-6 lg:col-span-3 lg:p-8">

          <div class="mb-8">

            <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-white/25">
              Security
            </p>

            <h2 class="mt-2 text-xl font-semibold">
              Change Password
            </h2>

            <p class="mt-2 text-sm text-white/35">
              Update your password to keep your Nitro account secure.
            </p>

          </div>

          <form
              class="max-w-2xl space-y-5"
              @submit.prevent="changePassword"
          >

            <div>

              <label class="mb-2 block text-xs font-medium text-white/50">
                Current Password
              </label>

              <input
                  v-model="passwordForm.current_password"
                  type="password"
                  autocomplete="current-password"
                  class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                  placeholder="Current password"
              />

            </div>

            <div class="grid gap-5 md:grid-cols-2">

              <div>

                <label class="mb-2 block text-xs font-medium text-white/50">
                  New Password
                </label>

                <input
                    v-model="passwordForm.password"
                    type="password"
                    autocomplete="new-password"
                    class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="New password"
                />

              </div>

              <div>

                <label class="mb-2 block text-xs font-medium text-white/50">
                  Confirm New Password
                </label>

                <input
                    v-model="passwordForm.password_confirmation"
                    type="password"
                    autocomplete="new-password"
                    class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="Confirm new password"
                />

              </div>

            </div>

            <div
                v-if="passwordError"
                class="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-300"
            >
              {{ passwordError }}
            </div>

            <div
                v-if="passwordSuccess"
                class="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-xs text-emerald-300"
            >
              Password changed successfully.
            </div>

            <div class="flex justify-end border-t border-white/10 pt-6">

              <button
                  type="submit"
                  :disabled="changingPassword"
                  class="rounded-xl bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ changingPassword ? 'Updating...' : 'Change Password' }}
              </button>

            </div>

          </form>

        </section>

      </div>

    </div>

  </div>
</template>