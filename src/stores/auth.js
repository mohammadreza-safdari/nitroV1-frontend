import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {

    state: () => ({
        user: null,
        token: localStorage.getItem('token'),
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.is_admin === true,
    },

    actions: {
        async login(credentials) {
            try {
                const response = await api.post('/auth/login', credentials)
                console.log('LOGIN USER:', response.data.user)
                this.token = response.data.token
                this.user = response.data.user

                localStorage.setItem('token', this.token)
            } catch (error) {
                console.log('LOGIN ERROR:', error.response?.data)
                throw error
            }
        },

        async register(data) {
            const response = await api.post('/auth/register', data)

            this.token = response.data.token
            this.user = response.data.user

            localStorage.setItem('token', this.token)
        },

        async fetchUser() {
            if (!this.token) {
                return
            }

            try {
                const response = await api.get('/auth/user')
                this.user = response.data.user
            } catch (error) {
                this.user = null
                this.token = null
                localStorage.removeItem('token')
                throw error
            }
        },

        async logout() {
            await api.post('/auth/logout')

            this.user = null
            this.token = null

            localStorage.removeItem('token')
        },
    },
})