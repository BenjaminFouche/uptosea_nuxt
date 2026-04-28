<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div v-if="isVisible && message" class="ui-toast" :class="`toast-${type}`">
        <div class="toast-icon">
          <svg v-if="type === 'error'" viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <div class="toast-content">
          {{ message }}
        </div>

        <button class="toast-close" @click="closeToast">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  message: { type: String, default: null },
  type: {
    type: String,
    default: 'error',
    validator: (v) => ['error', 'info'].includes(v)
  },
  duration: { type: Number, default: 5000 } // 5 secondes par défaut
});

const emit = defineEmits(['close']);
const isVisible = ref(false);
let timeout = null;

const startTimer = () => {
  if (timeout) clearTimeout(timeout);
  isVisible.value = true;
  timeout = setTimeout(() => {
    closeToast();
  }, props.duration);
};

const closeToast = () => {
  isVisible.value = false;
  if (timeout) clearTimeout(timeout);
  setTimeout(() => emit('close'), 400);
};

watch(() => props.message, (newVal) => {
  if (newVal) {
    startTimer();
  } else {
    isVisible.value = false;
  }
}, { immediate: true });

onUnmounted(() => {
  if (timeout) clearTimeout(timeout);
});
</script>

<style scoped lang="scss">
.ui-toast {
  position: fixed;
  top: 30px;
  right: 20px;
  z-index: 999999;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  max-width: 450px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
}

.toast-error {
  border-left: 6px solid #ef4444;
  .toast-icon { color: #ef4444; }
  .toast-content { color: #1f2937; }
}

.toast-info {
  background-color: #f0f7ff !important;
  border-left: 6px solid #3c5da8;

  .toast-icon { color: #3c5da8; }
  .toast-content { color: #1e3a8a; }
  .toast-close { color: #3c5da8; }
}

.toast-content {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0.5;
  &:hover { opacity: 1; }
}

.toast-slide-enter-active, .toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-slide-enter-from, .toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>