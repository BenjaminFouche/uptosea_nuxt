<template>
    <footer class="app-footer">
        <div class="footer-container">
            <div class="footer-main">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <img src="https://app.uptosea.com/images/uptosea-blanc.svg" alt="Logo UPtoSEA">
                    </div>
                  <p class="footer-description"><strong>UPtoSEA</strong> est née d’une idée simple : rendre la mer plus accessible et plus sereine. <strong>Pour les propriétaires</strong>, une conciergerie nautique complète et la possibilité de louer leur bateau. <strong>Pour les locataires</strong>, des expériences sur-mesure, encadrées par une équipe réactive.</p>
                    <div class="footer-tagline">
                        <em>La mer en plus facile</em>
                    </div>
                </div>

                <!-- Colonnes de navigation -->
                <div class="footer-columns">
                    <div class="footer-column">
                        <h3 class="footer-column-title">Organiser ma sortie</h3>
                        <ul class="footer-links">
                            <li><a href="https://www.uptosea.com/location-bateau-evenement/balade-en-bateau-coucher-de-soleil/" class="footer-link">Coucher de soleil</a></li>
                            <li><a href="https://www.uptosea.com/location-bateau-evenement/journee-peche-en-mer/" class="footer-link">Pêche en mer</a></li>
                            <li><a href="https://www.uptosea.com/location-bateau-evenement/repas-sur-bateau/" class="footer-link">Repas en mer</a></li>
                            <li><a href="https://www.uptosea.com/location-bateau-evenement/apero-en-mer/" class="footer-link">Apéro en mer</a></li>
                            <li><a href="https://www.uptosea.com/location-bateau-evenement/anniversaire/" class="footer-link">Anniversaire</a></li>
                            <li><a href="https://www.uptosea.com/location-bateau-evenement/evg-evjf/" class="footer-link">EVG / EVJF</a></li>
                            <li><a href="https://www.uptosea.com/location-bateau-evenement/demande-en-mariage/" class="footer-link">Demande en mariage</a></li>
                            <li><a href="https://www.uptosea.com/location-bateau-evenement/seminaire/" class="footer-link">Séminaire</a></li>
                        </ul>
                    </div>

<!--                    <div class="footer-column">-->
<!--                        <h3 class="footer-column-title">Destinations</h3>-->
<!--                        <ul class="footer-links">-->
<!--                            <li><a href="#" class="footer-link">Destinations 1</a></li>-->
<!--                            <li><a href="#" class="footer-link">Destinations 1</a></li>-->
<!--                            <li><a href="#" class="footer-link">Destinations 1</a></li>-->
<!--                        </ul>-->
<!--                    </div>-->

                    <div class="footer-column">
                        <h3 class="footer-column-title">À propos</h3>
                        <ul class="footer-links">
                          <li><a href="https://www.uptosea.com/a-propos/" class="footer-link">Qui nous sommes</a></li>
                          <li><a href="https://www.uptosea.com/blog/" class="footer-link">Blog</a></li>
                          <li><a href="https://www.uptosea.com/contact/" class="footer-link">Contact</a></li>
                        </ul>
                    </div>

                    <div class="footer-column">
                        <h3 class="footer-column-title">Nos services</h3>
                        <ul class="footer-links">
                            <li><a href="https://www.uptosea.com/conciergerie-bateau/" class="footer-link">Pour les propriétaires</a></li>
                            <li><a href="https://www.uptosea.com/services-locataires/" class="footer-link">Pour les locataires</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Section réseaux sociaux -->
            <div class="footer-social-section">
                <h3 class="social-title">Suivez-nous</h3>
                <div class="social-links">
                    <a href="https://www.facebook.com/people/Uptosea/61573553253804/" class="social-link" aria-label="Facebook">
                        <img :src="FacebookIcon" alt="Facebook icon">
                    </a>
                    <a href="https://www.linkedin.com/company/uptosea/" class="social-link" aria-label="LinkedIn">
                        <img :src="LinkedInIcon" alt="LinkedIn icon">
                    </a>
                    <a href="https://www.instagram.com/uptosea_/" class="social-link" aria-label="Instagram">
                         <img :src="InstagramIcon" alt="Instagram icon">
                    </a>
                </div>
            </div>

            <!-- Section description mobile -->
            <div class="footer-brand-mobile">
                <p class="footer-description-mobile">
                  UPtoSEA est née d’une idée simple : rendre la mer plus accessible et plus sereine. Pour les propriétaires, une conciergerie nautique complète et la possibilité de louer leur bateau. Pour les locataires, des expériences sur-mesure, encadrées par une équipe réactive.
                </p>
                <div class="footer-tagline-mobile">
                    <em>La mer en plus facile</em>
                </div>
            </div>
        </div>

        <!-- Footer bottom -->
        <div class="footer-bottom">
            <div class="footer-container">
                <div class="footer-bottom-content">
<!--                    <div class="footer-language">-->
<!--                        <div class="language-selector">-->
<!--                            <img :src="Flag" alt="Français" class="flag-icon">-->
<!--                            <span>Français</span>-->
<!--                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"-->
<!--                                xmlns="http://www.w3.org/2000/svg">-->
<!--                                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"-->
<!--                                    stroke-linejoin="round" />-->
<!--                            </svg>-->
<!--                        </div>-->
<!--                    </div>-->
                    <div class="footer-bottom-links">
                        <p class="copyright">© UPtoSEA 2025 - Tous droits réservés</p>

                        <a href="https://www.uptosea.com/conditions-generales-de-vente/" class="footer-bottom-link">C.G.V</a>
                        <a href="https://www.uptosea.com/mentions-legales/" class="footer-bottom-link">Mentions Légales</a>
                        <a href="https://www.uptosea.com/politique-de-confidentialite/" class="footer-bottom-link">Données Personnelles</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup>
import Logo from '@/assets/svg/logo-uptosea.svg';
import Flag from '@/assets/svg/flag-fr.svg';
import FacebookIcon from '@/assets/svg/facebook.svg';
import LinkedInIcon from '@/assets/svg/linkedin.svg';
import InstagramIcon from '@/assets/svg/instagram.svg';
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/common/footer';
</style>
