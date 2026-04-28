<template>
  <div v-if="boatsStore.error" class="full-view-error">
    <ErreurApi :errorDetail="boatsStore.error" @retry="retryLoading" />
  </div>

  <div v-else class="page-boats-wrapper">
    <div class="search-sticky-holder">
      <SearchFiltersSection
          ref="searchFiltersRef"
          :results-count="boatsStore.totalBoats"
          :active-tab="currentTabName"
          @refine="handleRefine"
          @tab-change="handleTabChange"
          @search="handleSearch"
      />
    </div>

    <div class="container container-boats-list">
      <div class="boats-list-page">

        <AffinerRechercheSection
            ref="affinerRechercheRef"
            :show="showRefineModal"
            @close="handleCloseRefineModal"
            @apply-filters="handleApplyFilters"
        />

        <Breadcrumbs />

        <div v-if="boatsStore.activeFranchiseContact" class="franchise-contact-banner">
          <div class="contact-content">
            <span class="contact-text">
              Notre agence <strong>{{ boatsStore.activeFranchiseContact.nom }}</strong> est à votre écoute
            </span>

            <span v-if="boatsStore.activeFranchiseContact.telephone" class="contact-separator">au</span>

            <a v-if="boatsStore.activeFranchiseContact.telephone" :href="`tel:${boatsStore.activeFranchiseContact.telephone.replace(/\s/g, '')}`" class="contact-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              {{ boatsStore.activeFranchiseContact.telephone }}
            </a>

            <span v-if="boatsStore.activeFranchiseContact.telephone && boatsStore.activeFranchiseContact.email" class="contact-separator">ou par e-mail à</span>
            <span v-else-if="boatsStore.activeFranchiseContact.email" class="contact-separator">par e-mail à</span>

            <a v-if="boatsStore.activeFranchiseContact.email" :href="`mailto:${boatsStore.activeFranchiseContact.email}`" class="contact-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              {{ boatsStore.activeFranchiseContact.email }}
            </a>
          </div>
        </div>

        <h1 class="boats-page-title">{{ pageTitle }}</h1>

        <div v-if="hasActiveFilters" class="active-filters-bar">
          <span class="filters-active-text">Filtres actifs</span>
          <UiButton @click="clearAllFilters" variant="outline" size="small">
            Effacer tous les filtres
          </UiButton>
        </div>

        <LoadingSpinner v-if="boatsStore.isLoading" message="Chargement des bateaux..." />

        <div v-else-if="!boatsStore.hasBoats && !boatsStore.isLoading" class="empty-container">
          <div class="empty-icon">🚢</div>
          <h3>Aucun bateau disponible</h3>
          <p class="empty-p">Il n'y a actuellement aucun bateau correspondant à votre recherche.</p>
          <div class="empty-actions">
            <UiButton @click="clearAllFilters" variant="primary">
              Voir tous les bateaux
            </UiButton>
          </div>
        </div>

        <div v-else class="boats-content">
          <div class="boats-grid">
            <NuxtLink
                v-for="boat in boatsStore.boats"
                :key="boat.code"
                :to="`/bateaux/${boat.code}`"
                class="boat-link"
            >
              <BoatCard :boat="boat"/>
            </NuxtLink>
          </div>

          <div v-if="boatsStore.totalPages > 1" class="pagination">
            <button class="pagination-arrow" :disabled="!boatsStore.hasPreviousPage || boatsStore.isLoading" @click="goToPreviousPage">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <span class="pagination-info">Page {{ boatsStore.currentPage + 1 }} sur {{ boatsStore.totalPages }}</span>
            <button class="pagination-arrow" :disabled="!boatsStore.hasNextPage || boatsStore.isLoading" @click="goToNextPage">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>

        <HelpSection @contact-expert="handleContactExpert"/>
        <FaqSection/>
        <ReassuranceSection/>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  breadcrumb: 'Bateaux'
})

// Plus besoin d'imports manuels grâce à l'auto-import Nuxt !
const route = useRoute();
const boatsStore = useBoatsStore();

const showRefineModal = ref(false);
const affinerRechercheRef = ref(null);
const searchFiltersRef = ref(null);

// Mappings
const tabToSlugMapping = {
  'Voilier': 'voilier',
  'Cabine': 'cabine',
  'Semi-rigides': 'semi-rigides',
  'Open': 'open'
};

const slugToTabMapping = {
  'voilier': 'Voilier',
  'cabine': 'Cabine',
  'semi-rigides': 'Semi-rigides',
  'semi-rigide': 'Semi-rigides',
  'open': 'Open'
};

// 1. Fonction qui gère l'URL
const applyFilterFromUrl = async () => {
  const slug = route.params.slug;
  if (slug) {
    const categoryName = slugToTabMapping[slug.toLowerCase()];
    if (categoryName) {
      await boatsStore.filterBoatsByCategory(categoryName);
    } else {
      boatsStore.activeCategory = null;
    }
  } else {
    await boatsStore.filterBoatsByCategory('Tous');
  }
};

// 2. Initialisation au montage
onMounted(async () => {
  // IMPORTANT : On applique le filtre AVANT de charger les bateaux manquants
  await applyFilterFromUrl();

  if (!boatsStore.hasBoats || !boatsStore.hasFullCache) {
    await boatsStore.fetchBoats(0, 8);
  }
});

// 3. Surveiller les changements d'URL
watch(
    () => route.params.slug,
    async () => {
      await applyFilterFromUrl();
    }
);

watch(
    () => boatsStore.currentPage,
    () => {
      nextTick(() => {
        if (import.meta.client) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
);

const handleTabChange = async (tabName) => {
  const currentQuery = { ...route.query };

  if (tabName === 'Tous') {
    await navigateTo({ path: '/bateaux', query: currentQuery });
  } else {
    const slug = tabToSlugMapping[tabName];
    if (slug) {
      await navigateTo({ path: `/bateaux/types/${slug}`, query: currentQuery });
    }
  }
};

const currentTabName = computed(() => {
  const slug = route.params.slug;
  if (slug) {
    const categoryName = slugToTabMapping[slug.toLowerCase()];
    if (categoryName) return categoryName;
    return '';
  }
  return 'Tous';
});

const hasActiveFilters = computed(() => {
  if (route.params.slug) return true;
  if (Object.keys(route.query).length > 0) return true;

  const f = boatsStore.activeFilters;
  if (!f) return false;

  if (f.categoryCodes && f.categoryCodes.length > 0) return true;
  if (f.brandSlugs && f.brandSlugs.length > 0) return true;
  if (f.passengerCount && f.passengerCount > 0) return true;
  if (f.location && f.location.trim() !== '') return true;
  if (f.dateFrom || f.dateTo) return true;
  if (f.sortBy && f.sortBy !== 'best-rating') return true;
  if (f.tailleRange && f.tailleRange.min > 0) return true;
  if (f.puissanceRange && f.puissanceRange.min > 0) return true;

  return false;
});

const pageTitle = computed(() => {
  const slug = route.params.slug;
  if (slug) {
    const categoryName = slugToTabMapping[slug.toLowerCase()];
    if (categoryName) return `Nos ${categoryName}`;
    return `Bateaux ${slug.charAt(0).toUpperCase() + slug.slice(1)}`;
  }
  if (Object.keys(route.query).length > 0) return 'Résultats de recherche';
  return 'Tous nos bateaux';
});

const handleRefine = () => { showRefineModal.value = true; };
const handleCloseRefineModal = () => { showRefineModal.value = false; };
const handleApplyFilters = () => { showRefineModal.value = false; };

const clearAllFilters = async () => {
  if (affinerRechercheRef.value && affinerRechercheRef.value.clearAll) {
    await affinerRechercheRef.value.clearAll();
  }
  if (searchFiltersRef.value && searchFiltersRef.value.clearAll) {
    searchFiltersRef.value.clearAll();
  }

  await navigateTo('/bateaux');

  if (import.meta.client) {
    localStorage.removeItem('searchDateDebut');
  }

  await boatsStore.clearFilters();
};

const retryLoading = async () => await boatsStore.fetchBoats(0, 8);
const goToPreviousPage = () => {
  if (boatsStore.hasPreviousPage && !boatsStore.isLoading) {
    boatsStore.goToPage(boatsStore.currentPage - 1);
  }
};
const goToNextPage = () => {
  if (boatsStore.hasNextPage && !boatsStore.isLoading) {
    boatsStore.goToPage(boatsStore.currentPage + 1);
  }
};
const handleContactExpert = () => {};
const handleSearch = () => {};
</script>

<style lang="scss">
/* -- Le SCSS reste inchangé -- */
.franchise-contact-banner {
  background-color: #f0f4f8;
  border-left: 4px solid #3c5da8;
  border-radius: 6px;
  padding: 12px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.contact-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #4a5568;
  line-height: 1.5;
}

.contact-text strong {
  color: #2d3748;
}

.contact-separator {
  color: #718096;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #3c5da8;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s ease;

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }

  svg {
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .franchise-contact-banner {
    padding: 12px 15px;

    .contact-content {
      font-size: 14px;
      gap: 6px;
    }
  }
}

.full-view-error {
  width: 100%;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.page-boats-wrapper {
  width: 100%;
  overflow: visible !important;
}

.search-sticky-holder {
  width: 100%;
  position: sticky;
  top: 90px;
  z-index: 90;
}

.container-boats-list, .container {
  overflow: visible !important;
}
</style>