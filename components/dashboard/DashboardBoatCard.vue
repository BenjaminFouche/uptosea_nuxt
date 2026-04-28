<template>
  <div class="boat-card-premium">
    <div class="card-header">
      <div class="header-content">
        <h3 class="boat-name">{{ boat.name }}</h3>

        <span v-if="boat.isOccupied" class="badge-status occupied">EN MER</span>
        <span v-else class="badge-status available">A QUAI</span>
      </div>
    </div>

    <div class="card-stats">
      <div class="stat-block primary">
        <span class="stat-label">Commission</span>
        <span class="stat-value">{{ boat.globalCommission.toFixed(0) }} <small>€</small></span>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-block">
        <span class="stat-label">Locations</span>
        <span class="stat-value">{{ boat.rentals }}</span>
      </div>

      <div class="stat-block" :class="{ 'has-anomalies': boat.upcomingAnomaliesCount > 0 }">
        <span class="stat-label">Anomalies</span>
        <span class="stat-value alert">{{ boat.upcomingAnomaliesCount }}</span>
      </div>
    </div>

    <div class="card-activities">
      <h4 class="activities-title">À venir</h4>

      <div v-if="boat.upcomingActivities?.length > 0" class="activity-list">
        <div
            v-for="activity in boat.upcomingActivities.slice(0, 3)"
            :key="activity.id"
            class="activity-item"
        >
          <div class="activity-bullet" :class="getBulletClass(activity.type)"></div>
          <div class="activity-info">
            <span class="activity-type">{{ formatActionName(activity.type) }}</span>
            <span class="activity-date">{{ formatDisplayDate(activity.date) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-activities">
        <p>Aucune activité prévue prochainement.</p>
      </div>
    </div>

    <div class="card-footer">
      <NuxtLink :to="`/proprietaire/bateau/${boat.code}/actions`" class="btn-details">
        Voir le bateau
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon-arrow"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  boat: {
    type: Object,
    required: true
  }
});

const formatActionName = (type) => {
  if (!type) return 'Activité';
  if (type.includes('LOCATION')) return 'Location';
  if (type.includes('ANOMALIE')) return 'Anomalie';
  if (type.includes('TEMPETE')) return 'Visite tempête';
  if (type.includes('NETTOYAGE') || type.includes('ENTRETIEN')) return 'Entretien';
  return type;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split(' à ');
  if(parts.length < 2) return dateStr;
  const datePart = parts[0].substring(0, 5);
  return `${datePart} à ${parts[1]}`;
};

const getBulletClass = (type) => {
  if (!type) return 'bullet-primary';
  if (type.includes('LOCATION')) return 'bullet-primary';
  if (type.includes('ANOMALIE')) return 'bullet-danger';
  if (type.includes('ENTRETIEN') || type.includes('NETTOYAGE')) return 'bullet-warning';
  return 'bullet-gray';
};
</script>

<style scoped lang="scss">
.boat-card-premium {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.card-header {
  padding: 20px 20px 15px;
  border-bottom: 1px solid rgba($border-color, 0.5);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .boat-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .badge-status {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &.available {
      background: rgba($success-color, 0.15);
      color: darken($success-color, 15%);
    }
    &.occupied {
      background: rgba($danger-color, 0.15);
      color: darken($danger-color, 10%);
    }
  }
}

.card-stats {
  display: flex;
  padding: 15px 20px;
  background-color: #f8fafc;
  align-items: center;

  .stat-block {
    display: flex;
    flex-direction: column;
    flex: 1;

    &.primary {
      flex: 1.5;
      .stat-value { color: $primary-color; font-size: 1.5rem; }
    }

    &.has-anomalies {
      background: rgba($danger-color, 0.1);
      padding: 8px;
      border-radius: 8px;
      margin: -8px;

      .stat-value { color: $danger-color; }
      .stat-label { color: darken($danger-color, 20%); }
    }

    .stat-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      color: $text-light;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;

      small { font-size: 0.9rem; opacity: 0.7; }
    }
  }

  .stat-divider {
    width: 1px;
    height: 30px;
    background: $border-color;
    margin: 0 15px;
  }
}

.card-activities {
  padding: 15px 20px;
  flex: 1;

  .activities-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: $text-light;
    text-transform: uppercase;
    margin: 0 0 12px 0;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .activity-bullet {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &.bullet-primary { background-color: $primary-color; }
    &.bullet-danger { background-color: $danger-color; }
    &.bullet-warning { background-color: $warning-color; }
    &.bullet-gray { background-color: $text-light; }
  }

  .activity-info {
    display: flex;
    justify-content: space-between;
    flex: 1;
    font-size: 0.85rem;

    .activity-type { font-weight: 600; color: #334155; }
    .activity-date { color: $text-light; font-variant-numeric: tabular-nums; }
  }

  .empty-activities {
    font-size: 0.85rem;
    color: $text-light;
    font-style: italic;
  }
}

.card-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba($border-color, 0.5);

  .btn-details {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 8px 0;
    color: $primary-color;
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    border-radius: 6px;
    transition: background 0.2s;

    .icon-arrow {
      width: 16px;
      height: 16px;
      margin-left: 6px;
      transition: transform 0.2s;
    }

    &:hover {
      background: rgba($primary-color, 0.05);
      .icon-arrow { transform: translateX(4px); }
    }
  }
}
</style>