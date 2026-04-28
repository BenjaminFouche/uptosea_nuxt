const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Service pour gérer les appels API liés aux articles
 */
export default {
    /**
     * Récupère tous les articles
     * @param {Object} params - Paramètres de filtre optionnels
     * @returns {Promise} Promesse contenant les articles
     */
    async getArticles(params = {}) {
        try {
            // Construction de l'URL avec les paramètres de filtre si existants
            let url = new URL(`${BASE_URL}/api/articles`);
            if (params.categorieSlug) url.searchParams.append('categorieSlug', params.categorieSlug);
            if (params.sousCategorieSlug) url.searchParams.append('sousCategorieSlug', params.sousCategorieSlug);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des articles: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.statut !== 'success') {
                throw new Error(`Erreur dans la réponse API: ${data.message}`);
            }
            return {
                article: data.elements,
                total: data.nbElements,
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des articles:', error.message);
            throw error;
        }
    },

    /**
     * Récupère un article par son code
     * @param {String} code - Code unique de l'article
     * @returns {Promise} Promesse contenant l'article
     */
    async getArticleByCode(code) {
        try {
            const response = await fetch(`${BASE_URL}/api/articles/${code}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération de l'article ${code}: ${response.statusText}`);
            }
            return response.json();
        } catch (error) {
            console.error(`Erreur API pour l'article ${code}:`, error.message);
            return Promise.reject(new Error(`Article avec le code ${code} non trouvé`));
        }
    },

    /**
     * Récupère les articles par catégorie
     * @param {String} categorieSlug - Slug de la catégorie
     * @returns {Promise} Promesse contenant les articles de la catégorie
     */
    async getArticlesByCategory(categorieSlug) {
        return this.getArticles({ categorieSlug });
    },

    /**
     * Récupère les articles par sous-catégorie
     * @param {String} sousCategorieSlug - Slug de la sous-catégorie
     * @returns {Promise} Promesse contenant les articles de la sous-catégorie
     */
    async getArticlesBySubCategory(sousCategorieSlug) {
        return this.getArticles({ sousCategorieSlug });
    }
};