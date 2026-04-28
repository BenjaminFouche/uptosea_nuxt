<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <LoadingSpinner v-if="isSubmitting" :message="isEditMode ? 'Modification en cours...' : 'Enregistrement en cours...'" />

      <div :class="{ 'content-hidden': isSubmitting }">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Modifier l\'activité' : 'Nouvelle activité' }}</h2>
          <button class="btn-close" @click="closeModal" title="Fermer" :disabled="isSubmitting">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="titre">Nom de l'activité</label>
            <input
                id="titre"
                type="text"
                v-model="formData.titre"
                required
                placeholder="Ex: Entretien moteur des 100h"
                class="form-control"
                :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label for="type">Type d'activité</label>
            <select
                id="type"
                v-model="formData.type"
                required
                class="form-control"
                :disabled="isSubmitting || isLoadingTypes"
            >
              <option value="" disabled>
                {{ isLoadingTypes ? 'Chargement des types...' : 'Sélectionnez un type' }}
              </option>

              <option v-for="type in actionTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Période de l'activité <span class="required">*</span></label>

            <VDatePicker
                v-model="rangeDateModel"
                mode="date"
                :min-date="minSelectableDate"
                is-range
                :is-dark="false"
            >
              <template #default="{ inputValue, inputEvents }">
                <div class="flex-range-inputs">
                  <input
                      :value="inputValue.start"
                      v-on="inputEvents.start"
                      class="form-control"
                      placeholder="Date de début"
                      :disabled="isSubmitting"
                      required
                  />
                  <input
                      :value="inputValue.end"
                      v-on="inputEvents.end"
                      class="form-control"
                      placeholder="Date de fin"
                      :disabled="isSubmitting"
                      required
                  />
                </div>
              </template>
            </VDatePicker>
          </div>

          <div class="form-group">
            <label for="desc">Commentaire / Description</label>
            <textarea
                id="desc"
                v-model="formData.commentaire"
                rows="4"
                placeholder="Détails supplémentaires (facultatif)..."
                class="form-control"
                :disabled="isSubmitting"
            ></textarea>
          </div>

          <div class="form-group">
            <ImageUpload
                v-model="selectedFiles"
                id="action-files"
                label="Photos / Justificatifs"
                :disabled="isSubmitting"
            />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="closeModal" :disabled="isSubmitting">Annuler</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting || isLoadingTypes || !isDateValid">
              {{ isEditMode ? 'Enregistrer les modifications' : 'Planifier l\'activité' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref, computed, onMounted } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ImageUpload from '@/components/ui/UiFilesUpload.vue';
import { DatePicker as VDatePicker } from 'v-calendar';
import 'v-calendar/dist/style.css';

/* ATTENTION: Vérifie que ces chemins correspondent bien à la structure de ton projet ! */
import { useAuthStore } from '@/stores/useAuthStore';
import { ApiBoatProprietaireService } from '@/services/apiBoatProprietaire';

const props = defineProps({
  isOpen: Boolean,
  initialData: Object
});

const isEditMode = computed(() => !!props.initialData);

const emit = defineEmits(['close', 'save']);

const authStore = useAuthStore();
const isSubmitting = ref(false);
const isLoadingTypes = ref(false);
const selectedFiles = ref([]);

// Le tableau est vide au départ
const actionTypes = ref([]);

const formData = reactive({
  titre: '',
  type: '',
  dateDebut: '',
  dateFin: '',
  commentaire: ''
});

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-');
  return new Date(year, month - 1, day);
};

const rangeDateModel = computed({
  get() {
    if (formData.dateDebut && formData.dateFin) {
      return {
        start: parseDate(formData.dateDebut),
        end: parseDate(formData.dateFin)
      };
    }
    return null;
  },
  set(val) {
    if (val && val.start && val.end) {
      const format = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      formData.dateDebut = format(val.start);
      formData.dateFin = format(val.end);
    } else {
      formData.dateDebut = '';
      formData.dateFin = '';
    }
  }
});

const isDateValid = computed(() => {
  return formData.dateDebut !== '' && formData.dateFin !== '';
});

const minSelectableDate = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isEditMode.value && formData.dateDebut) {
    const existingStartDate = parseDate(formData.dateDebut);
    if (existingStartDate && existingStartDate < today) {
      return existingStartDate;
    }
  }

  return today;
});

// Appel API pour récupérer les types
const fetchActionTypes = async () => {
  isLoadingTypes.value = true;
  try {
    const data = await ApiBoatProprietaireService.getActionTypes(authStore.token);

    if (data.statut === 'success') {
      actionTypes.value = data.elements.map(t => ({
        label: t.nom,
        value: t.code
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des types d'actions", error);
  } finally {
    isLoadingTypes.value = false;
  }
};

// On charge les types dès que le composant est monté
onMounted(() => {
  fetchActionTypes();
});

const resetForm = () => {
  formData.titre = '';
  formData.type = '';
  formData.dateDebut = '';
  formData.dateFin = '';
  formData.commentaire = '';
  selectedFiles.value = [];
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';

  // Si la date est au format ISO (ex: "2026-04-28T00:00:00+00:00")
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }

  // Si la date est au format français (ex: "28/04/2026 à 10h00")
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;

  return '';
};

watch(() => props.isOpen, (newVal) => {
  isSubmitting.value = false;
  if (newVal) {
    if (props.initialData) {
      const cleanComment = props.initialData.detail ? props.initialData.detail.replace(/<\/?[^>]+(>|$)/g, "") : '';

      formData.titre = props.initialData.nom || props.initialData.titre || '';
      // On utilise directement le code de l'API (ex: 180UTS) qui correspond au "value" des options
      formData.type = props.initialData.typeAction || '';
      formData.dateDebut = formatDateForInput(props.initialData.datePrevu);
      formData.dateFin = formatDateForInput(props.initialData.dateFin);
      formData.commentaire = cleanComment;
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

  const payloadFormData = { ...formData };

  if (payloadFormData.dateDebut) {
    payloadFormData.dateDebut = `${payloadFormData.dateDebut} 00:00:00`;
  }
  if (payloadFormData.dateFin) {
    payloadFormData.dateFin = `${payloadFormData.dateFin} 23:59:59`;
  }

  emit('save', {
    formData: payloadFormData,
    files: selectedFiles.value,
    isUpdate: isEditMode.value,
    actionCode: props.initialData?.code
  });
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/user/proprietaire/anomaly_modal';

select.form-control {
  cursor: pointer;
  appearance: auto;
}

.flex-range-inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;

  input {
    cursor: pointer;
  }
}
</style>