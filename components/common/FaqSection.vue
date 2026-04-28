<template>
  <div class="faq-section">
    <div class="faq-container">
      <h3 class="faq-title">On répond à vos questions</h3>

      <div class="faq-item">
        <button class="faq-question" @click="toggleFaq(0)">
          <span>Dois-je avoir une expérience en navigation ?</span>
          <div class="icon">
            <svg class="faq-icon" :class="{ 'faq-icon--open': openFaq === 0 }" width="20" height="20"
              viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9l-7 7-7-7" stroke="#4c55a7" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="faq-answer" :class="{ 'faq-answer--open': openFaq === 0 }">
          <p>Pas nécessairement. Si vous n’avez jamais navigué ou si vous ne souhaitez pas piloter vous-même, nous pouvons prévoir un skipper professionnel, discret et expérimenté. Vous profitez pleinement, sans stress.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question" @click="toggleFaq(1)">
          <span>Que comprend le prix de la location ?</span>
          <div class="icon">
            <svg class="faq-icon" :class="{ 'faq-icon--open': openFaq === 1 }" width="20" height="20"
              viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9l-7 7-7-7" stroke="#4c55a7" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="faq-answer" :class="{ 'faq-answer--open': openFaq === 1 }">
          <p>Le tarif inclut le bateau, les équipements de sécurité, l’assurance, ainsi qu’un accueil personnalisé. Le carburant est généralement en supplément, mais tout est précisé à l’avance, sans surprise.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question" @click="toggleFaq(2)">
          <span>Peut-on venir avec des enfants ? Des animaux ?</span>
          <div class="icon">
            <svg class="faq-icon" :class="{ 'faq-icon--open': openFaq === 2 }" width="20" height="20"
              viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9l-7 7-7-7" stroke="#4c55a7" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="faq-answer" :class="{ 'faq-answer--open': openFaq === 2 }">
          <p>Bien sûr ! La mer se partage en famille ou entre amis. Certains bateaux sont parfaitement adaptés aux enfants. Pour les animaux, il suffit de nous prévenir à l’avance, pour choisir un bateau approprié.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question" @click="toggleFaq(3)">
          <span>Est-ce qu’on peut dormir sur le bateau ?</span>
          <div class="icon">
            <svg class="faq-icon" :class="{ 'faq-icon--open': openFaq === 3 }" width="20" height="20"
                 viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9l-7 7-7-7" stroke="#4c55a7" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="faq-answer" :class="{ 'faq-answer--open': openFaq === 3 }">
          <p>Oui, certains bateaux sont équipés pour la nuit (couchettes, coin repas, sanitaires). Indiquez-nous vos envies, on vous proposera la formule adaptée.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const openFaq = ref(null);

const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? null : index;
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/faq-section';
</style>
