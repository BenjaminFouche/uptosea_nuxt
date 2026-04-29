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
  let metaBreadcrumb = route.meta.breadcrumb;

  if (typeof metaBreadcrumb === 'function') {
    metaBreadcrumb = metaBreadcrumb(route);
  }

  if (Array.isArray(metaBreadcrumb)) {
    return metaBreadcrumb;
  }

  if (route.path.includes('/bateaux/types/') && route.params.slug) {
    return [
      { label: 'Bateaux', to: '/bateaux' },
      { label: `Catégorie : ${route.params.slug}` }
    ];
  }

  const matchedRoutes = route.matched.filter(
      (r) => r.meta && r.meta.breadcrumb
  )

  return matchedRoutes.map((r) => {
    let label = r.meta.breadcrumb
    if (typeof label === 'function') {
      label = label(route)
    }

    const to = r.path || { name: r.name, params: route.params };

    return {
      label,
      to
    }
  })
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