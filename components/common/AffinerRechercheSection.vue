<template>
  <div v-show="show" class="affiner-recherche-modal">
    <div class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header-affiner-recherche">
          <h3>Affiner votre recherche</h3>
          <button class="close-button" @click="closeModal">
            <img src="../../assets/svg/croix.svg" alt="">
          </button>
        </div>

        <div class="modal-body">
          <div class="filter-section">
            <h4>Type de bateau</h4>
            <div class="checkbox-group">
              <label class="checkbox-option">
                <input type="checkbox" value="1NAU" v-model="selectedCategoryCodes">
                <span class="checkbox-custom"></span>
                <span>Voilier</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" value="6NAU" v-model="selectedCategoryCodes">
                <span class="checkbox-custom"></span>
                <span>Cabine</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" value="14NAU" v-model="selectedCategoryCodes">
                <span class="checkbox-custom"></span>
                <span>Semi-rigides</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" value="27UTS" v-model="selectedCategoryCodes">
                <span class="checkbox-custom"></span>
                <span>Open</span>
              </label>
            </div>
          </div>

          <hr class="hr-custom">

          <div class="filter-section">
            <h4>Nombre de passagers maximum</h4>
            <div class="passenger-range">
              <div class="range-slider">
                <input type="range" min="0" :max="searchParameters.passagersMax" v-model="passengerCount"
                       class="range-input" @input="updatePassengerRange">
              </div>
              <div class="range-labels">
                <span>{{ passengerCount === 0 ? 'Tous' : passengerCount + ' min' }}</span>
                <span>{{ searchParameters.passagersMax }} max</span>
              </div>
            </div>
          </div>

          <hr class="hr-custom">

          <div class="filter-section">
            <h4>Taille du bateau</h4>
            <div class="taille-range">
              <div class="range-slider">
                <input type="range" min="0" :max="searchParameters.longueurMax" v-model="tailleRange.min"
                       class="range-input range-min" @input="updateTailleRange">
                <input type="range" min="0" :max="searchParameters.longueurMax" v-model="tailleRange.max"
                       class="range-input range-max" @input="updateTailleRange">
              </div>
              <div class="range-labels">
                <span>{{ tailleRange.min }} m</span>
                <span>{{ tailleRange.max }} m</span>
              </div>
            </div>
          </div>

          <hr class="hr-custom">

          <div class="filter-section">
            <h4>Puissance du moteur</h4>
            <div class="puissance-range">
              <div class="range-slider">
                <input type="range" min="0" :max="searchParameters.puissanceMax" v-model="puissanceRange.min"
                       class="range-input range-min" @input="updatePuissanceRange">
                <input type="range" min="0" :max="searchParameters.puissanceMax" v-model="puissanceRange.max"
                       class="range-input range-max" @input="updatePuissanceRange">
              </div>
              <div class="range-labels">
                <span>{{ puissanceRange.min }} CV</span>
                <span>{{ puissanceRange.max }} CV</span>
              </div>
            </div>
          </div>

          <hr class="hr-custom">

          <div class="filter-section">
            <h4>Marque du bateau</h4>
            <div class="checkbox-group">
              <label class="checkbox-option">
                <input type="checkbox" value="zodiac" v-model="selectedBoatMarques">
                <span class="checkbox-custom"></span>
                <span>Zodiac</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" value="3d-tender" v-model="selectedBoatMarques">
                <span class="checkbox-custom"></span>
                <span>3D Tender</span>
              </label>
            </div>
          </div>

          <hr class="hr-custom">

          <div class="filter-section">
            <h4>Trier par</h4>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="sort" value="price-asc" v-model="sortBy">
                <span class="radio-custom"></span>
                <span>Prix croissant</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="sort" value="price-desc" v-model="sortBy">
                <span class="radio-custom"></span>
                <span>Prix décroissant</span>
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <UiButton @click="clearAll" class="btn-clear" variant="secondary">
            Effacer tout
          </UiButton>

          <UiButton @click="applyFilters" class="btn-apply" variant="primary">
            Appliquer les filtres
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Nuxt auto-importe ref, computed, watch, etc. ainsi que UiButton et les stores !
import { ApiBoatService } from '../../services/apiBoat.js'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'apply-filters'])
const route = useRoute()
const boatsStore = useBoatsStore()

const categoryMapping = {
  'voilier': '1NAU',
  'cabine': '6NAU',
  'semi-rigide': '14NAU',
  'open': '27UTS'
}

const getSlugFromCode = (code) => Object.keys(categoryMapping).find(key => categoryMapping[key] === code) || null
const getCodeFromSlug = (slug) => categoryMapping[slug.toLowerCase()] || null

const searchParameters = ref({ longueurMax: 13, puissanceMax: 2250, passagersMax: 12 })
const isLoadingParameters = ref(false)

const sortBy = ref('best-rating')
const priceRange = ref({ min: 0, max: 440 })
const selectedCategoryCodes = ref([])
const selectedBoatMarques = ref([])
const passengerCount = ref(0)
const tailleRange = ref({ min: 0, max: 13 })
const puissanceRange = ref({ min: 0, max: 2250 })
const searchLocation = ref('')
const dateRange = ref({ start: null, end: null })

const isLoadingEquipement = ref(false)
const equipementList = ref([])

const updateRangeProgress = (rangeType, min, max, maxValue) => {
  if (!maxValue || !import.meta.client) return; // Sécurité SSR
  const rangeSlider = document.querySelector(`.${rangeType}-range .range-slider`)
  if (rangeSlider) {
    const minPercent = (min / maxValue) * 100
    const maxPercent = (max / maxValue) * 100
    rangeSlider.style.setProperty('--range-min', `${minPercent}%`)
    rangeSlider.style.setProperty('--range-max', `${maxPercent}%`)
  }
}

const updateAllProgressBars = () => {
  nextTick(() => {
    updateRangeProgress('taille', tailleRange.value.min, tailleRange.value.max, searchParameters.value.longueurMax)
    updateRangeProgress('puissance', puissanceRange.value.min, puissanceRange.value.max, searchParameters.value.puissanceMax)
    updateRangeProgress('passenger', 0, passengerCount.value, searchParameters.value.passagersMax)
  })
}

const parseUrlFilters = () => {
  const p = route.params;
  const q = route.query;

  if (q.ville) searchLocation.value = q.ville;

  if (p.slug) {
    const slug = p.slug.toLowerCase();
    const code = getCodeFromSlug(slug);
    if (code) {
      if (!selectedCategoryCodes.value.includes(code)) selectedCategoryCodes.value.push(code);
    } else {
      if (!selectedBoatMarques.value.includes(slug)) selectedBoatMarques.value.push(slug);
    }
  }

  if (q.categories) {
    const slugs = q.categories.split(',');
    slugs.forEach(slug => {
      const code = getCodeFromSlug(slug);
      if (code && !selectedCategoryCodes.value.includes(code)) {
        selectedCategoryCodes.value.push(code);
      }
    });
  }

  if (q.marques) {
    const marques = q.marques.split(',');
    selectedBoatMarques.value = [...new Set([...selectedBoatMarques.value, ...marques])];
  }
}

const updateUrlAndNavigate = async () => {
  let routePath = '/bateaux'; // Chemin par défaut
  let query = { ...route.query };

  const nbCats = selectedCategoryCodes.value.length;
  const nbMarques = selectedBoatMarques.value.length;
  const totalSelections = nbCats + nbMarques;

  if (totalSelections === 1) {
    if (nbCats === 1) {
      const slug = getSlugFromCode(selectedCategoryCodes.value[0]);
      if (slug) {
        routePath = `/bateaux/types/${slug}`; // Nouveau chemin dynamique
        delete query.categories;
      }
    } else if (nbMarques === 1) {
      // Si tu as une URL spécifique pour les marques, mets-la ici.
      // Sinon, on garde /bateaux avec la marque en query parameter.
      routePath = `/bateaux`;
      query.marques = selectedBoatMarques.value[0];
    }
  } else {
    routePath = '/bateaux';
    if (nbCats > 0) {
      const catSlugs = selectedCategoryCodes.value.map(code => getSlugFromCode(code)).filter(slug => slug !== null);
      if (catSlugs.length > 0) query.categories = catSlugs.join(',');
    } else { delete query.categories; }

    if (nbMarques > 0) {
      query.marques = selectedBoatMarques.value.join(',');
    } else { delete query.marques; }
  }

  // On utilise path au lieu de name
  await navigateTo({ path: routePath, query });
}

const loadSearchParameters = async () => {
  isLoadingParameters.value = true
  try {
    const parameters = await ApiBoatService.getSearchParameters()
    searchParameters.value = {
      longueurMax: Math.ceil(parameters.longueurMax) || 13,
      puissanceMax: parameters.puissanceMax || 2250,
      passagersMax: parameters.passagersMax || 12
    }
    tailleRange.value.max = searchParameters.value.longueurMax
    puissanceRange.value.max = searchParameters.value.puissanceMax
    parseUrlFilters();
    updateAllProgressBars();
  } catch (error) {
    console.error('Erreur chargement paramètres:', error)
  } finally {
    isLoadingParameters.value = false
  }
}

const loadEquipements = async () => {
  try {
    isLoadingEquipement.value = true;
    const response = await ApiBoatService.getBoatEquipement();
    if (response.statut === 'success') equipementList.value = response.elements || [];
  } catch (err) { console.error(err); }
  finally { isLoadingEquipement.value = false; }
};

const closeModal = () => emit('close')

const updateTailleRange = () => {
  if (parseInt(tailleRange.value.min) > parseInt(tailleRange.value.max)) {
    const temp = tailleRange.value.min; tailleRange.value.min = tailleRange.value.max; tailleRange.value.max = temp;
  }
  updateRangeProgress('taille', tailleRange.value.min, tailleRange.value.max, searchParameters.value.longueurMax)
}

const updatePuissanceRange = () => {
  if (parseInt(puissanceRange.value.min) > parseInt(puissanceRange.value.max)) {
    const temp = puissanceRange.value.min; puissanceRange.value.min = puissanceRange.value.max; puissanceRange.value.max = temp;
  }
  updateRangeProgress('puissance', puissanceRange.value.min, puissanceRange.value.max, searchParameters.value.puissanceMax)
}

const updatePassengerRange = () => updateRangeProgress('passenger', 0, passengerCount.value, searchParameters.value.passagersMax)

const clearAll = async () => {
  sortBy.value = 'best-rating'
  searchLocation.value = ''
  priceRange.value = {min: 0, max: 440}
  selectedCategoryCodes.value = []
  selectedBoatMarques.value = []
  passengerCount.value = 0
  dateRange.value = { start: null, end: null };
  tailleRange.value = {min: 0, max: searchParameters.value.longueurMax}
  puissanceRange.value = {min: 0, max: searchParameters.value.puissanceMax}
  updateAllProgressBars();

  await navigateTo({ path: '/bateaux' });
  try { await boatsStore.clearFilters() } catch (error) {}
}

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const applyFilters = async () => {
  closeModal()
  await updateUrlAndNavigate();

  const filters = {
    location: (route.query.ville || boatsStore.activeFilters?.location || '').trim(),
    dateFrom: route.query.debut || boatsStore.activeFilters?.dateFrom || formatDate(dateRange.value.start),
    dateTo: route.query.fin || boatsStore.activeFilters?.dateTo || formatDate(dateRange.value.end),
    sortBy: sortBy.value,
    tailleRange: { min: parseFloat(tailleRange.value.min) || 0, max: parseFloat(tailleRange.value.max) || searchParameters.value.longueurMax },
    puissanceRange: { min: parseFloat(puissanceRange.value.min) || 0, max: parseFloat(puissanceRange.value.max) || searchParameters.value.puissanceMax },
    passengerCount: parseInt(passengerCount.value) || 0,
    categoryCodes: selectedCategoryCodes.value,
    brandSlugs: selectedBoatMarques.value,
  }

  if (import.meta.client) {
    if (filters.dateFrom) localStorage.setItem('searchDateDebut', filters.dateFrom);
    else localStorage.removeItem('searchDateDebut');
  }

  try {
    await boatsStore.applyFilters(filters)
    emit('apply-filters', filters)
  } catch (error) { console.error('Erreur application filtres:', error) }
}

onMounted(async () => {
  await loadSearchParameters()
  await loadEquipements()
})

watch(() => props.show, (isOpen) => {
  if (import.meta.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    document.body.style.touchAction = isOpen ? 'none' : ''
  }

  if (isOpen) {
    const f = boatsStore.activeFilters || {};
    if (f.categoryCodes) selectedCategoryCodes.value = [...f.categoryCodes];
    if (f.brandSlugs) selectedBoatMarques.value = [...f.brandSlugs];
    if (f.passengerCount) passengerCount.value = parseInt(f.passengerCount) || 0;
    if (f.sortBy) sortBy.value = f.sortBy;

    if (f.tailleRange) {
      tailleRange.value = { min: parseFloat(f.tailleRange.min) || 0, max: parseFloat(f.tailleRange.max) || searchParameters.value.longueurMax };
    }
    if (f.puissanceRange) {
      puissanceRange.value = { min: parseFloat(f.puissanceRange.min) || 0, max: parseFloat(f.puissanceRange.max) || searchParameters.value.puissanceMax };
    }
    updateAllProgressBars();
  }
})

defineExpose({ clearAll })
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/affiner-recherche-section';
</style>