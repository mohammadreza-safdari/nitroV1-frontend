<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { imageUrl } from '@/services/api.js'

const route = useRoute()
const router = useRouter()

const vehicle = ref(null)
const addresses = ref([])
const existingDeal = ref(null)

const selectedAddressId = ref(null)

const discountCode = ref('')
const discountCodeApplied = ref(false)
const discountCodeLoading = ref(false)
const discountCodeError = ref(null)

const pricing = ref(null)
const pricingLoading = ref(false)

const purchaseMethod = ref('full')
const selectedInstallmentPlan = ref(null)

const isEditingDeal = ref(false)

const installmentPlans = [
  { value: 12, months: 12 },
  { value: 24, months: 24 },
  { value: 36, months: 36 },
]

const loading = ref(true)
const submitting = ref(false)
const error = ref(null)
const submitError = ref(null)
const successMessage = ref(null)

const acceptedTerms = ref(false)

const vehicleId = computed(() => route.params.vehicle)

const primaryImage = computed(() => {
  if (!vehicle.value?.images?.length) {
    return null
  }

  return (
      vehicle.value.images.find(image => image.is_primary) ||
      vehicle.value.images[0]
  )
})

const vehicleName = computed(() => {
  return vehicle.value?.vehicle_model?.name || 'Unknown Vehicle'
})

const brandName = computed(() => {
  return vehicle.value?.vehicle_model?.brand?.name || 'Unknown Brand'
})

const vehiclePrice = computed(() => {
  return Number(pricing.value?.base_price ?? vehicle.value?.price ?? 0)
})

const offerDiscountAmount = computed(() => {
  return Number(pricing.value?.offer_discount ?? 0)
})

const discountCodeDiscount = computed(() => {
  return Number(pricing.value?.discount_code_discount ?? 0)
})

const finalPrice = computed(() => {
  return Number(pricing.value?.final_price ?? vehiclePrice.value)
})

const selectedPlan = computed(() => {
  if (!selectedInstallmentPlan.value) {
    return null
  }

  return installmentPlans.find(
      plan => plan.value === selectedInstallmentPlan.value
  ) || null
})

const estimatedInstallment = computed(() => {
  if (
      purchaseMethod.value !== 'installment' ||
      !selectedInstallmentPlan.value
  ) {
    return 0
  }

  return finalPrice.value / selectedInstallmentPlan.value
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(price || 0))
}

const formatMileage = (mileage) => {
  if (mileage === null || mileage === undefined) {
    return '—'
  }

  return `${Number(mileage).toLocaleString('en-US')} mi`
}

const loadVehicle = async () => {
  const response = await api.get(`/vehicles/${vehicleId.value}`)

  vehicle.value = response.data.vehicle ?? response.data
}

const loadAddresses = async () => {
  const response = await api.get('/addresses')

  addresses.value = response.data.addresses ?? response.data

  if (addresses.value.length && !selectedAddressId.value) {
    const defaultAddress = addresses.value.find(
        address => address.is_default
    )

    selectedAddressId.value =
        defaultAddress?.id || addresses.value[0].id
  }
}

const loadExistingDeal = async () => {
  const response = await api.get('/deals')

  const dealsResponse = response.data.deals ?? response.data

  const deals = Array.isArray(dealsResponse)
      ? dealsResponse
      : dealsResponse?.data ?? []

  const deal = deals.find(
      deal =>
          Number(deal.vehicle_id) === Number(vehicleId.value) &&
          ['pending', 'approved'].includes(deal.status)
  )

  if (!deal?.id) {
    existingDeal.value = null
    return
  }

  const detailResponse = await api.get(`/deals/${deal.id}`)

  existingDeal.value =
      detailResponse.data.deal ?? detailResponse.data

  const currentDeal = existingDeal.value

  purchaseMethod.value = currentDeal.payment_method || 'full'

  selectedInstallmentPlan.value =
      currentDeal.installment_months || null

  selectedAddressId.value =
      currentDeal.address_id || selectedAddressId.value

  const existingDiscountCode =
      currentDeal.discount_code?.code || null

  if (existingDiscountCode) {
    discountCode.value = existingDiscountCode
    discountCodeApplied.value = true
  }
}

const calculatePrice = async (code = null) => {
  if (!vehicle.value?.id) {
    return
  }

  pricingLoading.value = true
  discountCodeError.value = null

  try {
    const response = await api.post(
        `/vehicles/${vehicle.value.id}/calculate-price`,
        code
            ? { discount_code: code }
            : {}
    )

    pricing.value = response.data.pricing ?? response.data

    discountCodeApplied.value = Boolean(
        pricing.value?.discount_code
    )
  } catch (err) {
    if (code) {
      discountCodeApplied.value = false

      discountCodeError.value =
          err.response?.data?.message ||
          err.response?.data?.errors?.discount_code?.[0] ||
          'This discount code is invalid or unavailable.'

      return
    }

    throw err
  } finally {
    pricingLoading.value = false
  }
}

const applyDiscountCode = async () => {
  const code = discountCode.value.trim()

  if (!code) {
    discountCodeError.value = 'Please enter a discount code.'
    return
  }

  if (discountCodeApplied.value) {
    return
  }

  discountCodeLoading.value = true
  discountCodeError.value = null

  try {
    await calculatePrice(code)
  } finally {
    discountCodeLoading.value = false
  }
}

const removeDiscountCode = async () => {
  discountCode.value = ''
  discountCodeApplied.value = false
  discountCodeError.value = null

  await calculatePrice()
}

const goToAddresses = () => {
  router.push({
    name: 'profile',
    query: {
      redirect: route.fullPath,
    },
  })
}

const continueExistingDeal = () => {
  if (!existingDeal.value?.id) {
    return
  }

  const deal = existingDeal.value

  if (deal.payment_method === 'full') {
    router.push({
      name: 'payments',
      query: {
        deal: deal.id,
      },
    })

    return
  }

  if (deal.payment_method === 'installment') {
    router.push({
      name: 'installments',
      query: {
        deal: deal.id,
      },
    })

    return
  }

  submitError.value =
      'The payment method for this purchase request is invalid.'
}

const startChangeRequest = () => {
  isEditingDeal.value = true
  submitError.value = null
  successMessage.value = null
  acceptedTerms.value = false
}

const cancelChangeRequest = () => {
  if (existingDeal.value) {
    purchaseMethod.value = existingDeal.value.payment_method || 'full'

    selectedInstallmentPlan.value =
        existingDeal.value.installment_months || null

    selectedAddressId.value =
        existingDeal.value.address_id || selectedAddressId.value

    discountCode.value =
        existingDeal.value.discount_code?.code || ''

    discountCodeApplied.value = Boolean(
        existingDeal.value.discount_code?.code
    )
  }

  isEditingDeal.value = false
  acceptedTerms.value = false
  submitError.value = null
  successMessage.value = null

  calculatePrice(
      discountCodeApplied.value ? discountCode.value : null
  ).catch(err => {
    console.error('Failed to restore deal pricing:', err)
  })
}

const submitPurchase = async () => {
  if (!vehicle.value?.id) {
    return
  }

  if (!selectedAddressId.value) {
    submitError.value = 'Please select a delivery address.'
    return
  }

  if (!purchaseMethod.value) {
    submitError.value = 'Please select a purchase method.'
    return
  }

  if (
      purchaseMethod.value === 'installment' &&
      !selectedInstallmentPlan.value
  ) {
    submitError.value = 'Please select an installment plan.'
    return
  }

  if (!acceptedTerms.value) {
    submitError.value =
        'Please confirm that you understand the purchase terms.'
    return
  }

  if (isEditingDeal.value && !existingDeal.value?.id) {
    submitError.value =
        'The existing purchase request could not be found.'
    return
  }

  submitting.value = true
  submitError.value = null
  successMessage.value = null

  const payload = {
    vehicle_id: vehicle.value.id,
    address_id: selectedAddressId.value,
    type: 'purchase',
    payment_method: purchaseMethod.value,
    installment_months:
        purchaseMethod.value === 'installment'
            ? selectedInstallmentPlan.value
            : null,
    discount_code: discountCodeApplied.value
        ? discountCode.value.trim()
        : null,
  }

  try {
    // Existing deal: submit a change request through PUT.
    if (isEditingDeal.value) {
      const response = await api.put(
          `/deals/${existingDeal.value.id}`,
          payload
      )

      successMessage.value =
          response.data.message ||
          'Your change request has been submitted for admin approval.'

      isEditingDeal.value = false
      acceptedTerms.value = false

      return
    }

    // No existing deal: create a new purchase request through POST.
    const response = await api.post('/deals', payload)

    const deal = response.data.deal ?? response.data

    if (!deal?.id) {
      submitError.value =
          'The purchase request could not be saved. Please try again.'
      return
    }

    existingDeal.value = deal

    if (deal.payment_method === 'full') {
      router.push({
        name: 'payments',
        query: {
          deal: deal.id,
        },
      })

      return
    }

    if (deal.payment_method === 'installment') {
      router.push({
        name: 'installments',
        query: {
          deal: deal.id,
        },
      })

      return
    }

    submitError.value =
        'The purchase request was saved, but its payment method is invalid.'
  } catch (err) {
    console.error('Purchase submission error:', err)
    console.error('Response:', err.response?.data)

    submitError.value =
        err.response?.data?.errors?.deal?.[0] ||
        err.response?.data?.errors?.vehicle_id?.[0] ||
        err.response?.data?.errors?.address_id?.[0] ||
        err.response?.data?.errors?.discount_code?.[0] ||
        err.response?.data?.errors?.payment_method?.[0] ||
        err.response?.data?.errors?.installment_months?.[0] ||
        err.response?.data?.message ||
        'Failed to save the purchase request.'
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    await Promise.all([
      loadVehicle(),
      loadAddresses(),
    ])

    await loadExistingDeal()

    if (discountCodeApplied.value) {
      await calculatePrice(discountCode.value)
    } else {
      await calculatePrice()
    }
  } catch (err) {
    console.error('BuyView error:', err)
    console.error('Response:', err.response?.data)

    error.value =
        err.response?.data?.message ||
        'Failed to load purchase information.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">

    <div
        v-if="loading"
        class="py-24 text-center text-sm text-white/35"
    >
      Loading purchase information...
    </div>

    <div
        v-else-if="error"
        class="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-5"
    >
      <p class="text-sm text-red-400">
        {{ error }}
      </p>

      <button
          type="button"
          @click="goBack"
          class="mt-5 rounded-lg border border-white/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50 transition hover:border-white/20 hover:text-white"
      >
        Go Back
      </button>
    </div>

    <template v-else-if="vehicle">

      <div class="mb-10">

        <button
            type="button"
            @click="goBack"
            class="mb-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30 transition hover:text-white"
        >
          ← Back
        </button>

        <p
            class="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/30"
        >
          Purchase
        </p>

        <h1
            class="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl"
        >
          Review Your
          <span class="block">Purchase.</span>
        </h1>

        <p class="mt-5 max-w-2xl text-sm leading-7 text-white/40">
          Review the vehicle, purchase price and delivery information
          before submitting your purchase request.
        </p>

      </div>

      <div class="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">

        <div class="space-y-6">

          <!-- Vehicle Information -->

          <div
              class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
          >

            <div class="relative overflow-hidden">

              <img
                  v-if="primaryImage"
                  :src="imageUrl(primaryImage.path)"
                  :alt="vehicleName"
                  class="aspect-[16/9] w-full object-cover"
              />

              <div
                  v-else
                  class="flex aspect-[16/9] items-center justify-center bg-white/[0.025]"
              >
                <span
                    class="text-[10px] uppercase tracking-[0.2em] text-white/20"
                >
                  No Image
                </span>
              </div>

              <div
                  class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-6 pb-6 pt-16"
              >
                <p
                    class="text-[9px] uppercase tracking-[0.2em] text-white/45"
                >
                  {{ brandName }}
                </p>

                <h2
                    class="mt-1 text-2xl font-bold tracking-tight text-white"
                >
                  {{ vehicleName }}
                </h2>
              </div>

            </div>

            <div
                class="grid grid-cols-2 border-t border-white/[0.07] sm:grid-cols-4"
            >

              <div class="border-r border-white/[0.07] p-4">
                <p class="text-[8px] uppercase tracking-[0.16em] text-white/25">
                  Year
                </p>

                <p class="mt-2 text-xs font-semibold text-white/70">
                  {{ vehicle.year }}
                </p>
              </div>

              <div class="border-r border-white/[0.07] p-4">
                <p class="text-[8px] uppercase tracking-[0.16em] text-white/25">
                  Condition
                </p>

                <p class="mt-2 text-xs font-semibold capitalize text-white/70">
                  {{ vehicle.condition }}
                </p>
              </div>

              <div class="border-r border-white/[0.07] p-4">
                <p class="text-[8px] uppercase tracking-[0.16em] text-white/25">
                  Mileage
                </p>

                <p class="mt-2 text-xs font-semibold text-white/70">
                  {{ formatMileage(vehicle.mileage) }}
                </p>
              </div>

              <div class="p-4">
                <p class="text-[8px] uppercase tracking-[0.16em] text-white/25">
                  Color
                </p>

                <p class="mt-2 text-xs font-semibold text-white/70">
                  {{ vehicle.color || '—' }}
                </p>
              </div>

            </div>

          </div>

          <!-- Delivery Address -->

          <div
              class="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
          >

            <div class="mb-6 flex items-start justify-between gap-4">

              <div>
                <p
                    class="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25"
                >
                  Delivery
                </p>

                <h2 class="mt-2 text-lg font-bold text-white">
                  Delivery Address
                </h2>

                <p class="mt-2 text-xs leading-5 text-white/35">
                  Select the address associated with this purchase.
                </p>
              </div>

              <button
                  type="button"
                  @click="goToAddresses"
                  class="shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35 transition hover:text-white"
              >
                Manage Addresses →
              </button>

            </div>

            <div
                v-if="addresses.length"
                class="space-y-3"
            >

              <button
                  v-for="address in addresses"
                  :key="address.id"
                  type="button"
                  @click="selectedAddressId = address.id"
                  class="w-full rounded-xl border p-4 text-left transition"
                  :class="
                  selectedAddressId === address.id
                    ? 'border-white/25 bg-white/[0.06]'
                    : 'border-white/10 bg-white/[0.015] hover:border-white/15'
                "
              >

                <div class="flex items-start justify-between gap-4">

                  <div>
                    <p class="text-xs font-semibold text-white/75">
                      {{ address.title || 'Delivery Address' }}
                    </p>

                    <p class="mt-2 text-xs leading-5 text-white/40">
                      {{ address.address }}
                    </p>

                    <p
                        v-if="address.city || address.state"
                        class="mt-1 text-[10px] text-white/25"
                    >
                      {{ address.city }}
                      <span v-if="address.city && address.state">, </span>
                      {{ address.state }}
                    </p>
                  </div>

                  <div
                      class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                      :class="
                      selectedAddressId === address.id
                        ? 'border-white bg-white'
                        : 'border-white/20'
                    "
                  >
                    <div
                        v-if="selectedAddressId === address.id"
                        class="h-1.5 w-1.5 rounded-full bg-black"
                    />
                  </div>

                </div>

              </button>

            </div>

            <div
                v-else
                class="rounded-xl border border-white/10 bg-white/[0.015] px-5 py-6"
            >
              <p class="text-xs text-white/40">
                You don't have a delivery address yet.
              </p>

              <button
                  type="button"
                  @click="goToAddresses"
                  class="mt-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50 transition hover:text-white"
              >
                Add Delivery Address →
              </button>
            </div>

          </div>

          <!-- Discount Code -->

          <div
              class="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
          >

            <div class="mb-5">

              <p
                  class="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25"
              >
                Discount
              </p>

              <h2 class="mt-2 text-lg font-bold text-white">
                Have a Discount Code?
              </h2>

              <p class="mt-2 text-xs leading-5 text-white/35">
                Enter your code to check whether it can be applied to this
                purchase.
              </p>

            </div>

            <div
                v-if="!discountCodeApplied"
                class="flex flex-col gap-3 sm:flex-row"
            >

              <input
                  v-model="discountCode"
                  type="text"
                  placeholder="Enter discount code"
                  class="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-white outline-none transition placeholder:text-white/20 focus:border-white/25"
                  @keyup.enter="applyDiscountCode"
              />

              <button
                  type="button"
                  :disabled="discountCodeLoading || pricingLoading"
                  @click="applyDiscountCode"
                  class="rounded-xl border border-white/10 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                {{
                  discountCodeLoading
                      ? 'Checking...'
                      : 'Apply Code'
                }}
              </button>

            </div>

            <div
                v-else
                class="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3"
            >

              <div>
                <p
                    class="text-[9px] uppercase tracking-[0.14em] text-white/25"
                >
                  Applied Code
                </p>

                <p
                    class="mt-1 text-xs font-semibold tracking-wider text-white/70"
                >
                  {{ discountCode }}
                </p>
              </div>

              <button
                  type="button"
                  :disabled="pricingLoading"
                  @click="removeDiscountCode"
                  class="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Remove
              </button>

            </div>

            <p
                v-if="discountCodeError"
                class="mt-3 text-xs text-red-400"
            >
              {{ discountCodeError }}
            </p>

          </div>

          <!-- Purchase Method -->

          <div
              class="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
          >

            <div class="mb-6">

              <p
                  class="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25"
              >
                Purchase Method
              </p>

              <h2 class="mt-2 text-lg font-bold text-white">
                Choose Purchase Method
              </h2>

              <p class="mt-2 text-xs leading-5 text-white/35">
                Select how you would like to complete this purchase.
              </p>

            </div>

            <div class="space-y-3">

              <button
                  type="button"
                  @click="purchaseMethod = 'full'"
                  class="w-full rounded-xl border p-4 text-left transition"
                  :class="
                  purchaseMethod === 'full'
                    ? 'border-white/25 bg-white/[0.06]'
                    : 'border-white/10 bg-white/[0.015] hover:border-white/15'
                "
              >

                <div class="flex items-start justify-between gap-4">

                  <div>
                    <p class="text-xs font-semibold text-white/75">
                      Full Payment
                    </p>

                    <p class="mt-1 text-[10px] leading-5 text-white/35">
                      Pay the full purchase amount.
                    </p>
                  </div>

                  <div
                      class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                      :class="
                      purchaseMethod === 'full'
                        ? 'border-white bg-white'
                        : 'border-white/20'
                    "
                  >
                    <div
                        v-if="purchaseMethod === 'full'"
                        class="h-1.5 w-1.5 rounded-full bg-black"
                    />
                  </div>

                </div>

              </button>

              <button
                  type="button"
                  @click="purchaseMethod = 'installment'"
                  class="w-full rounded-xl border p-4 text-left transition"
                  :class="
                  purchaseMethod === 'installment'
                    ? 'border-white/25 bg-white/[0.06]'
                    : 'border-white/10 bg-white/[0.015] hover:border-white/15'
                "
              >

                <div class="flex items-start justify-between gap-4">

                  <div>
                    <p class="text-xs font-semibold text-white/75">
                      Installment Plan
                    </p>

                    <p class="mt-1 text-[10px] leading-5 text-white/35">
                      Purchase the vehicle through an installment plan.
                    </p>
                  </div>

                  <div
                      class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                      :class="
                      purchaseMethod === 'installment'
                        ? 'border-white bg-white'
                        : 'border-white/20'
                    "
                  >
                    <div
                        v-if="purchaseMethod === 'installment'"
                        class="h-1.5 w-1.5 rounded-full bg-black"
                    />
                  </div>

                </div>

              </button>

            </div>

            <div
                v-if="purchaseMethod === 'installment'"
                class="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
            >

              <p
                  class="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25"
              >
                Select Plan
              </p>

              <div class="mt-4 grid gap-3 sm:grid-cols-3">

                <button
                    v-for="plan in installmentPlans"
                    :key="plan.value"
                    type="button"
                    @click="selectedInstallmentPlan = plan.value"
                    class="rounded-xl border p-4 text-left transition"
                    :class="
                    selectedInstallmentPlan === plan.value
                      ? 'border-white/25 bg-white/[0.06]'
                      : 'border-white/10 bg-white/[0.015] hover:border-white/15'
                  "
                >

                  <p class="text-sm font-bold text-white/75">
                    {{ plan.months }}
                  </p>

                  <p
                      class="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/25"
                  >
                    Months
                  </p>

                </button>

              </div>

              <div
                  v-if="selectedPlan"
                  class="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-4"
              >

                <span class="text-[10px] text-white/35">
                  Estimated Monthly Payment
                </span>

                <span class="text-sm font-bold text-white/70">
                  {{ formatPrice(estimatedInstallment) }}
                </span>

              </div>

              <p class="mt-3 text-[9px] leading-5 text-white/20">
                Final installment amounts and terms are subject to Nitro
                admin confirmation.
              </p>

            </div>

          </div>

          <!-- Purchase Terms -->

          <div
              class="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
          >

            <p
                class="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25"
            >
              Purchase Terms
            </p>

            <label class="mt-5 flex cursor-pointer items-start gap-3">

              <input
                  v-model="acceptedTerms"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent accent-white"
              />

              <span class="text-xs leading-6 text-white/40">
                I understand that submitting this request does not
                constitute final purchase confirmation. The purchase
                remains subject to Nitro admin review and confirmation.
              </span>

            </label>

          </div>

        </div>

        <!-- Purchase Summary -->

        <aside class="lg:sticky lg:top-8 lg:self-start">

          <div
              class="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
          >

            <div class="mb-6">

              <p
                  class="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25"
              >
                Purchase Summary
              </p>

              <h2 class="mt-2 text-lg font-bold text-white">
                Order Summary
              </h2>

            </div>

            <div class="flex items-start justify-between gap-4">

              <div>
                <p class="text-xs font-semibold text-white/70">
                  {{ vehicleName }}
                </p>

                <p class="mt-1 text-[10px] text-white/30">
                  {{ brandName }} · {{ vehicle.year }}
                </p>
              </div>

              <p class="text-xs font-semibold text-white/60">
                {{ formatPrice(vehiclePrice) }}
              </p>

            </div>

            <div
                class="mt-6 space-y-3 border-t border-white/[0.07] pt-5"
            >

              <div class="flex items-center justify-between">

                <span class="text-xs text-white/35">
                  Vehicle Price
                </span>

                <span class="text-xs text-white/60">
                  {{ formatPrice(vehiclePrice) }}
                </span>

              </div>

              <div
                  v-if="offerDiscountAmount > 0"
                  class="flex items-center justify-between"
              >

                <span class="text-xs text-white/35">
                  Offer Discount
                </span>

                <span class="text-xs text-white/60">
                  -{{ formatPrice(offerDiscountAmount) }}
                </span>

              </div>

              <div
                  v-if="discountCodeDiscount > 0"
                  class="flex items-center justify-between"
              >

                <span class="text-xs text-white/35">
                  Discount Code
                </span>

                <span class="text-xs text-white/60">
                  -{{ formatPrice(discountCodeDiscount) }}
                </span>

              </div>

            </div>

            <div
                v-if="pricingLoading"
                class="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3"
            >
              <p class="text-[10px] text-white/30">
                Calculating final price...
              </p>
            </div>

            <div
                class="mt-5 flex items-end justify-between border-t border-white/[0.07] pt-5"
            >

              <div>
                <p
                    class="text-[9px] uppercase tracking-[0.16em] text-white/25"
                >
                  Estimated Total
                </p>

                <p
                    class="mt-1 text-2xl font-black tracking-tight text-white"
                >
                  {{ formatPrice(finalPrice) }}
                </p>
              </div>

              <span
                  v-if="offerDiscountAmount > 0 || discountCodeDiscount > 0"
                  class="rounded-full bg-white px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-black"
              >
                Discount Applied
              </span>

            </div>

            <div
                class="mt-5 border-t border-white/[0.07] pt-5"
            >

              <div class="flex items-center justify-between">

                <span class="text-xs text-white/35">
                  Payment Method
                </span>

                <span
                    class="text-xs font-semibold capitalize text-white/60"
                >
                  {{
                    purchaseMethod === 'installment'
                        ? 'Installment'
                        : 'Full Payment'
                  }}
                </span>

              </div>

              <div
                  v-if="purchaseMethod === 'installment' && selectedPlan"
                  class="mt-3 flex items-center justify-between"
              >

                <span class="text-xs text-white/35">
                  Plan
                </span>

                <span class="text-xs text-white/60">
                  {{ selectedPlan.months }} Months
                </span>

              </div>

              <div
                  v-if="purchaseMethod === 'installment' && selectedPlan"
                  class="mt-3 flex items-center justify-between"
              >

                <span class="text-xs text-white/35">
                  Estimated Monthly
                </span>

                <span class="text-xs font-semibold text-white/60">
                  {{ formatPrice(estimatedInstallment) }}
                </span>

              </div>

            </div>

            <div
                class="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3"
            >

              <p class="text-[10px] leading-5 text-white/30">
                Final pricing, discount eligibility and purchase details
                will be verified during Nitro's admin review.
              </p>

            </div>

            <!-- Success Message -->

            <div
                v-if="successMessage"
                class="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3"
            >

              <p class="text-xs leading-5 text-emerald-400">
                {{ successMessage }}
              </p>

            </div>

            <!-- Submission Error -->

            <div
                v-if="submitError"
                class="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3"
            >

              <p class="text-xs leading-5 text-red-400">
                {{ submitError }}
              </p>

            </div>

            <!-- Existing Deal Actions -->

            <div
                v-if="existingDeal && !isEditingDeal"
                class="mt-6 space-y-3"
            >

              <button
                  type="button"
                  @click="continueExistingDeal"
                  class="flex w-full items-center justify-between rounded-xl bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white/90"
              >

                <span>Continue</span>

                <span>→</span>

              </button>

              <button
                  type="button"
                  @click="startChangeRequest"
                  class="flex w-full items-center justify-between rounded-xl border border-white/15 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/30 hover:text-white"
              >

                <span>Request Changes</span>

                <span>→</span>

              </button>

            </div>

            <!-- Single Submit Button for New Deal or Change Request -->

            <div
                v-else
                class="mt-6 space-y-3"
            >

              <button
                  type="button"
                  :disabled="
                  submitting ||
                  pricingLoading ||
                  !selectedAddressId ||
                  !purchaseMethod ||
                  (
                    purchaseMethod === 'installment' &&
                    !selectedInstallmentPlan
                  ) ||
                  !acceptedTerms
                "
                  @click="submitPurchase"
                  class="flex w-full items-center justify-between rounded-xl bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
              >

                <span>
                  {{
                    submitting
                        ? 'Processing...'
                        : isEditingDeal
                            ? 'Submit Change Request'
                            : 'Submit Purchase Request'
                  }}
                </span>

                <span>→</span>

              </button>

              <button
                  v-if="isEditingDeal"
                  type="button"
                  :disabled="submitting"
                  @click="cancelChangeRequest"
                  class="w-full rounded-xl border border-white/10 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Cancel Editing
              </button>

            </div>

            <p class="mt-4 text-center text-[9px] leading-5 text-white/20">
              No payment will be processed at this stage.
              Your request must be confirmed by Nitro administration.
            </p>

          </div>

        </aside>

      </div>

    </template>

  </section>
</template>