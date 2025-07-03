const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  // Configuration de routing corrigée
  {
    path: '/user',
    component: () => import('layouts/AssureLayout.vue'),
    children: [
      // CORRECTION: Utiliser des chemins relatifs (sans /) dans les children
      {
        path: 'dashboard', // Au lieu de '/dashboard'
        name: 'dashboard',
        component: () => import('pages/dashboard.vue'), // Correction: bashboard -> dashboard
      },
      {
        path: 'depot-dossier', // Au lieu de '/depot-dossier'
        name: 'depot-dossier',
        component: () => import('pages/prestations/dossiers.vue'),
      },
      // Route par défaut pour rediriger vers dashboard
      {
        path: '',
        redirect: 'dashboard',
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
