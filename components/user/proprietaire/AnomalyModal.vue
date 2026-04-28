<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <LoadingSpinner v-if="isSubmitting" message="Enregistrement en cours..." />

            <div :class="{ 'content-hidden': isSubmitting }">
                <div class="modal-header">
                    <h2>{{ isEdit ? `Modifier l'anomalie ${initialData?.reference ? '#' + initialData.reference : ''}`: 'Nouvelle anomalie' }}</h2>
                    <button class="btn-close" @click="closeModal" title="Fermer" :disabled="isSubmitting">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="titre">Type d'incident</label>
                        <input
                            id="titre"
                            type="text"
                            v-model="formData.titre"
                            required
                            placeholder="Ex: Rayure sur la coque"
                            class="form-control"
                            :disabled="isSubmitting"
                        />
                    </div>

                    <div class="form-group" v-if="!hidePriority">
                        <label>Niveau de priorité</label>
                        <div class="priority-selector">
                            <div
                                v-for="prio in priorities"
                                :key="prio.value"
                                class="priority-chip"
                                :class="[prio.value.toLowerCase(), { active: formData.priorite === prio.value }, { disabled: isSubmitting }]"
                                @click="!isSubmitting && (formData.priorite = prio.value)"
                            >
                                <span class="dot"></span>
                                {{ prio.label }}
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="desc">Description détaillée</label>
                        <textarea
                            id="desc"
                            v-model="formData.description"
                            rows="5"
                            required
                            placeholder="Décrivez l'anomalie ..."
                            class="form-control"
                            :disabled="isSubmitting"
                        ></textarea>
                    </div>

                    <div class="form-group">
                      <ImageUpload
                          v-model="selectedFiles"
                          id="anomaly-files"
                          label="Ajouter des photos / Preuves"
                          :disabled="isSubmitting"
                      />
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn-ghost" @click="closeModal" :disabled="isSubmitting">Annuler</button>
                        <button type="submit" class="btn-primary" :disabled="isSubmitting">
                            {{ isEdit ? 'Enregistrer les modifications' : 'Déclarer l\'anomalie' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, watch, ref } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ImageUpload from '@/components/ui/UiFilesUpload.vue';

const props = defineProps({
    isOpen: Boolean,
    isEdit: Boolean,
    initialData: Object,
    hidePriority: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'save']);

const isSubmitting = ref(false);
const selectedFiles = ref([]);

const priorities = [
    { label: 'Basse', value: 'Basse' },
    { label: 'Moyenne', value: 'Moyenne' },
    { label: 'Haute', value: 'Haute' }
];

const formData = reactive({
    titre: '',
    description: '',
    priorite: 'Moyenne'
});

const resetForm = () => {
    formData.titre = '';
    formData.description = '';
    formData.priorite = 'Moyenne';
    selectedFiles.value = [];
};

watch(() => props.isOpen, (newVal) => {
    isSubmitting.value = false;
    if (newVal) {
        if (props.isEdit && props.initialData) {
            Object.assign(formData, props.initialData);
          selectedFiles.value = [];
        } else {
            resetForm();
        }
    }
});

const closeModal = () => {
    if (isSubmitting.value) return;
    emit('close');
};

const handleSubmit = () => {
    isSubmitting.value = true;
    emit('save', { formData: { ...formData }, files: selectedFiles.value });
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/user/proprietaire/anomaly_modal';
</style>