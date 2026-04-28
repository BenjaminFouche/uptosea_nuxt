import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ApiBoatService } from '../services/apiBoat';
import { useAuthStore } from './useAuthStore';


const normalizeText = (text) => {
    if (!text) return '';
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export const useBoatsStore = defineStore('boats', () => {
    const allBoats = ref([]);
    const boats = ref([]);
    const filteredBoats = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const currentPage = ref(0);
    const itemsPerPage = ref(8)
    const totalBoats = ref(0);
    const activeCategory = ref('Tous');
    const hasFullCache = ref(false); // Pour tracker si on a le cache complet de tous les bateaux
    const activeFilters = ref(null); // Pour stocker les filtres actifs

    // Configuration du cache
    // const CACHE_KEY = 'uptosea_boats_cache';
    // const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

    const hasBoats = computed(() => boats.value.length > 0);
    const totalPages = computed(() => Math.ceil(totalBoats.value / itemsPerPage.value));
    const hasNextPage = computed(() => currentPage.value < totalPages.value - 1);
    const hasPreviousPage = computed(() => currentPage.value > 0);

    // Fonctions utilitaires pour le cache
    // function saveCacheToStorage(data, isFullCache = false) {
    //   try {
    //     const cacheData = {
    //       boats: data,
    //       timestamp: Date.now(),
    //       isFullCache: isFullCache // Indique si c'est le cache complet ou partiel
    //     };
    //     localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    //   } catch (error) {
    //     console.warn('Impossible de sauvegarder le cache:', error);
    //   }
    // }
    //
    // function loadCacheFromStorage() {
    //   try {
    //     const cached = localStorage.getItem(CACHE_KEY);
    //     if (!cached) return null;
    //
    //     const cacheData = JSON.parse(cached);
    //     const now = Date.now();
    //
    //     // Vérifier si le cache n'est pas expiré
    //     if (now - cacheData.timestamp > CACHE_DURATION) {
    //       localStorage.removeItem(CACHE_KEY);
    //       return null;
    //     }
    //
    //     // Mettre à jour hasFullCache selon l'info du cache
    //     hasFullCache.value = cacheData.isFullCache || false;
    //
    //     return cacheData.boats;
    //   } catch (error) {
    //     console.warn('Impossible de charger le cache:', error);
    //     localStorage.removeItem(CACHE_KEY);
    //     return null;
    //   }
    // }
    //
    // function clearCache() {
    //   localStorage.removeItem(CACHE_KEY);
    // }

    function updateDisplayedBoats() {
        const startIndex = currentPage.value * itemsPerPage.value;
        const endIndex = startIndex + itemsPerPage.value;
        boats.value = filteredBoats.value.slice(startIndex, endIndex);
    }

    // Charge tout les bateaux
    async function fetchAllBoatsOnce() {
        if (allBoats.value.length > 0 && hasFullCache.value) return;

        isLoading.value = true;
        error.value = null;
        try {
            // const cachedBoats = loadCacheFromStorage();

            // // Si on a un cache complet valide, l'utiliser
            // if (cachedBoats && cachedBoats.length > 0 && hasFullCache.value) {
            //   allBoats.value = cachedBoats;
            //   filteredBoats.value = cachedBoats;
            //   totalBoats.value = cachedBoats.length;
            // } else {
            const response = await ApiBoatService.getAllBoats(0, 100);
            allBoats.value = response.boats;
            filteredBoats.value = [...allBoats.value];
            totalBoats.value = allBoats.value.length;
            hasFullCache.value = true;

            // saveCacheToStorage(response.boats, true); // true = cache complet }
        } catch (err) {
            error.value = err.message;
            console.error('Erreur fetchAllBoatsOnce:', err);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchBoatsByDateRange(from, to) {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await ApiBoatService.getBoats(from, to);
            allBoats.value = response.boats;
            filteredBoats.value = [...allBoats.value];
            totalBoats.value = allBoats.value.length;
            hasFullCache.value = false;
            updateDisplayedBoats();
        } catch (err) {
            error.value = err.message;
            console.error('Erreur fetchBoatsByDateRange:', err);
        } finally {
            isLoading.value = false;
        }
    }

    // Pagination
    function goToPage(page) {
        if (page < 0 || page >= totalPages.value) return;
        currentPage.value = page;
        updateDisplayedBoats();
    }

    async function filterBoatsByCategory(category) {
        activeCategory.value = category;

            // Mapping libellé d'onglet
            const categoryCodeMapping = {
                'Voilier': '1NAU',
                'Cabine': '6NAU',
                'Semi rigide': '14NAU',
                'Semi-rigides': '14NAU',
                'Open': '27UTS',
                'Tous': null
            };

        const code = categoryCodeMapping[category];
        const currentFilters = activeFilters.value || {};

        // On met à jour UNIQUEMENT la catégorie
        const newFilters = {
            ...currentFilters,
            categoryCodes: code ? [code] : []
        };

        await applyFilters(newFilters);
    }

    /**
     * @param {number} page
     * @param {number} limit
     */
    async function fetchBoats(page = 0, limit = 8) {
        await fetchAllBoatsOnce();
        currentPage.value = page;
        itemsPerPage.value = limit;
        updateDisplayedBoats();
    }

    function loadMoreBoats() {
        if (hasNextPage.value && !isLoading.value) {
            goToPage(currentPage.value + 1);
        }
    }

    function loadPreviousBoats() {
        if (hasPreviousPage.value && !isLoading.value) {
            goToPage(currentPage.value - 1);
        }
    }

    /**
     * @param {string} code
     * @returns {Promise<import('../types/Boat').Boat | null>}
     */
    async function getBoatById(code) {
        try {
            if (allBoats.value.length === 0) {
                if (cachedBoats && cachedBoats.length > 0) {
                    allBoats.value = cachedBoats;
                }
            }

            const existingBoat = allBoats.value.find(boat => boat.code === code);
            if (existingBoat) {
                return existingBoat;
            }

            const boat = await ApiBoatService.getBoatById(code);

            if (boat) {
                allBoats.value.push(boat);
            }

            return boat;
        } catch (err) {
            return null;
        }
    }

    function clearBoats() {
        boats.value = [];
        filteredBoats.value = [];
        allBoats.value = [];
        totalBoats.value = 0;
        currentPage.value = 0;
        activeCategory.value = 'Tous';
        hasFullCache.value = false;
        error.value = null;
        clearCache();
    }

    // Rechargement des bateaux
    async function refreshBoats() {
        clearCache();
        allBoats.value = [];
        hasFullCache.value = false;
        await fetchBoats(0, itemsPerPage.value);
    }

    /**
     * Applique des filtres avancés aux bateaux
     * @param {Object} filters - Filtres à appliquer
     */
    async function applyFilters(newFilters) {
        isLoading.value = true;
        error.value = null;

        activeFilters.value = {
            ...(activeFilters.value || {}),
            ...newFilters
        };

        const filters = activeFilters.value;

        try {
            if (filters.dateFrom && filters.dateTo) {
                await fetchBoatsByDateRange(filters.dateFrom, filters.dateTo);
            } else {
                await fetchAllBoatsOnce();
            }

            let filteredResult = [...allBoats.value];

            // Filtre Lieu
            if (filters.location && filters.location.trim() !== '') {
                const searchVille = normalizeText(filters.location.trim());
                filteredResult = filteredResult.filter(boat => {
                    if (!boat.franchise || !boat.franchise.ville) return false;
                    return normalizeText(boat.franchise.ville).includes(searchVille);
                });
            }

            // Filtres Taille (Forcé en Nombre pour éviter les bugs)
            if (filters.tailleRange) {
                const minT = parseFloat(filters.tailleRange.min) || 0;
                const maxT = parseFloat(filters.tailleRange.max) || 100;
                filteredResult = filteredResult.filter(boat => {
                    const longueur = parseFloat(boat.longueur) || 0;
                    return longueur >= minT && longueur <= maxT;
                });
            }

            // Filtres Puissance (Forcé en Nombre)
            if (filters.puissanceRange) {
                const minP = parseFloat(filters.puissanceRange.min) || 0;
                const maxP = parseFloat(filters.puissanceRange.max) || 10000;
                filteredResult = filteredResult.filter(boat => {
                    const puissance = parseFloat(boat.puissance) || 0;
                    return puissance >= minP && puissance <= maxP;
                });
            }

            // Filtre Passagers
            if (filters.passengerCount && parseInt(filters.passengerCount) > 0) {
                const minPass = parseInt(filters.passengerCount);
                filteredResult = filteredResult.filter(boat => {
                    const cap = parseInt(boat.nombreDePersonnesAutorisees) || 0;
                    return cap >= minPass;
                });
            }

            // Filtre Catégories (Onglets ET Checkboxes)
            if (filters.categoryCodes && filters.categoryCodes.length > 0) {
                filteredResult = filteredResult.filter(boat =>
                    filters.categoryCodes.includes(boat.categorieCode)
                );
            }

            // Filtre Marques
            if (filters.brandSlugs && filters.brandSlugs.length > 0) {
                const brandSet = new Set(filters.brandSlugs.map(s => (s || '').toLowerCase()));
                filteredResult = filteredResult.filter(boat => brandSet.has((boat.marqueSlug || '').toLowerCase()));
            }

            // Tri
            if (filters.sortBy) {
                const getPrice = (boat) => parseFloat(boat.prixMinimal) || parseFloat(boat.prixJournalier) || 0;
                if (filters.sortBy === 'price-asc') filteredResult.sort((a, b) => getPrice(a) - getPrice(b));
                else if (filters.sortBy === 'price-desc') filteredResult.sort((a, b) => getPrice(b) - getPrice(a));
                else if (filters.sortBy === 'best-rating') filteredResult.sort((a, b) => (parseFloat(b.note) || 0) - (parseFloat(a.note) || 0));
            }

            filteredBoats.value = filteredResult;
            totalBoats.value = filteredResult.length;
            currentPage.value = 0;
            updateDisplayedBoats();

        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur filtres';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Supprime tous les filtres et affiche tous les bateaux
     */
    async function clearFilters() {
        isLoading.value = true;
        error.value = null;

        // Réinitialiser tous les filtres
        activeFilters.value = null;
        activeCategory.value = 'Tous';

        try {
            await fetchAllBoatsOnce();

            filteredBoats.value = [...allBoats.value];
            totalBoats.value = allBoats.value.length;
            currentPage.value = 0;
            updateDisplayedBoats();
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression des filtres';
            console.error('Erreur dans clearFilters:', err);
        } finally {
            isLoading.value = false;
        }
    }

    const availableCities = computed(() => {
        const uniqueCityMap = new Map();

        allBoats.value.forEach(boat => {
            const ville = boat.franchise?.ville;
            if (ville && ville.trim() !== '') {
                const normalizedValue = normalizeText(ville.trim());

                if (!uniqueCityMap.has(normalizedValue)) {
                    const displayLabel = ville.toLowerCase().replace(/(?:^|\s|-|')\S/g, match => match.toUpperCase());
                    uniqueCityMap.set(normalizedValue, displayLabel);
                }
            }
        });

        return Array.from(uniqueCityMap, ([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label));
    });

    // Récupère les contacts de la franchise si une ville est sélectionnée
    const activeFranchiseContact = computed(() => {
        const location = activeFilters.value?.location;
        if (!location || location.trim() === '') return null;

        const searchVille = normalizeText(location.trim());

        const boatFromLocation = allBoats.value.find(boat => {
            return boat.franchise && boat.franchise.ville && normalizeText(boat.franchise.ville).includes(searchVille);
        });

        if (boatFromLocation && boatFromLocation.franchise) {
            const displayCity = boatFromLocation.franchise.ville.toLowerCase().replace(/(?:^|\s|-|')\S/g, match => match.toUpperCase());

            const hasTel = !!boatFromLocation.franchise.tel;
            const hasMail = !!boatFromLocation.franchise.mail;

            if (!hasTel && !hasMail) return null;

            return {
                ville: displayCity,
                nom: boatFromLocation.franchise.nom || displayCity,
                telephone: boatFromLocation.franchise.tel || null,
                email: boatFromLocation.franchise.mail || null
            };
        }
        return null;
    });

    return {
        boats,
        isLoading,
        error,
        currentPage,
        itemsPerPage,
        totalBoats,
        activeCategory,
        hasFullCache,
        activeFilters,
        availableCities,
        activeFranchiseContact,

        hasBoats,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        goToPage,

        fetchBoats,
        fetchBoatsByDateRange,
        loadMoreBoats,
        loadPreviousBoats,
        getBoatById,
        clearBoats,
        refreshBoats,
        filterBoatsByCategory,
        applyFilters,
        clearFilters
    };
});
