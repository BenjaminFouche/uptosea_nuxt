<template>
  <div  class="boat-fiche">
    <hr>
    <h3 class="fiche-title">Fiche du bateau</h3>
    <button class="download-link" @click="downloadPdf">
      Télécharger la fiche du bateau (pdf)
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps(['boat']);
const isDownloading = ref(false);

async function downloadPdf() {
  try {
    // Vérifier si lienDetails existe
    if (!props.boat?.lienDetails || !props.boat.lienDetails.length) {
      alert('Aucun fichier PDF disponible pour ce bateau.');
      return;
    }

    const pdfUrl = props.boat.lienDetails[0].slug;

    if (pdfUrl) {
      const response = await fetch(pdfUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Convertir la réponse en blob
      const pdfBlob = await response.blob();

      // Créer une URL pour le blob
      const blobUrl = window.URL.createObjectURL(pdfBlob);

      // Créer un lien temporaire pour télécharger le fichier
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `${props.boat.nom || 'fiche-bateau'}.pdf`;
      downloadLink.style.display = 'none';

      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobUrl);
      }, 200);
    } else {
      alert('Le lien du PDF n\'est pas valide.');
    }

  } catch (error) {
    alert('Impossible de télécharger le fichier PDF. Veuillez réessayer plus tard.');
  }
}
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/boat-detail/boat-fiche';
</style>
