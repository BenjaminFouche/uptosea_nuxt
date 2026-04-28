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
        <NuxtLink v-if="index < breadcrumbs.length - 1" :to="crumb.to">
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

const route = useRoute()

const breadcrumbs = computed(() => {
  const matchedRoutes = route.matched.filter(
      (r) => r.meta && r.meta.breadcrumb
  )

  return matchedRoutes.map((r) => {
    // Gestion du label (string ou fonction pour le dynamique)
    let label = r.meta.breadcrumb
    if (typeof label === 'function') {
      label = label(route)
    }

    const to = r.name ? { name: r.name, params: route.params } : r.path;

    return {
      label,
      to
    }
  })
})
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  list-style: none;
  padding: 1rem 0;
  font-size: 0.9rem;
}
.breadcrumb-item {
  color: $primary-color;
}
.breadcrumb-item.active {
  font-weight: bold;
  color: $primary-color;
}
.separator {
  margin: 0 8px;
  color: #ccc;
}
.breadcrumb-item a {
  text-decoration: none;
  color: $primary-color;
  font-weight: bold;
}
.breadcrumb-item a:hover {
  text-decoration: underline;
}
</style>