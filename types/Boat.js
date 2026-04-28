/**
 * @typedef {Object} Boat
 * @property {string} code - L'ID du bateau
 * @property {string} nom - Le nom
 * @property {string} descriptionFr - Description en français
 * @property {string|null} nomBapteme - Nom de baptême
 * @property {string|null} localisation - Localisation du bateau

 * @property {string} famille - Famille du bateau
 * @property {string|null} familleCode - Code de la famille
 * @property {string|null} categorieNom - Nom de la catégorie du bateau
 * @property {number|null} tirantEauMin - Tirant d'eau minimum
 * @property {number|null} longueur - Longueur en mètres
 * @property {string|null} marque - Marque du bateau
 * @property {any[]} reservations - Réservations
 * @property {any[]} equipementsAutorises - Équipements autorisés
 * @property {any[]} evenementsAutorises - Événements autorisés
 * @property {string} [image] - Image du bateau
 */

/**
 * @typedef {Object} ApiBoatResponse
 * @property {string} statut
 * @property {number} code
 * @property {string} message
 * @property {Boat[]} elements
 * @property {any[]} details
 * @property {number} nbElements
 * @property {number} page
 * @property {number} nbElementsParPage
 * @property {number} nbPages
 */

export {};
