const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiBookingService {

    /**
     * Simulation d'une réservation
     * @param {Object} bookingData - Données de la réservation à simuler
     * @returns {Promise<Object>} - Réponse de l'API avec prix simulés
     */
    static async simulateBooking(bookingData) {
        try {
            // Récupérer le token
            const token = localStorage.getItem('token');

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            // Ajouter le token d'authentification
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${BASE_URL}/api/reservations/simulate`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(bookingData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.message && data.message.includes('No account found')) {
                    throw new Error('Aucun compte utilisateur trouvé. Veuillez vous connecter pour simuler une réservation.');
                }
                throw new Error(data.message || 'Erreur lors de la simulation de réservation');
            }

            return data;
        } catch (error) {
            console.error('Erreur API simulateBooking:', error);
            throw error;
        }
    }

    /**
     * Inscription d'un nouvel utilisateur
     * @param {Object} userData - Données de l'utilisateur
     * @returns {Promise<Object>} - Réponse de l'API
     */
    static async addBooking(bookingData) {
        try {
            // Récupérer le token
            let token = localStorage.getItem('token');

            if (!(bookingData instanceof FormData) && bookingData.token) {
                token = bookingData.token;
            }

            const headers = {
                'Accept': 'application/json'
            };

            if (!(bookingData instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
            }

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const body = (bookingData instanceof FormData) ? bookingData : JSON.stringify(bookingData);

            const response = await fetch(`${BASE_URL}/api/reservations`, {
                method: 'POST',
                headers: headers,
                body: body,
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Erreur lors de la création de la réservation');
            }

            return responseData;
        } catch (error) {
            console.error('Erreur API addBooking:', error);
            throw error;
        }
    }

    /**
     * Récupère les indisponibilités spécifiques
     * @param {string} boatCode - Code du bateau
     * @param {string} from - Date de début (YYYY-MM-DD)
     * @param {string} to - Date de fin (YYYY-MM-DD)
     * @param {string} [token] - Token (optionnel)
     * @returns {Promise<Array>} - Liste des objets indisponibilités
     */
    static async getIndisponibilities(boatCode, from, to, token = null) {
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            const params = new URLSearchParams({ from, to });
            const response = await fetch(`${BASE_URL}/api/bateaux/${boatCode}/indisponibilites?${params}`, {
                method: 'GET',
                headers: headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la récupération des indisponibilités');
            }

            if (Array.isArray(data)) return data;
            if (data.elements && Array.isArray(data.elements)) return data.elements;

            return [];
        } catch (error) {
            console.error('Erreur API getIndisponibilities:', error);
            return [];
        }
    }

    /**
     * Récupère le détails des réservation de l'utilisateur connecté
     * @param {string} token - Token d'authentification
     * @returns {Promise<Object>} - Détails des réservations de l'utilisateur
     */
    static async getBookings(token) {
        try {
            // Récupération du token
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

            const response = await fetch(`${BASE_URL}/api/reservations`, {
                method: 'GET',
                headers: headers
            });

            const textData = await response.text();

            let data;
            try {
                data = JSON.parse(textData);
            } catch (parseError) {
                return { elements: [] };
            }

            if (!response.ok) {
                console.error(`[ApiBookingService] Réponse avec erreur HTTP ${response.status}:`, data);

                if (response.status === 401 || response.status === 403) {
                    throw new Error('Session expirée ou authentification invalide. Veuillez vous reconnecter.');
                } else if (response.status === 404) {
                    throw new Error('Ressource non trouvée: aucune réservation disponible.');
                } else if (response.status === 500) {
                    if (data && data.message === 'No account found for the current user') {
                        return { elements: [] };
                    }
                    return { elements: [] };
                } else {
                    return { elements: [] };
                }
            }

            // Traitement des données reçues
            Array.isArray(data) ? `Tableau avec ${data.length} éléments` :
                (data.elements ? `Objet avec ${data.elements.length} éléments` : "Format inconnu");

            if (Array.isArray(data)) {
                return {
                    elements: data
                };
            }
            else if (data && data.elements && Array.isArray(data.elements)) {
                return data;
            }
            else if (data && data.data && Array.isArray(data.data)) {
                return {
                    elements: data.data
                };
            }
            else if (data && typeof data === 'object') {
                if (data.reservations && Array.isArray(data.reservations)) {
                    return { elements: data.reservations };
                }
                if (Object.keys(data).length === 0 || data.message === 'No account found for the current user') {
                    return { elements: [] };
                }
            }

            throw new Error('Format de données inattendu: impossible de traiter les réservations');

        } catch (error) {
            throw error;
        }
    }

    /**
     * Récupère les disponibilités d'un bateau pour une plage de dates
     * @param {string} boatCode - Code du bateau (ex: 47UTSP)
     * @param {string} from - Date de début (YYYY-MM-DD)
     * @param {string} to - Date de fin (YYYY-MM-DD)
     * @param {string} [token] - Token d'authentification (optionnel, fallback localStorage)
     * @returns {Promise<Object>} - Réponse de l'API avec elements (tableau de jours)
     */
    static async getAvailability(boatCode, from, to, token = null) {
        try {
            let authToken = token || localStorage.getItem('token');
            if (!authToken) {
                throw new Error("Vous devez être connecté pour vérifier les disponibilités");
            }
            if (typeof authToken !== 'string') {
                authToken = String(authToken);
            }

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            };

            const params = new URLSearchParams({ from, to });
            const response = await fetch(`${BASE_URL}/api/bateaux/${boatCode}/disponibilites?${params}`, {
                method: 'GET',
                headers: headers
            });

            const textData = await response.text();
            let data;
            try {
                data = JSON.parse(textData);
            } catch (parseError) {
                throw new Error("Erreur lors du parsing des disponibilités");
            }

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error(data?.message || `Erreur lors de la récupération des disponibilités (${response.status})`);
            }

            if (!data.elements || !Array.isArray(data.elements)) {
                return { elements: [] };
            }

            return data;
        } catch (error) {
            console.error('Erreur API getAvailability:', error);
            throw error;
        }
    }

    /**
     * Met à jour les informations d'une reservation
     * @param {string} token - Token d'authentification
     * @param {Object} bookingData - Données à mettre à jour
     * @returns {Promise<Object>} - Réponse de l'API
     */
    static async updateBooking(token, bookingData) {
        try {
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            if (!bookingData.id) {
                throw new Error('ID de réservation manquant');
            }

            const updateData = { ...bookingData };

            // Format des dates si elles sont présentes
            if (updateData.dateDebut && !updateData.dateDebut.includes(':')) {
                const today = new Date();
                const hours = String(today.getHours()).padStart(2, '0');
                const minutes = String(today.getMinutes()).padStart(2, '0');
                const seconds = String(today.getSeconds()).padStart(2, '0');
                updateData.dateDebut = `${updateData.dateDebut} ${hours}:${minutes}:${seconds}`;
            }

            if (updateData.dateFin && !updateData.dateFin.includes(':')) {
                const today = new Date();
                const hours = String(today.getHours()).padStart(2, '0');
                const minutes = String(today.getMinutes()).padStart(2, '0');
                const seconds = String(today.getSeconds()).padStart(2, '0');
                updateData.dateFin = `${updateData.dateFin} ${hours}:${minutes}:${seconds}`;
            }

            const response = await fetch(`${BASE_URL}/api/reservations/${bookingData.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            const textData = await response.text();

            let data;
            try {
                data = JSON.parse(textData);
            } catch (parseError) {
                console.error('Erreur lors du parsing de la réponse:', parseError);

                if (response.ok) {
                    return { success: true, message: 'Réservation mise à jour avec succès' };
                } else {
                    throw new Error(`Erreur lors de la mise à jour de la réservation: ${textData}`);
                }
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Erreur lors de la mise à jour des informations de réservation');
            }

            return data;
        } catch (error) {
            console.error('Erreur API updateBooking:', error);
            throw error;
        }
    }

    /**
     * Consulter les détails d'une réservation
     * @param {string} token - Token d'authentification
     * @param {string} bookingId - ID de la réservation à consulter
     * @returns {Promise<Object>} - Réponse de l'API
     */
    static async getBookingDetails(token, bookingId) {
        try {
            const response = await fetch(`${BASE_URL}/api/reservations/${bookingId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },

            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la récupération des détails de la réservation');
            }
            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Annuler une réservation
     * @param {string} token - Token d'authentification
     * @param {string} bookingId - ID de la réservation à annuler
     * @returns {Promise<Object>} - Réponse de l'API
     */
// Dans apiBooking.js
// Dans apiBooking.js
    static async cancelBooking(token, bookingId) {
        try {
            const authToken = token || localStorage.getItem('token');

            if (!authToken) {
                throw new Error("Token d'authentification requis pour annuler une réservation");
            }

            const response = await fetch(`${BASE_URL}/api/reservations/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            const textData = await response.text();
            let data;
            try {
                data = JSON.parse(textData);
            } catch (parseError) {
                if (response.ok) {
                    return { success: true, message: 'Réservation annulée avec succès' };
                } else {
                    throw new Error(`Erreur lors de l'annulation de la réservation: ${textData}`);
                }
            }

            if (!response.ok) {
                throw new Error(data.message || `Erreur lors de l'annulation de la réservation (statut ${response.status})`);
            }

            return data;
        } catch (error) {
            console.error('Erreur API cancelBooking:', {
                message: error.message,
                bookingId,
                stack: error.stack,
            });
            throw error;
        }
    }

    /**
     * Récupère le nombre de réservations dans le panier
     * @returns {Promise<number>} - Nombre de réservations dans le panier (nbReservations)
     */
    static async getBasketCount() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return 0;
            }

            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(`${BASE_URL}/api/reservations/basket`, {
                method: 'GET',
                headers: headers
            });

            const textData = await response.text();
            let data;
            try {
                data = JSON.parse(textData);
            } catch (parseError) {
                return 0;
            }

            if (!response.ok) {
                return 0;
            }

            if (data.elements && Array.isArray(data.elements) && data.elements.length > 0) {
                const count = data.elements[0].nbReservations || 0;
                return count;
            }

            return 0;

        } catch (error) {
            throw error;
        }
    }
    /**
     * Obtient un lien de paiement pour une réservation spécifique
     * @param {string} token - Token d'authentification
     * @param {string|number} bookingId - ID de la réservation à payer
     * @returns {Promise<Object>} - Données du lien de paiement
     */
    static async getPaymentLink(token, bookingId) {
        try {
            // Récupération du token
            let authToken = token || localStorage.getItem('token');

            if (!authToken) {
                throw new Error("Vous devez être connecté pour effectuer ce paiement");
            }

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            };

            const response = await fetch(`${BASE_URL}/api/reservations/${bookingId}/lien-paiement`, {
                method: 'GET',
                headers: headers
            });

            const textData = await response.text();

            let data;
            try {
                data = JSON.parse(textData);
            } catch (parseError) {
                throw new Error("Erreur lors de la génération du lien de paiement");
            }

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Session expirée ou authentification invalide. Veuillez vous reconnecter.');
                } else {
                    throw new Error(data.message || `Erreur lors de la génération du lien de paiement: ${response.status}`);
                }
            }

            return data;
        } catch (error) {
            console.error('Erreur API getPaymentLink:', error);
            throw error;
        }
    }

    /**
     * Vérification du paiement
     * @param {string} token - Token d'authentification
     * @param {Object} bookingId - Données de paiement
     * @returns {Promise<Object>} - Réponse de l'API
     */
    static async checkPaymentStatus(token, bookingId) {
        try {
            let authToken = token || localStorage.getItem('token');

            if (!authToken) {
                throw new Error("Vous devez être connecté pour accéder à vos réservations");
            }

            if (typeof authToken !== 'string') {
                authToken = String(authToken);
            }

            const response = await fetch(`${BASE_URL}/api/reservations/${bookingId}/verifier-paiement`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la vérification du paiement');
            }

            return data;
        } catch (error) {
            console.error('Erreur API checkPaymentStatus:', error);
            throw error;
        }
    }

    /**
     * Récupère une réservation spécifique par son ID
     * @param {string} token - Token d'authentification
     * @param {string|number} bookingId - ID de la réservation à récupérer
     * @returns {Promise<Object>} - Détails de la réservation
     */
    static async getBookingById(token, bookingId) {
        try {
            // Récupération du token
            let authToken = token || localStorage.getItem('token');

            if (!authToken) {
                throw new Error("Vous devez être connecté pour accéder à cette réservation");
            }

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            };

            const response = await fetch(`${BASE_URL}/api/reservations/${bookingId}`, {
                method: 'GET',
                headers: headers
            });

            const textData = await response.text();

            let data;
            try {
                data = JSON.parse(textData);
            } catch (parseError) {
                throw new Error("Erreur lors de la lecture des données de la réservation");
            }

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Session expirée ou authentification invalide. Veuillez vous reconnecter.');
                } else if (response.status === 404) {
                    throw new Error('Réservation non trouvée.');
                } else {
                    throw new Error(data.message || `Erreur lors de la récupération de la réservation: ${response.status}`);
                }
            }

            return data;
        } catch (error) {
            console.error('Erreur API getBookingById:', error);
            throw error;
        }
    }

    /**
     * Uploade le fichier du permis pour une réservation
     * @param {string} token
     * @param {string} reservationId - L'ID de la réservation (pour faire le lien)
     * @param {File} file - Le fichier à uploader
     */
    static async uploadLicenseFile(token, reservationId, file) {
        try {
            const authToken = token || localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);

            // J'ai repris tes clés d'anomalies, à adapter si ton backend attend
            // autre chose pour lier un document à une réservation.
            formData.append('FC_INDEXTABLE', '0');
            formData.append('FC_CODEMAITRE', reservationId);

            const response = await fetch(`${BASE_URL}/media/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Erreur lors de l\'upload du permis');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur API uploadLicenseFile:', error);
            throw error;
        }
    }
}