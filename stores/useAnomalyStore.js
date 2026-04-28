import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ApiAnomalyService } from '../services/apiAnomaly';
import { useRouter } from 'vue-router';

export const useAnomalyStore = defineStore('anomaly', () => {
    const router = useRouter();

    const allAnomalies = ref([]);
    const displayedAnomalies = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const searchQuery = ref('');
    const activeTab = ref('all');

    const hasAnomalies = computed(() => displayedAnomalies.value.length > 0);

    const filteredAnomalies = computed(() => {
        let anomaliesToFilter = [...displayedAnomalies.value];

        if (searchQuery.value) {
            const q = searchQuery.value.toLowerCase();
            anomaliesToFilter = anomaliesToFilter.filter(a =>
                (a.titre && a.titre.toLowerCase().includes(q)) ||
                (a.reference && a.reference.toLowerCase().includes(q)) ||
                (a.description && a.description.toLowerCase().includes(q))
            );
        }

        if (activeTab.value === 'en-cours') {
            anomaliesToFilter = anomaliesToFilter.filter(a => a.statut !== 'Résolu');
        } else if (activeTab.value === 'resolu') {
            anomaliesToFilter = anomaliesToFilter.filter(a => a.statut === 'Résolu');
        }

        anomaliesToFilter.sort((a, b) => {
            const statusA = a.statut === 'Résolu' ? 1 : 0;
            const statusB = b.statut === 'Résolu' ? 1 : 0;

            if (statusA !== statusB) {
                return statusA - statusB;
            }

            const dateA = new Date(a.dateCreation);
            const dateB = new Date(b.dateCreation);

            return dateB - dateA;
        });

        return anomaliesToFilter;
    });

    const anomalies = computed(() => filteredAnomalies.value);

    async function fetchAnomalies(boatCode) {
        isLoading.value = true;
        error.value = null;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }

            const response = await ApiAnomalyService.getAnomalies(token);

            let fetchedList = [];
            if (response.elements && Array.isArray(response.elements)) {
                fetchedList = (response.elements.length > 0 && Array.isArray(response.elements[0]))
                    ? response.elements[0]
                    : response.elements;
            }

            allAnomalies.value = fetchedList;

            if (boatCode && boatCode !== 'DEFAULT') {
                displayedAnomalies.value = allAnomalies.value.filter(a => {
                    const codeInAnomaly = a.bateauCode || (a.bateau ? a.bateau.code : null);
                    return codeInAnomaly === boatCode;
                });
            } else {
                displayedAnomalies.value = allAnomalies.value;
            }

            displayedAnomalies.value = displayedAnomalies.value.map(a => {
                let cleanDescription = '';
                if (Array.isArray(a.description)) {
                    cleanDescription = a.description.join('\n');
                } else {
                    cleanDescription = a.description || '';
                }

                return {
                    ...a,
                    id: a.id || a.code,
                    reference: a.code || a.reference || 'N/A',
                    description: cleanDescription,
                    dateCreation: a.dateCreation || a.dateSaisie || a.dateDeclaration || a.dateDebut,
                    priorite: a.priorite || 'Moyenne',
                    statut: a.statut || (a.isArchive ? 'Résolu' : 'En attente'),
                    medias: a.medias || []
                };
            });

        } catch (err) {
            console.error(err);
            error.value = "Impossible de charger les anomalies.";
        } finally {
            isLoading.value = false;
        }
    }

    async function addAnomaly(formData, files) {
        isLoading.value = true;
        error.value = null;

        try {
            const token = localStorage.getItem('token');
            const payload = {
                titre: formData.titre,
                description: [formData.description],
                bateauId: formData.boatCode,
                priorite: formData.priorite || 'Moyenne',
                actionLiee: formData.actionLiee
            };

            const responseBackend = await ApiAnomalyService.createAnomaly(token, payload);
            
            const realAnomalyData = (responseBackend.elements && responseBackend.elements.length > 0)
                ? responseBackend.elements[0]
                : responseBackend;

            const acCodeForUpload = realAnomalyData.code;

            if (files && files.length > 0 && acCodeForUpload) {
                for (const file of files) {
                    await ApiAnomalyService.uploadAnomalyImage(token, acCodeForUpload, file);
                }
            }

            await fetchAnomalies(formData.boatCode);

        } catch (err) {
            error.value = err.message || "Erreur lors de la création";
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateAnomaly(anomaly, files) {
        isLoading.value = true;
        error.value = null;

        try {
            const token = localStorage.getItem('token');
            const idToUpdate = anomaly.id || anomaly.code || anomaly.reference;

            if (!idToUpdate || idToUpdate === 'N/A' || idToUpdate === 'En cours...') {
                throw new Error("Impossible de modifier : référence technique introuvable.");
            }

            const payload = {
                titre: anomaly.titre,
                description: [anomaly.description],
                priorite: anomaly.priorite,
                bateauId: anomaly.bateauCode || (anomaly.bateau ? anomaly.bateau.code : null)
            };

            const responseBackend = await ApiAnomalyService.updateAnomaly(token, idToUpdate, payload);
            
            const realUpdatedData = (responseBackend.elements && responseBackend.elements.length > 0)
                ? responseBackend.elements[0]
                : responseBackend;

            const acCodeForUpload = realUpdatedData.code;

            if (files && files.length > 0 && acCodeForUpload) {
                for (const file of files) {
                    await ApiAnomalyService.uploadAnomalyImage(token, acCodeForUpload, file);
                }
            }

            const boatCode = payload.bateauId;
            await fetchAnomalies(boatCode);

        } catch (err) {
            console.error("Erreur update:", err);
            error.value = err.message || "Impossible de mettre à jour l'anomalie";
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteAnomaly(id, boatCode) {
        isLoading.value = true;
        try {
            const token = localStorage.getItem('token');
            await ApiAnomalyService.deleteAnomaly(token, id);
            await fetchAnomalies(boatCode);
        } catch (err) {
            error.value = "Impossible de supprimer l'anomalie";
        } finally {
            isLoading.value = false;
        }
    }

    return {
        anomalies,
        isLoading,
        error,
        fetchAnomalies,
        addAnomaly,
        updateAnomaly,
        deleteAnomaly,
        searchQuery,
        activeTab,
        totalCount: computed(() => displayedAnomalies.value.length),
        enCoursCount: computed(() => displayedAnomalies.value.filter(a => a.statut !== 'Résolu').length),
        resoluCount: computed(() => displayedAnomalies.value.filter(a => a.statut === 'Résolu').length),
    };
});