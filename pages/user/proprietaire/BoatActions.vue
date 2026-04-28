<template>
  <div class="boat-action-page-container">
    <div class="boat-action-page">
      <div class="container">
        <Breadcrumbs></Breadcrumbs>

        <div class="boat-action-page__header">
          <h1 class="boat-action-page__title">Activité de {{ boatName }}</h1>
        </div>

        <UiToast :message="error" @close="apiError = null" />

        <div v-if="isLoadingBoats" class="loader-container">
          <LoadingSpinner v-if="isLoadingBoats" message="Chargement des informations du bateau..." />
        </div>

        <div v-else-if="isLoadingActions" class="loader-container">
          <LoadingSpinner v-if="isLoadingActions" message="Chargement des actions..." />
        </div>

        <div v-else class="boat-actions-container">
          <div class="boat-action-page__filters">
            <div class="view-switcher">
              <button
                  @click="currentView = 'calendar'"
                  :class="{ active: currentView === 'calendar' }"
                  class="view-btn"
              >
                Vue Calendrier
              </button>
              <button
                  @click="currentView = 'list'"
                  :class="{ active: currentView === 'list' }"
                  class="view-btn"
              >
                Vue Liste
              </button>
            </div>
            <button class="details-button" @click="isActionModalOpen = true">
              + Nouvelle activité
            </button>
          </div>

          <div v-if="currentView === 'list'" class="boat-action-page__tabs">
            <div class="search-field">
              <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Rechercher une activité (code, type...)"
                  class="search-input"
              />
              <img src="@/assets/svg/loupe.svg" alt="Rechercher" class="search-icon"/>
            </div>
            <div class="booking-tabs">
              <button
                  v-for="tab in tabs"
                  :key="tab.value"
                  @click="activeTab = tab.value"
                  :class="['booking-tabs__tab', { active: activeTab === tab.value }]"
              >
                {{ tab.label }}
                <span v-if="getTabCount(tab.value)" class="booking-tabs__count">
                  {{ getTabCount(tab.value) }}
                </span>
              </button>
            </div>
          </div>

          <div v-if="currentView === 'calendar'" class="calendar-section">
            <div class="calendar-wrapper">
              <MbscEventcalendar
                  :view="myView"
                  :data="calendarEvents"
                  :locale="localeFr"
                  @event-click="onEventClick"
              />
            </div>
          </div>

          <div v-else-if="currentView === 'list' && filteredActions.length" class="boat-action-list">
            <div
                v-for="action in filteredActions"
                :key="action.code"
                class="boat-action-card animate__animated animate__fadeIn"
            >
              <div class="boat-action-card__header">
                <h2>
                  <span class="material-icons">{{ action.libelleTypeAction }}</span>
                </h2>
                <div class="filter-button active" :style="isPastAction(action) ? 'opacity: 0.6' : ''">
                  {{ isPastAction(action) ? 'Terminée' : 'À venir' }}
                </div>
              </div>

              <div class="boat-action-card__content">
                <p><strong>Réf :</strong> {{ action.code }}</p>
                <p><strong>Date de début :</strong> {{ action.datePrevu }}</p>
                <p><strong>Date de fin :</strong> {{ action.dateFin }}</p>
              </div>

              <div class="boat-action-card__footer">
                <NuxtLink :to="{ name: 'ActionsBoatDetails', params: { actionCode: action.code } }">
                  <UiButton variant="primary">
                    Voir le détail
                  </UiButton>
                </NuxtLink>

                <UiButton v-if="canEdit(action)" @click="openEditModal(action)" variant="secondary">Modifier</UiButton>
              </div>
            </div>
          </div>

          <div v-else class="boat-action-page__empty">
            <h3>Aucune activité trouvée.</h3>
            <p v-if="searchQuery">Aucun résultat pour "{{ searchQuery }}"</p>
            <p v-else>Une activité s’affichera ici lorsqu’elle sera planifiée.</p>
          </div>
        </div>
      </div>
    </div>
    <ActionModal
        :isOpen="isActionModalOpen"
        :initialData="selectedAction"
        @close="closeActionModal"
        @save="handleSaveAction"
    />
  </div>
</template>

<script>
import { useBoatProprietaireStore } from '@/stores/useBoatProprietaireStore';
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { MbscEventcalendar, localeFr } from '@mobiscroll/vue';
import '@mobiscroll/vue/dist/css/mobiscroll.min.css';

import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ActionModal from '@/components/user/proprietaire/ActionModal.vue';
import UiButton from "@/components/ui/UiButton.vue";
import Breadcrumbs from "@/components/common/Breadcrumbs.vue";
import UiToast from "@/components/ui/UiToast.vue";

export default {
  name: 'BoatActions',
  components: { UiToast, Breadcrumbs, UiButton, LoadingSpinner, MbscEventcalendar, ActionModal },
  props: {
    code: { type: String, required: true }
  },
  setup(props) {
    const store = useBoatProprietaireStore();
    const router = useRouter();
    const { boats, actionsByBoat, error } = storeToRefs(store);
    const { fetchBoats, fetchActionsByBoat, createBoatAction, updateBoatAction, fetchActionsDetail } = store;

    const isLoadingBoats = ref(true);
    const isLoadingActions = ref(true);
    const currentView = ref('calendar');

    const isActionModalOpen = ref(false);
    const selectedAction = ref(null);

    // Etats pour les filtres
    const searchQuery = ref('');
    const activeTab = ref('all');
    const tabs = [
      { label: 'Toutes', value: 'all' },
      { label: 'À venir', value: 'upcoming' },
      { label: 'Terminées', value: 'past' }
    ];

    const canEdit = (action) => {
      console.log(action.libelleTypeAction);
      return action.source === 'action' && !action.codeInterlocuteurSource && action.codeContact == JSON.parse(localStorage.getItem("userData")).code && !action.libelleTypeAction?.includes('LOCATION');
    };

    const openEditModal = async (action) => {
      try {
        selectedAction.value = null;

        const response = await fetchActionsDetail(action.code);

        const fullActionDetails = (response && response.elements && response.elements.length > 0)
            ? response.elements[0]
            : response;

        selectedAction.value = fullActionDetails;
        isActionModalOpen.value = true;
      } catch (err) {
        console.error("Erreur lors de la récupération des détails de l'action", err);
        selectedAction.value = action;
        isActionModalOpen.value = true;
      }
    };

    const closeActionModal = () => {
      isActionModalOpen.value = false;
      selectedAction.value = null;
    };

    const handleSaveAction = async (payload) => {
      try {
        payload.formData.bateauId = props.code;

        if (payload.isUpdate) {
          await updateBoatAction(payload.actionCode, payload);
        } else {
          await createBoatAction(payload);
        }

        closeActionModal();
      } catch (err) {
        console.error("Erreur save", err);
      }
    };

    const parseApiDate = (dateStr) => {
      if (!dateStr) return null;
      const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}) à (\d{2})h(\d{2})/);
      if (match) {
        const [, day, month, year, hour, minute] = match;
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
      }
      return null;
    };

    const isPastAction = (action) => {
      const date = parseApiDate(action.dateFin) || parseApiDate(action.datePrevu);
      return date && date < new Date();
    };

    const actions = computed(() => {
      const data = actionsByBoat.value?.[props.code];
      return data?.elements || [];
    });

    const filteredActions = computed(() => {
      let result = [...actions.value];

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(a => a.code.toLowerCase().includes(q) || a.libelleTypeAction.toLowerCase().includes(q));
      }

      if (activeTab.value === 'upcoming') {
        result = result.filter(a => !isPastAction(a));
      }
      if (activeTab.value === 'past') {
        result = result.filter(a => isPastAction(a));
      }

      result.sort((a, b) => {
        const dateA = parseApiDate(a.datePrevu) || parseApiDate(a.dateFin);
        const dateB = parseApiDate(b.datePrevu) || parseApiDate(b.dateFin);

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        const isPastA = isPastAction(a);
        const isPastB = isPastAction(b);

        if (isPastA !== isPastB) {
          return isPastA ? 1 : -1;
        }

        if (!isPastA && !isPastB) {
          return dateA - dateB;
        }

        return dateB - dateA;
      });

      return result;
    });

    const getTabCount = (val) => {
      if (val === 'all') return actions.value.length;
      if (val === 'upcoming') return actions.value.filter(a => !isPastAction(a)).length;
      if (val === 'past') return actions.value.filter(a => isPastAction(a)).length;
      return 0;
    };

    const myView = {
      calendar: {
        type: 'month'
      }
    };

    const calendarEvents = computed(() => {
      return actions.value.map(a => ({
        id: a.code,
        title: a.libelleTypeAction,
        start: parseApiDate(a.datePrevu),
        end: parseApiDate(a.dateFin),
        originalData: a
      })).filter(e => e.start);
    });

    // Gestion du clic sur un événement du calendrier
    const onEventClick = (args) => {
      const actionClicked = args.event.originalData;

      if (actionClicked) {
        MapsTo({ name: 'ActionsBoatDetails', params: { actionCode: actionClicked.code } });
      }
    };

    onMounted(async () => {
      try {
        await fetchBoats();
        isLoadingBoats.value = false;
        await fetchActionsByBoat(props.code);
        isLoadingActions.value = false;
      } catch (err) {
        isLoadingBoats.value = false;
        isLoadingActions.value = false;
      }
    });

    return {
      boatName: computed(() => (boats.value || []).find(b => b.code === props.code)?.nomBapteme),
      actions,
      filteredActions,
      isLoadingBoats,
      isLoadingActions,
      error,
      currentView,
      searchQuery,
      activeTab,
      tabs,
      myView,
      calendarEvents,
      localeFr,
      onEventClick,
      getTabCount,
      isPastAction,
      isActionModalOpen,
      selectedAction,
      canEdit,
      openEditModal,
      closeActionModal,
      handleSaveAction
    };
  }
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/user/proprietaire/boat-action-proprietaire';
</style>