<template>
  <div v-if="show" class="booking-modal-overlay" @click.self="closeModal">
    <div class="booking-modal-content" @click.stop>
      <HeaderModal
          title="Votre réservation"
          @close="closeModal"
      />

      <form @submit.prevent="handleSubmit" v-if="currentStep === 'form'" class="modal-body">
        <h2 class="booking-title">{{ boat?.nom }}</h2>

        <div class="form-group">
          <label>Type de réservation</label>
          <div v-if="reservationType === 'multi' && !isOwnerComputed" class="multi-day-info-box">
            <div class="info-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="info-text-wrapper">
              <h4 class="info-title">Un départ multi-journée ?</h4>
              <p class="info-description">
                Configurez votre réservation ici. UPtoSEA se chargera de vous envoyer rapidement une offre personnalisée sur devis pour votre départ multijournée.
              </p>
            </div>
          </div>
          <div class="radio-group-booking" v-if="!boat?.multijournee">
            <label class="radio-option-booking">
              <UiRadioButton v-model="reservationType" value="single" label="Journée" />
            </label>
          </div>
        </div>

        <div v-if="reservationType === 'single'">
          <div class="form-group">
            <label for="booking-date">Date de début <span class="required">*</span></label>
            <VDatePicker
                v-model="bookingDate"
                mode="date"
                :min-date="new Date()"
                :disabled-dates="disabledDates"
                @update:modelValue="updateFormattedDate"
                :is-dark="false"
            >
              <template #default="{ inputValue, inputEvents }">
                <input
                    id="booking-date"
                    class="form-input"
                    :class="{ 'has-error': formSubmitted && !bookingDate }"
                    :value="inputValue"
                    v-on="inputEvents"
                    placeholder="jj/mm/aaaa"
                />
              </template>
            </VDatePicker>
            <div class="required-tag" v-if="formSubmitted && !bookingDate">Date requise</div>
          </div>

          <div v-if="hasOnCallSlots" class="info-message fade-in" style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 12px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; color: #e65100; font-weight: 500;">
              Les créneaux affichés en orange sont réservables uniquement sur appel téléphonique.
            </p>
          </div>

          <div class="form-group">
            <label>Créneau de début <span class="required">*</span></label>
            <div class="time-slots">
              <div class="time-slot"
                   :class="{
                     active: creneauDebutInternal === 'morning',
                     disabled: !(isSlotAvailable('morning', true).available || isSlotAvailable('morning', true).onCall),
                     semi: !isSlotAvailable('morning', true).available && isSlotAvailable('morning', true).onCall
                   }"
                   @click="(isSlotAvailable('morning', true).available || isSlotAvailable('morning', true).onCall) ? toggleCreneauDebut('morning') : null">
                Lever de soleil <br>
                <span class="heure-creneau">(5h)</span>

              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauDebutInternal === 'morning-half',
                     disabled: !(isSlotAvailable('morning-half', true).available || isSlotAvailable('morning-half', true).onCall),
                     semi: !isSlotAvailable('morning-half', true).available && isSlotAvailable('morning-half', true).onCall
                   }"
                   @click="(isSlotAvailable('morning-half', true).available || isSlotAvailable('morning-half', true).onCall) ? toggleCreneauDebut('morning-half') : null">
                Matinée <br>
                <span class="heure-creneau">(9h)</span>
              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauDebutInternal === 'afternoon',
                     disabled: !(isSlotAvailable('afternoon', true).available || isSlotAvailable('afternoon', true).onCall),
                     semi: !isSlotAvailable('afternoon', true).available && isSlotAvailable('afternoon', true).onCall
                   }"
                   @click="(isSlotAvailable('afternoon', true).available || isSlotAvailable('afternoon', true).onCall) ? toggleCreneauDebut('afternoon') : null">
                Après-midi <br>
                <span class="heure-creneau">(14h)</span>
              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauDebutInternal === 'sunset',
                     disabled: !(isSlotAvailable('sunset', true).available || isSlotAvailable('sunset', true).onCall),
                     semi: !isSlotAvailable('sunset', true).available && isSlotAvailable('sunset', true).onCall
                   }"
                   @click="(isSlotAvailable('sunset', true).available || isSlotAvailable('sunset', true).onCall) ? toggleCreneauDebut('sunset') : null">
                Coucher de soleil<br>
                <span class="heure-creneau">(19h)</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Créneau de fin <span class="required">*</span></label>
            <div class="time-slots">
              <div class="time-slot"
                   :class="{
                     active: creneauFinInternal === 'morning',
                     disabled: !(isSlotAvailable('morning', false).available || isSlotAvailable('morning', false).onCall),
                     semi: !isSlotAvailable('morning', false).available && isSlotAvailable('morning', false).onCall
                   }"
                   @click="(isSlotAvailable('morning', false).available || isSlotAvailable('morning', false).onCall) ? toggleCreneauFin('morning') : null">
                Lever de soleil<br>
                <span class="heure-creneau">(08h)</span>
              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauFinInternal === 'morning-half',
                     disabled: !(isSlotAvailable('morning-half', false).available || isSlotAvailable('morning-half', false).onCall),
                     semi: !isSlotAvailable('morning-half', false).available && isSlotAvailable('morning-half', false).onCall
                   }"
                   @click="(isSlotAvailable('morning-half', false).available || isSlotAvailable('morning-half', false).onCall) ? toggleCreneauFin('morning-half') : null">
                Matinée<br>
                <span class="heure-creneau">(13h)</span>
              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauFinInternal === 'afternoon',
                     disabled: !(isSlotAvailable('afternoon', false).available || isSlotAvailable('afternoon', false).onCall),
                     semi: !isSlotAvailable('afternoon', false).available && isSlotAvailable('afternoon', false).onCall
                   }"
                   @click="(isSlotAvailable('afternoon', false).available || isSlotAvailable('afternoon', false).onCall) ? toggleCreneauFin('afternoon') : null">
                Après-midi<br>
                <span class="heure-creneau">(18h)</span>
              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauFinInternal === 'sunset',
                     disabled: !(isSlotAvailable('sunset', false).available || isSlotAvailable('sunset', false).onCall),
                     semi: !isSlotAvailable('sunset', false).available && isSlotAvailable('sunset', false).onCall
                   }"
                   @click="(isSlotAvailable('sunset', false).available || isSlotAvailable('sunset', false).onCall) ? toggleCreneauFin('sunset') : null">
                Coucher de soleil<br>
                <span class="heure-creneau">(22h)</span>
              </div>
            </div>

            <UiToast  v-if="!isTimeSlotSequenceValid" message="Le créneau de fin ne peut pas être avant le créneau de début" @close="apiError = null" />
          </div>
        </div>

        <UiToast v-if="isSelectedSlotOnCall" message="Cette réservation est possible uniquement sur appel téléphonique pour les créneaux sélectionnés." />

        <div v-if="reservationType === 'multi'">
          <div class="form-group">
            <label for="date-range">Plage de dates de réservation <span class="required">*</span></label>

            <VDatePicker
                v-model="rangeDateModel"
                mode="date"
                is-range
                :min-date="new Date()"
                :disabled-dates="disabledDates"
                :is-dark="false"
            >
              <template #default="{ inputValue, inputEvents }">
                <div class="flex-range-inputs">
                  <input
                      :value="inputValue.start"
                      v-on="inputEvents.start"
                      class="form-input"
                      :class="{ 'has-error': formSubmitted && !bookingDate }"
                      placeholder="Début"
                  />
                  <input
                      :value="inputValue.end"
                      v-on="inputEvents.end"
                      class="form-input"
                      :class="{ 'has-error': formSubmitted && !endDate }"
                      placeholder="Fin"
                      style="margin-top: 15px"
                  />
                </div>
              </template>
            </VDatePicker>

            <UiToast v-if="isMultiDayDateError" message="Pour une réservation multi-journée, la date de fin doit être différente de la date de début." @close="apiError = null"></UiToast>

            <div class="required-tag" v-if="formSubmitted && (!bookingDate || !endDate)">
              Plage de dates requise
            </div>
          </div>

          <div class="form-group">
            <label>Créneau de début <span class="required">*</span></label>
            <div class="time-slots">
              <div class="time-slot"
                   :class="{
                     active: creneauDebutInternal === 'morning',
                     disabled: !(isSlotAvailable('morning', true).available || isSlotAvailable('morning', true).onCall)
                   }"
                   @click="(isSlotAvailable('morning', true).available || isSlotAvailable('morning', true).onCall) ? toggleCreneauDebut('morning') : null">
                Lever de soleil<br>
                <span class="heure-creneau">(5h)</span>
              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauDebutInternal === 'morning-half',
                     disabled: !(isSlotAvailable('morning-half', true).available || isSlotAvailable('morning-half', true).onCall)
                   }"
                   @click="(isSlotAvailable('morning-half', true).available || isSlotAvailable('morning-half', true).onCall) ? toggleCreneauDebut('morning-half') : null">
                Matinée<br>
                <span class="heure-creneau">(9h)</span>
              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauDebutInternal === 'afternoon',
                     disabled: !(isSlotAvailable('afternoon', true).available || isSlotAvailable('afternoon', true).onCall)
                   }"
                   @click="(isSlotAvailable('afternoon', true).available || isSlotAvailable('afternoon', true).onCall) ? toggleCreneauDebut('afternoon') : null">
                Après-midi<br>
                <span class="heure-creneau">(14h)</span>
              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauDebutInternal === 'sunset',
                     disabled: !(isSlotAvailable('sunset', true).available || isSlotAvailable('sunset', true).onCall)
                   }"
                   @click="(isSlotAvailable('sunset', true).available || isSlotAvailable('sunset', true).onCall) ? toggleCreneauDebut('sunset') : null">
                Coucher de soleil<br>
                <span class="heure-creneau">(19h)</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Créneau de fin <span class="required">*</span></label>
            <div class="time-slots">
              <div class="time-slot"
                   :class="{
                     active: creneauFinInternal === 'morning',
                     disabled: !(isSlotAvailable('morning', false).available || isSlotAvailable('morning', false).onCall)
                   }"
                   @click="(isSlotAvailable('morning', false).available || isSlotAvailable('morning', false).onCall) ? toggleCreneauFin('morning') : null">
                Lever de soleil<br>
                <span class="heure-creneau">(8h)</span>
              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauFinInternal === 'morning-half',
                     disabled: !(isSlotAvailable('morning-half', false).available || isSlotAvailable('morning-half', false).onCall)
                   }"
                   @click="(isSlotAvailable('morning-half', false).available || isSlotAvailable('morning-half', false).onCall) ? toggleCreneauFin('morning-half') : null">
                Matinée<br>
                <span class="heure-creneau">(13h)</span>
              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauFinInternal === 'afternoon',
                     disabled: !(isSlotAvailable('afternoon', false).available || isSlotAvailable('afternoon', false).onCall)
                   }"
                   @click="(isSlotAvailable('afternoon', false).available || isSlotAvailable('afternoon', false).onCall) ? toggleCreneauFin('afternoon') : null">
                Après-midi<br>
                <span class="heure-creneau">(18h)</span>
              </div>
              <div class="time-slot"
                   :class="{
                     active: creneauFinInternal === 'sunset',
                     disabled: !(isSlotAvailable('sunset', false).available || isSlotAvailable('sunset', false).onCall)
                   }"
                   @click="(isSlotAvailable('sunset', false).available || isSlotAvailable('sunset', false).onCall) ? toggleCreneauFin('sunset') : null">
                Coucher de soleil<br>
                <span class="heure-creneau">(22h)</span>
              </div>
            </div>
          </div>
        </div>

        <hr class="hr-custom" v-if="!isOwnerComputed">

        <div class="form-group" v-if="!isOwnerComputed">
          <label>Nombre de personnes à bord</label>
          <div class="passenger-counter"
               :class="{ 'has-error': passengerExceedsMaximum }">

            <span v-if='passengerCount > 0' class="passenger-label-summary">
              {{ passengerCount }} Passager{{ passengerCount > 1 ? 's' : '' }}
            </span>
            <span v-else class="passenger-label-summary empty-label">Nombre de passagers</span>

            <div class="counter-controls">
              <button type="button" @click="decreasePassengers" :disabled="passengerCount <= 1" class="counter-btn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <span class="counter-value">{{ passengerCount }}</span>
              <button type="button"
                      @click="increasePassengers"
                      :disabled="passengerCount >= maxPassengers"
                      class="counter-btn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="capacity-info" v-if="boat?.nombreDePersonnesAutorisees">
            Capacité maximum: {{ boat.nombreDePersonnesAutorisees }} personnes
          </div>

          <UiToast v-if="passengerExceedsMaximum" message="`Le nombre de personnes (${ passengerCount }) dépasse la capacité maximale du
            bateau (${boat?.nombreDePersonnesAutorisees})`" />

          <div class="required-tag" v-if="formSubmitted && !passengerCount">
            Veuillez indiquer le nombre de personnes
          </div>
        </div>

        <div class="form-group" v-if="!isOwnerComputed">
          <label>Conditions d'annulation</label>
          <div class="time-slots">
            <div class="time-slot" :class="{ active: selectedAnnulation === '4UTS' }"
                 @click="selectedAnnulation = '4UTS'">
              Annulable 72h avant
            </div>
            <div class="time-slot" :class="{ active: selectedAnnulation === '3UTS' }"
                 @click="selectedAnnulation = '3UTS'">
              Reportable 10 jours avant
            </div>
            <div class="time-slot" :class="{ active: selectedAnnulation === '2UTS' }"
                 @click="selectedAnnulation = '2UTS'">
              Non annulable
            </div>
          </div>
        </div>

        <hr class="hr-custom" v-if="!isOwnerComputed">

        <div class="form-group" v-if="!isOwnerComputed">
          <label for="message">Message</label>
          <textarea id="message" v-model="message" placeholder="Message" rows="4" class="form-textarea"></textarea>
        </div>

        <div class="form-group" v-if="!isOwnerComputed">
          <label for="referral">Code parrainage</label>
          <input id="referral" v-model="apporteurCode" type="text" placeholder="Saisir un code" class="form-input"/>
        <div class="verif-apporteur">
          <small v-if="isCheckingDiscount" style="color: gray;">Vérification du code...</small>
          <small v-else-if="discountAmount > 0" style="color: #2e7d32; font-weight: 600;">
            Code valide ! -{{ (discountAmount / 100).toFixed(2) }} € appliqués.
          </small>
          <small v-else-if="apporteurCode && !isCheckingDiscount" style="color: #c62828;">Code introuvable.</small>
        </div>
        </div>

        <div v-if="authStore.isLoggedIn && needsBoatLicenseButUserDoesntHaveOne && !hasSkipper" class="license-check-section">
          <div class="license-warning-box">
            <div class="warning-icon">⚠️</div>
            <div class="warning-content">
              <strong>Permis bateau requis</strong>
              <p>Votre compte ne possède pas de permis.</p>
            </div>
          </div>

          <div class="form-group mt-3">
            <label class="mb-2">Une autre personne présente sur le bateau possède-t-elle le permis ?</label>

            <div class="radio-group-license">
              <label class="radio-option-license" :class="{ active: guestLicenseChoice === 'yes' }">
                <input type="radio" class="drive-licence" v-model="guestLicenseChoice" value="yes">
                <span>Oui</span>
              </label>

              <label class="radio-option-license" :class="{ active: guestLicenseChoice === 'no' }">
                <input type="radio" class="drive-licence" v-model="guestLicenseChoice" value="no">
                <span>Non</span>
              </label>
            </div>
          </div>

          <div v-if="guestLicenseChoice === 'yes'" class="form-group upload-section fade-in">
<!--            <label for="license-upload">Télécharger le permis (PDF, JPG, PNG)</label>-->
            <ImageUpload
                v-model="selectedFiles"
                id="license-upload"
                label="Télécharger le permis (PDF, JPG, PNG)"
                :disabled="isSubmitting"
                class="form-input-file"
                accept=".pdf,.jpg,.jpeg,.png"
                @change="handleFileChange"
            />
            <small v-if="guestLicenseError" class="file-error">
              {{ guestLicenseError }}
            </small>
          </div>

          <div class="info-message fade-in">
            <p>
              Le départ se fait sous présentation obligatoire d’un permis bateau valable ou en présence d’un skipper.
            </p>
          </div>
        </div>

        <UiToast :message="apiError" @close="apiError = null" />

        <div class="form-content">
        </div>
      </form>

      <div v-if="currentStep === 'form'" class="modal-booking-actions">
        <div class="actions-left">
          <UiButton v-if="!formData || !formData.reservationId" @click="clearAll" variant="secondary" class="search-btn"
                    :disabled="isSubmitting">
            Effacer tout
          </UiButton>

          <UiButton @click="goToArticles" variant="primary" class="search-btn"
                    :disabled="!isFormValid || isSubmitting || (!authStore.isLoggedIn && !email) || isSelectedSlotOnCall">
            Suivant
          </UiButton>
        </div>

        <div class="price-total-section" v-if="(amountToPay > 0 || reservationType === 'multi') && !isOwnerComputed">
          <div v-if="isSimulating" class="price-loading">
            Chargement en cours...
          </div>
          <div v-else-if="amountToPay > 0 || reservationType === 'multi'" class="price-total">
            <span v-if="reservationType !== 'multi'" class="price-label">{{ editArticlesOnly ? 'Total articles :' : 'Total :' }}</span>
            <span v-if="reservationType !== 'multi'" class="price-amount">{{ (amountToPay / 100).toFixed(2) }} €</span>
            <span v-if="reservationType === 'multi' && !isOwnerComputed">Sur devis</span>
          </div>
        </div>
      </div>

      <div v-if="currentStep === 'articles'" class="modal-body articles-view">
        <h2 class="booking-title">Options et équipements</h2>

        <div v-if="isLoadingArticles" class="loading-overlay">
          <LoadingSpinner message="Chargement des articles..." />
        </div>

        <div class="accordions-container">
          <div v-for="cat in categoriesHierarchy" :key="cat.categorieNom" class="accordion-level-1">
            <div class="accordion-header" @click="toggleAccordion('cat_' + cat.categorieNom)">
              <span>{{ cat.categorieNom }} <span class="article-count">({{ countArticlesInNode(cat.categorieNom) }})</span></span>
              <span class="icon">{{ isAccordionOpen('cat_' + cat.categorieNom) ? '−' : '+' }}</span>
            </div>

            <div v-if="isAccordionOpen('cat_' + cat.categorieNom)" class="accordion-content">

              <div class="articles-grid" v-if="getArticlesForNode(cat.categorieNom).length">
                <div v-for="article in getArticlesForNode(cat.categorieNom)" :key="article.code" class="article-card">

                  <component :is="getArticleDownloadLink(article) ? 'a' : 'div'"
                             :href="getArticleDownloadLink(article) || null"
                             target="_blank"
                             class="article-card__header">
                    <div class="article-card__image-wrapper">
                      <img :src="getArticleImage(article)" :alt="article.titre" class="article-card__img" />
                    </div>
                    <div v-if="article.venteOuLocation === 'location'" class="article-card__badge article-card__badge--location">
                      {{ article.venteOuLocation }}
                    </div>
                    <div class="article-card__badge article-card__badge--category">
                      {{ article.categorieNom }}
                    </div>
                  </component>

                  <div class="article-card__content">
                    <div class="article-card__info">
                      <h3 class="article-card__title">{{ article.titre }}</h3>
                      <div class="article-card__description line-clamp" v-html="article.description"></div>
                    </div>

                    <div class="article-card__footer">
                      <div class="article-card__price">
                        {{ (article.prixTtc / 100).toFixed(2) }} €
                      </div>
                      <div class="article-actions-card">
                        <button type="button"
                                @click="updateArticleQuantity(article, -1)"
                                :disabled="!selectedArticlesMap[article.code] || (isPaid && selectedArticlesMap[article.code] <= (alreadyPaidArticlesMap[article.code] || 0))">
                          -
                        </button>
                        <span>{{ selectedArticlesMap[article.code] || 0 }}</span>
                        <button v-if="selectedArticlesMap < article.quantite" type="button" @click="updateArticleQuantity(article, 1)" :disabled="article.venteOuLocation === 'location' && (selectedArticlesMap[article.code] || 0) >= article.quantite || (selectedArticlesMap[article.code] || 0) >= 99">+</button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div v-for="subcat in cat.sousCategories" :key="subcat.sousCategorieNom" class="accordion-level-2">
                <div class="accordion-header sub" @click="toggleAccordion('sub_' + cat.categorieNom + subcat.sousCategorieNom)">
                  <span>{{ subcat.sousCategorieNom }} <span class="article-count">({{ countArticlesInNode(cat.categorieNom, subcat.sousCategorieNom) }})</span></span>
                  <span class="icon">{{ isAccordionOpen('sub_' + cat.categorieNom + subcat.sousCategorieNom) ? '−' : '+' }}</span>
                </div>

                <div v-if="isAccordionOpen('sub_' + cat.categorieNom + subcat.sousCategorieNom)" class="accordion-content">

                  <div class="articles-grid" v-if="getArticlesForNode(cat.categorieNom, subcat.sousCategorieNom).length">
                    <div v-for="article in getArticlesForNode(cat.categorieNom, subcat.sousCategorieNom)" :key="article.code" class="article-card">

                      <component :is="getArticleDownloadLink(article) ? 'a' : 'div'"
                                 :href="getArticleDownloadLink(article) || null"
                                 target="_blank"
                                 class="article-card__header">
                        <div class="article-card__image-wrapper">
                          <img :src="getArticleImage(article)" :alt="article.titre" class="article-card__img" />
                        </div>
                        <div v-if="article.venteOuLocation === 'location'" class="article-card__badge article-card__badge--location">
                          {{ article.venteOuLocation }}
                        </div>
                        <div class="article-card__badge article-card__badge--category">
                          {{ article.categorieNom }}
                        </div>
                      </component>

                      <div class="article-card__content">
                        <div class="article-card__info">
                          <h3 class="article-card__title">{{ article.titre }}</h3>
                          <div class="article-card__description line-clamp" v-html="article.description"></div>
                        </div>

                        <div class="article-card__footer">
                          <div class="article-card__price">
                            {{ (article.prixTtc / 100).toFixed(2) }} €
                          </div>
                          <div class="article-actions-card">
                            <button type="button"
                                    @click="updateArticleQuantity(article, -1)"
                                    :disabled="!selectedArticlesMap[article.code] || (isPaid && selectedArticlesMap[article.code] <= (alreadyPaidArticlesMap[article.code] || 0))">
                              -
                            </button>
                            <span>{{ selectedArticlesMap[article.code] || 0 }}</span>
                            <button type="button" @click="updateArticleQuantity(article, 1)" :disabled="article.venteOuLocation === 'location' && (selectedArticlesMap[article.code] || 0) >= article.quantite || (selectedArticlesMap[article.code] || 0) >= 99">+</button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div v-for="subsub in subcat.sousSousCategories" :key="subsub.sousSousCategorieNom" class="accordion-level-3">
                    <div class="accordion-header sub-sub" @click="toggleAccordion('subsub_' + cat.categorieNom + subcat.sousCategorieNom + subsub.sousSousCategorieNom)">
                      <span>{{ subsub.sousSousCategorieNom }} <span class="article-count">({{ countArticlesInNode(cat.categorieNom, subcat.sousCategorieNom, subsub.sousSousCategorieNom) }})</span></span>
                      <span class="icon">{{ isAccordionOpen('subsub_' + cat.categorieNom + subcat.sousCategorieNom + subsub.sousSousCategorieNom) ? '−' : '+' }}</span>
                    </div>

                    <div v-if="isAccordionOpen('subsub_' + cat.categorieNom + subcat.sousCategorieNom + subsub.sousSousCategorieNom)" class="accordion-content">

                      <div class="articles-grid" v-if="getArticlesForNode(cat.categorieNom, subcat.sousCategorieNom, subsub.sousSousCategorieNom).length">
                        <div v-for="article in getArticlesForNode(cat.categorieNom, subcat.sousCategorieNom, subsub.sousSousCategorieNom)" :key="article.code" class="article-card">

                          <component :is="getArticleDownloadLink(article) ? 'a' : 'div'"
                                     :href="getArticleDownloadLink(article) || null"
                                     target="_blank"
                                     class="article-card__header">
                            <div class="article-card__image-wrapper">
                              <img :src="getArticleImage(article)" :alt="article.titre" class="article-card__img" />
                            </div>
                            <div v-if="article.venteOuLocation === 'location'" class="article-card__badge article-card__badge--location">
                              {{ article.venteOuLocation }}
                            </div>
                            <div class="article-card__badge article-card__badge--category">
                              {{ article.categorieNom }}
                            </div>
                          </component>

                          <div class="article-card__content">
                            <div class="article-card__info">
                              <h3 class="article-card__title">{{ article.titre }}</h3>
                              <div class="article-card__description line-clamp" v-html="article.description"></div>
                            </div>

                            <div class="article-card__footer">
                              <div class="article-card__price">
                                {{ (article.prixTtc / 100).toFixed(2) }} €
                              </div>
                              <div class="article-actions-card">
                                <button type="button"
                                        @click="updateArticleQuantity(article, -1)"
                                        :disabled="!selectedArticlesMap[article.code] || (isPaid && selectedArticlesMap[article.code] <= (alreadyPaidArticlesMap[article.code] || 0))">
                                  -
                                </button>
                                <span>{{ selectedArticlesMap[article.code] || 0 }}</span>
                                <button type="button" @click="updateArticleQuantity(article, 1)" :disabled="article.venteOuLocation === 'location' && (selectedArticlesMap[article.code] || 0) >= article.quantite || (selectedArticlesMap[article.code] || 0) >= 99">+</button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div v-if="currentStep === 'articles'" class="modal-booking-actions">
        <div class="actions-left">
          <UiButton v-if="!editArticlesOnly" @click="currentStep = 'form'" variant="secondary" class="search-btn" :disabled="isSubmitting">
            Retour
          </UiButton>
          <UiButton @click="goToSummary" variant="primary" class="search-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'En cours...' : (formData.reservationId ? 'Confirmer' : (authStore.isLoggedIn ? 'Réserver maintenant' : 'Réserver')) }}
          </UiButton>
        </div>

        <div class="price-total-section" v-if="(amountToPay > 0 || reservationType === 'multi') && !isOwnerComputed">
          <div v-if="isSimulating" class="price-loading">
            Chargement en cours...
          </div>
          <div v-else-if="amountToPay > 0 || reservationType === 'multi'" class="price-total">
            <span v-if="reservationType !== 'multi'" class="price-label">{{ editArticlesOnly ? 'Total articles :' : 'Total :' }}</span>
            <span v-if="reservationType !== 'multi'" class="price-amount">
              {{ (amountToPay / 100).toFixed(2) }} €
            </span>
            <span v-if="reservationType === 'multi' && !isOwnerComputed">Sur devis</span>
          </div>
        </div>
      </div>

      <div v-if="currentStep === 'summary'" class="modal-body summary-view">
        <div class="boat-summary">
          <div class="boat-image">
            <img :src="boatImage" alt="Photo du bateau">
          </div>
          <div class="boat-info">
            <h3>{{ boat?.nom }} <span class="reference">Référence bateau :{{ boat.code }}</span></h3>
            <p class="boat-year">({{ boat?.annee || '' }})</p>
            <p class="boat-location" style="text-transform: capitalize"> {{ [boat.franchise.ville, boat.franchise.pays].filter(item => item).join(', ').toLowerCase() }}</p>
          </div>
        </div>

        <div class="booking-section">
          <h3>Votre sortie</h3>

          <div class="booking-item">
            <div class="item-label">Date(s)</div>
            <div class="item-value">{{ summaryDates }}</div>
            <div class="action-buttons" v-if="!editArticlesOnly">
              <UiButton variant="secondary" @click="goBackToForm('date')">Modifier</UiButton>
            </div>
          </div>

          <div class="booking-item">
            <div class="item-label">Créneaux horaires</div>
            <div class="item-value">{{ getTimeSlotsLabel }}</div>
            <div class="action-buttons" v-if="!editArticlesOnly">
              <UiButton variant="secondary" @click="goBackToForm('timeSlot')">Modifier</UiButton>
            </div>
          </div>

          <div class="booking-item" v-if="!isOwnerComputed">
            <div class="item-label">Conditions d'annulation</div>
            <div class="item-value">{{ getAnnulationLabel }}</div>
            <div class="action-buttons" v-if="!editArticlesOnly">
              <UiButton variant="secondary" @click="goBackToForm('annulation')">Modifier</UiButton>
            </div>
          </div>
          <div class="booking-item" v-if="!isOwnerComputed">
            <div class="item-label">Skipper</div>
            <div class="item-value">
              <span class="status-badge">Sans skipper</span>
              <p class="helper-text">
                Si vous souhaitez un skipper, contactez-nous au
                <a :href="`tel:${boat.franchise.tel}`" class="phone-link">
                  {{ boat.franchise.tel }}
                </a>
              </p>
          </div>
          </div>

          <div class="booking-item">
            <div class="item-label">Articles / Options</div>
            <div class="item-value">
              <div v-if="Object.keys(selectedArticlesMap).length === 0">Aucun produit sélectionné</div>

              <ul v-else class="summary-articles-list">
                <li v-for="(qty, code) in selectedArticlesMap" :key="code">
                  <strong>{{ qty }}x</strong> {{ getArticleByCodeLocal(code)?.titre }}

                  <span class="text-muted" v-if="editArticlesOnly && qty > (alreadyPaidArticlesMap[code] || 0)">
                    <br><small style="color: #e65100;">(Supplément : +{{ qty - (alreadyPaidArticlesMap[code] || 0) }} pour {{ (((getArticleByCodeLocal(code)?.prixTtc) * (qty - (alreadyPaidArticlesMap[code] || 0))) / 100).toFixed(2) }} €)</small>
                  </span>

                  <span class="text-muted" v-else-if="!editArticlesOnly">
                    ({{ ((getArticleByCodeLocal(code)?.prixTtc * qty) / 100).toFixed(2) }} €)
                  </span>
                </li>
              </ul>
            </div>
            <div class="action-buttons">
              <UiButton variant="secondary" @click="currentStep = 'articles'">Modifier</UiButton>
            </div>
          </div>
        </div>

        <div v-if="!isOwnerComputed && reservationType !== 'multi'" class="booking-section">
          <h3>Détail du prix</h3>

          <div class="price-item" v-if="!editArticlesOnly">
            <div class="price-description">
              <p>Location du bateau TTC</p>
            </div>
            <div class="price-amount">{{ (apiBookingPrice.montantTtcLocationBateau / 100).toFixed(2) }} €</div>
          </div>

          <div class="price-item" v-if="editArticlesOnly ? newArticlesTotals.location > 0 : apiBookingPrice.montantTtcArticleLocation > 0">
            <div class="price-description">
              <p>Articles loués (Options) TTC</p>
            </div>
            <div class="price-amount">
              {{ editArticlesOnly
                ? (newArticlesTotals.location / 100).toFixed(2)
                : (apiBookingPrice.montantTtcArticleLocation / 100).toFixed(2)
              }} €
            </div>
          </div>

          <div class="price-item" v-if="editArticlesOnly ? newArticlesTotals.vendus > 0 : apiBookingPrice.montantTtcArticleVendus > 0">
            <div class="price-description">
              <p>Articles vendus (Consommables, etc.) TTC</p>
            </div>
            <div class="price-amount">
              {{ editArticlesOnly
                ? (newArticlesTotals.vendus / 100).toFixed(2)
                : (apiBookingPrice.montantTtcArticleVendus / 100).toFixed(2)
              }} €
            </div>
          </div>

          <div class="price-item" v-if="!editArticlesOnly">
            <div class="price-description">
              <p>Montant de la caution (informations)</p>
            </div>
            <div class="price-amount">{{ (boat?.caution / 100).toFixed(2) }} €</div>
          </div>

          <div class="price-item" v-if="discountAmount > 0">
            <div class="price-description">
              <p style="color: #2e7d32; font-weight: 600;">Réduction parrainage</p>
            </div>
            <div class="price-amount" style="color: #2e7d32; font-weight: 600;">
              - {{ (discountAmount / 100).toFixed(2) }} €
            </div>
          </div>

          <div class="price-item total">
            <div class="price-description">
              <p>{{ editArticlesOnly ? 'Total à payer (Articles) TTC' : 'Total TTC' }}</p>
            </div>
            <div class="price-amount">
              {{ (amountToPay / 100).toFixed(2) }} €
            </div>
          </div>
        </div>

        <UiToast :message="apiError" @close="apiError = null" />

        <div class="confirmation-section">
          <div v-if="authStore.isLoggedIn">
            <UiButton @click="handleFinalAction" variant="primary" class="continue-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'En cours...' : (isOwnerComputed ? 'Réserver' : (reservationType === 'multi' ? 'Demander un devis' : 'Procéder au paiement')) }}
            </UiButton>
          </div>

          <div class="login-section" v-else>
            <h3>Finalisez votre réservation</h3>

            <div class="form-group">
              <input type="email" placeholder="Adresse e-mail" v-model="email" class="form-input"
                     :class="{ 'has-error': formSubmitted && !email }"/>
              <div class="required-tag" v-if="formSubmitted && !email">Email requis</div>
            </div>

            <UiButton @click="submitBooking" variant="primary" class="continue-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'En cours...' : (reservationType === 'multi' ? 'Demander un devis' : 'Finaliser la réservation') }}
            </UiButton>
          </div>
        </div>
      </div>

      <div v-if="isRedirecting" class="loading-overlay">
        <LoadingSpinner v-if="isRedirecting" message="Redirection vers la page de paiement..." />
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, computed, watch} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import UiButton from '../ui/UiButton.vue';
import UiRadioButton from '../ui/UiRadioButton.vue';
import {ApiBookingService} from '../../services/apiBooking.js';
import {useAuthStore} from '../../stores/useAuthStore.js';
import { useBoatsStore } from '../../stores/useBoatsStore.js';
import {useBookingStore} from '../../stores/useBookingStore.js';
import { useArticlesStore } from '@/stores/useArticlesStore.js';
import {useBoatProprietaireStore} from '@/stores/useBoatProprietaireStore';
import {isBookingEditable as checkBookingEditable, goBackToForm as goBackToFormUtil} from '../../utils/bookingUtils.js';
import {nextTick} from 'vue';
import HeaderModal from "@/components/common/HeaderModal.vue";
import 'v-calendar/dist/style.css';
import { DatePicker as VDatePicker } from 'v-calendar';
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ImageUpload from "@/components/ui/UiFilesUpload.vue";
import UiToast from "@/components/ui/UiToast.vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  boat: {
    type: Object,
    default: () => ({})
  },
  booking: {
    type: Object,
    default: () => ({})
  },
  editArticlesOnly: {
    type: Boolean,
    default: false
  },
  isOwnerContext: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'submit']);
const router = useRouter();
const route = useRoute();
const currentStep = ref('form');

// Initialisation des stores
const authStore = useAuthStore();
const bookingStore = useBookingStore();
const articlesStore = useArticlesStore();
const boatsStoreList = useBoatsStore();

// Ref & Etat ===
const isSubmitting = ref(false);
const isSimulating = ref(false);
const apiError = ref(null);
const isRedirecting = ref(false);
const isLoadingArticles = ref(false);
const formSubmitted = ref(false);
const email = ref('');
const createdBookingId = ref(null);
const isOwnerReservation = ref(false);

const reservationType = ref(props.boat?.multijournee ? 'multi' : 'single');
const bookingDate = ref('');
const endDate = ref('');
const dates = ref(null);
const creneauDebutInternal = ref('');
const creneauFinInternal = ref('');
const creneauDebut = ref('');
const creneauFin = ref('');
const passengerCount = ref(1);
const formattedDate = ref('');
const selectedAnnulation = ref('2UTS');
const apporteurCode = ref('');
const message = ref('');

// --- GESTION DES ARTICLES DYNAMIQUES ---
const categoriesHierarchy = computed(() => articlesStore.categoriesHierarchy);
const openAccordions = ref({});
const selectedArticlesMap = ref({}); // Structure : { 'codeArticle': quantite }
const alreadyPaidArticlesMap = ref({});
const sessionSavedArticlesMap = ref({});

const isSelectedSlotOnCall = computed(() => {
  // On applique le blocage uniquement pour les réservations d'une journée
  if (reservationType.value !== 'single') return false;

  let onCall = false;

  // Vérifie si le créneau de début sélectionné est "orange"
  if (creneauDebutInternal.value) {
    const statusDebut = isSlotAvailable(creneauDebutInternal.value, true);
    if (!statusDebut.available && statusDebut.onCall) onCall = true;
  }

  // Vérifie si le créneau de fin sélectionné est "orange"
  if (creneauFinInternal.value) {
    const statusFin = isSlotAvailable(creneauFinInternal.value, false);
    if (!statusFin.available && statusFin.onCall) onCall = true;
  }

  return onCall;
});

// Fonction pour compter les articles dans un niveau spécifique (pour l'affichage (X))
const countArticlesInNode = (cat, subCat = null, subSubCat = null) => {
  if (!articlesStore.allArticles) return 0;
  return articlesStore.allArticles.filter(a => {
    let match = a.categorieNom === cat;
    if (subCat) match = match && a.sousCategorieNom === subCat;
    if (subSubCat) match = match && a.sousSousCategorieNom === subSubCat;
    return match;
  }).length;
};

// Retourne les articles pour une sous-catégorie précise
const getArticlesForNode = (cat, subCat = null, subSubCat = null) => {
  if (!articlesStore.allArticles) return [];
  return articlesStore.allArticles.filter(a =>
      a.categorieNom === cat &&
      a.sousCategorieNom === subCat &&
      a.sousSousCategorieNom === subSubCat
  );
};

// Récupérer un article via son code pour le récapitulatif
const getArticleByCodeLocal = (code) => {
  if (!articlesStore.allArticles) return null;
  return articlesStore.allArticles.find(a => a.code === code);
};

// Helpers pour l'affichage dans la Card
const getArticleImage = (article) => {
  if (article.imageUrl && article.imageUrl.slug) {
    const separator = article.imageUrl.slug.includes('?') ? '&' : '?';
    return `${article.imageUrl.slug}${separator}w=317`;
  }
  return 'https://app.uptosea.com/images/produit.webp';
};

const getArticleDownloadLink = (article) => {
  if (article.ficheUrl && article.ficheUrl.slug) {
    return article.ficheUrl.slug;
  }
  return null;
};

// Accordeons
const toggleAccordion = (id) => {
  openAccordions.value[id] = !openAccordions.value[id];
};

const isAccordionOpen = (id) => {
  return !!openAccordions.value[id];
};

// Modification Quantité
const updateArticleQuantity = (article, delta) => {
  const current = selectedArticlesMap.value[article.code] || 0;
  const next = current + delta;
    if (next <= 0) {
      delete selectedArticlesMap.value[article.code];
    } else {
      selectedArticlesMap.value[article.code] = next;
    }
};

// Formatte les options pour l'API (Ajout multiple)
const buildOptionsPayload = () => {
  const optionsArray = [];

  Object.entries(selectedArticlesMap.value).forEach(([code, quantite]) => {
    let qtyToSend = quantite;

    if (props.editArticlesOnly) {
      const alreadySavedInSession = sessionSavedArticlesMap.value[code] || 0;
      qtyToSend = quantite - alreadySavedInSession;
    }

    if (qtyToSend > 0) {
      const art = getArticleByCodeLocal(code);
      if (art) {
        for (let i = 0; i < qtyToSend; i++) {
          optionsArray.push({
            optionId: code,
            nom: art.titre || '',
            prix: art.prixTtc || 0
          });
        }
      }
    }
  });

  return optionsArray;
};
// Ajout pour disponibilités
const availability = ref([]);
const disabledDates = ref([]);

// Gestion permis
const guestLicenseChoice = ref(null); // 'yes' ou 'no'
const guestLicenseFile = ref(null);
const guestLicenseError = ref(null);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Vérif simple taille/type
    if (file.size > 5 * 1024 * 1024) { // 5MB
      guestLicenseError.value = "Le fichier est trop volumineux (Max 5Mo)";
      guestLicenseFile.value = null;
      return;
    }
    guestLicenseFile.value = file;
    guestLicenseError.value = null;
  }
};

const loadDisabledDates = async () => {
  if (!props.boat?.code) return;

  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 60);

  const formatDate = (d) => d.toISOString().split('T')[0];
  const fromStr = formatDate(start);
  const toStr = formatDate(end);

  try {
    const rawData = await ApiBookingService.getIndisponibilities(
        props.boat.code,
        fromStr,
        toStr,
        authStore.token
    );

    const datesToDisable = rawData
        .filter(item => {
          if (item.indisponibleJour === true) {
            const hasAppel = item.disponibleJourAppel || item.disponibleLeverAppel || item.disponibleMatinAppel || item.disponibleApresMidiAppel || item.disponibleCoucherAppel;
            return !hasAppel;
          }
          return false;
        })
        .map(item => new Date(item.jour));

    disabledDates.value = datesToDisable;

  } catch (err) {
    console.error("Impossible de charger les dates indisponibles", err);
  }
};

// --- GESTION DU PARRAINAGE ---
const discountAmount = ref(0);
const isCheckingDiscount = ref(false);
let parrainageTimeout = null;

watch(apporteurCode, (newCode) => {
  if (!newCode || newCode.trim() === '') {
    discountAmount.value = 0;
    return;
  }

  if (parrainageTimeout) clearTimeout(parrainageTimeout);

  parrainageTimeout = setTimeout(async () => {
    isCheckingDiscount.value = true;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/reservations/check-parrainage/${newCode.trim()}`);
      const data = await response.json();

      if (data.valid) {
        discountAmount.value = data.discount * 100;
      } else {
        discountAmount.value = 0;
      }
    } catch (e) {
      discountAmount.value = 0;
    } finally {
      isCheckingDiscount.value = false;
    }
  }, 500); // Déclenchement 0.5s après la dernière frappe
});

watch(() => props.show, async (newVal) => {
  if (newVal === true) {

    if (newVal === true) {
      if (props.boat?.multijournee) {
        reservationType.value = 'multi';
      } else if (!props.booking?.code) {
        reservationType.value = 'single';
      }
      }

    currentStep.value = props.editArticlesOnly ? 'articles' : 'form';
    passengerCount.value = 1;

    if (!props.booking || Object.keys(props.booking).length === 0) {

      const savedDate = route.query.debut
          || boatsStoreList.activeFilters?.dateFrom
          || localStorage.getItem('searchDateDebut');

      if (savedDate) {
        reservationType.value = 'single';
        endDate.value = '';
        creneauFinInternal.value = '';
        creneauFin.value = '';

        if (savedDate.includes('-')) {
          const parts = savedDate.split('-');
          bookingDate.value = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
          bookingDate.value = new Date(savedDate);
        }

        updateFormattedDate();
      }
    }

    if (authStore.isLoggedIn && !isOwnerComputed.value) {
      try {
        const ownerStore = useBoatProprietaireStore();
        if (!ownerStore.boats || ownerStore.boats.length === 0) {
          ownerStore.fetchBoats();
        }
      } catch(e) {
      }
    }

    isLoadingArticles.value = true;
    try {
      await loadDisabledDates();
      await articlesStore.fetchArticles();
    } finally {
      isLoadingArticles.value = false;
    }

    await nextTick();
    if (bookingDate.value && creneauDebutInternal.value) {
      await simulateReservation();
    }
  }
});

  watch(() => props.boat, (newVal) => {
    if (newVal?.multijournee) {
      reservationType.value = 'multi';
    }
  }, { immediate: true });

watch(() => props.boat, (newVal) => {
  if (newVal?.code && props.show) {
    loadDisabledDates();
  }
});

const rangeDateModel = computed({
  get() {
    if (bookingDate.value && endDate.value) {
      return { start: bookingDate.value, end: endDate.value };
    }
    return null;
  },
  set(val) {
    if (val && val.start && val.end) {
      bookingDate.value = val.start;
      endDate.value = val.end;
      updateFormattedDate();
    } else {
      dates.value = null;
    }
  }
});

const apiBookingPrice = ref({
  montantTtcLocationBateau: 0,
  montantTtcArticleLocation: 0,
  montantTtcArticleVendus: 0,
  montantTtcTotalReservation: 0,
});

const formData = reactive({
  dateDebut: '',
  dateFin: '',
  creneauDebut: '',
  creneauFin: '',
  conditionAnnulation: '2UTS',
  nombrePersonnes: 1,
  apporteurAffaire: '',
  message: '',
  option: [],
  bateauId: null,
  reservationId: null
});

const TIME_SLOT_MAP = {
  'morning': 'lever',
  'morning-half': 'matin',
  'afternoon': 'apresmidi',
  'sunset': 'coucher'
};
const timeSlotLabels = {
  'morning': 'Lever de soleil',
  'morning-half': 'Matinée',
  'afternoon': 'Après-midi',
  'sunset': 'Coucher de soleil'
};
const timeSlotHours = {
  start: {
    'morning': '5h',
    'morning-half': '9h',
    'afternoon': '14h',
    'sunset': '19h'
  },
  end: {
    'morning': '8h',
    'morning-half': '13h',
    'afternoon': '18h',
    'sunset': '22h'
  }
};
const annulationLabels = {
  '4UTS': 'Annulable 72h avant',
  '3UTS': 'Reportable 10 jours avant',
  '2UTS': 'Non annulable'
};

const slotToKey = {
  morning: 'Lever',
  'morning-half': 'Matin',
  afternoon: 'ApresMidi',
  sunset: 'Coucher'
};
const slotOrder = {
  'morning': 0,
  'morning-half': 1,
  'afternoon': 2,
  'sunset': 3
};

// Vérifie si le créneau de fin est bien APRÈS (ou égal) au créneau de début
const isTimeSlotSequenceValid = computed(() => {
  if (reservationType.value !== 'single') return true;
  if (!creneauDebutInternal.value || !creneauFinInternal.value) return true; // On ne bloque pas si l'utilisateur n'a pas encore tout cliqué

  const startIndex = slotOrder[creneauDebutInternal.value];
  const endIndex = slotOrder[creneauFinInternal.value];

  return startIndex <= endIndex;
});

const isPaid = computed(() => {
  if (!props.booking || !props.booking.statutSlug) return false;
  return props.booking.statutSlug !== 'attente_paiement';
});

const formatDateForApi = (dateInput, creneau = null) => {
  if (!dateInput) return null;

  let date;
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      date = new Date(year, month, day);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      date = new Date(dateInput);
    } else {
      date = new Date(dateInput);
    }
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return null;
  }

  if (isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hours = '00';
  let minutes = '00';
  let seconds = '00';

  if (creneau) {
    switch (creneau) {
      case 'morning':
        hours = '06';
        break;
      case 'morning-half':
        hours = '09';
        break;
      case 'afternoon':
        hours = '14';
        break;
      case 'sunset':
        hours = '18';
        break;
      default:
        hours = '00';
    }
  }

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const isOwnerComputed = computed(() => {
  if (props.isOwnerContext) return true;

  if (props.booking?.reservationProprietaire || props.booking?.typeAction === 'LOCATION_PROPRIETAIRE') return true;
  if (isOwnerReservation.value) return true;

  try {
    const ownerStore = useBoatProprietaireStore();
    if (ownerStore.boats && ownerStore.boats.some(b => b.code === props.boat?.code)) {
      return true;
    }
  } catch (e) {
  }

  const user = authStore.user;
  if (user && props.boat) {
    const uCode = String(user.code || user.id || '').trim();
    const bCode = String(props.boat.codeContact || props.boat.proprietaire || '').trim();
    if (uCode !== '' && uCode === bCode) return true;
  }

  return false;
});

async function fetchAvailability() {
  if (!props.boat?.code || !authStore.token || !bookingDate.value) {
    availability.value = [];
    return;
  }

  let from, to;
  if (reservationType.value === 'single') {
    const dateStr = formatDateForApi(bookingDate.value).split(' ')[0];
    from = to = dateStr;
  } else if (reservationType.value === 'multi' && endDate.value) {
    from = formatDateForApi(bookingDate.value).split(' ')[0];
    to = formatDateForApi(endDate.value).split(' ')[0];
  } else {
    availability.value = [];
    return;
  }

  try {
    const response = await ApiBookingService.getAvailability(props.boat.code, from, to, authStore.token);
    availability.value = response.elements || [];
  } catch (error) {
    availability.value = [];
  }
}

const boatImage = computed(() => {
  let image = '';
  if (props.boat.imagePrincipale && props.boat.imagePrincipale.slug) {
    image = props.boat.imagePrincipale.slug;
  }
  else if (props.boat.image) {
    image = props.boat.image;
  }

  if (!image) {
    image = 'https://app.uptosea.com/images/produit.webp';
  }

  if (typeof image === 'string') {
    const separator = image.includes('?') ? '&' : '?';
    return `${image}${separator}w=250`;
  }

  return '';
});

const toggleCreneauDebut = (slot) => {
  const status = isSlotAvailable(slot, true);
  if (!status || (!status.available && !status.onCall)) return;

  if (creneauDebutInternal.value === slot) {
    creneauDebutInternal.value = '';
    creneauDebut.value = '';
  } else {
    creneauDebutInternal.value = slot;
    creneauDebut.value = TIME_SLOT_MAP[slot];
  }
};

const toggleCreneauFin = (slot) => {
  const status = isSlotAvailable(slot, false);
  if (!status || (!status.available && !status.onCall)) return;

  if (creneauFinInternal.value === slot) {
    creneauFinInternal.value = '';
    creneauFin.value = '';
  } else {
    creneauFinInternal.value = slot;
    creneauFin.value = TIME_SLOT_MAP[slot];
  }
};

const updateDateRange = (range) => {
  if (range && Array.isArray(range) && range.length === 2 && range[0] && range[1]) {
    bookingDate.value = range[0];
    endDate.value = range[1];
    updateFormattedDate();
  } else {
    bookingDate.value = '';
    endDate.value = '';
    formattedDate.value = '';
  }
};

const updateFormattedDate = () => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const parseToDate = (input) => {
    if (input instanceof Date) return input;
    const parts = input.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10) < 100 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10);
      return new Date(year, monthIdx, day);
    }
    return new Date(input);
  };

  if (reservationType.value === 'single' && bookingDate.value) {
    const date = parseToDate(bookingDate.value);
    formattedDate.value = `${date.getDate()} ${months[date.getMonth()].substring(0, 3)}.`;
  } else if (reservationType.value === 'multi' && bookingDate.value && endDate.value) {
    const startDate = parseToDate(bookingDate.value);
    const endDateObj = parseToDate(endDate.value);
    formattedDate.value = `${startDate.getDate()} ${months[startDate.getMonth()].substring(0, 3)}. - ${endDateObj.getDate()} ${months[endDateObj.getMonth()].substring(0, 3)}.`;
  } else {
    formattedDate.value = '';
  }

  formData.dateDebut = bookingDate.value instanceof Date ? bookingDate.value.toISOString().split('T')[0] : '';
  formData.dateFin = endDate.value instanceof Date ? endDate.value.toISOString().split('T')[0] : '';
};

const increasePassengers = () => {
  if (passengerCount.value < maxPassengers.value) {
    passengerCount.value++;
  }
};

const decreasePassengers = () => {
  if (passengerCount.value > 1) {
    passengerCount.value--;
  }
};

const findBookingCode = (response) => {
  if (!response) return null;

  if (response.elements && Array.isArray(response.elements) && response.elements.length > 0) {
    return response.elements[0].code;
  }

  if (response.code && typeof response.code === 'string') {
    return response.code;
  }

  return null;
};

// Cleat Forms
const clearAll = () => {
  bookingDate.value = '';
  creneauDebutInternal.value = '';
  creneauDebut.value = '';
  creneauFinInternal.value = '';
  creneauFin.value = '';
  endDate.value = '';
  dates.value = null;
  reservationType.value = 'single';
  passengerCount.value = 1;
  formattedDate.value = '';
  selectedAnnulation.value = '2UTS';
  apporteurCode.value = '';
  message.value = '';
  selectedArticlesMap.value = {};
  alreadyPaidArticlesMap.value = {};
  sessionSavedArticlesMap.value = {};
  openAccordions.value = {};
  email.value = '';
  formSubmitted.value = false;
  apiError.value = null;
  isSubmitting.value = false;
  apiBookingPrice.value = {
    montantTtcLocationBateau: 0,
    montantTtcArticleLocation: 0,
    montantTtcArticleVendus: 0,
    montantTtcTotalReservation: 0,
  };
  availability.value = [];
  isOwnerReservation.value = false;

  Object.assign(formData, {
    dateDebut: '',
    dateFin: '',
    creneauDebut: '',
    creneauFin: '',
    conditionAnnulation: '2UTS',
    nombrePersonnes: 1,
    apporteurAffaire: '',
    message: '',
    option: [],
    reservationId: null
  });
};

let generalSimulationTimeout = null;

const triggerSimulation = () => {
  isSimulating.value = true;

  if (generalSimulationTimeout) {
    clearTimeout(generalSimulationTimeout);
  }

  generalSimulationTimeout = setTimeout(async () => {
    await simulateReservation();
  }, 200);
};

const simulateReservation = async () => {

  if (reservationType.value === 'multi') {
    isSimulating.value = false;
    apiBookingPrice.value = {
      montantTtcLocationBateau: 0,
      montantTtcArticleLocation: 0,
      montantTtcArticleVendus: 0,
      montantTtcTotalReservation: 0,
    };
    return;
  }

  if (!bookingDate.value || !creneauDebutInternal.value || !creneauFinInternal.value || !props.boat?.code) {
    apiBookingPrice.value = {
      montantTtcLocationBateau: 0,
      montantTtcArticleLocation: 0,
      montantTtcArticleVendus: 0,
      montantTtcTotalReservation: 0,
    };
    isSimulating.value = false;
    return;
  }

  try {
    isSimulating.value = true;
    const formattedApiDateDebut = formatDateForApi(bookingDate.value, creneauDebutInternal.value);
    let formattedApiDateFin = formattedApiDateDebut;
    let finalCreneauFin = creneauFin.value;

    if (reservationType.value === 'multi' && endDate.value && creneauFinInternal.value) {
      formattedApiDateFin = formatDateForApi(endDate.value, creneauFinInternal.value);
      finalCreneauFin = creneauFin.value;
    }

    const simData = {
      reservationId: props.booking?.code || formData.reservationId || null,
      bateauId: props.boat.code,
      dateDebut: formattedApiDateDebut,
      dateFin: formattedApiDateFin,
      nombrePersonnes: passengerCount.value || 1,
      creneauDebut: creneauDebut.value,
      creneauFin: finalCreneauFin,
      reservationNuit: false,
      isDevis: false,
      conditionAnnulation: selectedAnnulation.value,
      options: buildOptionsPayload()
    };

    if (message.value) simData.message = message.value;

    const response = await ApiBookingService.simulateBooking(simData);

    const bookingElement = response?.elements?.[0] || null;
    if (bookingElement) {
      apiBookingPrice.value = {
        montantTtcLocationBateau: bookingElement.montantTtcLocationBateau || 0,
        montantTtcArticleLocation: bookingElement.montantTtcArticleLocation || 0,
        montantTtcArticleVendus: bookingElement.montantTtcArticleVendus || 0,
        montantTtcTotalReservation: bookingElement.montantTtcTotalReservation || 0,
      };
      isOwnerReservation.value = bookingElement.reservationProprietaire === true;
    }
  } catch (error) {
    console.error('Erreur lors de la simulation de réservation:', error);
    // if (authStore.isLoggedIn) {
    //   apiError.value = `Simulation impossible : ${error.message}. Vérifiez votre connexion.`;
    // }
  } finally {
    isSimulating.value = false;
  }
};

const goToArticles = () => {
  formSubmitted.value = true;
  apiError.value = null;

  // if (!isLicenseValid.value) {
  //   apiError.value = "Veuillez indiquer si une autre personne possède le permis.";
  //   return;
  // }
  //
  // if (!isLicenseValid.value) {
  //   if (guestLicenseChoice.value === 'yes' && !guestLicenseFile.value) {
  //     apiError.value = "Veuillez télécharger le permis de la personne accompagnante pour continuer.";
  //   } else {
  //     apiError.value = "Veuillez indiquer si une autre personne possède le permis.";
  //   }
  //   return;
  // }

  if (!isTimeSlotSequenceValid.value) {
    apiError.value = "Le créneau de fin ne peut pas être avant le créneau de début.";
    return;
  }

  if (!creneauDebutInternal.value || !creneauFinInternal.value) {
    setTimeout(() => { apiError.value = "Veuillez sélectionner un créneau de début et un créneau de fin."; }, 10);
    return;
  }

  // 3. Vérification de la logique des créneaux
  if (!isTimeSlotSequenceValid.value) {
    setTimeout(() => { apiError.value = "Le créneau de fin ne peut pas être avant le créneau de début."; }, 10);
    return;
  }

  if (!isLicenseValid.value) {
    if (!guestLicenseChoice.value) {
      apiError.value = "Veuillez indiquer si une personne possède le permis.";
    }
    return;
  }

  if (passengerExceedsMaximum.value) {
    apiError.value = "Le nombre de passagers dépasse la capacité maximale du bateau.";
    return;
  }

  if (!isFormValid.value) {
    apiError.value = "Veuillez remplir tous les champs obligatoires du formulaire.";
    return;
  }

  if (!authStore.isLoggedIn && !email.value) {
    apiError.value = "L'adresse e-mail est requise.";
    return;
  }

  if (!props.boat?.code) {
    apiError.value = "Erreur technique : Le bateau est introuvable.";
    return;
  }

  currentStep.value = 'articles';
  window.scrollTo(0, 0);
};

const goToSummary = async () => {
  if (!formData) return;
  formSubmitted.value = true;
  apiError.value = null;

  if (authStore.isLoggedIn && needsBoatLicenseButUserDoesntHaveOne.value && !hasSkipper.value) {
    if (!guestLicenseChoice.value) {
      apiError.value = "Veuillez indiquer si une personne possède le permis.";
      return;
    }
  }

  if (!props.editArticlesOnly && !isFormValid.value) {
    apiError.value = "Des informations requises (dates, passagers) sont manquantes.";
    return;
  }

  if (!creneauDebutInternal.value || !creneauFinInternal.value) {
    setTimeout(() => { apiError.value = "Veuillez sélectionner un créneau de début et un créneau de fin."; }, 10);
    return;
  }

  if (!isTimeSlotSequenceValid.value) {
    setTimeout(() => { apiError.value = "Le créneau de fin ne peut pas être avant le créneau de début."; }, 10);
    return;
  }

  const optionsPayload = buildOptionsPayload();

  if (props.editArticlesOnly && optionsPayload.length === 0) {
    currentStep.value = 'summary';
    window.scrollTo(0, 0);
    return;
  }

  try {
    isSubmitting.value = true;
    updateFormattedDate();

    const formattedApiDateDebut = formatDateForApi(bookingDate.value, creneauDebutInternal.value);
    let formattedApiDateFin;
    let finalCreneauFin = creneauFin.value;

    if (reservationType.value === 'single') {
      formattedApiDateFin = formatDateForApi(bookingDate.value, creneauFinInternal.value);
    } else {
      formattedApiDateFin = formatDateForApi(endDate.value, creneauFinInternal.value);
      if (!formattedApiDateFin) throw new Error("Date de fin invalide");
    }

    const apiBookingData = {
      bateauId: props.boat.code,
      dateDebut: formattedApiDateDebut,
      dateFin: formattedApiDateFin,
      nombrePersonnes: passengerCount.value || 1,
      creneauDebut: creneauDebut.value,
      creneauFin: finalCreneauFin,
      reservationNuit: reservationType.value === 'multi',
      isDevis: reservationType.value === 'multi',
      conditionAnnulation: selectedAnnulation.value,
      apporteurAffaire: apporteurCode.value || '',
      message: message.value || '',
      options: optionsPayload,
      hasGuestLicense: false,
      isWaitingForFile: false,
      montantTtcTotalReservation: amountToPay.value,
    };

    if (message.value) apiBookingData.message = message.value;
    if (!authStore.isLoggedIn) apiBookingData.email = email.value;

    if (needsBoatLicenseButUserDoesntHaveOne.value && !hasSkipper.value) {
      if (guestLicenseChoice.value === 'yes') {
        apiBookingData.hasGuestLicense = true;
        apiBookingData.isWaitingForFile = !!guestLicenseFile.value;
      } else if (guestLicenseChoice.value === 'no') {
        apiBookingData.hasGuestLicense = false;
        apiBookingData.isWaitingForFile = false;
      }
    }

    let payload = { ...apiBookingData };
    let response;

    if (formData.reservationId) {
      payload.id = formData.reservationId;
      response = await ApiBookingService.updateBooking(authStore.token, payload);

      if (props.editArticlesOnly) {
        sessionSavedArticlesMap.value = { ...selectedArticlesMap.value };
      }

      try { bookingStore.refreshSingleBooking(formData.reservationId); } catch (e) { }

    } else {
      response = await ApiBookingService.addBooking(payload);
    }

    let bookingCode = findBookingCode(response);
    if (!bookingCode && formData.reservationId) {
      bookingCode = formData.reservationId;
    }

    if (bookingCode && guestLicenseChoice.value === 'yes' && guestLicenseFile.value) {
      try { await ApiBookingService.uploadLicenseFile(authStore.token, bookingCode, guestLicenseFile.value); } catch (e) { }
    }

    const bookingElement = response?.elements?.[0] || null;
    if (bookingElement) {
      // apiBookingPrice.value = {
      //   montantTtcLocationBateau: bookingElement.montantTtcLocationBateau || 0,
      //   montantTtcArticleLocation: bookingElement.montantTtcArticleLocation || 0,
      //   montantTtcArticleVendus: bookingElement.montantTtcArticleVendus || 0,
      //   montantTtcTotalReservation: bookingElement.montantTtcTotalReservation || 0,
      // };
      isOwnerReservation.value = bookingElement.reservationProprietaire === true;
    }

    if (bookingCode) {
      formData.reservationId = bookingCode;
      createdBookingId.value = bookingCode;
    }

    currentStep.value = 'summary';
    window.scrollTo(0, 0);

  } catch (error) {
    apiError.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
};

const handleFinalAction = async () => {
  apiError.value = null;
  try {
    isSubmitting.value = true;
    if (isOwnerComputed.value && amountToPay.value === 0) {
      confirmOwnerReservation();
    } else if (reservationType.value === 'multi') {
      confirmDevisReservation();
    } else {
      await goToPaymentLink();
    }
  } catch (error) {
    console.error(error);
    apiError.value = error.message || 'Une erreur est survenue lors de la validation.';
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDevisReservation = () => {
  emit('submit', {
    ...formData,
    id: formData.reservationId || createdBookingId.value,
    status: 'pending_devis',
    requiresLogin: false
  });

  closeModal();
  navigateTo('/reservation')
};

const confirmOwnerReservation = () => {
  emit('submit', {
    ...formData,
    id: formData.reservationId,
    status: 'confirmed',
    requiresLogin: false
  });

  navigateTo({
    path: `/reservations/${formData.reservationId}/validation-paiement`,
    query: {isOwner: true}
  });
};

const closeModal = () => {
  currentStep.value = 'form';
  emit('close');
};

const goBackToForm = (focusField = null) => {
  goBackToFormUtil({currentStep, apiError}, focusField);
};

const submitBooking = async () => {
  if (!formData) return;
  formSubmitted.value = true;
  apiError.value = null;

  if (!authStore.isLoggedIn && !email.value) {
    apiError.value = "Email requis";
    return;
  }

  if (!isFormValid.value) {
    apiError.value = "Champs requis";
    return;
  }

  try {
    isSubmitting.value = true;

    // CORRECTION ICI AUSSI
    const formattedDateDebut = formatDateForApi(bookingDate.value, creneauDebutInternal.value);
    let formattedDateFin;
    let finalCreneauFin = creneauFin.value;

    if (reservationType.value === 'single') {
      formattedDateFin = formatDateForApi(bookingDate.value, creneauFinInternal.value);
    } else {
      formattedDateFin = formatDateForApi(endDate.value, creneauFinInternal.value);
    }

    if (!formData.reservationId) {
      const bookingData = {
        bateauId: props.boat?.code,
        dateDebut: formattedDateDebut,
        dateFin: formattedDateFin,
        nombrePersonnes: passengerCount.value || 1,
        creneauDebut: creneauDebut.value,
        creneauFin: finalCreneauFin,
        reservationNuit: reservationType.value === 'multi',
        isDevis: reservationType.value === 'multi',
        conditionAnnulation: selectedAnnulation.value,
        email: email.value,
        options: buildOptionsPayload(),
        montantTtcTotalReservation: amountToPay.value
      };

      if (authStore.isLoggedIn) bookingData.token = authStore.token;

      const response = await ApiBookingService.addBooking(bookingData);

      try {
        let bookingCode = findBookingCode(response);
        if (bookingCode) {
          formData.reservationId = bookingCode;
          createdBookingId.value = bookingCode;
        }

        emit('submit', {
          ...bookingData,
          id: bookingCode || response.id || 'unknown',
          status: authStore.isLoggedIn ? (reservationType.value === 'multi' ? 'pending_devis' : 'confirmed') : 'pending',
          requiresLogin: !authStore.isLoggedIn
        });

        if(reservationType.value === 'multi') {
          await navigateTo('/reservation')
        }
        closeModal();
      } catch (e) {
        apiError.value = "Erreur finalisation";
      }
    } else {
      try {
        if (authStore.isLoggedIn) {
          await ApiBookingService.updateBooking(authStore.token, {
            id: formData.reservationId,
            email: email.value,
            conditionAnnulation: selectedAnnulation.value,
            dateDebut: formattedDateDebut,
            dateFin: formattedDateFin,
            creneauDebut: creneauDebut.value,
            creneauFin: finalCreneauFin,
            nombrePersonnes: passengerCount.value || 1,
            reservationNuit: reservationType.value === 'multi',
            isDevis: reservationType.value === 'multi',
            options: buildOptionsPayload(),
            montantTtcTotalReservation: amountToPay.value
          });

          emit('submit', {
            id: formData.reservationId,
            status: authStore.isLoggedIn ? (reservationType.value === 'multi' ? 'pending_devis' : 'confirmed') : 'pending',
            email: email.value,
            requiresLogin: !authStore.isLoggedIn
          });

          if(reservationType.value === 'multi') {
            await navigateTo('/reservation')
          }
          closeModal();
        } else {
          emit('submit', {
            id: formData.reservationId,
            status: 'pending',
            email: email.value,
            requiresLogin: true
          });
          closeModal();
        }
      } catch (updateError) {
        apiError.value = "Impossible de mettre à jour.";
      }
    }
  } catch (error) {
    apiError.value = error.response?.data?.message || 'Erreur serveur';
  } finally {
    isSubmitting.value = false;
  }
};

const goToPaymentLink = async () => {
  let reservationId = formData.reservationId || createdBookingId.value;
  if (!reservationId) {
    apiError.value = "Erreur URL";
    isRedirecting.value = false;
    return;
  }

  try {
    isRedirecting.value = true;
    const result = await bookingStore.generateLinkPayment(reservationId);

    let paymentUrl = null;
    if (result?.locationPaiementUrl) paymentUrl = result.locationPaiementUrl;
    else if (result?.[0]?.locationPaiementUrl) paymentUrl = result[0].locationPaiementUrl;
    else if (result?.elements?.[0]?.locationPaiementUrl) paymentUrl = result.elements[0].locationPaiementUrl;

    if (paymentUrl && paymentUrl !== "null" && paymentUrl.includes('http')) {
      window.open(paymentUrl, "_blank");
    } else {
      apiError.value = "Aucun lien de paiement disponible. Veuillez vérifier le montant de votre panier.";
    }
  } catch (error) {
    apiError.value = "Impossible de générer le lien de paiement";
  } finally {
    isRedirecting.value = false;
  }
};

const hasOnCallSlots = computed(() => {
  // On ne vérifie que si des dates sont sélectionnées
  if (!bookingDate.value) return false;

  // On ne déclenche pas le message pour le multi-journée
  if (reservationType.value === 'multi') return false;

  const slots = ['morning', 'morning-half', 'afternoon', 'sunset'];

  if (reservationType.value === 'single') {
    return slots.some(slot => {
      const status = isSlotAvailable(slot, true);
      return !status.available && status.onCall;
    });
  } else {
    // Pour le multi-jours, on vérifie les créneaux de début ET de fin
    return slots.some(slot => {
      const statusDebut = isSlotAvailable(slot, true);
      const statusFin = isSlotAvailable(slot, false);
      return (!statusDebut.available && statusDebut.onCall) ||
          (!statusFin.available && statusFin.onCall);
    });
  }
});

const isSlotAvailable = (slot, isDebut = true) => {
  const targetDate = reservationType.value === 'single'
      ? bookingDate.value
      : (isDebut ? bookingDate.value : endDate.value);

  if (!targetDate) return { available: false, onCall: false, dayUnavailable: true };

  const fullDateStr = formatDateForApi(targetDate);
  const dayStr = fullDateStr ? fullDateStr.split(' ')[0] : '';

  if (availability.value.length === 0) return { available: true, onCall: false, dayUnavailable: false };

  const dayAvail = availability.value.find(d => d.jour.split('T')[0] === dayStr);

  if (!dayAvail) return { available: false, onCall: false, dayUnavailable: true };

  const dayAvailable = !!dayAvail.disponibleJour || !!dayAvail.disponibleLever || !!dayAvail.disponibleMatin || !!dayAvail.disponibleApresMidi || !!dayAvail.disponibleCoucher;
  const dayOnCall = !!dayAvail.disponibleJourAppel || !!dayAvail.disponibleLeverAppel || !!dayAvail.disponibleMatinAppel || !!dayAvail.disponibleApresMidiAppel || !!dayAvail.disponibleCoucherAppel;

  if (!dayAvailable && !dayOnCall) return { available: false, onCall: false, dayUnavailable: true };

  const key = slotToKey[slot] || '';
  const availKey = `disponible${key}`;
  const callKey = `disponible${key}Appel`;

  const available = !!dayAvail[availKey];
  const onCall = !!dayAvail[callKey];

  return { available, onCall, dayUnavailable: false };
};

const isBookingEditable = computed(() => {
  return checkBookingEditable(props.booking);
});

const getTimeSlotsLabel = computed(() => {
  if (!creneauDebutInternal.value) return 'Aucun créneau';
  const startHour = timeSlotHours.start[creneauDebutInternal.value];
  if (reservationType.value === 'single') {
    const endHour = creneauFinInternal.value ? timeSlotHours.end[creneauFinInternal.value] : '';
    const startLabel = timeSlotLabels[creneauDebutInternal.value];
    const endLabel = creneauFinInternal.value ? timeSlotLabels[creneauFinInternal.value] : '';

    if (startLabel === 'Matinée' && endLabel === 'Après-midi') {
      return `Journée ${startHour}${endHour ? ' à ' + endHour : ''}`;
    }
    return `${startHour}${endHour ? ' à ' + endHour : ''}`;
  } else {
    let label = `Début: ${timeSlotLabels[creneauDebutInternal.value]} (${startHour})`;
    if (creneauFinInternal.value) {
      const endHour = timeSlotHours.end[creneauFinInternal.value];
      label += ` — Fin: ${timeSlotLabels[creneauFinInternal.value]} (${endHour})`;
    }
    return label;
  }
});

const getAnnulationLabel = computed(() => {
  return annulationLabels[selectedAnnulation.value] || 'Non annulable';
});

const maxPassengers = computed(() => {
  if (props.boat && typeof props.boat.nombreDePersonnesAutorisees === 'number') return props.boat.nombreDePersonnesAutorisees;
  if (props.boat && typeof props.boat.nombreDePersonnesAutorisees === 'string') {
    const parsed = parseInt(props.boat.nombreDePersonnesAutorisees, 10);
    if (!isNaN(parsed)) return parsed;
  }
  if (props.boat && typeof props.boat.maxPersonnes === 'number') return props.boat.maxPersonnes;
  if (props.boat && typeof props.boat.maxPersonnes === 'string') {
    const parsed = parseInt(props.boat.maxPersonnes, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 12;
});

const isFormValid = computed(() => {
  const validDateDebut = !!bookingDate.value;
  const validCreneauDebut = !!creneauDebutInternal.value;
  const validPassengerCount = passengerCount.value > 0 && passengerCount.value <= maxPassengers.value;
  const validAnnulation = !!selectedAnnulation.value;

  let validMultiDay = true;
  let validSingleDay = true;

  if (reservationType.value === 'multi') {
    validMultiDay = !!bookingDate.value && !!endDate.value && !!creneauFinInternal.value;
    if (validMultiDay) {
      const startDate = new Date(bookingDate.value);
      const endDateObj = new Date(endDate.value);
      validMultiDay = endDateObj > startDate;
    } else {
      validSingleDay = !!creneauFinInternal.value && isTimeSlotSequenceValid.value;
    }
  }

  return validDateDebut && validCreneauDebut && validPassengerCount && validAnnulation && validMultiDay && validSingleDay;
});

const isMultiDayDateError = computed(() => {
  if (reservationType.value !== 'multi' || !bookingDate.value || !endDate.value) return false;

  const d1 = new Date(bookingDate.value).setHours(0,0,0,0);
  const d2 = new Date(endDate.value).setHours(0,0,0,0);

  return d1 === d2;
});
const passengerExceedsMaximum = computed(() => {
  return passengerCount.value > maxPassengers.value;
});

const hasSkipper = computed(() => {
  return Object.keys(selectedArticlesMap.value).some(code => {
    const art = getArticleByCodeLocal(code);
    return art && art.categorieNom === 'SERVICES' && art.sousCategorieNom === 'Skippers ';
  });
});

const isLicenseValid = computed(() => {
  if (!needsBoatLicenseButUserDoesntHaveOne.value) return true;

  if (guestLicenseChoice.value === 'no') return true;
  if (guestLicenseChoice.value === 'yes') return true;

  return false;
});

const needsBoatLicenseButUserDoesntHaveOne = computed(() => {
  if (isOwnerComputed.value) return false;

  if (!authStore.isLoggedIn || !authStore.user) return false;
  if (!props.boat?.permisObligatoire) return false;
  const user = authStore.user;
  const hasNormalizedPermit = user.possedePermisCotier === true || user.possedePermisFluvial === true || user.possedePermisHauturier === true;
  const hasLegacyPermit = user.permis === 'oui' || (Array.isArray(user.permisNautiques) && user.permisNautiques.length > 0);
  const userHasLicense = hasNormalizedPermit || hasLegacyPermit;
  return props.boat.permisObligatoire === true && !userHasLicense && !hasSkipper.value;
});

const summaryDates = computed(() => {
  if (!bookingDate.value) return 'Non spécifié';
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const toDate = (d) => (d instanceof Date ? d : new Date(d));
  const startStr = toDate(bookingDate.value).toLocaleDateString('fr-FR', options);
  if (endDate.value) {
    const endStr = toDate(endDate.value).toLocaleDateString('fr-FR', options);
    return `Du ${startStr} au ${endStr}`;
  }
  return `Le ${startStr}`;
});

const addedArticlesList = computed(() => {
  const list = [];
  Object.entries(selectedArticlesMap.value).forEach(([code, quantite]) => {
    const alreadyPaid = alreadyPaidArticlesMap.value[code] || 0;
    const addedQty = quantite - alreadyPaid;
    if (addedQty > 0) {
      list.push({
        code,
        qty: addedQty,
        article: getArticleByCodeLocal(code)
      });
    }
  });
  return list;
});

const newArticlesTotals = computed(() => {
  let location = 0;
  let vendus = 0;

  addedArticlesList.value.forEach(item => {
    const isLocation = item.article?.venteOuLocation?.toLowerCase() === 'location';
    const prixCents = (item.article?.prixTtc || 0) * item.qty;

    if (isLocation) {
      location += prixCents;
    } else {
      vendus += prixCents;
    }
  });

  return { location, vendus, total: location + vendus };
});

const amountToPay = computed(() => {
  const baseTotal = props.editArticlesOnly
      ? newArticlesTotals.value.total
      : (apiBookingPrice.value.montantTtcTotalReservation || 0);

  const finalTotal = baseTotal - discountAmount.value;
  return finalTotal > 0 ? finalTotal : 0;
});

watch(() => props.booking, (newBooking) => {
  if (newBooking && Object.keys(newBooking).length > 0) {
    formData.reservationId = newBooking.code;

    // --- 1. RECONSTITUTION DES OPTIONS ---
    if (newBooking.options && Array.isArray(newBooking.options)) {
      const loadedMap = {};
      newBooking.options.forEach(opt => {
        const code = opt.optionId || opt.code;
        if (code) {
          loadedMap[code] = (loadedMap[code] || 0) + 1;
        }
      });
      selectedArticlesMap.value = { ...loadedMap };
      alreadyPaidArticlesMap.value = { ...loadedMap };
      sessionSavedArticlesMap.value = { ...loadedMap };
    } else {
      selectedArticlesMap.value = {};
      alreadyPaidArticlesMap.value = {};
      sessionSavedArticlesMap.value = {};
    }

    // --- 2. GESTION INFAILLIBLE DES DATES ET DES CRÉNEAUX ---
    if (newBooking.dateDebut) {
      const start = new Date(newBooking.dateDebut);
      bookingDate.value = start;

      // On lit directement l'heure de début pour déduire le créneau exact
      const startHour = start.getHours();
      if (startHour < 8) {
        creneauDebutInternal.value = 'morning';            // Autour de 5h
      } else if (startHour < 13) {
        creneauDebutInternal.value = 'morning-half';       // Autour de 9h
      } else if (startHour < 18) {
        creneauDebutInternal.value = 'afternoon';          // Autour de 14h
      } else {
        creneauDebutInternal.value = 'sunset';             // Autour de 19h
      }

      creneauDebut.value = TIME_SLOT_MAP[creneauDebutInternal.value] || '';

      if (newBooking.dateFin) {
        const end = new Date(newBooking.dateFin);
        const isSameDay = start.toDateString() === end.toDateString();

        if (!isSameDay) {
          reservationType.value = 'multi';
          endDate.value = end;
        } else {
          reservationType.value = 'single';
          endDate.value = '';
        }

        // On lit directement l'heure de fin pour déduire le créneau exact
        const endHour = end.getHours();
        if (endHour <= 9) {
          creneauFinInternal.value = 'morning';             // Autour de 8h
        } else if (endHour <= 14) {
          creneauFinInternal.value = 'morning-half';        // Autour de 13h
        } else if (endHour <= 19) {
          creneauFinInternal.value = 'afternoon';           // Autour de 18h
        } else {
          creneauFinInternal.value = 'sunset';              // Autour de 22h
        }

        creneauFin.value = TIME_SLOT_MAP[creneauFinInternal.value] || '';

      } else {
        reservationType.value = 'single';
        endDate.value = '';
      }
    }

    // --- 3. AUTRES INFORMATIONS ---
    passengerCount.value = newBooking.nombrePersonnes || 1;
    selectedAnnulation.value = newBooking.conditionAnnulation || '2UTS';
    message.value = newBooking.message || '';
  }
}, { immediate: true, deep: true });

watch(bookingDate, async () => {
  if (!bookingDate.value) return;
  await fetchAvailability();
  triggerSimulation();
});

watch([creneauDebutInternal, endDate, creneauFinInternal, passengerCount, selectedAnnulation, apporteurCode, reservationType], async () => {
  triggerSimulation();
}, {deep: true});

let articleSimulationTimeout = null;

watch(selectedArticlesMap, () => {
  triggerSimulation();
}, {deep: true});

watch(dates, (newDates) => {
  if (!newDates || newDates.length !== 2 || !bookingDate.value || !endDate.value) return;
  updateDateRange(newDates);
  fetchAvailability();
}, {deep: true});

watch(reservationType, async () => {
  if (reservationType.value === 'single') {
    endDate.value = '';
    creneauFinInternal.value = '';
    creneauFin.value = '';
    creneauDebutInternal.value = '';
    creneauDebut.value = '';
  }
  await fetchAvailability();
  triggerSimulation();
});

watch(passengerCount, (newVal) => { formData.nombrePersonnes = newVal; });
watch(creneauDebut, (newVal) => { formData.creneauDebut = newVal; });
watch(creneauFin, (newVal) => { formData.creneauFin = newVal; });
watch(selectedAnnulation, (newVal) => { formData.conditionAnnulation = newVal; });
watch(apporteurCode, (newVal) => { formData.apporteurAffaire = newVal; });
watch(message, (newVal) => { formData.message = newVal; });
watch(() => props.boat, (newVal) => { if (newVal?.id) { formData.bateauId = newVal.id; } }, {immediate: true});

</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/boat-detail/booking-modal';
</style>