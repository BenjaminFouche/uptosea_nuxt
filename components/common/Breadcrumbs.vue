<template>
  <nav class="breadcrumb-container" aria-label="Fil d'Ariane">
    <ol class="breadcrumbs">
      <li class="breadcrumb-item">
        <NuxtLink to="/">Accueil</NuxtLink>
      </li>

      <li
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          class="breadcrumb-item"
          :class="{ active: index === breadcrumbs.length - 1 }"
      >
        <span class="separator">/</span>
        <NuxtLink v-if="crumb.to && index < breadcrumbs.length - 1" :to="crumb.to">
          {{ crumb.label }}
        </NuxtLink>
        <span v-else>{{ crumb.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
// 1. Importe ton store de bateaux
import { useBoatsStore } from '@/stores/useBoatsStore'

const route = useRoute()
const boatsStore = useBoatsStore() // 2. Initialise le store

const breadcrumbs = computed(() => {
  // --- CAS 1 : TABLEAU DÉFINI DANS LA PAGE (definePageMeta) ---
  if (Array.isArray(route.meta.breadcrumb)) {
    return route.meta.breadcrumb;
  }

  // --- CAS 2 : DÉTAIL DU BATEAU (Dynamique) ---
  // On vérifie si on est sur une URL de type /bateaux/CODE
  if (route.params.code && route.path.startsWith('/bateaux/')) {
    // On cherche le bateau dans la liste du store grâce au code de l'URL
    const boat = boatsStore.boats.find(b => b.code === route.params.code);

    // On détermine le nom à afficher (le nom du bateau ou le code en fallback)
    const boatName = boat ? (boat.nomBapteme || boat.nom) : `Bateau ${route.params.code}`;

    return [
      { label: 'Bateaux', to: '/bateaux' },
      { label: boatName } // Pas de "to" car c'est la page actuelle
    ];
  }

  // --- CAS 3 : FILTRE PAR TYPE (Slug) ---
  if (route.params.slug && route.path.includes('/types/')) {
    return [
      { label: 'Bateaux', to: '/bateaux' },
      { label: `Catégorie : ${route.params.slug}` }
    ];
  }

  // --- CAS 4 : PAGES SIMPLES (Fallback) ---
  const matchedRoutes = route.matched.filter(r => r.meta && r.meta.breadcrumb);
  return matchedRoutes.map((r) => {
    let label = r.meta.breadcrumb;
    if (typeof label === 'function') label = label(route);
    return { label, to: r.path };
  });
})
</script>

<style scoped lang="scss">
.breadcrumbs {
  display: flex;
  list-style: none;
  padding: 1rem 0;
  font-size: 0.9rem;
}

.breadcrumb-item {
  color: $primary-color;
  display: flex;
  align-items: center;

  &.active {
    font-weight: bold;
    color: #000;

    span {
      color: #000;
    }
  }

  a {
    text-decoration: none;
    color: $primary-color;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
}

.separator {
  margin: 0 8px;
  color: #ccc;
  font-weight: normal;
}
</style>