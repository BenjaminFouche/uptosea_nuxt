<template>
    <div class="favorites-page">
      <div class="container">
        <h1>Page Favoris</h1>
        <p>Pas implémenter</p>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth.js'
import Default from '../../layouts/default.vue'
import BoatCard from '../../components/common/BoatCard.vue'
import UiButton from '../../components/ui/UiButton.vue'

const { user, isLoading } = useAuth()

// Retirer les favorie
function removeFavorite(boatId) {
  const index = favoritesExample.value.findIndex(boat => boat.id === boatId)
  if (index !== -1) {
    favoritesExample.value.splice(index, 1)
  }
}
</script>

<style lang="scss" scoped>
.favorites-page {
  padding: 40px 0;
  min-height: calc(100vh - 200px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>
