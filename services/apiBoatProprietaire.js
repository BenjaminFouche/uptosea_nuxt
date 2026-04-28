export class ApiBoatProprietaireService {

    static getBaseUrl() {
        const config = useRuntimeConfig();
        return config.public.apiUrl;
    }

    /**
     * Récupère la liste de tous les bateaux d'un propriétaire
     */
    static async getBoatProprietaire(token) {
        try {
            let authToken = token || (import.meta.client ? localStorage.getItem('token') : null);

            if (!authToken) {
                throw new Error("Vous devez être connecté pour accéder à vos bateaux");
            }

            const data = await $fetch(`${this.getBaseUrl()}/api/proprietaire/bateaux`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${String(authToken)}`
                }
            });

            if (data.statut !== 'success') {
                throw new Error(`Erreur API: ${data.message}`);
            }

            return {
                boats: data.elements,
                total: data.nbElements
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des bateaux du proprietaire:', error);
            // On retourne un tableau vide plutôt que de faire crasher si c'est une erreur de parsing
            return { boats: [], total: 0 };
        }
    }

    /**
     * Récupère les actions d'un bateau par son ID
     */
    static async getActionByBoat(code, token, year = null) {
        try {
            let authToken = token || (import.meta.client ? localStorage.getItem('token') : null);

            if (!authToken) {
                throw new Error("Vous devez être connecté pour accéder à vos actions");
            }

            const data = await $fetch(`${this.getBaseUrl()}/api/proprietaire/bateau/${code}/actions`, {
                method: 'GET',
                query: year ? { year } : {},
                headers: {
                    'Authorization': `Bearer ${String(authToken)}`
                }
            });

            return data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des actions du bateau ${code}:`, error);
            throw error;
        }
    }

    /**
     * Récupère le détail d'une action par son ID
     */
    static async getActionDetail(code, token) {
        try {
            let authToken = token || (import.meta.client ? localStorage.getItem('token') : null);

            if (!authToken) throw new Error("Vous devez être connecté pour accéder aux détails de l'action");

            return await $fetch(`${this.getBaseUrl()}/api/proprietaire/bateau/action/${code}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${String(authToken)}` }
            });
        } catch (error) {
            console.error(`Erreur lors de la récupération des détails de l'action ${code}:`, error);
            throw error;
        }
    }

    /**
     * Récupère toutes les actions des bateaux
     */
    static async getAllActionBoat() {
        return await $fetch(`${this.getBaseUrl()}/api/proprietaire-actions`);
    }

    /**
     * Récupère les types d'actions dynamiques
     */
    static async getActionTypes(token) {
        try {
            let authToken = token || (import.meta.client ? localStorage.getItem('token') : null);
            if (!authToken) throw new Error("Vous devez être connecté.");

            return await $fetch(`${this.getBaseUrl()}/api/proprietaire/action-types`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${String(authToken)}` }
            });
        } catch (error) {
            console.error("Erreur lors de la récupération des types d'actions:", error);
            throw error;
        }
    }

    /**
     * Crée une nouvelle action pour un bateau
     */
    static async createBoatAction(token, actionData) {
        try {
            let authToken = token || (import.meta.client ? localStorage.getItem('token') : null);
            if (!authToken) throw new Error("Vous devez être connecté.");

            return await $fetch(`${this.getBaseUrl()}/api/proprietaire/actions`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${String(authToken)}` },
                body: actionData
            });
        } catch (error) {
            console.error('Erreur API createBoatAction:', error);
            throw new Error(error.data?.message || 'Erreur de création');
        }
    }

    /**
     * Met à jour une action existante
     */
    static async updateBoatAction(token, actionCode, actionData) {
        try {
            let authToken = token || (import.meta.client ? localStorage.getItem('token') : null);
            return await $fetch(`${this.getBaseUrl()}/api/proprietaire/action/${actionCode}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${String(authToken)}` },
                body: actionData
            });
        } catch (error) {
            console.error('Erreur API updateBoatAction:', error);
            throw new Error(error.data?.message || 'Erreur de modification');
        }
    }

    /**
     * Uploade une image pour une action
     */
    static async uploadActionImage(token, fcCodeMaitre, file) {
        try {
            const authToken = token || (import.meta.client ? localStorage.getItem('token') : null);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FC_INDEXTABLE', '0');
            formData.append('FC_CODEMAITRE', fcCodeMaitre);

            return await $fetch(`${this.getBaseUrl()}/media/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });
        } catch (error) {
            console.error('Erreur API uploadActionImage:', error);
            throw new Error(error.data?.error || "Erreur lors de l'upload de l'image");
        }
    }

    /**
     * Uploade un document pour un bateau
     */
    static async uploadBoatDocument(token, boatCode, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FC_INDEXTABLE', '9');
            formData.append('FC_CODEMAITRE', boatCode);
            formData.append('FC_REPERTOIRE', 'documents');

            return await $fetch(`${this.getBaseUrl()}/media/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
        } catch (error) {
            console.error('Erreur API uploadBoatDocument:', error);
            throw new Error(error.data?.error || "Erreur lors de l'upload du document");
        }
    }

    /**
     * Clear le cache d'un bateau
     */
    static async clearCacheByBoat(boatCode) {
        return await $fetch(`${this.getBaseUrl()}/api/cache/clear-object/bateau/${boatCode}`);
    }

    /**
     * Dashboard : Actions
     */
    static async getDashboardActionByBoat(code, token, year) {
        try {
            let authToken = token || (import.meta.client ? localStorage.getItem('token') : null);
            if (!authToken) throw new Error("Vous devez être connecté.");

            return await $fetch(`${this.getBaseUrl()}/api/proprietaire/bateau/${code}/dashboard-actions`, {
                method: 'GET',
                query: year ? { year } : {},
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
        } catch (error) {
            console.error(`Erreur dashboard actions bateau ${code}:`, error);
            throw error;
        }
    }
}