<template>
  <div class="default-layout">

    <AppHeader />

    <main class="main-content">

      <div class="system-alert">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>
          Bienvenue sur notre nouvelle web app ! Elle évolue encore, alors merci pour votre indulgence 😉 Un problème ? Contactez‑nous au
          <a href="tel:0251291097" class="alert-link">02 51 29 10 97</a> ou à
          <a href="mailto:club@uptosea.com" class="alert-link">club@uptosea.com</a>
        </span>
      </div>

      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue';
</script>

<style lang="scss">
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  padding: 0;
}

.main-content {
  flex: 1;
  overflow: clip;
  padding-top: $header-height;
}

/* --- bannière d'alerte --- */
.system-alert {
  background-color: #fff3e0;
  color: #e65100;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 0.95rem;
  text-align: center;
  border-bottom: 1px solid #ffe0b2;

  .alert-icon {
    flex-shrink: 0;
  }

  .alert-link {
    color: inherit;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }
  }
}

@include media-breakpoint-max(md) {
  .main-content {
    padding-top: $header-height-mobile;
  }

  .system-alert {
    font-size: 0.85rem;
    padding: 10px 15px;
    text-align: left;
  }
}
</style>