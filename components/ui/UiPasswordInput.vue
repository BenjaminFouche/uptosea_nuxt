<template>
  <div class="password-input-wrapper">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}<span v-if="required" class="required">*</span>
    </label>
    <div class="password-input-container">
      <input
          :id="id"
          :type="showPassword ? 'text' : 'password'"
          v-model="internalValue"
          :placeholder="placeholder"
          class="form-input"
          :class="{ 'error': error }"
          :required="required"
          @input="$emit('input', $event)"
      />
      <button
          type="button"
          class="password-toggle"
          @click="toggleVisibility"
          :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
      >
        <!-- Icône œil Ouvert/Fermé -->
        <svg v-if="!showPassword" class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M6.712 6.72C8.96 8.968 10.8 10.8 12 10.8c1.2 0 3.04-1.832 5.28-4.08" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M4.929 4.929C6.178 6.178 7.999 8 9.837 9.837" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="m14.163 14.163 1.491-1.491M18.071 18.07 16.48 16.48" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Mot de passe'
  },
  error: {
    type: [String, Boolean],
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: 'password'
  }
})

const emit = defineEmits(['update:modelValue', 'input'])

const internalValue = ref(props.modelValue)
const showPassword = ref(false)

const toggleVisibility = () => {
  showPassword.value = !showPassword.value
}

watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

watch(internalValue, (newVal) => {
  emit('update:modelValue', newVal)
  emit('input', newVal)
})
</script>

<style scoped lang="scss">
.password-input-wrapper {
  position: relative;
}

.password-input-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.form-input {
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  &:hover {
    color: #333;
  }

  &:focus {
    outline: 2px solid #007bff;
    border-radius: 50%;
  }
}

.eye-icon {
  display: block;
}
</style>