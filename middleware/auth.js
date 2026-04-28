import { useAuthStore } from '~/stores/useAuthStore.js'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isLoggedIn) {
    // Dans Nuxt, on retourne navigateTo au lieu d'utiliser next()
    return navigateTo({
      path: '/login', // Ou ton chemin exact vers la page de login
      query: { redirect: to.fullPath }
    })
  }
})