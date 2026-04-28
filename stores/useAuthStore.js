import { defineStore } from 'pinia'
import { ApiAuthService } from '../services/apiAuth.js' // Assure-toi que le chemin est correct

export const useAuthStore = defineStore('auth', {
    state: () => {
        // Dans Nuxt, useCookie() gère le fait d'être sur le serveur ou le client.
        // On donne une clé au cookie, par ex: 'auth_token'
        const tokenCookie = useCookie('auth_token')
        const refreshTokenCookie = useCookie('auth_refresh_token')
        const userCookie = useCookie('auth_user')
        const tokenTimestampCookie = useCookie('auth_token_timestamp')

        const token = tokenCookie.value || null
        const refreshToken = refreshTokenCookie.value || null
        // useCookie parse automatiquement le JSON pour les objets !
        const user = userCookie.value || null
        const tokenTimestamp = parseInt(tokenTimestampCookie.value) || 0

        const now = Date.now()
        const age = token && tokenTimestamp ? now - tokenTimestamp : Infinity
        const oneHour = 60 * 60 * 1000

        // Si on recharge la page avec un token expiré
        if (token && age > oneHour) {
            return {
                user: null,
                token: null,
                refreshToken: refreshToken,
                tokenTimestamp: 0,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                refreshInterval: null
            }
        }

        return {
            user,
            token,
            refreshToken,
            tokenTimestamp,
            isLoading: false,
            isAuthenticated: !!token,
            error: null,
            refreshInterval: null
        }
    },

    getters: {
        isLoggedIn: (state) => !!(state.token && state.isAuthenticated),
        isProprietaire: (state) => state.user?.proprietaire === true,
        currentUser: (state) => state.user,

        isTokenNearExpiry: (state) => {
            if (!state.tokenTimestamp) return false
            const now = Date.now()
            const tokenAge = now - state.tokenTimestamp
            const oneHour = 60 * 60 * 1000 // 1 heure
            const fiveMinutes = 5 * 60 * 1000 // 5 minutes
            return tokenAge > (oneHour - fiveMinutes)
        },

        isTokenExpired: (state) => {
            if (!state.tokenTimestamp) return true
            const now = Date.now()
            const tokenAge = now - state.tokenTimestamp
            const oneHour = 60 * 60 * 1000 // 1 heure
            return tokenAge > oneHour
        }
    },

    actions: {
        fixInvalidTimestamp() {
            if (this.token && (!this.tokenTimestamp || this.tokenTimestamp > Date.now())) {
                this.tokenTimestamp = Date.now()
                this.saveToCookies()
            }
        },

        saveToCookies() {
            // Nuxt gère la réactivité des cookies
            const tokenCookie = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 }) // Expire dans 7 jours
            const refreshTokenCookie = useCookie('auth_refresh_token', { maxAge: 60 * 60 * 24 * 30 }) // 30 jours
            const userCookie = useCookie('auth_user', { maxAge: 60 * 60 * 24 * 7 })
            const tokenTimestampCookie = useCookie('auth_token_timestamp', { maxAge: 60 * 60 * 24 * 7 })

            tokenCookie.value = this.token
            refreshTokenCookie.value = this.refreshToken
            userCookie.value = this.user // useCookie stringify automatiquement
            tokenTimestampCookie.value = this.tokenTimestamp ? this.tokenTimestamp.toString() : null
        },

        validateAndCleanToken() {
            if (!this.token || !this.tokenTimestamp) {
                this.clearAuthData()
                return false
            }

            const now = Date.now()
            const tokenAge = now - this.tokenTimestamp
            const oneHourInMs = 60 * 60 * 1000

            if (tokenAge > oneHourInMs && !this.refreshToken) {
                this.clearAuthData()
                return false
            }

            return true
        },

        clearAuthData() {
            this.token = null
            this.refreshToken = null
            this.user = null
            this.isAuthenticated = false
            this.tokenTimestamp = 0
            this.error = null

            if (this.refreshInterval) {
                clearInterval(this.refreshInterval)
                this.refreshInterval = null
            }

            // On efface les cookies en passant leur valeur à null
            const tokenCookie = useCookie('auth_token')
            const refreshTokenCookie = useCookie('auth_refresh_token')
            const userCookie = useCookie('auth_user')
            const tokenTimestampCookie = useCookie('auth_token_timestamp')

            tokenCookie.value = null
            refreshTokenCookie.value = null
            userCookie.value = null
            tokenTimestampCookie.value = null
        },

        forceLogout() {
            this.clearAuthData()
        },

        async register(userData) {
            this.isLoading = true; this.error = null;
            try {
                const formattedData = {
                    email: userData.email, nom: userData.lastName, prenom: userData.firstName,
                    dateNaissance: userData.birthDate, telephone: userData.phone, adresse: userData.address,
                    codePostal: userData.postalCode, ville: userData.city, mot_de_passe: userData.password,
                }
                return await ApiAuthService.register(formattedData)
            } catch (error) {
                this.error = error.message; throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async login(email, password) {
            this.isLoading = true; this.error = null;
            try {
                const response = await ApiAuthService.login(email, password);

                this.token = response.token || response.access_token;
                this.refreshToken = response.refresh_token || response.refreshToken;
                this.isAuthenticated = true;
                this.tokenTimestamp = Date.now();

                await this.fetchProfile();
                this.saveToCookies(); // On sauvegarde dans les cookies
                this.startTokenMonitor();

                return response;
            } catch (error) {
                this.error = error.message; throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async loginWithGoogle(googleToken) {
            this.isLoading = true; this.error = null;
            try {
                const response = await ApiAuthService.loginWithGoogle(googleToken);

                this.token = response.token || response.access_token;
                this.refreshToken = response.refresh_token || response.refreshToken;
                this.isAuthenticated = true;
                this.tokenTimestamp = Date.now();

                await this.fetchProfile();
                this.saveToCookies();
                this.startTokenMonitor();

                return response;
            } catch (error) {
                this.error = error.message; throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async logout() {
            this.isLoading = true
            try {
                if (this.token) await ApiAuthService.logout(this.token)
            } catch (error) {
                console.error('Erreur lors de la déconnexion:', error)
            } finally {
                this.clearAuthData()
                this.isLoading = false
            }
        },

        async refreshTokenAction() {
            if (!this.refreshToken) {
                this.forceLogout();
                throw new Error('Aucun refresh token disponible');
            }
            try {
                const response = await ApiAuthService.refreshToken(this.refreshToken);

                this.token = response.access_token || response.token;
                if (response.refresh_token || response.refreshToken) {
                    this.refreshToken = response.refresh_token || response.refreshToken;
                }

                this.tokenTimestamp = Date.now();
                this.isAuthenticated = true;
                this.saveToCookies();

                return response;
            } catch (error) {
                this.forceLogout();
                throw error;
            }
        },

        startTokenMonitor() {
            // Le setInterval ne doit tourner QUE côté client
            if (import.meta.server) return;

            if (this.refreshInterval) clearInterval(this.refreshInterval);

            this.refreshInterval = setInterval(async () => {
                if (!this.isAuthenticated || !this.token) {
                    clearInterval(this.refreshInterval);
                    return;
                }

                if (this.isTokenExpired) {
                    this.forceLogout();
                } else if (this.isTokenNearExpiry) {
                    try {
                        await this.refreshTokenAction();
                    } catch (error) {
                        this.forceLogout();
                    }
                }
            }, 60 * 1000);
        },

        async checkAuth() {
            if (!this.token) return false
            this.isLoading = true
            try {
                this.isAuthenticated = true
                return true
            } finally {
                this.isLoading = false
            }
        },

        async fetchProfile() {
            if (!this.token) return null;

            this.isLoading = true; this.error = null;
            try {
                const response = await ApiAuthService.getProfile(this.token);
                this.user = response.user;
                this.saveToCookies();
                return response;
            } catch (error) {
                this.error = error.message; return null;
            } finally {
                this.isLoading = false;
            }
        },

        async generateResetPassword(email) {
            this.isLoading = true; this.error = null;
            try { return await ApiAuthService.generateResetPassword(email) }
            catch (error) { this.error = error.message; throw error }
            finally { this.isLoading = false }
        },

        async resetPassword(token, password) {
            this.isLoading = true; this.error = null;
            try { return await ApiAuthService.resetPassword(token, password) }
            catch (error) { this.error = error.message; throw error }
            finally { this.isLoading = false }
        },

        clearError() {
            this.error = null
        },

        async initialize() {
            // On peut laisser la logique d'initialisation tourner côté serveur si besoin,
            // car les cookies sont lisibles par le serveur.

            const isTokenValid = this.validateAndCleanToken();
            if (!isTokenValid) return;

            this.fixInvalidTimestamp();

            if (this.token || this.refreshToken) {
                const now = Date.now();
                const tokenAge = now - this.tokenTimestamp;
                const oneHour = 60 * 60 * 1000;
                const fiveMinutes = 5 * 60 * 1000;

                if (tokenAge > oneHour && this.refreshToken) {
                    try {
                        await this.refreshTokenAction();
                    } catch (e) {
                        this.forceLogout();
                        return;
                    }
                }
                else if (tokenAge > (oneHour - fiveMinutes)) {
                    try {
                        await this.refreshTokenAction();
                    } catch (error) {
                        this.isAuthenticated = true;
                    }
                }
                else if (tokenAge >= 0) {
                    this.isAuthenticated = true;
                    // Note: Le checkAuth distant peut ralentir le rendu SSR.
                    // Il vaut parfois mieux supposer que le token est valide s'il n'est pas expiré.
                } else {
                    this.forceLogout();
                    return;
                }

                if (this.isAuthenticated) {
                    this.startTokenMonitor();
                    if (!this.user) {
                        try { await this.fetchProfile(); } catch (error) {}
                    }
                }
            }
        },

        handleAccountSyncIssue() {
            this.clearAuthData()
            this.error = "Votre compte n'est pas correctement associé à votre session. Veuillez vous reconnecter."
            return Promise.resolve()
        }
    }
})