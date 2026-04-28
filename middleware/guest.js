import { useAuthStore } from '~/stores/useAuthStore.js'

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()

    if (authStore.isLoggedIn) {
        const redirectTo = to.query.redirect || '/'
        return navigateTo(redirectTo)
    }
})