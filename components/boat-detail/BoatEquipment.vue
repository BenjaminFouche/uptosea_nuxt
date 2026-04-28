<template>
  <div class="boat-equipment">
    <h3 class="equipment-title">Équipements</h3>

    <div v-if="props.equipmentList && props.equipmentList.length > 0" class="equipment-list">
      <div class="equipment-item" v-for="(equipment, index) in displayedEquipments" :key="index">
        <img src="../../assets/svg/equipement.svg" alt="">
        <span>{{ equipment }}</span>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Aucun équipement disponible pour ce bateau.</p>
    </div>
  </div>

  <!-- Voir tout les évènements-->
  <button v-if="props.equipmentList && props.equipmentList.length > 10" class="show-all-btn" @click="toggleExpanded">
        {{ isExpanded ? 'Voir moins' : `Tous les équipements (${equipmentList.length})`}}
    <img src="../../assets/svg/chevron.svg" :class="{ 'rotated': isExpanded }" alt="">
  </button>
</template>

<script setup>
import { ref, computed } from 'vue';

/**
 * @typedef {Object} Props
 * @property {string[]} equipmentList
 */

const props = defineProps({
  equipmentList: {
    type: Array,
    default: () => []
  }
});

const isExpanded = ref(false);

// Affichage des 10 premiers équipements
const displayedEquipments = computed(() => {
  if (!props.equipmentList || props.equipmentList.length === 0) return [];
  return isExpanded.value ? props.equipmentList : props.equipmentList.slice(0, 10);
});

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/boat-detail/boat-equipment';
</style>