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
            <div class="dropdown-menu">
              <a href="https://www.uptosea.com/location-bateau-evenement/balade-en-bateau-coucher-de-soleil/" class="dropdown-item">Coucher de soleil</a>
              <a href="https://www.uptosea.com/location-bateau-evenement/journee-peche-en-mer/" class="dropdown-item">Pêche en mer</a>
              <a href="https://www.uptosea.com/location-bateau-evenement/repas-sur-bateau/" class="dropdown-item">Repas en mer</a>
              <a href="https://www.uptosea.com/location-bateau-evenement/apero-en-mer/" class="dropdown-item">Apéro en mer</a>
              <a href="https://www.uptosea.com/location-bateau-evenement/anniversaire/" class="dropdown-item">Anniversaire</a>
              <a href="https://www.uptosea.com/location-bateau-evenement/evg-evjf/" class="dropdown-item">EVG / EVJF</a>
              <a href="https://www.uptosea.com/location-bateau-evenement/demande-en-mariage/" class="dropdown-item">Demande en mariage</a>
              <a href="https://www.uptosea.com/location-bateau-evenement/seminaire/" class="dropdown-item">Séminaire</a>
            </div>
          </li>
          <li class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle">
              Nos services
              <img src="../../assets/svg/chevron-white.svg" class="dropdown-icon" alt="">
            </a>
            <div class="dropdown-menu">
              <a href="https://www.uptosea.com/conciergerie-bateau/" class="dropdown-item">Pour les propriétaires</a>
              <a href="https://www.uptosea.com/services-locataires/" class="dropdown-item">Pour les locataires</a>
            </div>
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
              <NuxtLink to="/profile" class="dropdown-item" @click="closeUserMenu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Mon profil
              </NuxtLink>

              <NuxtLink v-if="authStore.isProprietaire" to="/dashboard" class="dropdown-item" @click="closeUserMenu">
                <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" viewBox="0 0 36 36">
                  <path d="M13.94,2H4.79a2.77,2.77,0,0,0-2,.82,2.81,2.81,0,0,0-.82,2v9.15a2.8,2.8,0,0,0,2.79,2.79h9.15a2.81,2.81,0,0,0,2-.82,2.77,2.77,0,0,0,.82-2V4.79A2.8,2.8,0,0,0,13.94,2Zm1.27,11.94a1.3,1.3,0,0,1-1.27,1.27H4.79a1.3,1.3,0,0,1-1.27-1.27V4.79A1.3,1.3,0,0,1,4.79,3.52h9.15a1.3,1.3,0,0,1,1.27,1.27Z"/>
                  <path d="M33.18,2.82a2.81,2.81,0,0,0-2-.82H22.06a2.77,2.77,0,0,0-2,.82,2.81,2.81,0,0,0-.82,2v9.15a2.8,2.8,0,0,0,2.79,2.79h9.15a2.81,2.81,0,0,0,2-.82,2.77,2.77,0,0,0,.82-2V4.79A2.81,2.81,0,0,0,33.18,2.82Zm-.7,11.12a1.3,1.3,0,0,1-1.27,1.27H22.06a1.3,1.3,0,0,1-1.27-1.27V4.79a1.3,1.3,0,0,1,1.27-1.27h9.15a1.3,1.3,0,0,1,1.27,1.27Z"/>
                  <path d="M13.94,19.27H4.79a2.77,2.77,0,0,0-2,.82,2.81,2.81,0,0,0-.82,2v9.15a2.81,2.81,0,0,0,.82,2,2.77,2.77,0,0,0,2,.82h9.15a2.8,2.8,0,0,0,2.79-2.79V22.06a2.8,2.8,0,0,0-2.79-2.79Zm1.27,11.94a1.3,1.3,0,0,1-1.27,1.27H4.79a1.3,1.3,0,0,1-1.27-1.27V22.06a1.3,1.3,0,0,1,1.27-1.27h9.15a1.3,1.3,0,0,1,1.27,1.27Z"/>
                  <path d="M31.21,19.27H22.06a2.77,2.77,0,0,0-2,.82,2.81,2.81,0,0,0-.82,2v9.15a2.81,2.81,0,0,0,.82,2,2.77,2.77,0,0,0,2,.82h9.15A2.8,2.8,0,0,0,34,31.21V22.06a2.8,2.8,0,0,0-2.79-2.79Zm1.27,11.94a1.3,1.3,0,0,1-1.27,1.27H22.06a1.3,1.3,0,0,1-1.27-1.27V22.06a1.3,1.3,0,0,1,1.27-1.27h9.15a1.3,1.3,0,0,1,1.27,1.27Z"/>
                </svg>
                Tableau de bord
              </NuxtLink>

              <NuxtLink to="/reservation" class="dropdown-item" @click="closeUserMenu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Mes réservations
              </NuxtLink>

              <NuxtLink v-if="authStore.isProprietaire" to="/proprietaire/bateaux" class="dropdown-item" @click="closeUserMenu">
                <svg width="16" height="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="m445.058594 356.011719c-3.460938-44.203125-14.4375-88.023438-32.714844-130.417969-15.765625-36.566406-36.957031-72.152344-62.980469-105.757812-35.015625-45.222657-69.011719-74.363282-82.59375-85.230469v-34.605469h-66.675781v29.964844h36.710938v24.3125l-167.714844 289.328125h167.714844v26.894531l-236.804688 16.476562 34.171875 124.4375h359.703125l3.023438-1.417968c80.539062-37.777344 108.25-134.109375 109.390624-138.195313l5.710938-20.449219zm-323.960938-42.371094 115.707032-199.609375v199.609375zm145.671875-239.46875c15.785157 14.433594 37.550781 36.332031 59.472657 64.75 36.789062 47.691406 81.363281 123.8125 88.933593 219.167969l-148.40625 10.324218zm120.328125 407.277344h-330.078125l-18.433593-67.117188 431.21875-30.007812c-11.597657 27.222656-37.265626 74.359375-82.707032 97.125zm0 0"/>
                </svg>
                Mes bateaux
              </NuxtLink>

              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-btn" @click="handleLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>

        <NuxtLink v-else to="/login" class="user-icon-desktop">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </NuxtLink>

        <NuxtLink v-if="authStore.isLoggedIn" :to="{ path: '/reservation', query: { statut: 'attente_paiement' } }" class="basket-icon-desktop" title="Réservations en attente de paiement">
          <img src="../../assets/svg/panier.svg">
          <span v-if="shouldShowBasket" class="basket-count">{{ bookingStore.basketCount }}</span>
        </NuxtLink>
      </div>

      <div class="mobile-actions">
        <NuxtLink v-if="!authStore.isLoggedIn" to="/login" class="user-icon-mobile">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </NuxtLink>
        <div v-else class="user-icon-mobile logged-in">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>

        <NuxtLink v-if="authStore.isLoggedIn" :to="{ path: '/reservation', query: { statut: 'attente_paiement' } }" class="basket-icon-desktop">
          <img src="../../assets/svg/panier.svg">
          <span v-if="shouldShowBasket" class="basket-count">{{ bookingStore.basketCount }}</span>
        </NuxtLink>

        <div class="mobile-menu-toggle" :class="{ 'active': isMobileMenuOpen }" @click="toggleMobileMenu">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div class="mobile-menu-overlay" v-if="isMobileMenuOpen" @click="toggleMobileMenu"></div>
      <nav class="nav-mobile" :class="{ 'active': isMobileMenuOpen }">
        <div class="mobile-menu-header">
          <img style="width: 100px" src="https://app.uptosea.com/images/uptosea-blanc.svg" alt="Logo UptoSEA">
          <div class="mobile-menu-close" @click="toggleMobileMenu">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2"/>
            </svg>
          </div>
        </div>
        <div class="mobile-menu-content">
          <ul class="mobile-nav-menu">
            <li class="nav-item dropdown" :class="{ 'active': openDropdown === 'boats' }">
              <a href="#" class="nav-link" @click.prevent="toggleDropdown('boats')">
                <span>Louer un bateau</span>
                <img src="../../assets/svg/chevron.svg" class="dropdown-icon" alt="">
              </a>
              <transition name="submenu">
                <div class="sub-menu" v-show="openDropdown === 'boats'">
                  <NuxtLink to="/bateaux" class="sub-menu-item" @click="closeMobileMenu">Tous</NuxtLink>
                  <NuxtLink to="/bateaux/types/voilier" class="sub-menu-item" @click="closeMobileMenu">Voilier</NuxtLink>
                  <NuxtLink to="/bateaux/types/cabine" class="sub-menu-item" @click="closeMobileMenu">Cabine</NuxtLink>
                  <NuxtLink to="/bateaux/types/semi-rigides" class="sub-menu-item" @click="closeMobileMenu">Semi-rigides</NuxtLink>
                  <NuxtLink to="/bateaux/types/open" class="sub-menu-item" @click="closeMobileMenu">Open</NuxtLink>
                </div>
              </transition>
            </li>
            <li class="nav-item dropdown" :class="{ 'active': openDropdown === 'organize' }">
              <a href="#" class="nav-link" @click.prevent="toggleDropdown('organize')">
                <span>Organiser</span>
                <img src="../../assets/svg/chevron.svg" class="dropdown-icon" alt="">
              </a>
              <transition name="submenu">
                <div class="sub-menu" v-show="openDropdown === 'organize'">
                  <a href="https://www.uptosea.com/location-bateau-evenement/balade-en-bateau-coucher-de-soleil/" class="sub-menu-item" @click="closeMobileMenu">Coucher de soleil</a>
                  <a href="https://www.uptosea.com/location-bateau-evenement/journee-peche-en-mer/" class="sub-menu-item" @click="closeMobileMenu">Pêche en mer</a>
                  <a href="https://www.uptosea.com/location-bateau-evenement/repas-sur-bateau/" class="sub-menu-item" @click="closeMobileMenu">Repas en mer</a>
                  <a href="https://www.uptosea.com/location-bateau-evenement/apero-en-mer/" class="sub-menu-item" @click="closeMobileMenu">Apéro en mer</a>
                  <a href="https://www.uptosea.com/location-bateau-evenement/anniversaire/" class="sub-menu-item" @click="closeMobileMenu">Anniversaire</a>
                  <a href="https://www.uptosea.com/location-bateau-evenement/evg-evjf/" class="sub-menu-item" @click="closeMobileMenu">EVG / EVJF</a>
                  <a href="https://www.uptosea.com/location-bateau-evenement/demande-en-mariage/" class="sub-menu-item" @click="closeMobileMenu">Demande en mariage</a>
                  <a href="https://www.uptosea.com/location-bateau-evenement/seminaire/" class="sub-menu-item" @click="closeMobileMenu">Séminaire</a>
                </div>
              </transition>
            </li>
            <li class="nav-item dropdown" :class="{ 'active': openDropdown === 'services' }">
              <a href="#" class="nav-link" @click.prevent="toggleDropdown('services')">
                <span>Nos services</span>
                <img src="../../assets/svg/chevron.svg" class="dropdown-icon" alt="">
              </a>
              <transition name="submenu">
                <div class="sub-menu" v-show="openDropdown === 'services'">
                  <a href="https://www.uptosea.com/conciergerie-bateau/" class="sub-menu-item dropdown-item">Pour les propriétaires</a>
                  <a href="https://www.uptosea.com/services-locataires/" class="sub-menu-item dropdown-item">Pour les locataires</a>
                </div>
              </transition>
            </li>
            <li class="nav-item">
              <a @click="closeMobileMenu" class="nav-link" href="/articles"><span>Nos articles</span></a>
            </li>
            <li class="nav-item">
              <a @click="closeMobileMenu" class="nav-link" href="https://www.uptosea.com/a-propos/"><span>À propos</span></a>
            </li>
            <li class="nav-item">
              <NuxtLink to="/contact" class="nav-link" @click="closeMobileMenu"><span>Contact</span></NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="https://www.uptosea.com/mettre-en-ligne-mon-bateau/" class="nav-link" @click="closeMobileMenu"><span>Proposer mon bateau</span></NuxtLink>
            </li>

            <template v-if="authStore.isLoggedIn">
              <li class="nav-item login">
                <div class="nav-link" @click="closeMobileMenu">
                  <img src="../../assets/svg/user-mobile.svg" alt="">
                  <span v-if="authStore.currentUser?.email">{{ authStore.currentUser.email }}</span>
                  <span v-else>Connexion</span>
                </div>
              </li>
              <li class="nav-item-login">
                <NuxtLink to="/profile" class="nav-link-login" @click="closeMobileMenu">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Mon profil</span>
                </NuxtLink>
              </li>
              <li v-if="authStore.isProprietaire" class="nav-item-login">
                <NuxtLink to="/dashboard" class="nav-link-login" @click="closeMobileMenu">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" stroke="currentColor" viewBox="0 0 36 36">
                    <path d="M13.94,2H4.79a2.77,2.77,0,0,0-2,.82,2.81,2.81,0,0,0-.82,2v9.15a2.8,2.8,0,0,0,2.79,2.79h9.15a2.81,2.81,0,0,0,2-.82,2.77,2.77,0,0,0,.82-2V4.79A2.8,2.8,0,0,0,13.94,2Zm1.27,11.94a1.3,1.3,0,0,1-1.27,1.27H4.79a1.3,1.3,0,0,1-1.27-1.27V4.79A1.3,1.3,0,0,1,4.79,3.52h9.15a1.3,1.3,0,0,1,1.27,1.27Z"/>
                    <path d="M33.18,2.82a2.81,2.81,0,0,0-2-.82H22.06a2.77,2.77,0,0,0-2,.82,2.81,2.81,0,0,0-.82,2v9.15a2.8,2.8,0,0,0,2.79,2.79h9.15a2.81,2.81,0,0,0,2-.82,2.77,2.77,0,0,0,.82-2V4.79A2.81,2.81,0,0,0,33.18,2.82Zm-.7,11.12a1.3,1.3,0,0,1-1.27,1.27H22.06a1.3,1.3,0,0,1-1.27-1.27V4.79a1.3,1.3,0,0,1,1.27-1.27h9.15a1.3,1.3,0,0,1,1.27,1.27Z"/>
                    <path d="M13.94,19.27H4.79a2.77,2.77,0,0,0-2,.82,2.81,2.81,0,0,0-.82,2v9.15a2.81,2.81,0,0,0,.82,2,2.77,2.77,0,0,0,2,.82h9.15a2.8,2.8,0,0,0,2.79-2.79V22.06a2.8,2.8,0,0,0-2.79-2.79Zm1.27,11.94a1.3,1.3,0,0,1-1.27,1.27H4.79a1.3,1.3,0,0,1-1.27-1.27V22.06a1.3,1.3,0,0,1,1.27-1.27h9.15a1.3,1.3,0,0,1,1.27,1.27Z"/>
                    <path d="M31.21,19.27H22.06a2.77,2.77,0,0,0-2,.82,2.81,2.81,0,0,0-.82,2v9.15a2.81,2.81,0,0,0,.82,2,2.77,2.77,0,0,0,2,.82h9.15A2.8,2.8,0,0,0,34,31.21V22.06a2.8,2.8,0,0,0-2.79-2.79Zm1.27,11.94a1.3,1.3,0,0,1-1.27,1.27H22.06a1.3,1.3,0,0,1-1.27-1.27V22.06a1.3,1.3,0,0,1,1.27-1.27h9.15a1.3,1.3,0,0,1,1.27,1.27Z"/>
                  </svg>
                  <span>Tableau de bord</span>
                </NuxtLink>
              </li>
              <li class="nav-item-login">
                <NuxtLink to="/reservation" class="nav-link-login" @click="closeMobileMenu">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Mes réservations</span>
                </NuxtLink>
              </li>
              <li v-if="authStore.isProprietaire" class="nav-item-login">
                <NuxtLink to="/proprietaire/bateaux" class="nav-link-login" @click="closeMobileMenu">
                  <svg width="16" height="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="m445.058594 356.011719c-3.460938-44.203125-14.4375-88.023438-32.714844-130.417969-15.765625-36.566406-36.957031-72.152344-62.980469-105.757812-35.015625-45.222657-69.011719-74.363282-82.59375-85.230469v-34.605469h-66.675781v29.964844h36.710938v24.3125l-167.714844 289.328125h167.714844v26.894531l-236.804688 16.476562 34.171875 124.4375h359.703125l3.023438-1.417968c80.539062-37.777344 108.25-134.109375 109.390624-138.195313l5.710938-20.449219zm-323.960938-42.371094 115.707032-199.609375v199.609375zm145.671875-239.46875c15.785157 14.433594 37.550781 36.332031 59.472657 64.75 36.789062 47.691406 81.363281 123.8125 88.933593 219.167969l-148.40625 10.324218zm120.328125 407.277344h-330.078125l-18.433593-67.117188 431.21875-30.007812c-11.597657 27.222656-37.265626 74.359375-82.707032 97.125zm0 0"/>
                  </svg>
                  <span>Mes bateaux</span>
                </NuxtLink>
              </li>
              <li class="nav-item-login">
                <button class="nav-link logout-btn-mobile login" @click="handleLogout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span>Se déconnecter</span>
                </button>
              </li>
            </template>

            <li v-else class="nav-item">
              <NuxtLink to="/login" class="nav-link" @click="closeMobileMenu">
                <img src="../../assets/svg/user-mobile.svg" alt="">
                <span>Connexion</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
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