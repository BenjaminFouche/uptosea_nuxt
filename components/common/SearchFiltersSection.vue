<template>
  <div ref="searchSection" class="search-filters-section" :class="{ 'is-sticky': isSticky }">
    <div class="search-wrapper">

      <div class="search-main-card" @click="openModal">
        <div class="search-card-body">
          <div class="search-input-group">
            <label>Destination</label>
            <div class="display-text">{{ selectedPort || 'Toutes les destinations' }}</div>
          </div>
          <div class="search-separator"></div>
          <div class="search-input-group">
            <label>Période</label>
            <div class="display-text">{{ dateRange?.start ? formattedDateRange : 'Choisir les dates' }}</div>
          </div>
        </div>
        <button class="search-submit-btn">Rechercher</button>
      </div>

      <div v-if="showModal" class="search-modal-overlay" @click.self="!boatsStore.isLoading && closeModal()">
        <div class="search-modal-container" @click.stop>

          <div v-if="boatsStore.isLoading" class="modal-loader-wrapper">
            <LoadingSpinner message="Chargement des bateaux disponible ..." />
          </div>

          <div class="search-modal-grid" :class="{ 'is-loading-blur': boatsStore.isLoading }">
            <div class="search-modal-pane pane-location">
              <span class="step-indicator">01</span>
              <h3 class="pane-title">Destination</h3>
              <div class="select-container">
                <select v-model="selectedPort" class="search-select-input" :disabled="boatsStore.isLoading">
                  <option value="">Toutes les destinations</option>
                  <option v-for="city in boatsStore.availableCities" :key="city.value" :value="city.value">
                    {{ city.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="search-modal-pane pane-calendar">
              <span class="step-indicator">02</span>
              <h3 class="pane-title">Dates de navigation</h3>

              <ClientOnly>
                <VDatePicker
                    v-model="dateRange"
                    mode="date"
                    :min-date="new Date()"
                    is-range
                    expanded
                    rows="2"
                    borderless
                    transparent
                    class="search-datepicker-widget"
                    :disabled="boatsStore.isLoading"
                />
                <template #fallback>
                  <div class="loading-calendar">Chargement du calendrier...</div>
                </template>
              </ClientOnly>

            </div>
          </div>

          <div class="search-modal-footer">
            <button class="btn-text-action" @click="clearAll" :disabled="boatsStore.isLoading">
              Réinitialiser
            </button>
            <div class="footer-buttons">
              <button class="btn-cancel" @click="closeModal" :disabled="boatsStore.isLoading">Fermer</button>
              <button class="btn-apply" @click="search" :disabled="boatsStore.isLoading">
                {{ boatsStore.isLoading ? 'Recherche...' : 'Appliquer' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="search-filter-bar">
        <div class="tabs-container">
          <button v-for="tab in tabs" :key="tab"
                  class="filter-tab-item" :class="{ 'active': activeTab === tab }"
                  @click="selectTab(tab)">
            {{ tab }}
          </button>
        </div>
        <button class="filter-refine-btn" @click="handleRefine">
          Affiner
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
// Plus besoin d'importer Vue ou les stores !
import { DatePicker as VDatePicker } from 'v-calendar';
import 'v-calendar/style.css';

const props = defineProps(['resultsCount', 'activeTab']);
const emit = defineEmits(['refine', 'tabChange', 'search']);

const route = useRoute();
const boatsStore = useBoatsStore();

const tabs = ['Tous', 'Voilier', 'Cabine', 'Semi-rigides', 'Open'];
const isSticky = ref(false);
const showModal = ref(false);

const selectedPort = ref('');
const dateRange = ref({ start: null, end: null });

const formattedDateRange = computed(() => {
  if (!dateRange.value || !dateRange.value.start) return '';
  const options = { day: 'numeric', month: 'short' };
  const start = new Date(dateRange.value.start).toLocaleDateString('fr-FR', options);

  if (dateRange.value.end) {
    const end = new Date(dateRange.value.end).toLocaleDateString('fr-FR', options);
    return `${start} au ${end}`;
  }
  return start;
});

const openModal = () => {
  showModal.value = true;
  if (import.meta.client) document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  showModal.value = false;
  if (import.meta.client) document.body.style.overflow = '';
};

const clearAll = () => {
  selectedPort.value = '';
  dateRange.value = { start: null, end: null };
};

watch(() => route.query, (newQuery) => {
  if (!newQuery.ville) selectedPort.value = '';
  if (!newQuery.debut || !newQuery.fin) dateRange.value = { start: null, end: null };
});

defineExpose({ clearAll });

const formatDateForApi = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const search = async () => {
  const range = dateRange.value || {};
  const filters = {
    location: selectedPort.value ? selectedPort.value.trim() : '',
    dateFrom: range.start ? formatDateForApi(range.start) : null,
    dateTo: range.end ? formatDateForApi(range.end) : null,
  };

  if (import.meta.client) {
    if (filters.dateFrom) localStorage.setItem('searchDateDebut', filters.dateFrom);
    else localStorage.removeItem('searchDateDebut');
  }

  let query = { ...route.query };
  if (filters.location) query.ville = filters.location; else delete query.ville;
  if (filters.dateFrom) query.debut = filters.dateFrom; else delete query.debut;
  if (filters.dateTo) query.fin = filters.dateTo; else delete query.fin;

  await navigateTo({ path: route.path, query }); // Changement de MapsTo()

  try {
    const currentStoreFilters = boatsStore.activeFilters || {};
    const finalFilters = { ...currentStoreFilters, ...filters };
    await boatsStore.applyFilters(finalFilters);
    closeModal();
    emit('search', finalFilters);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
  }
};

const selectTab = (t) => emit('tabChange', t);
const handleRefine = () => emit('refine');

const handleScroll = () => {
  const scrollY = window.scrollY;
  const threshold = 50;
  if (!isSticky.value && scrollY > threshold) isSticky.value = true;
  else if (isSticky.value && scrollY < threshold - 10) isSticky.value = false;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/search-filters-section';
</style>