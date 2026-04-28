export class ApiUserService {

    static getBaseUrl() {
        const config = useRuntimeConfig();
        return config.public.apiUrl;
    }

    /**
     * Récupère les détails de l'utilisateur connecté
     */
    static async getUserDetails(token) {
        try {
            const data = await $fetch(`${this.getBaseUrl()}/api/utilisateur/details`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.elements && data.elements.length > 0) {
                return {
                    ...data,
                    user: data.elements[0]
                };
            }

            throw new Error('Aucune donnée utilisateur trouvée');
        } catch (error) {
            console.error('Erreur API getUserDetails:', error);
            throw new Error(error.data?.message || 'Erreur lors de la récupération des détails utilisateur');
        }
    }

    /**
     * Met à jour les informations de l'utilisateur
     */
    static async updateUserAttributes(token, userData) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/utilisateur/details`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: userData
            });
        } catch (error) {
            console.error('Erreur API updateUserAttributes:', error);
            throw new Error(error.data?.message || 'Erreur lors de la mise à jour des informations utilisateur');
        }
    }

    /**
     * Met à jour les préférences de l'utilisateur
     */
    static async updatePreferences(token, preferences) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/utilisateur/update-preferences`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: preferences
            });
        } catch (error) {
            console.error('Erreur API updatePreferences:', error);
            throw new Error(error.data?.message || 'Erreur lors de la mise à jour des préférences');
        }
    }

    /**
     * Uploade un document pour l'utilisateur
     */
    static async uploadUserDocument(token, fcCodeMaitre, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FC_INDEXTABLE', '2');
            formData.append('FC_CODEMAITRE', fcCodeMaitre);

            return await $fetch(`${this.getBaseUrl()}/media/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
        } catch (error) {
            console.error('Erreur API uploadUserDocument:', error);
            throw new Error(error.data?.error || 'Erreur lors de l\'upload du document');
        }
    }

    /**
     * Uploade un permis pour l'utilisateur.
     */
    static async uploadUserPermis(token, fcCodeMaitre, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('FC_INDEXTABLE', '2');
            formData.append('FC_CODEMAITRE', fcCodeMaitre);
            formData.append('FC_REPERTOIRE', 'permis');

            return await $fetch(`${this.getBaseUrl()}/media/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
        } catch (error) {
            console.error('Erreur API uploadUserPermis:', error);
            throw new Error(error.data?.error || 'Erreur lors de l\'upload du document');
        }
    }
}