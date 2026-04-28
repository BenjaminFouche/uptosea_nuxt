<template>
  <div class="error-container">
    <div class="content">
      <div class="error-icon">⚠️</div>
      <h1>Maintenance en cours</h1>
      <p class="description">
        L'application est actuellement indisponible pour des raisons techniques. <br>
        Veuillez réessayer dans quelques instants.
      </p>
      <UiButton @click="$emit('retry')" variant="outline">
        Réessayer
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  text-align: center;
  color: #2c3e50;
}

.content {
  display: flex;
  flex-direction: column;
}

.icon-wrapper {
  margin-bottom: 20px;
  color: #e74c3c;
}

h1 {
  font-size: 2rem;
  margin-bottom: 10px;
}

.description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.5;
}

.retry-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.retry-btn:hover {
  background-color: #2980b9;
}

.home-link {
  display: block;
  margin-top: 15px;
  color: #7f8c8d;
  text-decoration: underline;
}
</style>
<script setup lang="ts">
import UiButton from "@/components/ui/UiButton.vue";
</script>