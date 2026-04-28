import { computed } from 'vue'
import { useAuthStore } from '../stores/useAuthStore.js'

/**
 * Composable pour gérer l'authentification
 */
export function useAuth() {
  const authStore = useAuthStore()

  // État réactif
  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const user = computed(() => authStore.user)
  const token = computed(() => authStore.token)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)

  // Actions
  const login = async (email, password) => {
    return await authStore.login(email, password)
  }

  const logout = async () => {
    return await authStore.logout()
  }

  const register = async (userData) => {
    return await authStore.register(userData)
  }

  const checkAuth = async () => {
    return await authStore.checkAuth()
  }

  const clearError = () => {
    authStore.clearError()
  }

  // Utilitaires
  const hasRole = (role) => {
    return user.value?.roles?.includes(role) || false
  }

  const isOwner = computed(() => {
    return user.value?.type === 'owner' || hasRole('owner')
  })

  const isAdmin = computed(() => {
    return hasRole('admin')
  })

    return {
        isLoggedIn: computed(() => authStore.isLoggedIn),
        user: computed(() => authStore.user),
        token: computed(() => authStore.token),
        isLoading: computed(() => authStore.isLoading),
        error: computed(() => authStore.error),
        isProprietaire: computed(() => {
            const isProp = authStore.user?.proprietaire === true;
            return isProp;
        }),
        isOwner: computed(() => {
            return authStore.user?.type === 'owner' || authStore.user?.roles?.includes('owner') || false;
        }),
        isAdmin: computed(() => {
            return authStore.user?.roles?.includes('admin') || false;
        }),
        login: async (email, password) => await authStore.login(email, password),
        logout: async () => await authStore.logout(),
        register: async (userData) => await authStore.register(userData),
        checkAuth: async () => await authStore.checkAuth(),
        clearError: () => authStore.clearError()
    };
}
