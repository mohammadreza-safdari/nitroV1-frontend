import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

import WelcomeView from '@/views/WelcomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'

import CustomerLayout from '@/layouts/CustomerLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

import DashboardView from '@/views/customer/DashboardView.vue'
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import VehiclesView from "@/views/customer/VehiclesView.vue";
import VehicleDetailsView from "@/views/customer/VehicleDetailsView.vue";
import CompareView from "@/views/customer/CompareView.vue";
import OffersView from "@/views/customer/OffersView.vue";
import ProfileView from "@/views/customer/ProfileView.vue";
import BuyView from "@/views/customer/deal/BuyView.vue";
import FullPaymentView from "@/views/customer/deal/FullPaymentView.vue";
import InstallmentPaymentView from "@/views/customer/deal/InstallmentPaymentView.vue";
import ReservationView from "@/views/customer/reservation/ReservationView.vue";
import PreOrderView from "@/views/customer/pre-order/PreOrderView.vue";
import AllReservationsView from "@/views/customer/reservation/AllReservationsView.vue";
import AllPreOrdersView from "@/views/customer/pre-order/AllPreOrdersView.vue";
import DealView from "@/views/customer/deal/DealView.vue";
import BrandsView from "@/views/admin/brands/BrandsView.vue";
import BrandCreateView from "@/views/admin/brands/BrandCreateView.vue";
import BrandEditView from "@/views/admin/brands/BrandEditView.vue";
import BrandsDetailsView from "@/views/admin/brands/BrandsDetailsView.vue";
import CategoriesView from "@/views/admin/categories/CategoriesView.vue";
import CategoryCreateView from "@/views/admin/categories/CategoryCreateView.vue";
import CategoryDetailsView from "@/views/admin/categories/CategoryDetailsView.vue";
import CategoryEditView from "@/views/admin/categories/CategoryEditView.vue";
import VehicleModelEditView from "@/views/admin/vehicle-models/VehicleModelEditView.vue";
import VehicleModelDetailsView from "@/views/admin/vehicle-models/VehicleModelDetailsView.vue";
import VehicleModelCreateView from "@/views/admin/vehicle-models/VehicleModelCreateView.vue";
import VehicleModelsView from "@/views/admin/vehicle-models/VehicleModelsView.vue";
import AdminVehiclesView from '@/views/admin/vehicles/VehiclesView.vue'
import AdminVehicleDetailsView from '@/views/admin/vehicles/VehicleDetailsView.vue'
import AdminVehicleCreateView from '@/views/admin/vehicles/VehicleCreateView.vue'
import AdminVehicleEditView from '@/views/admin/vehicles/VehicleEditView.vue'
import CreateCarDetailView from "@/views/admin/vehicles/car-details/CreateCarDetailView.vue";
import CreateMotorcycleDetailView from "@/views/admin/vehicles/motorcycle-details/CreateMotorcycleDetailView.vue";
import EditCarDetailView from "@/views/admin/vehicles/car-details/EditCarDetailView.vue";
import EditMotorcycleDetailView from "@/views/admin/vehicles/motorcycle-details/EditMotorcycleDetailView.vue";
import ReservationDetailsView from "@/views/admin/reservations/ReservationDetailsView.vue";
import AdminReservationView from "@/views/admin/reservations/ReservationsView.vue";
import AdminDealsView from "@/views/admin/deals/DealsView.vue";
import AdminDealDetailsView from "@/views/admin/deals/DealDetailsView.vue";
import AdminPaymentDetailsView from "@/views/admin/payments/PaymentDetailsView.vue";
import AdminPaymentsView from "@/views/admin/payments/PaymentsView.vue";
import DiscountCodesView from "@/views/admin/discount-codes/DiscountCodesView.vue";
import DiscountCodeCreateView from "@/views/admin/discount-codes/DiscountCodeCreateView.vue";
import DiscountCodeEditView from "@/views/admin/discount-codes/DiscountCodeEditView.vue";
import AdminPreOrderView from "@/views/admin/pre-orders/PreOrdersView.vue";

const router = createRouter({
    history: createWebHistory(),

    routes: [

        // =========================
        // Public
        // =========================

        {
            path: '/',
            name: 'welcome',
            component: WelcomeView,
            meta: {
                guest: true,
            },
        },

        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: {
                guest: true,
            },
        },

        {
            path: '/register',
            name: 'register',
            component: RegisterView,
            meta: {
                guest: true,
            },
        },

        // =========================
        // Customer
        // =========================

        {
            path: '/dashboard',
            component: CustomerLayout,
            children: [

                {
                    path: '',
                    name: 'dashboard',
                    component: DashboardView,
                },

                // Store

                {
                    path: 'vehicles',
                    name: 'vehicles',
                    component: VehiclesView,
                },

                {
                    path: 'vehicles/:vehicle',
                    name: 'vehicle-details',
                    component: VehicleDetailsView,
                },

                {
                    path: 'compare',
                    name: 'compare',
                    component: CompareView,
                },

                {
                    path: 'offers',
                    name: 'offers',
                    component: OffersView,
                },

                // Account

                {
                    path: 'profile',
                    name: 'profile',
                    component: ProfileView,
                    meta: {
                        auth: true,
                    },
                },

                {
                    path: 'buy/:vehicle',
                    name: 'buy',
                    component: BuyView,
                    meta: {
                        auth: true,
                    },
                },

                {
                    path: 'reservations',
                    name: 'reservations',
                    component: AllReservationsView,
                    meta: {
                        auth: true,
                    },
                },

                {
                    path: 'pre-orders',
                    name: 'pre-orders',
                    component: AllPreOrdersView,
                    meta: {
                        auth: true,
                    },
                },

                {
                    path: 'reservation/:vehicle',
                    name: 'reservation',
                    component: ReservationView,
                    meta: {
                        auth: true,
                    },
                },

                {
                    path: 'pre-order/:vehicle',
                    name: 'pre-order',
                    component: PreOrderView,
                    meta: {
                        auth: true,
                    },
                },

                {
                    path: 'deals',
                    name: 'deals',
                    component: DealView,
                    meta: {
                        auth: true,
                    },
                },

                {
                    path: 'payments',
                    name: 'payments',
                    component: FullPaymentView,
                    meta: {
                        auth: true,
                    },
                },

                {
                    path: 'installments',
                    name: 'installments',
                    component: InstallmentPaymentView,
                    meta: {
                        auth: true,
                    },
                },

                // Preferences

                {
                    path: 'settings',
                    name: 'settings',
                    component: DashboardView,
                    meta: {
                        auth: true,
                    },
                },
            ],
        },

        // =========================
        // Admin
        // =========================

        {
            path: '/admin',
            component: AdminLayout,
            children: [

                // Dashboard

                {
                    path: 'dashboard',
                    name: 'admin-dashboard',
                    component: AdminDashboardView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                // Management

                {
                    path: 'vehicles',
                    name: 'admin-vehicles',
                    component: AdminVehiclesView,
                    meta: { auth: true, admin: true },
                },
                {
                    path: 'vehicles/create',
                    name: 'admin-vehicles-create',
                    component: AdminVehicleCreateView,
                    meta: { auth: true, admin: true },
                },
                {
                    path: 'vehicles/:vehicle',
                    name: 'admin-vehicles-show',
                    component: AdminVehicleDetailsView,
                    meta: { auth: true, admin: true },
                },
                {
                    path: 'vehicles/:vehicle/edit',
                    name: 'admin-vehicles-edit',
                    component: AdminVehicleEditView,
                    meta: { auth: true, admin: true },
                },

                {
                    path: 'vehicles/:vehicle/car-detail/create',
                    name: 'admin-vehicles-car-detail-create',
                    component: CreateCarDetailView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },
                {
                    path: 'vehicles/:vehicle/car-detail/edit',
                    name: 'admin-vehicles-car-detail-edit',
                    component: EditCarDetailView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },
                {
                    path: 'vehicles/:vehicle/motorcycle-detail/create',
                    name: 'admin-vehicles-motorcycle-detail-create',
                    component: CreateMotorcycleDetailView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },
                {
                    path: 'vehicles/:vehicle/motorcycle-detail/edit',
                    name: 'admin-vehicles-motorcycle-detail-edit',
                    component: EditMotorcycleDetailView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                {
                    path: 'brands',
                    name: 'admin-brands',
                    component: BrandsView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                {
                    path: 'brands/create',
                    name: 'admin-brands-create',
                    component: BrandCreateView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                {
                    path: 'brands/:brand/edit',
                    name: 'admin-brands-edit',
                    component: BrandEditView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                {
                    path: 'brands/:brand',
                    name: 'admin-brands-show',
                    component: BrandsDetailsView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                {
                    path: 'categories',
                    name: 'admin-categories',
                    component: CategoriesView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                {
                    path: 'categories/create',
                    name: 'admin-categories-create',
                    component: CategoryCreateView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                {
                    path: 'categories/:category',
                    name: 'admin-categories-show',
                    component: CategoryDetailsView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                {
                    path: 'categories/:category/edit',
                    name: 'admin-categories-edit',
                    component: CategoryEditView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                {
                    path: 'vehicle-models',
                    name: 'admin-vehicle-models',
                    component: VehicleModelsView,
                    meta: { auth: true, admin: true },
                },
                {
                    path: 'vehicle-models/create',
                    name: 'admin-vehicle-models-create',
                    component: VehicleModelCreateView,
                    meta: { auth: true, admin: true },
                },
                {
                    path: 'vehicle-models/:vehicleModel',
                    name: 'admin-vehicle-models-show',
                    component: VehicleModelDetailsView,
                    meta: { auth: true, admin: true },
                },
                {
                    path: 'vehicle-models/:vehicleModel/edit',
                    name: 'admin-vehicle-models-edit',
                    component: VehicleModelEditView,
                    meta: { auth: true, admin: true },
                },

                {
                    path: 'reservations',
                    name: 'admin-reservations',
                    component: AdminReservationView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },
                {
                    path: 'reservations/:reservation',
                    name: 'admin-reservation-detail',
                    component: ReservationDetailsView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                {
                    path: 'deals',
                    name: 'admin-deals',
                    component: AdminDealsView,
                    meta: { auth: true, admin: true },
                },

                {
                    path: 'deals/:deal',
                    name: 'admin-deal-detail',
                    component: AdminDealDetailsView,
                    meta: { auth: true, admin: true },
                },

                {
                    path: 'deals/:deal/payments',
                    name: 'admin-deal-payments',
                    component: AdminPaymentsView,
                    meta: { auth: true, admin: true },
                },
                {
                    path: 'payments/:payment',
                    name: 'admin-payment-detail',
                    component: AdminPaymentDetailsView,
                    meta: { auth: true, admin: true },
                },

                {
                    path: 'installments',
                    name: 'admin-installments',
                    component: AdminDashboardView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },

                {
                    path: '/admin/discount-codes',
                    name: 'admin-discount-codes',
                    component: DiscountCodesView,
                    meta: { auth: true, admin: true },
                },
                {
                    path: '/admin/discount-codes/create',
                    name: 'admin-discount-code-create',
                    component: DiscountCodeCreateView,
                    meta: { auth: true, admin: true },
                },
                {
                    path: '/admin/discount-codes/:discountCodeId/edit',
                    name: 'admin-discount-code-edit',
                    component: DiscountCodeEditView,
                    meta: { auth: true, admin: true },
                },
                {
                    path: '/admin/pre-orders',
                    name: 'admin-pre-orders',
                    component: AdminPreOrderView,
                    meta: { auth: true, admin: true },
                },

                // System

                {
                    path: 'settings',
                    name: 'admin-settings',
                    component: AdminDashboardView,
                    meta: {
                        auth: true,
                        admin: true,
                    },
                },
            ],
        },
    ],
})

router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (to.meta.auth && !authStore.isAuthenticated) {
        return {
            name: 'welcome',
        }
    }

    if (to.meta.guest && authStore.isAuthenticated) {
        return {
            name: 'dashboard',
        }
    }

    if (to.meta.admin && !authStore.isAdmin) {
        return {
            name: 'dashboard',
        }
    }

    return true
})

export default router