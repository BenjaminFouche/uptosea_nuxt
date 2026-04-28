/**
 * Utilitaires pour convertir les noms de catégories en URLs et vice versa
 */

// Mapping des catégories vers leurs URLs
const categoryToUrlMap = {
  'Tous': 'tous',
  'Voilier': 'voilier',
  'Cabine': 'cabine',
  'Semi-rigides': 'semi-rigides',
  'Open': 'open',
};

// Mapping inverse : URLs vers catégories
const urlToCategoryMap = {
  'tous': 'Tous',
  'voilier': 'Voilier',
  'cabine': 'Cabine',
  'semi-rigides': 'Semi-rigides',
  'open': 'Open',
};

/**
 * Convertit un nom de catégorie en URL slug
 * @param {string} category - Nom de la catégorie
 * @returns {string} - URL slug
 */
export function categoryToUrl(category) {
  return categoryToUrlMap[category] || category.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Convertit un URL slug en nom de catégorie
 * @param {string} urlSlug - URL slug
 * @returns {string} - Nom de la catégorie
 */
export function urlToCategory(urlSlug) {
  return urlToCategoryMap[urlSlug] || urlSlug;
}

/**
 * Vérifie si une catégorie URL est valide
 * @param {string} urlSlug - URL slug
 * @returns {boolean} - True si valide
 */
export function isValidCategoryUrl(urlSlug) {
  return urlSlug in urlToCategoryMap;
}

/**
 * Obtient toutes les catégories disponibles
 * @returns {Array} - Liste des catégories
 */
export function getAllCategories() {
  return Object.keys(categoryToUrlMap);
}

/**
 * Obtient toutes les URLs de catégories disponibles
 * @returns {Array} - Liste des URLs
 */
export function getAllCategoryUrls() {
  return Object.keys(urlToCategoryMap);
}
