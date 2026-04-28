import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ApiBoatProprietaireService } from '../services/apiBoatProprietaire';
import { ApiAnomalyService } from '@/services/apiAnomaly.js';
import { useAuthStore } from './useAuthStore';

export const useBoatProprietaireStore = defineStore('boatProprietaire', () => {
    // Etat
    const boats = ref([]);
    const anomalies = ref([]);
    const actionsByBoat = ref({});
    const actionDetails = ref({});
    const isLoading = ref(false);
    const error = ref(null);

    const selectedMonth = ref(null);
    const selectedYear = ref(new Date().getFullYear());

    // 2. FONCTION UTILITAIRE POUR RECUPERER LE TOKEN PROPREMENT
    const getToken = () => {
        const authStore = useAuthStore();
        return authStore.token;
    };

    // --- GETTERS (Computed) ---
    const hasBoats = computed(() => boats.value.length > 0);

    const parseApiDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            const parts = dateStr.split(' à ');
            if (parts.length !== 2) return new Date(dateStr);

            const [day, month, year] = parts[0].split('/');
            const [hours, minutes] = parts[1].split('h');
            return new Date(year, month - 1, day, hours, minutes);
        } catch (e) {
            return null;
        }
    };

    // ... (Le code de boatsWithStats, totalRentals, totalAnomalies, totalCommission reste strictement identique) ...
    const boatsWithStats = computed(() => {
        const now = new Date();

        const rawMonth = selectedMonth.value;
        const rawYear = selectedYear.value;

        const applyMonthFilter = rawMonth !== null && rawMonth !== '' && rawMonth !== 'null' && rawMonth !== undefined;
        const applyYearFilter = rawYear !== null && rawYear !== '' && rawYear !== 'null' && rawYear !== undefined;

        const targetMonth = applyMonthFilter ? parseInt(rawMonth, 10) : null;
        const targetYear = applyYearFilter ? parseInt(rawYear, 10) : null;

        return boats.value.map(boat => {
            const boatActionsResponse = actionsByBoat.value[boat.code];
            const boatActions = boatActionsResponse?.elements || [];

            // Filtrage des anomalies
            const filteredAnomalies = anomalies.value.filter(a => {
                if (a.bateauCode !== boat.code) return false;

                let anomalyDate = null;
                if (a.dateCreation) {
                    anomalyDate = new Date(a.dateCreation);
                } else if (a.datePrevu || a.date) {
                    anomalyDate = parseApiDate(a.datePrevu || a.date);
                }

                if (!anomalyDate) return false;

                const matchMonth = !applyMonthFilter || anomalyDate.getMonth() === targetMonth;
                const matchYear = !applyYearFilter || anomalyDate.getFullYear() === targetYear;

                const isArchived = a.archive === true;
                const isResolved = a.statut && (
                    a.statut.toLowerCase().includes('termin') ||
                    a.statut.toLowerCase().includes('trait') ||
                    a.statut.toLowerCase().includes('clôtur')
                );

                return matchMonth && matchYear && !isArchived && !isResolved;
            });

            // Filtrage des locations
            const locationActions = boatActions.filter(action => {
                const isLocation = action.libelleTypeAction?.includes('LOCATION');
                const actionDate = parseApiDate(action.datePrevu);

                if (!isLocation || !actionDate) return false;

                const matchMonth = !applyMonthFilter || actionDate.getMonth() === targetMonth;
                const matchYear = !applyYearFilter || actionDate.getFullYear() === targetYear;

                return matchMonth && matchYear;
            });

            // Status
            const isOccupied = boatActions.some(action => {
                const startDate = parseApiDate(action.datePrevu);
                let endDate = parseApiDate(action.dateFin);

                if (!startDate) return false;
                if (!endDate) {
                    endDate = new Date(startDate);
                    endDate.setHours(23, 59, 59);
                }
                return now >= startDate && now <= endDate;
            });

            // Activités à venir
            const upcomingActivities = boatActions
                .filter(action => {
                    const startDate = parseApiDate(action.datePrevu);
                    return startDate && startDate >= now;
                })
                .sort((a, b) => parseApiDate(a.datePrevu) - parseApiDate(b.datePrevu))
                .map(action => ({
                    id: action.code,
                    type: action.libelleTypeAction || 'Activité',
                    date: action.datePrevu
                }));

            return {
                id: boat.id,
                code: boat.code,
                name: boat.nomBapteme || 'Nom inconnu',
                rentals: locationActions.length,
                upcomingAnomaliesCount: filteredAnomalies.length,
                upcomingActivities: upcomingActivities,
                isOccupied: isOccupied,
                globalCommission: 0,
            };
        });
    });

    const totalRentals = computed(() => boatsWithStats.value.reduce((sum, boat) => sum + boat.rentals, 0));
    const totalAnomalies = computed(() => boatsWithStats.value.reduce((sum, boat) => sum + boat.upcomingAnomaliesCount, 0));
    const totalCommission = computed(() => boatsWithStats.value.reduce((sum, boat) => sum + boat.globalCommission, 0));

    /**
     * Fetch complet des données pour le Dashboard
     */
    async function fetchDashboardData() {
        isLoading.value = true;
        error.value = null;

        try {
            // 3. REMPLACEMENT DE LOCALSTORAGE
            const token = getToken();
            if (!token) throw new Error("Token d'authentification manquant.");

            const currentYear = selectedYear.value;

            const [ownerBoatsResponse, anomaliesResponse] = await Promise.all([
                ApiBoatProprietaireService.getBoatProprietaire(token),
                ApiAnomalyService.getDashboardAnomalies(token, currentYear)
            ]);

            const fetchedBoats = ownerBoatsResponse.boats || [];
            boats.value = fetchedBoats;
            anomalies.value = (anomaliesResponse.elements || []).flat();

            if (fetchedBoats.length > 0) {
                const actionsPromises = fetchedBoats.map(boat =>
                    ApiBoatProprietaireService.getDashboardActionByBoat(boat.code, token, currentYear)
                        .catch(err => {
                            console.warn(`Erreur récup actions pour ${boat.code}`, err);
                            return {elements: []};
                        })
                );

                const actionsResults = await Promise.all(actionsPromises);

                actionsResults.forEach((result, index) => {
                    const boatCode = fetchedBoats[index].code;
                    actionsByBoat.value[boatCode] = result;
                });
            }

        } catch (err) {
            error.value = err.message || 'Une erreur est survenue lors de la récupération des données.';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Fetch des bateaux simple
     */
    async function fetchBoats() {
        isLoading.value = true;
        error.value = null;
        try {
            // 3. REMPLACEMENT DE LOCALSTORAGE
            const token = getToken();
            const response = await ApiBoatProprietaireService.getBoatProprietaire(token);
            boats.value = response.boats || [];
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des bateaux';
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Fetch des actions par bateau
     */
    async function fetchActionsByBoat(code) {
        isLoading.value = true;
        error.value = null;
        try {
            // 3. REMPLACEMENT DE LOCALSTORAGE
            const token = getToken();
            const response = await ApiBoatProprietaireService.getActionByBoat(code, token);
            actionsByBoat.value[code] = response;
            return response;
        } catch (err) {
            error.value = err instanceof Error ? err.message : `Erreur pour le bateau ${code}`;
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchActionsDetail(code) {
        isLoading.value = true;
        error.value = null;
        try {
            const token = getToken();
            const response = await ApiBoatProprietaireService.getActionDetail(code, token);
            actionDetails.value[code] = response;
            return response;
        } catch (err) {
            error.value = err instanceof Error ? err.message : `Erreur pour l'action ${code}`;
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Créer une nouvelle action et rafraîchit la liste
     */
    async function createBoatAction(payload) {
        isLoading.value = true;
        error.value = null;

        const {formData, files} = payload;

        try {
            const token = getToken();
            if (!token) throw new Error("Token manquant");

            const response = await ApiBoatProprietaireService.createBoatAction(token, formData);

            const realActionData = (response.elements && response.elements.length > 0)
                ? response.elements[0]
                : response;

            const actionCode = realActionData.code;

            if (files && files.length > 0 && actionCode) {
                for (const file of files) {
                    await ApiBoatProprietaireService.uploadActionImage(token, actionCode, file);
                }
            }

            if (formData.bateauId) {
                delete actionsByBoat.value[formData.bateauId];
                await fetchActionsByBoat(formData.bateauId);
            }

        } catch (err) {
            console.error("Erreur création action:", err);
            error.value = err.message || "Impossible de créer l'action.";
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Modifier une action
     */
    async function updateBoatAction(actionCode, payload) {
        isLoading.value = true;
        error.value = null;
        const {formData, files} = payload;

        try {
            const token = getToken();

            await ApiBoatProprietaireService.updateBoatAction(token, actionCode, formData);

            if (files && files.length > 0) {
                for (const file of files) {
                    await ApiBoatProprietaireService.uploadActionImage(token, actionCode, file);
                }
            }

            if (formData.bateauId) {
                delete actionsByBoat.value[formData.bateauId];
                delete actionDetails.value[actionCode];
                await fetchActionsByBoat(formData.bateauId);
            }
        } catch (err) {
            error.value = err.message || "Impossible de modifier l'action.";
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Ajoute un document à un bateau
     */
    async function addDocuments(boatCode, files) {
        isLoading.value = true;
        error.value = null;

        try {
            const token = getToken();
            if (!token) throw new Error("Token manquant");

            const uploadPromises = files.map(file =>
                ApiBoatProprietaireService.uploadBoatDocument(token, boatCode, file)
            );
            await Promise.all(uploadPromises);

            try {
                await ApiBoatProprietaireService.clearCacheByBoat(boatCode);
            } catch (cacheErr) {
                console.warn("Erreur vidage cache", cacheErr);
            }

            await fetchBoats();

        } catch (err) {
            console.error("Erreur upload groupé:", err);
            error.value = err.message || "Impossible d'ajouter les documents";
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function refreshBoats() {
        boats.value = [];
        await fetchBoats();
    }

    function clearStore() {
        boats.value = [];
        anomalies.value = [];
        actionsByBoat.value = {};
        error.value = null;
    }

    return {
        boats,
        actionsByBoat,
        isLoading,
        error,
        hasBoats,
        boatsWithStats,
        totalRentals,
        totalAnomalies,
        totalCommission,
        selectedMonth,
        selectedYear,
        fetchDashboardData,
        fetchBoats,
        fetchActionsByBoat,
        fetchActionsDetail,
        addDocuments,
        refreshBoats,
        clearStore,
        createBoatAction,
        updateBoatAction
    };
});