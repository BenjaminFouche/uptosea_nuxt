<script setup>
defineProps({
  title: {
    type: String,
    required: true,
    default: 'Titre de la modal'
  },
  showArrow: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

const handleBack = () => {
  emit('close');
};
</script>

<template>
  <div class="header-modal">
    <button v-if="showArrow" class="back-button" @click="handleBack">
      <img src="@/assets/svg/croix.svg" alt="Retour">
    </button>

    <h1 class="title-modal" :class="{ 'no-arrow': !showArrow }">{{ title }}</h1>
  </div>
</template>

<style lang="scss" scoped>
@import 'assets/styles/scss/components/header-modal';
</style>