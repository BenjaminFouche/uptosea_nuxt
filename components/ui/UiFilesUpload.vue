<template>
  <div class="image-upload-container">
    <label v-if="label" :for="id" class="upload-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span></label>

    <input
        :id="id"
        type="file"
        @change="handleFileChange"
        accept="image/*,video/*,audio/*,.avi"
        class="form-control"
        :disabled="disabled"
        :required="required && modelValue.length === 0"
        multiple
        ref="fileInput"
    />

    <div v-if="previews.length" class="file-preview-container">
      <div v-for="(preview, index) in previews" :key="index" class="file-preview animate__animated animate__fadeIn">

        <img
            v-if="preview.type.startsWith('image/')"
            :src="preview.url"
            :alt="preview.name"
        />

        <video
            v-else-if="preview.type.startsWith('video/') || preview.name.toLowerCase().endsWith('.avi')"
            :src="preview.url"
            muted
            loop
            class="video-player"
            @mouseenter="$event.target.play()"
            @mouseleave="$event.target.pause()"
        ></video>

        <div v-else class="audio-placeholder">
          <span class="icon">🎵</span>
          <span class="file-name">{{ preview.name }}</span>
        </div>

        <button
            type="button"
            @click="removeFile(index)"
            class="btn-remove-file"
            :disabled="disabled"
            title="Supprimer le fichier"
        >
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: 'Ajouter des photos'
  },
  id: {
    type: String,
    default: 'image-upload'
  },
  disabled: Boolean,
  required: {
    type: Boolean,
    default: false
  },
});

const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);
const previews = ref([]);

// Génère les prévisualisations pour les fichiers existants (si on passe des fichiers par défaut)
// ou vide la liste si le parent vide le modelValue
watch(() => props.modelValue, (newFiles) => {
  if (newFiles.length === 0) {
    previews.value = [];
    if (fileInput.value) fileInput.value.value = ''; // Reset input
  }
}, { immediate: true });

const handleFileChange = (event) => {
  const newFiles = Array.from(event.target.files);
  const validFiles = [];

  // On crée une copie du tableau actuel pour émettre
  const currentFiles = [...props.modelValue];

  const allowedTypes = [
    'image/',
    'video/mp4',
    'video/x-msvideo',
    'audio/mpeg'
  ];

  newFiles.forEach(file => {
    const isImage = file.type.startsWith('image/');
    const isAllowedExact = allowedTypes.includes(file.type);

    const isAviExtension = file.name.toLowerCase().endsWith('.avi');

    if (isImage || isAllowedExact || isAviExtension) {
      validFiles.push(file);

      // Preview seulement pour images et vidéos
      if (file.type.startsWith('image/') || file.type.startsWith('video/' || isAviExtension)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.value.push({
            url: e.target.result,
            name: file.name,
            type: file.type
          });
        };
        reader.readAsDataURL(file);
      }

      if (file.type.startsWith('audio/')) {
        previews.value.push({
          url: null,
          name: file.name,
          type: file.type
        });
      }
    }
  });

  emit('update:modelValue', [...currentFiles, ...validFiles]);
};

const removeFile = (index) => {
  previews.value.splice(index, 1);

  const newFileList = [...props.modelValue];
  newFileList.splice(index, 1);
  emit('update:modelValue', newFileList);
};
</script>

<style scoped lang="scss">
.upload-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: $text-primary;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid $border-gray;
  border-radius: 8px;
  background-color: white;
  font-size: 0.95rem;
  color: #334155;
  transition: all 0.2s;
  font-family: inherit;
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    outline: none;
    background-color: white;
  }
}

.file-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.file-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  // Gestion image et video
  img, .video-player {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // Design pour l'audio
  .audio-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f1f5f9;
    padding: 8px;
    box-sizing: border-box;

    .icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .file-name {
      font-size: 11px;
      color: #475569;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }
  }
}

.btn-remove-file {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(220, 38, 38, 0.9);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.required-asterisk {
  color: #dc2626; /* Rouge */
  margin-left: 4px;
}
</style>