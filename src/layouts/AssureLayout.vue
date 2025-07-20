<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <!-- Menu burger pour mobile (seulement si authentifié) -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <div v-if="$q.screen.gt.xs" class="">
          <q-img src="icons/logo.jpg" style="width: 150px" class="q-ml-md logo" />
        </div>

        <q-toolbar-title class="text-bold text-center">
          <span class="q-mx-md">{{ $t('title') }}</span>
        </q-toolbar-title>

        <!-- Bouton de déconnexion (si authentifié) -->
        <q-btn flat dense round icon="logout" to="/" class="q-mr-sm">
          <q-tooltip>{{ $t('logout') }}</q-tooltip>
        </q-btn>

        <q-btn
          dense
          flat
          icon="language"
          :label="currentLangLabel"
          no-caps
          color="primary"
          style="background-color: white"
          rounded
        >
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="changeLang('fr')">
                <q-item-section avatar>
                  <img src="flags/fr.svg" alt="FR" class="flag" />
                </q-item-section>
                <q-item-section>Français</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="changeLang('en')">
                <q-item-section avatar>
                  <img src="flags/en.svg" alt="EN" class="flag" />
                </q-item-section>
                <q-item-section>English</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Sidebar (Drawer) - Affiché seulement si authentifié -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="280"
      :breakpoint="1024"
      bordered
      class="sidebar-drawer"
    >
      <q-scroll-area class="fit">
        <!-- En-tête du drawer -->
        <div class="drawer-header bg-primary text-white q-pa-md">
          <div class="row items-center no-wrap">
            <q-avatar size="50px" class="q-mr-md">
              <q-icon name="account_circle" size="50px" />
            </q-avatar>
          </div>
        </div>

        <!-- Menu de navigation -->
        <q-list class="q-pa-md">
          <!-- Tableau de bord -->
          <q-item
            clickable
            v-ripple
            :to="{ name: '/dashboard' }"
            exact-active-class="sidebar-item-active"
            class="sidebar-item q-mb-sm"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ $t('Accueil') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            :to="{ name: 'depot-dossier' }"
            exact-active-class="sidebar-item-active"
            class="sidebar-item q-mb-sm"
          >
            <q-item-section avatar>
              <q-icon name="upload_file" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ $t('Dépot dossiers prestations') }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container :class="{ 'page-container-with-drawer': isAuthenticated }">
      <router-view />
    </q-page-container>

    <q-footer reveal elevated>
      <q-toolbar>
        <q-toolbar-title class="text-bold text-center" style="font-size: 15px">
          Copyright © 2021-{{ new Date().getFullYear() }} {{ $t('footer.rights') }} <br />
          "{{ $t('footer.message') }}"
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const { locale, t } = useI18n()
const $q = useQuasar()
const router = useRouter()

// État de la sidebar
const leftDrawerOpen = ref(false)

// État d'authentification (à adapter selon votre système d'auth)
const isAuthenticated = ref(false)
const userInfo = ref({
  nom: 'Utilisateur Test',
  email: 'user@example.com',
  numeroAssure: '321-1256447-9',
})

// Vérification de l'authentification au montage du composant
onMounted(() => {
  // Simuler la vérification de l'authentification
  // Remplacez par votre logique d'authentification réelle
  const token = localStorage.getItem('auth_token')
  const user = localStorage.getItem('user_info')

  if (token && user) {
    isAuthenticated.value = true
    userInfo.value = JSON.parse(user)
  }

  // Récupérer la langue sauvegardée
  const savedLang = localStorage.getItem('lang')
  if (savedLang) {
    locale.value = savedLang
  }
})

const changeLang = (lang) => {
  locale.value = lang
  localStorage.setItem('lang', lang)
}

const currentLangLabel = computed(() => (locale.value === 'fr' ? 'Français 🇫🇷' : 'English 🇬🇧'))

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const logout = () => {
  $q.dialog({
    title: t('logout.confirm.title', 'Confirmation'),
    message: t('logout.confirm.message', 'Êtes-vous sûr de vouloir vous déconnecter ?'),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // Logique de déconnexion
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
    isAuthenticated.value = false
    leftDrawerOpen.value = false

    $q.notify({
      type: 'positive',
      message: t('logout.success', 'Déconnexion réussie'),
      position: 'top',
    })

    // Redirection vers la page de connexion
    router.push('/')
  })
}

// Exposer les méthodes pour les tests
defineExpose({
  toggleLeftDrawer,
  logout,
  isAuthenticated,
  userInfo,
})
</script>

<style scoped>
.lang-switch {
  top: 1rem;
  right: 1rem;
}

.flag {
  width: 20px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
}

.q-toolbar-title {
  font-weight: bold;
  text-align: center;
}

/* Styles pour la sidebar */
.sidebar-drawer {
  background-color: #fafafa;
}

.drawer-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.sidebar-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background-color: rgba(25, 118, 210, 0.04);
  transform: translateX(4px);
}

.sidebar-item-active {
  background-color: rgba(25, 118, 210, 0.1);
  border-left: 4px solid var(--q-primary);
}

.sidebar-item-active .q-item__section--avatar .q-icon {
  color: var(--q-primary) !important;
}

.drawer-footer {
  border-top: 1px solid #e0e0e0;
  background-color: white;
}

/* Responsive adjustments */
@media (max-width: 1023px) {
  .sidebar-item:hover {
    transform: none;
  }
}
</style>
