<template>
  <button :type="type" :class="buttonClasses" :disabled="disabled || loading" @click="handleClick">
    <span v-if="loading" class="loading-spinner"></span>
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue';

/**
 * @typedef {Object} Props
 * @property {'primary'|'secondary'|'outline'|'danger'} [variant='primary']
 * @property {'small'|'medium'|'large'} [size='medium'] 
 * @property {'button'|'submit'|'reset'} [type='button']
 * @property {boolean} [disabled=false]
 * @property {boolean} [loading=false]
 * @property {boolean} [block=false]
 */

// Gestion des props
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'warning', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

// Class des boutons
const buttonClasses = computed(() => {
  return [
    'ui-button',
    `ui-button--${props.variant}`,
    `ui-button--${props.size}`,
    {
      'ui-button--block': props.block,
      'ui-button--loading': props.loading,
      'ui-button--disabled': props.disabled,
      'ui-button--rounded':props.rounded
    }
  ];
});

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped lang="scss">
@import "assets/styles/scss/ui/button";
</style>
