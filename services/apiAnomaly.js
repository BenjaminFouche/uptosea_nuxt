const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiAnomalyService {

    /**
     * Récupère la liste des anomalies de l'utilisateur
     * @param {string} token - Token d'authentification
     * @param {number|null} year
     * @returns {Promise<Object>} - Liste des anomalies
     */
    static async getAnomalies(token, year = null) {
        try {
            let authToken = token || localStorage.getItem('token');

            if (!authToken) {
                throw new Error("Vous devez être connecté pour voir les anomalies");
            }

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            };

            let url = `${BASE_URL}/api/anomalies`;
            if (year) {
                url += `?year=${year}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            const textData = await response.text();
            let data;
            try {
                data = JSON.parse(textData);
            } catch (e) {
                return { elements: [] };
            }

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                return { elements: [] };
            }

            if (Array.isArray(data)) {
                return { elements: data };
            } else if (data && data.elements && Array.isArray(data.elements)) {
                return data;
            } else if (data && typeof data === 'object') {
                const possibleArray = data['hydra:member'] || data.data || [];
                return { elements: possibleArray };
            }

            return { elements: [] };
        } catch (error) {
            console.error('Erreur API getAnomalies:', error);
            throw error;
        }
    }

    /**
     * Créer une nouvelle anomalie
     * @param {string} token
     * @param {Object} anomalyData - { titre, description, bateauId, priorite }
     */
    static async createAnomaly(token, anomalyData) {
        try {
            const authToken = token || localStorage.getItem('token');

            const response = await fetch(`${BASE_URL}/api/anomalies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(anomalyData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.detail || 'Erreur lors de la création de l\'anomalie');
            }

            return data;
        } catch (error) {
            console.error('Erreur API createAnomaly:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour une anomalie
     * @param {string} token
     * @param {string} id
     * @param {Object} anomalyData
     */
    static async updateAnomaly(token, id, anomalyData) {
        try {
            const authToken = token || localStorage.getItem('token');

            const response = await fetch(`${BASE_URL}/api/anomalies/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(anomalyData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la modification de l\'anomalie');
            }

            return data;
        } catch (error) {
            console.error('Erreur API updateAnomaly:', error);
            throw error;
        }
    }

    /**
     * Supprimer une anomalie
     * @param {string} token
     * @param {string} id
     */
    static async deleteAnomaly(token, id) {
        try {
            const authToken = token || localStorage.getItem('token');

            const response = await fetch(`${BASE_URL}/api/anomalies/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Erreur lors de la suppression');
            }

            return true;
        } catch (error) {
            console.error('Erreur API deleteAnomaly:', error);
            throw error;
        }
    }

    /**
     * Uploade une image pour une anomalie
     * @param {string} token
     * @param {string} fcCodeMaitre - Le AC_CODE de l'action
     * @param {File} file - Le fichier à uploader
     */
    static async uploadAnomalyImage(token, fcCodeMaitre, file) {
        try {
            const authToken = token || localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FC_INDEXTABLE', '0');
            formData.append('FC_CODEMAITRE', fcCodeMaitre);

            for (let pair of formData.entries()) {
                console.log(pair[0]+ ', ' + pair[1]);
            }

            const response = await fetch(`${BASE_URL}/media/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'upload de l\'image');
            }

            return data;
        } catch (error) {
            console.error('Erreur API uploadAnomalyImage:', error);
            throw error;
        }
    }

    /**
     * Récupère les anomalies optimisées pour le dashboard (sans images)
     * @param {string} token - Le token d'authentification
     * @param {number|string} year - L'année cible pour le filtre
     */
    static async getDashboardAnomalies(token, year) {
        try {
            let authToken = token || localStorage.getItem('token');
            if (!authToken) throw new Error("Vous devez être connecté.");

            // Construction de l'URL avec le paramètre d'année
            const url = `${BASE_URL}/api/proprietaire/dashboard-anomalies?year=${year}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                const textData = await response.text();
                throw new Error(`Erreur API: ${response.status} - ${textData}`);
            }

            // Tenter de parser le JSON
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Erreur de parsing JSON (Dashboard Anomalies):", parseError);
                throw new Error("La réponse du serveur n'est pas un JSON valide.");
            }

            return data;
        } catch (error) {
            console.error('Erreur API getDashboardAnomalies:', error);
            throw error;
        }
    }
}