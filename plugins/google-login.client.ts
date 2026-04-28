import vue3GoogleLogin from 'vue3-google-login';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(vue3GoogleLogin, {
        clientId: '53297662740-cue8nsv9p2e3c8jor79r4uclc4it5mci.apps.googleusercontent.com'
    });
});