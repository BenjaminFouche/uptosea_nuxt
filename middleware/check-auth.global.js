import { useAuthStore } from '~/stores/useAuthStore.js'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()
    if (authStore.token && !authStore.isAuthenticated) {
        try {
            await authStore.checkAuth()
        } catch (error) {}
    }
})