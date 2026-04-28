import { useAuthStore } from '~/stores/useAuthStore';

export default defineNuxtPlugin(async (nuxtApp) => {
    const authStore = useAuthStore();

    try {
        // Cette fonction sera appelée à chaque chargement de l'application
        await authStore.initialize();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
    }
});