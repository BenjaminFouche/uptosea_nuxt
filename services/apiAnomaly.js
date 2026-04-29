import { useAuthStore } from '@/stores/useAuthStore';

export class ApiAnomalyService {

    static getBaseUrl() {
        const config = useRuntimeConfig();
        return config.public.apiUrl;
    }

    static async getAnomalies(token, year = null) {
        try {
            const authToken = token || useAuthStore().token;

            if (!authToken) {
                throw new Error("Vous devez être connecté pour voir les anomalies");
            }

            const data = await $fetch(`${this.getBaseUrl()}/api/anomalies`, {
                method: 'GET',
                query: year ? { year } : {},
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (Array.isArray(data)) return { elements: data };
            if (data && data.elements && Array.isArray(data.elements)) return data;
            if (data && typeof data === 'object') {
                const possibleArray = data['hydra:member'] || data.data || [];
                return { elements: possibleArray };
            }

            return { elements: [] };
        } catch (error) {
            if (error.statusCode === 401 || error.statusCode === 403) {
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }
            console.error('Erreur API getAnomalies:', error);
            return { elements: [] };
        }
    }

    static async createAnomaly(token, anomalyData) {
        try {
            const authToken = token || useAuthStore().token;

            return await $fetch(`${this.getBaseUrl()}/api/anomalies`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: anomalyData
            });
        } catch (error) {
            console.error('Erreur API createAnomaly:', error);
            throw new Error(error.data?.message || error.data?.detail || 'Erreur lors de la création de l\'anomalie');
        }
    }

    static async updateAnomaly(token, id, anomalyData) {
        try {
            const authToken = token || useAuthStore().token;

            return await $fetch(`${this.getBaseUrl()}/api/anomalies/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: anomalyData
            });
        } catch (error) {
            console.error('Erreur API updateAnomaly:', error);
            throw new Error(error.data?.message || 'Erreur lors de la modification de l\'anomalie');
        }
    }

    static async deleteAnomaly(token, id) {
        try {
            const authToken = token || useAuthStore().token;

            await $fetch(`${this.getBaseUrl()}/api/anomalies/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });
            return true;
        } catch (error) {
            console.error('Erreur API deleteAnomaly:', error);
            throw new Error(error.data || 'Erreur lors de la suppression');
        }
    }

    static async uploadAnomalyImage(token, fcCodeMaitre, file) {
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
            console.error('Erreur API uploadAnomalyImage:', error);
            throw new Error(error.data?.error || 'Erreur lors de l\'upload de l\'image');
        }
    }

    static async getDashboardAnomalies(token, year) {
        try {
            const authToken = token || useAuthStore().token;
            if (!authToken) throw new Error("Vous devez être connecté.");

            return await $fetch(`${this.getBaseUrl()}/api/proprietaire/dashboard-anomalies`, {
                method: 'GET',
                query: { year },
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
        } catch (error) {
            console.error('Erreur API getDashboardAnomalies:', error);
            throw new Error(error.data?.message || `Erreur API: ${error.statusCode}`);
        }
    }
}