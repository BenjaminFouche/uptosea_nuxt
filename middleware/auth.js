import { useAuthStore } from '../stores/useAuthStore.js'

/**
 * Middleware pour protéger les routes qui nécessitent une authentification
 * @param {Object} to - Route de destination
 * @param {Object} from - Route de provenance
 * @param {Function} next - Fonction de navigation
 */
export function requireAuth(to, from, next) {
  const authStore = useAuthStore()
  
  if (authStore.isLoggedIn) {
    next()
  } else {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}

/**
 * Middleware pour les routes d'utilisateurs (connexion, inscription)
 * Redirige vers l'accueil si l'utilisateur est déjà connecté
 * @param {Object} to - Route de destination
 * @param {Object} from - Route de provenance
 * @param {Function} next - Fonction de navigation
 */
export function requireGuest(to, from, next) {
  const authStore = useAuthStore()
  
  if (authStore.isLoggedIn) {
    const redirectTo = to.query.redirect || '/'
    next(redirectTo)
  } else {
    next()
  }
}

/**
 * Middleware pour vérifier l'authentification avant chaque route
 * @param {Object} to - Route de destination
 * @param {Object} from - Route de provenance
 * @param {Function} next - Fonction de navigation
 */
export async function checkAuth(to, from, next) {
  const authStore = useAuthStore()  
  if (authStore.token && !authStore.isAuthenticated) {
    try {
      await authStore.checkAuth()
    } catch (error) {}
  }
  
  next()
}

/**
 * Middleware pour les routes nécessitant des rôles spécifiques
 * @param {Array} requiredRoles - Rôles requis pour accéder à la route
 */
export function requireRole(requiredRoles) {
  return function(to, from, next) {
    const authStore = useAuthStore()
    
    if (!authStore.isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    const userRoles = authStore.currentUser?.roles || []
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
    
    if (hasRequiredRole) {
      next()
    } else {
      next({ path: '/', query: { error: 'access_denied' } })
    }
  }
}
