const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiUserService {
    /**
     * Récupère les détails de l'utilisateur connecté
     * @param {string} token - Token d'authentification
     * @returns {Promise<Object>} - Détails de l'utilisateur
     */
    static async getUserDetails(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/utilisateur/details`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la récupération des détails utilisateur');
            }

            if (data.elements && data.elements.length > 0) {
                return {
                    ...data,
                    user: data.elements[0]
                };
            }

            throw new Error('Aucune donnée utilisateur trouvée');
        } catch (error) {
            console.error('Erreur API getUserDetails:', error);
            throw error;
        }
    }

    /**
     * Met à jour les informations de l'utilisateur (personnelles, adresse, permis, mot de passe)
     * @param {string} token - Token d'authentification
     * @param {Object} userData - Données à mettre à jour (doit contenir le corps complet car on utilise PUT)
     * @returns {Promise<Object>} - Réponse de l'API
     */
    static async updateUserAttributes(token, userData) {
        try {
            const response = await fetch(`${BASE_URL}/api/utilisateur/details`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la mise à jour des informations utilisateur');
            }

            return data;
        } catch (error) {
            console.error('Erreur API updateUserAttributes:', error);
            throw error;
        }
    }

    /**
     * Met à jour les préférences de l'utilisateur
     * @param {string} token - Token d'authentification
     * @param {Object} preferences - Préférences à mettre à jour
     * @returns {Promise<Object>} - Réponse de l'API
     */
    static async updatePreferences(token, preferences) {
        try {
            const response = await fetch(`${BASE_URL}/api/utilisateur/update-preferences`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(preferences)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la mise à jour des préférences');
            }

            return data;
        } catch (error) {
            console.error('Erreur API updatePreferences:', error);
            throw error;
        }
    }

    /**
     * Uploade un document pour l'utilisateur (ex: permis de bateau).
     * @param {string} token - Token d'authentification.
     * @param {string} fcCodeMaitre - Le code de l'utilisateur.
     * @param {File} file - Le fichier à uploader.
     * @returns {Promise<Object>} - La réponse de l'API.
     */
    static async uploadUserDocument(token, fcCodeMaitre, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FC_INDEXTABLE', '2');
            formData.append('FC_CODEMAITRE', fcCodeMaitre);

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
            console.error('Erreur API uploadUserDocument:', error);
            throw error;
        }
    }

    /**
     * Uploade un permis pour l'utilisateur.
     * @param {string} token - Token d'authentification.
     * @param {string} fcCodeMaitre - Le code de l'utilisateur.
     * @param {File} file - Le fichier à uploader.
     * @returns {Promise<Object>} - La réponse de l'API.
     */
    static async uploadUserPermis(token, fcCodeMaitre, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FC_INDEXTABLE', '2');
            formData.append('FC_CODEMAITRE', fcCodeMaitre);
            formData.append('FC_REPERTOIRE', 'permis');

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
            console.error('Erreur API uploadUserDocument:', error);
            throw error;
        }
    }
}