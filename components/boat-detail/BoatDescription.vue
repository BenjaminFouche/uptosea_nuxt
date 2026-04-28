<template>
  <div class="boat-description" v-if="description">
    <div class="description-content" :class="{ 'expanded': isExpanded }">
      <div v-html="description"></div>
    </div>
    <button class="read-more-btn" @click="toggleExpanded">
       {{ isExpanded ? 'Lire moins' : 'Lire plus' }}
      <img src="../../assets/svg/chevron.svg" :class="{ 'rotated': isExpanded }" alt="">
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

/**
 * @typedef {Object} Props
 * @property {string} description
 */

defineProps({
  description: String,
});

const isExpanded = ref(false);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/boat-detail/boat-description';
</style>
