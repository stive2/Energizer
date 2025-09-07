const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  // Routes pour la gestion des contrôleurs
  {
    path: '/gestion-controleurs',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'mise-demeure',
        name: 'gestion-mise-demeure',
        component: () => import('pages/gestionControleurs/gestionMiseDemeure.vue'),
      },
      {
        path: 'resultat-controle',
        name: 'gestion-resultat-controle',
        component: () => import('pages/gestionControleurs/gestionResultatControle.vue'),
      },
    ],
  },

  // Routes pour les liquidations
  {
    path: '/liquidations',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'liquidationRP/gestionLiquidationRP',
        name: 'gestion-liquidation-rp',
        component: () => import('pages/liquidations/liquidationRP/gestionLiquidationRP.vue'),
      },
    ],
  },

  // Routes pour la tenue des comptes
  {
    path: '/tenu-comptes',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'gestionTenuCmpt',
        name: 'gestion-tenu-comptes',
        component: () => import('pages/gestionTenuCmpt.vue'),
      },
    ],
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
