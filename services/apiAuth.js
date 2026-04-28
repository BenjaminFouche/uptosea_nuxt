export class ApiAuthService {

    // Fonction utilitaire interne pour récupérer l'URL de base Nuxt
    static getBaseUrl() {
        const config = useRuntimeConfig();
        return config.public.apiUrl;
    }

    /**
     * Inscription d'un nouvel utilisateur
     */
    static async register(userData) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/auth/inscription`, {
                method: 'POST',
                body: userData
            });
        } catch (error) {
            console.error('Erreur API inscription:', error);
            throw new Error(error.data?.message || 'Erreur lors de l\'inscription');
        }
    }

    /**
     * Connexion d'un utilisateur
     */
    static async login(email, password) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/auth/connect`, {
                method: 'POST',
                body: { email, password }
            });
        } catch (error) {
            throw new Error(error.data?.message || 'Erreur lors de la connexion');
        }
    }

    /**
     * Connexion via Google
     */
    static async loginWithGoogle(googleToken) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/auth/google`, {
                method: 'POST',
                body: { token: googleToken }
            });
        } catch (error) {
            throw new Error(error.data?.message || 'Erreur lors de la connexion Google');
        }
    }

    /**
     * Déconnexion de l'utilisateur
     */
    static async logout(token) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            throw new Error(error.data?.message || 'Erreur lors de la déconnexion');
        }
    }

    /**
     * Refresh token d'authentification
     */
    static async refreshToken(refreshToken) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/auth/refresh`, {
                method: 'POST',
                body: { refresh_token: refreshToken },
            });
        } catch (error) {
            throw new Error(error.data?.message || 'Erreur lors du rafraîchissement');
        }
    }

    /**
     * Récupération du profil utilisateur
     */
    static async getProfile(token) {
        try {
            const data = await $fetch(`${this.getBaseUrl()}/api/utilisateur/details`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (data.statut !== 'success' || !data.elements || data.elements.length === 0) {
                throw new Error('Profil non trouvé');
            }

            const user = data.elements[0] || {};
            // Normalisation du booléen propriétaire
            user.proprietaire = user.proprietaire === true;

            return { user };
        } catch (error) {
            console.error('Erreur API getProfile:', error);
            throw new Error(error.data?.message || 'Erreur lors de la récupération du profil');
        }
    }

    /**
     * Demande de réinitialisation de mot de passe
     */
    static async generateResetPassword(email) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/auth/reset-link`, {
                method: 'POST',
                body: { email }
            });
        } catch (error) {
            throw new Error(error.data?.message || 'Erreur lors de la demande de réinitialisation');
        }
    }

    /**
     * Vérifie l'email d'un utilisateur
     */
    static async verifyEmail(params) {
        try {
            return await $fetch(`${this.getBaseUrl()}/auth/verify/email`, {
                method: 'GET',
                query: {
                    expires: params.expires,
                    id: params.id,
                    signature: params.signature,
                    token: params.token
                }
            });
        } catch (error) {
            throw new Error(error.data?.message || 'Erreur lors de la vérification de l\'email');
        }
    }

    /**
     * Réinitialisation du mot de passe
     */
    static async resetPassword(token, password) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/auth/reset-password`, {
                method: 'POST',
                body: { token, password }
            });
        } catch (error) {
            throw new Error(error.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
        }
    }
}