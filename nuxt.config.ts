// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-04',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  future: {
    compatibilityVersion: 4
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3000/admin'
    }
  }
})