import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2026-04-28',
  ssr: true,

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000',
    }
  },

  routeRules: {
    // Redirections permanentes (code 301)
    '/': { redirect: '/bateaux' },
    '/boats': { redirect: '/bateaux' },
    '/app': { redirect: '/bateaux' }
  },

  // 1. Déclaration des modules (Pinia et PrimeVue)
  modules: [
    '@pinia/nuxt',
    '@primevue/nuxt-module'
  ],

  hooks: {
    'pages:extend'(pages) {
      pages.push({
        name: 'BoatsListFiltered',
        path: '/bateaux/types/:slug',
        file: '~/pages/bateaux/index.vue' // On redirige vers ton fichier unique !
      });
    }
  },

  // 2. Importation de tes styles globaux
  css: [
    '~/assets/style.css',
    '~/assets/styles/scss/main.scss'
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "~/assets/styles/scss/_variables.scss";
            @import "~/assets/styles/scss/mixins/_breakpoints.scss";
            @import "~/assets/styles/scss/mixins/_grid.scss";
          `
        }
      }
    }
  },

  // 3. Configuration de PrimeVue
  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
      locale: {
        monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        dayNamesMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
        chooseDate: 'Choisir la date',
        today: "Aujourd'hui",
        clear: 'Effacer',
        weekHeader: 'Sem',
        firstDayOfWeek: 1,
        dateFormat: 'dd/mm/yy',
      } as any
    },
    // Nuxt auto-importe les composants PrimeVue, mais on peut forcer l'inclusion globale
    components: {
      include: ['DatePicker']
    }
  }
})