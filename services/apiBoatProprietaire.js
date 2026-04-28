const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiBoatProprietaireService {

    /**
     * Récupère la liste de tous les bateaux d'un propriétaire
     */
    static async getBoatProprietaire(token) {
        try {
            let authToken = token || localStorage.getItem('token');

            if (!authToken) {
                throw new Error("Vous devez être connecté pour accéder à vos réservations");
            }

            // Convertir le token en chaîne
            if (typeof authToken !== 'string') {
                authToken = String(authToken);
            }

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            };

            const response = await fetch(`${BASE_URL}/api/proprietaire/bateaux`, {
                method: 'GET',
                headers: headers
            });

            // Lire le corps de la réponse
            const textData = await response.text();

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
            }

            let data;
            try {
                data = JSON.parse(textData);
            } catch (parseError) {
                return { elements: [] };
            }

            if (data.statut !== 'success') {
                throw new Error(`Erreur API: ${data.message}`);
            }

            return {
                boats: data.elements,
                total: data.nbElements
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des bateaux du proprietaire:', error);
            throw error;
        }
    }

    /**
     * Récupère les actions d'un bateau par son ID
     * @param {string} code - Code du bateau
     * @param {string} token
     * @param {number|null} year
     * @returns {Promise<Object>}
     */
    static async getActionByBoat(code, token, year = null) {
        try {
            let authToken = token || localStorage.getItem('token');

            if (!authToken) {
                throw new Error("Vous devez être connecté pour accéder à vos réservations");
            }

            if (typeof authToken !== 'string') {
                authToken = String(authToken);
            }

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            };

            let url = `${BASE_URL}/api/proprietaire/bateau/${code}/actions`;
            if (year) {
                url += `?year=${year}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            const textData = await response.text();

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} ${response.statusText} - ${textData}`);
            }

            let data;
            try {
                data = JSON.parse(textData);
            } catch (parseError) {
                console.error("Erreur de parsing JSON:", parseError, "Réponse brute:", textData);
                throw new Error("La réponse du serveur n'est pas un JSON valide.");
            }

            if (!data || !data.elements) {
                console.warn(`Réponse inattendue de l'API pour le bateau ${code}:`, data);
            }

            return data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des actions du bateau ${code}:`, error);
            throw error;
        }
    }

    /**
     * Récupère le détail d'une action par son ID
     * @param {string} code - Code de l'action
     * @param {string} token
     * @returns {Promise<Object>}
     */
    static async getActionDetail(code, token) {
        try {
            let authToken = token || localStorage.getItem('token');

            if (!authToken) {
                throw new Error("Vous devez être connecté pour accéder au détails de l'action");
            }

            if (typeof authToken !== 'string') {
                authToken = String(authToken);
            }

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            };

            const response = await fetch(`${BASE_URL}/api/proprietaire/bateau/action/${code}`, {
                method: 'GET',
                headers: headers
            });

            const textData = await response.text();

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} ${response.statusText} - ${textData}`);
            }

            let data;
            try {
                data = JSON.parse(textData);
            } catch (parseError) {
                console.error("Erreur de parsing JSON:", parseError, "Réponse brute:", textData);
                throw new Error("La réponse du serveur n'est pas un JSON valide.");
            }

            if (!data || !data.elements) {
                console.warn(`Réponse inattendue de l'API pour l'action ${code}:`, data);
            }

            return data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des détails de l'action ${code}:`, error);
            throw error;
        }
    }

    /**
     * Récupère toutes les actions des bateaux
     * @returns {Promise<Object>}
     */
    static async getAllActionBoat() {
        try {
            const response = await fetch(`${BASE_URL}/api/proprietaire-actions`);

            if (!response.ok) {
                throw new Error(`Erreur API : ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    /**
     * =========================================================================
     * NOUVEAU : Récupère les types d'actions dynamiques depuis Infocob
     * =========================================================================
     * @param {string} token
     * @returns {Promise<Object>}
     */
    static async getActionTypes(token) {
        try {
            let authToken = token || localStorage.getItem('token');
            if (!authToken) throw new Error("Vous devez être connecté.");

            if (typeof authToken !== 'string') {
                authToken = String(authToken);
            }

            const response = await fetch(`${BASE_URL}/api/proprietaire/action-types`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const textData = await response.text();

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} - ${textData}`);
            }

            return JSON.parse(textData);
        } catch (error) {
            console.error("Erreur lors de la récupération des types d'actions:", error);
            throw error;
        }
    }

    /**
     * Crée une nouvelle action pour un bateau
     * @param {string} token
     * @param {Object} actionData - { bateauId, type, commentaire }
     */
    static async createBoatAction(token, actionData) {
        try {
            let authToken = token || localStorage.getItem('token');
            if (!authToken) throw new Error("Vous devez être connecté.");

            const response = await fetch(`${BASE_URL}/api/proprietaire/actions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(actionData)
            });

            const textData = await response.text();

            if (!response.ok) {
                throw new Error(`Erreur de création: ${response.status} - ${textData}`);
            }

            return JSON.parse(textData);
        } catch (error) {
            console.error('Erreur API createBoatAction:', error);
            throw error;
        }
    }

    /**
     * Met à jour une action existante
     * @param {string} token
     * @param {string} actionCode
     * @param {Object} actionData
     */
    static async updateBoatAction(token, actionCode, actionData) {
        try {
            let authToken = token || localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/proprietaire/action/${actionCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(actionData)
            });

            const textData = await response.text();
            if (!response.ok) {
                throw new Error(`Erreur de modification: ${response.status} - ${textData}`);
            }
            return JSON.parse(textData);
        } catch (error) {
            console.error('Erreur API updateBoatAction:', error);
            throw error;
        }
    }

    /**
     * Uploade une image pour une action (activité)
     * @param {string} token
     * @param {string} fcCodeMaitre - Le code de l'action retourné par l'API
     * @param {File} file - Le fichier image
     */
    static async uploadActionImage(token, fcCodeMaitre, file) {
        try {
            const authToken = token || localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FC_INDEXTABLE', '0'); // Index correspondant aux actions dans ton système
            formData.append('FC_CODEMAITRE', fcCodeMaitre);

            const response = await fetch(`${BASE_URL}/media/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erreur lors de l'upload de l'image");
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur API uploadActionImage:', error);
            throw error;
        }
    }

    /**
     * Uploade un document pour un bateau
     * @param {string} token
     * @param {string} boatCode - Le code du bateau (ex: 741UTX)
     * @param {File} file - Le fichier à uploader
     */
    static async uploadBoatDocument(token, boatCode, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FC_INDEXTABLE', '9'); // Index correspondant aux bateaux
            formData.append('FC_CODEMAITRE', boatCode);
            formData.append('FC_REPERTOIRE', 'documents');

            const response = await fetch(`${BASE_URL}/media/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'upload du document');
            }

            return data;
        } catch (error) {
            console.error('Erreur API uploadBoatDocument:', error);
            throw error;
        }
    }

    /**
     * Clear le cache d'un bateau
     * @param {string} boatCode - Le code du bateau (ex: 741UTX)
     */
    static async clearCacheByBoat(boatCode) {
        try {
            const response = await fetch(`${BASE_URL}/api/cache/clear-object/bateau/${boatCode}`);

            if (!response.ok) {
                throw new Error(`Erreur API : ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // =========================================================================
    // Dashboard
    // =========================================================================

    static async getDashboardActionByBoat(code, token, year) {
        try {
            let authToken = token || localStorage.getItem('token');
            if (!authToken) throw new Error("Vous devez être connecté.");

            let url = `${BASE_URL}/api/proprietaire/bateau/${code}/dashboard-actions`;
            if (year) {
                url += `?year=${year}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const textData = await response.text();

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} - ${textData}`);
            }

            return JSON.parse(textData);
        } catch (error) {
            console.error(`Erreur lors de la récupération des actions dashboard du bateau ${code}:`, error);
            throw error;
        }
    }
}