<template>
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: 'Chargement...'
    }
  }
};
</script>

<style scoped lang="scss">
@import "assets/styles/scss/components/loading-spiner";
</style>
