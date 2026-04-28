export class ApiBoatService {

    // Fonction utilitaire pour récupérer l'URL de base proprement
    static getBaseUrl() {
        const config = useRuntimeConfig();
        return config.public.apiUrl;
    }

    /**
     * Récupère la liste de tous les bateaux
     */
    static async getAllBoats(offset = 0, limit = 100) {
        try {
            // $fetch parse automatiquement le JSON et lance une erreur si status n'est pas 2xx
            const data = await $fetch(`${this.getBaseUrl()}/api/bateaux`, {
                query: { offset, limit } // Remplace les concaténations "?offset=..."
            });

            if (data.statut !== 'success') {
                throw new Error(`Erreur API: ${data.message}`);
            }

            return {
                boats: data.elements,
                total: data.nbElements
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des bateaux:', error);
            throw error;
        }
    }

    /**
     * Récupère les bateaux disponibles pour une période donnée
     */
    static async getBoats(from, to) {
        try {
            const data = await $fetch(`${this.getBaseUrl()}/api/bateaux`, {
                query: { from, to }
            });

            if (data.statut !== 'success') {
                throw new Error(`Erreur API: ${data.message}`);
            }

            return {
                boats: data.elements,
                total: data.nbElements
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des bateaux par date:', error);
            throw error;
        }
    }

    /**
     * Récupère les détails d'un bateau par son ID
     */
    static async getBoatById(code) {
        try {
            const data = await $fetch(`${this.getBaseUrl()}/api/bateaux/${code}`);
            return data;
        } catch (error) {
            // Avec $fetch, les données d'erreur de l'API sont dans error.data
            const errorMessage = error.data?.message || `Erreur API: ${error.statusCode}`;
            const customError = new Error(errorMessage);
            customError.data = error.data;
            console.error(`Erreur lors de la récupération du bateau ${code}:`, customError);
            throw customError;
        }
    }

    /**
     * Récupère les réservations d'un bateau
     */
    static async getBoatReservations(code, from, to) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/bateaux/${code}/reservations`, {
                query: { from, to }
            });
        } catch (error) {
            console.error(`Erreur lors de la récupération des réservations du bateau ${code}:`, error);
            throw error;
        }
    }

    /**
     * Récupère les disponibilités d'un bateau
     */
    static async getBoatAvailabilities(code, from, to) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/bateaux/${code}/disponibilites`, {
                query: { from, to }
            });
        } catch (error) {
            console.error(`Erreur lors de la récupération des disponibilités du bateau ${code}:`, error);
            throw error;
        }
    }

    /**
     * Récupère les options d'un bateau
     */
    static async getBoatOptions(code) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/bateaux/${code}/options`);
        } catch (error) {
            console.error(`Erreur lors de la récupération des options du bateau ${code}:`, error);
            throw error;
        }
    }

    static async getBoatCategory() {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/bateaux-categories`);
        } catch (error) {
            console.error('Erreur getBoatCategory:', error);
            throw error;
        }
    }

    static async getBoatEvent() {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/bateaux-evenements`);
        } catch (error) {
            console.error('Erreur getBoatEvent:', error);
            throw error;
        }
    }

    static async getBoatEquipement() {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/bateaux-equipements`);
        } catch (error) {
            console.error('Erreur getBoatEquipement:', error);
            throw error;
        }
    }

    /**
     * Récupère les paramètres de recherche (valeurs max pour les filtres)
     */
    static async getSearchParameters() {
        try {
            const data = await $fetch(`${this.getBaseUrl()}/api/bateaux-recherche-parametres`);

            if (data.statut !== 'success') {
                throw new Error(`Erreur API: ${data.message}`);
            }

            return data.elements[0];
        } catch (error) {
            console.error('Erreur lors de la récupération des paramètres de recherche:', error);
            throw error;
        }
    }

    /**
     * Recherche des bateaux avec des filtres
     */
    static async searchBoatsWithFilters(filters = {}) {
        try {
            const data = await $fetch(`${this.getBaseUrl()}/api/bateaux`, {
                query: { offset: 0, limit: 200 }
            });

            if (data.statut !== 'success') {
                throw new Error(`Erreur API: ${data.message}`);
            }

            let boats = data.elements || [];

            // Appliquer les filtres
            if (filters.tailleRange) {
                boats = boats.filter(boat => {
                    const longueur = parseFloat(boat.longueur);
                    return longueur >= filters.tailleRange.min && longueur <= filters.tailleRange.max;
                });
            }

            if (filters.puissanceRange) {
                boats = boats.filter(boat => {
                    const puissance = parseFloat(boat.puissance);
                    return puissance >= filters.puissanceRange.min && puissance <= filters.puissanceRange.max;
                });
            }

            if (filters.passengerCount && filters.passengerCount > 0) {
                boats = boats.filter(boat => {
                    const passagers = parseInt(boat.nombreDePersonnesAutorisees) || 0;
                    return passagers >= filters.passengerCount;
                });
            }

            if (filters.boatTypes && filters.boatTypes.length > 0) {
                boats = boats.filter(boat => {
                    const typeMapping = {
                        'semi-rigides': ['Semi rigide', 'Semi-rigide'],
                        'voilier': ['Voilier'],
                        'yacht': ['Yacht'],
                        'bateau-moteur': ['Bateau à moteur', 'Open', 'Cabine'],
                        'bateau-sans-permis': ['Sans permis']
                    };

                    return filters.boatTypes.some(selectedType => {
                        const apiTypes = typeMapping[selectedType] || [selectedType];
                        return apiTypes.some(apiType =>
                            boat.famille === apiType ||
                            boat.categorieNom === apiType ||
                            boat.type === apiType
                        );
                    });
                });
            }

            if (filters.brandSlugs && filters.brandSlugs.length > 0) {
                const brandSet = new Set(filters.brandSlugs.map(s => (s || '').toLowerCase()));
                boats = boats.filter(boat => brandSet.has((boat.marqueSlug || '').toLowerCase()));
            }

            if (filters.equipements && filters.equipements.length > 0) {
                const equipementSet = new Set(filters.equipements);
                boats = boats.filter(boat => {
                    const boatEquipements = boat.equipements || [];
                    return boatEquipements.some(eq => equipementSet.has(eq));
                });
            }

            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case 'price-asc':
                        boats.sort((a, b) => (parseFloat(a.prixMinimal) || parseFloat(a.prixJournalier) || parseFloat(a.prix) || 0) - (parseFloat(b.prixMinimal) || parseFloat(b.prixJournalier) || parseFloat(b.prix) || 0));
                        break;
                    case 'price-desc':
                        boats.sort((a, b) => (parseFloat(b.prixMinimal) || parseFloat(b.prixJournalier) || parseFloat(b.prix) || 0) - (parseFloat(a.prixMinimal) || parseFloat(a.prixJournalier) || parseFloat(a.prix) || 0));
                        break;
                    case 'best-rating':
                        boats.sort((a, b) => parseFloat(b.note || 0) - parseFloat(a.note || 0));
                        break;
                }
            }

            return { boats: boats, total: boats.length };
        } catch (error) {
            console.error('Erreur lors de la recherche de bateaux:', error);
            throw error;
        }
    }

    /**
     * Récupère les bateaux par catégorie
     */
    static async getBoatsByCategory(categorieNom, offset = 0, limit = 6, excludeCode = null) {
        try {
            const data = await $fetch(`${this.getBaseUrl()}/api/bateaux`, {
                query: { offset: 0, limit: 100 }
            });

            if (data.statut !== 'success') {
                throw new Error(`Erreur API: ${data.message}`);
            }

            let boats = data.elements || [];

            if (categorieNom) {
                boats = boats.filter(boat =>
                    boat.categorieNom &&
                    boat.categorieNom.toLowerCase() === categorieNom.toLowerCase()
                );
            }

            if (excludeCode) {
                boats = boats.filter(boat => boat.code !== excludeCode);
            }

            const total = boats.length;
            const paginatedBoats = boats.slice(offset, offset + limit);

            return { boats: paginatedBoats, total: total };
        } catch (error) {
            console.error('Erreur lors de la récupération des bateaux par catégorie:', error);
            throw error;
        }
    }
}