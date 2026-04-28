<template>
  <header id="header" :class="{ 'scrolled': isScrolled }">
    <div class="header-inner">
      <div class="logo-container">
        <NuxtLink to="/" class="logo">
          <img src="https://app.uptosea.com/images/uptosea-blanc.svg" alt="Logo UptoSEA">
        </NuxtLink>
      </div>

      <nav class="nav-desktop">
        <ul class="nav-menu">
          <li class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle">
              Louer un bateau
              <img src="../../assets/svg/chevron-white.svg" class="dropdown-icon" alt="">
            </a>
            <div class="dropdown-menu">
              <NuxtLink to="/bateaux" class="dropdown-item">Tous</NuxtLink>
              <NuxtLink to="/bateaux/types/voilier" class="dropdown-item">Voilier</NuxtLink>
              <NuxtLink to="/bateaux/types/cabine" class="dropdown-item">Cabine</NuxtLink>
              <NuxtLink to="/bateaux/types/semi-rigides" class="dropdown-item">Semi-rigides</NuxtLink>
              <NuxtLink to="/bateaux/types/open" class="dropdown-item">Open</NuxtLink>
            </div>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="https://www.uptosea.com/location-bateau-evenement/">Organiser
              <img src="../../assets/svg/chevron-white.svg" class="dropdown-icon" alt="">
            </a>
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link" to="/articles">Nos articles</NuxtLink>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="https://www.uptosea.com/a-propos/">À propos</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="https://www.uptosea.com/contact/" target="_blank">Contact</a>
          </li>
        </ul>
      </nav>

      <div class="header-actions">
        <a href="https://www.uptosea.com/mettre-en-ligne-mon-bateau/">
          <button class="btn-propose">PROPOSER MON BATEAU</button>
        </a>

        <div v-if="authStore.isLoggedIn" class="user-menu-desktop">
          <div class="user-dropdown">
            <button class="user-avatar" @click="toggleUserMenu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span v-if="authStore.currentUser?.prenom">{{ authStore.currentUser.prenom }}</span>
              <img src="../../assets/svg/chevron-white.svg" class="dropdown-icon" alt="">
            </button>

            <div class="user-dropdown-menu" v-show="showUserMenu">
              <NuxtLink to="/profile" class="dropdown-item" @click="closeUserMenu">Mon profil</NuxtLink>
              <NuxtLink v-if="authStore.isProprietaire" to="/dashboard" class="dropdown-item" @click="closeUserMenu">Tableau de bord</NuxtLink>
              <NuxtLink to="/reservation" class="dropdown-item" @click="closeUserMenu">Mes réservations</NuxtLink>
              <NuxtLink v-if="authStore.isProprietaire" to="/proprietaire/bateaux" class="dropdown-item" @click="closeUserMenu">Mes bateaux</NuxtLink>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-btn" @click="handleLogout">Se déconnecter</button>
            </div>
          </div>
        </div>

        <NuxtLink v-else to="/login" class="user-icon-desktop">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </NuxtLink>

        <NuxtLink v-if="authStore.isLoggedIn" :to="{ path: '/reservation', query: { statut: 'attente_paiement' } }" class="basket-icon-desktop">
          <img src="../../assets/svg/panier.svg">
          <span v-if="shouldShowBasket" class="basket-count">{{ bookingStore.basketCount }}</span>
        </NuxtLink>
      </div>

    </div>
  </header>
</template>

<script setup>
// Syntax Composition API (beaucoup plus propre et natif à Nuxt)
const authStore = useAuthStore()
const bookingStore = useBookingStore()
const route = useRoute()

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const openDropdown = ref(null)
const showUserMenu = ref(false)

const shouldShowBasket = computed(() => {
  return authStore.isLoggedIn && !bookingStore.isBasketLoading && bookingStore.basketCount > 0
})

watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    bookingStore.fetchBasketCount()
  }
}, { immediate: true })

watch(() => route.path, () => {
  closeMobileMenu()
  closeUserMenu()
})

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (!isMobileMenuOpen.value) openDropdown.value = null
  if (import.meta.client) document.body.classList.toggle('mobile-menu-open', isMobileMenuOpen.value)
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  openDropdown.value = null
  if (import.meta.client) document.body.classList.remove('mobile-menu-open')
}

const toggleDropdown = (name) => {
  openDropdown.value = openDropdown.value === name ? null : name
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    closeUserMenu()
    closeMobileMenu()
    bookingStore.basketCount = 0
    await navigateTo('/') // Remplace this.$await navigateTo
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}

const handleClickOutside = (event) => {
  if (showUserMenu.value && import.meta.client) {
    const userMenu = document.querySelector('.user-dropdown')
    if (userMenu && !userMenu.contains(event.target)) {
      closeUserMenu()
    }
  }
}

// Les événements Window doivent être protégés ou appelés dans onMounted (qui ne tourne que sur le client)
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
  document.body.classList.remove('mobile-menu-open')
})
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/common/header';
</style>