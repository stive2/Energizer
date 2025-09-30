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
      {
        path: 'liquidationPF/liquidationPF',
        name: 'liquidation-pf-home',
        component: () => import('pages/liquidations/liquidationPF/liquidationPF.vue'),
      },
      {
        path: 'liquidationPF/allocationsFamiliales',
        name: 'liquidation-pf-alloc-fam',
        component: () => import('pages/liquidations/liquidationPF/allocationsFamiliales.vue'),
      },
      {
        path: 'liquidationPF/aperiodique',
        name: 'liquidation-pf-aperiodique',
        component: () => import('pages/liquidations/liquidationPF/aperiodique.vue'),
      },
      {
        path: 'liquidationPF/saisieReprises',
        name: 'liquidation-pf-saisie-reprises',
        component: () => import('pages/liquidations/liquidationPF/saisieReprises.vue'),
      },
      {
        path: 'liquidationPF/periodeActive',
        name: 'liquidation-pf-periode-active',
        component: () => import('pages/liquidations/liquidationPF/periodeActive.vue'),
      },
      {
        path: 'liquidationPF/pieceMaintienDroit',
        name: 'liquidation-pf-piece-maintien-droit',
        component: () => import('pages/liquidations/liquidationPF/pieceMaintienDroit.vue'),
      },
      {
        path: 'liquidationPF/statistiques',
        name: 'liquidation-pf-statistiques',
        component: () => import('pages/liquidations/liquidationPF/statistiques.vue'),
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

  // Configuration de routing corrigée
  {
    path: '/rp',
    component: () => import('layouts/RPLayout.vue'),
    children: [
      {
        path: 'saisie-dossier', // Au lieu de '/saisie-dossier'
        name: 'saisie-dossier',
        component: () => import('pages/rp/saisieDossier.vue'),
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
