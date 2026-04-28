export default {
    getBaseUrl() {
        const config = useRuntimeConfig();
        return config.public.apiUrl;
    },

    /**
     * Récupère tous les articles
     */
    async getArticles(params = {}) {
        try {
            const data = await $fetch(`${this.getBaseUrl()}/api/articles`, {
                query: {
                    ...(params.categorieSlug && { categorieSlug: params.categorieSlug }),
                    ...(params.sousCategorieSlug && { sousCategorieSlug: params.sousCategorieSlug })
                }
            });

            if (data.statut !== 'success') {
                throw new Error(`Erreur dans la réponse API: ${data.message}`);
            }

            return {
                article: data.elements,
                total: data.nbElements,
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des articles:', error.message);
            throw error;
        }
    },

    /**
     * Récupère un article par son code
     */
    async getArticleByCode(code) {
        try {
            return await $fetch(`${this.getBaseUrl()}/api/articles/${code}`, {
                method: 'GET'
            });
        } catch (error) {
            console.error(`Erreur API pour l'article ${code}:`, error.message);
            throw new Error(`Article avec le code ${code} non trouvé`);
        }
    },

    async getArticlesByCategory(categorieSlug) {
        return this.getArticles({ categorieSlug });
    },

    async getArticlesBySubCategory(sousCategorieSlug) {
        return this.getArticles({ sousCategorieSlug });
    }
};