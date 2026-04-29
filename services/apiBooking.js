import { useAuthStore } from '@/stores/useAuthStore';

export class ApiBookingService {

    static getBaseUrl() {
        const config = useRuntimeConfig();
        return config.public.apiUrl;
    }

    static async simulateBooking(bookingData) {
        try {
            const authToken = useAuthStore().token;

            return await $fetch(`${this.getBaseUrl()}/api/reservations/simulate`, {
                method: 'POST',
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
                body: bookingData
            });
        } catch (error) {
            if (error.data?.message?.includes('No account found')) {
                throw new Error('Aucun compte utilisateur trouvé. Veuillez vous connecter pour simuler une réservation.');
            }
            console.error('Erreur API simulateBooking:', error);
            throw new Error(error.data?.message || 'Erreur lors de la simulation de réservation');
        }
    }

    static async addBooking(bookingData) {
        try {
            let authToken = useAuthStore().token;
            if (!(bookingData instanceof FormData) && bookingData.token) {
                authToken = bookingData.token;
            }

            return await $fetch(`${this.getBaseUrl()}/api/reservations`, {
                method: 'POST',
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
                body: bookingData
            });
        } catch (error) {
            console.error('Erreur API addBooking:', error);
            throw new Error(error.data?.message || 'Erreur lors de la création de la réservation');
        }
    }

    static async getIndisponibilities(boatCode, from, to, token = null) {
        try {
            const data = await $fetch(`${this.getBaseUrl()}/api/bateaux/${boatCode}/indisponibilites`, {
                method: 'GET',
                query: { from, to }
            });

            if (Array.isArray(data)) return data;
            if (data.elements && Array.isArray(data.elements)) return data.elements;

            return [];
        } catch (error) {
            console.error('Erreur API getIndisponibilities:', error);
            return [];
        }
    }

    static async getBookings(token) {
        try {
            const authToken = token || useAuthStore().token;

            if (!authToken) throw new Error("Vous devez être connecté pour accéder à vos réservations");

            const data = await $fetch(`${this.getBaseUrl()}/api/reservations`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${String(authToken)}` }
            });

            if (Array.isArray(data)) return { elements: data };
            if (data?.elements && Array.isArray(data.elements)) return data;
            if (data?.data && Array.isArray(data.data)) return { elements: data.data };
            if (data?.reservations && Array.isArray(data.reservations)) return { elements: data.reservations };

            return { elements: [] };

        } catch (error) {
            if (error.statusCode === 401 || error.statusCode === 403) {
                throw new Error('Session expirée ou authentification invalide. Veuillez vous reconnecter.');
            } else if (error.statusCode === 404) {
                throw new Error('Ressource non trouvée: aucune réservation disponible.');
            }
            if (error.data?.message === 'No account found for the current user') {
                return { elements: [] };
            }
            return { elements: [] };
        }
    }

    static async getAvailability(boatCode, from, to, token = null) {
        try {
            const authToken = token || useAuthStore().token;
            if (!authToken) throw new Error("Vous devez être connecté pour vérifier les disponibilités");

            const data = await $fetch(`${this.getBaseUrl()}/api/bateaux/${boatCode}/disponibilites`, {
                method: 'GET',
                query: { from, to },
                headers: { 'Authorization': `Bearer ${String(authToken)}` }
            });

            if (!data.elements || !Array.isArray(data.elements)) {
                return { elements: [] };
            }

            return data;
        } catch (error) {
            if (error.statusCode === 401 || error.statusCode === 403) {
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }
            throw new Error(error.data?.message || `Erreur lors de la récupération des disponibilités`);
        }
    }

    static async updateBooking(token, bookingData) {
        try {
            const authToken = token || useAuthStore().token;
            if (!authToken) throw new Error('Token d\'authentification manquant');
            if (!bookingData.id) throw new Error('ID de réservation manquant');

            const updateData = { ...bookingData };

            if (updateData.dateDebut && !updateData.dateDebut.includes(':')) {
                const today = new Date();
                updateData.dateDebut = `${updateData.dateDebut} ${String(today.getHours()).padStart(2,'0')}:${String(today.getMinutes()).padStart(2,'0')}:${String(today.getSeconds()).padStart(2,'0')}`;
            }
            if (updateData.dateFin && !updateData.dateFin.includes(':')) {
                const today = new Date();
                updateData.dateFin = `${updateData.dateFin} ${String(today.getHours()).padStart(2,'0')}:${String(today.getMinutes()).padStart(2,'0')}:${String(today.getSeconds()).padStart(2,'0')}`;
            }

            return await $fetch(`${this.getBaseUrl()}/api/reservations/${bookingData.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: updateData
            });
        } catch (error) {
            console.error('Erreur API updateBooking:', error);
            throw new Error(error.data?.message || 'Erreur lors de la mise à jour des informations de réservation');
        }
    }

    static async getBookingDetails(token, bookingId) {
        try {
            const authToken = token || useAuthStore().token;
            return await $fetch(`${this.getBaseUrl()}/api/reservations/${bookingId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
        } catch (error) {
            throw new Error(error.data?.message || 'Erreur lors de la récupération des détails de la réservation');
        }
    }

    static async cancelBooking(token, bookingId) {
        try {
            const authToken = token || useAuthStore().token;
            if (!authToken) throw new Error("Token d'authentification requis");

            await $fetch(`${this.getBaseUrl()}/api/reservations/${bookingId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            return { success: true, message: 'Réservation annulée avec succès' };
        } catch (error) {
            console.error('Erreur API cancelBooking:', error);
            throw new Error(error.data?.message || `Erreur lors de l'annulation de la réservation`);
        }
    }

    static async getBasketCount() {
        try {
            const authToken = useAuthStore().token;
            if (!authToken) return 0;

            const data = await $fetch(`${this.getBaseUrl()}/api/reservations/basket`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (data.elements && Array.isArray(data.elements) && data.elements.length > 0) {
                return data.elements[0].nbReservations || 0;
            }
            return 0;
        } catch (error) {
            return 0;
        }
    }

    static async getPaymentLink(token, bookingId) {
        try {
            const authToken = token || useAuthStore().token;
            if (!authToken) throw new Error("Vous devez être connecté pour effectuer ce paiement");

            return await $fetch(`${this.getBaseUrl()}/api/reservations/${bookingId}/lien-paiement`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
        } catch (error) {
            if (error.statusCode === 401 || error.statusCode === 403) {
                throw new Error('Session expirée ou authentification invalide. Veuillez vous reconnecter.');
            }
            throw new Error(error.data?.message || `Erreur lors de la génération du lien de paiement`);
        }
    }

    static async checkPaymentStatus(token, bookingId) {
        try {
            const authToken = token || useAuthStore().token;
            if (!authToken) throw new Error("Vous devez être connecté");

            return await $fetch(`${this.getBaseUrl()}/api/reservations/${bookingId}/verifier-paiement`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${String(authToken)}` }
            });
        } catch (error) {
            throw new Error(error.data?.message || 'Erreur lors de la vérification du paiement');
        }
    }

    static async getBookingById(token, bookingId) {
        try {
            const authToken = token || useAuthStore().token;
            if (!authToken) throw new Error("Vous devez être connecté");

            return await $fetch(`${this.getBaseUrl()}/api/reservations/${bookingId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
        } catch (error) {
            if (error.statusCode === 401 || error.statusCode === 403) {
                throw new Error('Session expirée ou authentification invalide.');
            } else if (error.statusCode === 404) {
                throw new Error('Réservation non trouvée.');
            }
            throw new Error(error.data?.message || `Erreur lors de la récupération de la réservation`);
        }
    }

    static async uploadLicenseFile(token, reservationId, file) {
        try {
            const authToken = token || useAuthStore().token;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FC_INDEXTABLE', '0');
            formData.append('FC_CODEMAITRE', reservationId);

            return await $fetch(`${this.getBaseUrl()}/media/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });
        } catch (error) {
            throw new Error(error.data?.error || 'Erreur lors de l\'upload du permis');
        }
    }
}