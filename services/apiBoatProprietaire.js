import { useAuthStore } from '@/stores/useAuthStore';

export class ApiBoatProprietaireService {

    static getBaseUrl() {
        const config = useRuntimeConfig();
        return config.public.apiUrl;
    }

    static async getBoatProprietaire(token) {
        try {
            const authToken = token || useAuthStore().token;

            if (!authToken) throw new Error("Vous devez être connecté pour accéder à vos bateaux");

            const data = await $fetch(`${this.getBaseUrl()}/api/proprietaire/bateaux`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${String(authToken)}` }
            });

            if (data.statut !== 'success') {
                throw new Error(`Erreur API: ${data.message}`);
            }

            return { boats: data.elements, total: data.nbElements };
        } catch (error) {
            console.error('Erreur lors de la récupération des bateaux du proprietaire:', error);
            return { boats: [], total: 0 };
        }
    }

    static async getActionByBoat(code, token, year = null) {
        try {
            const authToken = token || useAuthStore().token;

            if (!authToken) throw new Error("Vous devez être connecté pour accéder à vos actions");

            return await $fetch(`${this.getBaseUrl()}/api/proprietaire/bateau/${code}/actions`, {
                method: 'GET',
                query: year ? { year } : {},
                headers: { 'Authorization': `Bearer ${String(authToken)}` }
            });
        } catch (error) {
            console.error(`Erreur lors de la récupération des actions du bateau ${code}:`, error);
            throw error;
        }
    }

    static async getActionDetail(code, token) {
        try {
            const authToken = token || useAuthStore().token;

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

    static async getAllActionBoat() {
        return await $fetch(`${this.getBaseUrl()}/api/proprietaire-actions`);
    }

    static async getActionTypes(token) {
        try {
            const authToken = token || useAuthStore().token;
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

    static async createBoatAction(token, actionData) {
        try {
            const authToken = token || useAuthStore().token;
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

    static async updateBoatAction(token, actionCode, actionData) {
        try {
            const authToken = token || useAuthStore().token;
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

    static async uploadActionImage(token, fcCodeMaitre, file) {
        try {
            const authToken = token || useAuthStore().token;
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

    static async uploadBoatDocument(token, boatCode, file) {
        try {
            const authToken = token || useAuthStore().token;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FC_INDEXTABLE', '9');
            formData.append('FC_CODEMAITRE', boatCode);
            formData.append('FC_REPERTOIRE', 'documents');

            return await $fetch(`${this.getBaseUrl()}/media/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });
        } catch (error) {
            console.error('Erreur API uploadBoatDocument:', error);
            throw new Error(error.data?.error || "Erreur lors de l'upload du document");
        }
    }

    static async clearCacheByBoat(boatCode) {
        return await $fetch(`${this.getBaseUrl()}/api/cache/clear-object/bateau/${boatCode}`);
    }

    static async getDashboardActionByBoat(code, token, year) {
        try {
            const authToken = token || useAuthStore().token;
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