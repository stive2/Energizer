const routes = [
  /* Portail multi-modules (sans authentification) */
  {
    path: '/',
    component: () => import('src/modules/shared/layouts/PortalLayout.vue'),
    children: [
      {
        path: '',
        name: 'module-portal',
        component: () => import('src/modules/shared/pages/portal/ModulePortalPage.vue'),
      },
      /* Logins modules : QPage doit être sous QLayout (PortalLayout) */
      {
        path: 'energizer/login',
        name: 'energizer-login',
        component: () => import('src/modules/energizer/pages/EnergizerLoginPage.vue'),
      },
      {
        path: 'assure/login',
        name: 'assure-login',
        component: () => import('src/modules/assure/pages/AssureLoginPage.vue'),
      },
    ],
  },

  /* 1 — Energizer (agent CNPS) */
  {
    path: '/energizer',
    component: () => import('src/modules/shared/layouts/MainLayout.vue'),
    meta: { authProfile: 'internal' },
    children: [
      {
        path: '',
        name: 'energizer-home',
        component: () => import('src/modules/energizer/pages/EnergizerHomePage.vue'),
      },
      {
        path: 'reception/nouveau-dossier',
        name: 'energizer-reception-nouveau-dossier',
        component: () => import('src/modules/energizer/pages/NouveauDossierReceptionPage.vue'),
      },
    ],
  },

  /* 3 — Assuré */
  {
    path: '/assure',
    component: () => import('src/modules/shared/layouts/AssureLayout.vue'),
    meta: { authProfile: 'external' },
    children: [
      {
        path: '',
        name: 'assure-home',
        component: () => import('src/modules/assure/pages/AssureHomePage.vue'),
      },
      {
        path: 'dashboard',
        name: 'assure-dashboard',
        component: () => import('src/modules/shared/pages/dashboard.vue'),
      },
      {
        path: 'depot-dossier',
        name: 'depot-dossier',
        component: () => import('src/modules/assure/pages/prestations/dossiers.vue'),
      },
      {
        path: 'prestations-familiales',
        name: 'assure-prestations-familiales',
        component: () => import('src/modules/assure/pages/Prestations_Familiales.vue'),
      },
      {
        path: 'prestation-pension',
        name: 'assure-prestation-pension',
        component: () => import('src/modules/assure/pages/Prestation_pension.vue'),
      },
      {
        path: 'prestation-prise-at-mp',
        name: 'assure-prestation-prise-at-mp',
        component: () => import('src/modules/assure/pages/Prestation_prise_AT_MP.vue'),
      },
    ],
  },

  /* Ancienne URL espace assuré → module Assuré */
  {
    path: '/user',
    redirect: '/assure',
  },

  /* 4 — Déclarations / immatriculations (sans authentification) */
  {
    path: '/declarations',
    component: () => import('src/modules/shared/layouts/DeclarationsLayout.vue'),
    children: [
      {
        path: '',
        name: 'declarations-home',
        component: () => import('src/modules/immatriculations/pages/DeclarationsHomePage.vue'),
      },
    ],
  },

  {
    path: '/liquidations',
    component: () => import('src/modules/shared/layouts/MainLayout.vue'),
    children: [
      {
        path: 'liquidationRP/gestionLiquidationRP',
        name: 'gestion-liquidation-rp',
        component: () => import('src/modules/energizer/pages/liquidations/liquidationRP/gestionLiquidationRP.vue'),
      },
      {
        path: 'liquidationRP/saisie-dossier-rp',
        name: 'prestation-rp-saisie-dossier',
        component: () => import('src/modules/energizer/pages/liquidations/liquidationRP/saisieDossierRP.vue'),
      },
      {
        path: 'liquidationRP/saisie-elements-rp',
        name: 'prestation-rp-saisie-elements',
        component: () => import('src/modules/energizer/pages/liquidations/liquidationRP/saisieElementsRP.vue'),
      },
      {
        path: 'liquidationPF/liquidationPF',
        redirect: { name: 'prestation-pf-saisie-elements' },
      },
      {
        path: 'liquidationPF/saisie-elements',
        name: 'prestation-pf-saisie-elements',
        component: () => import('src/modules/energizer/pages/liquidations/liquidationPF/saisieElementsLiquidation.vue'),
      },
      {
        path: 'liquidationPF/allocationsFamiliales',
        redirect: { name: 'prestation-pf-saisie-elements', query: { panel: 'allocations' } },
      },
      {
        path: 'liquidationPF/aperiodique',
        redirect: { name: 'prestation-pf-saisie-elements', query: { panel: 'aperiodique' } },
      },
      {
        path: 'liquidationPF/saisieReprises',
        redirect: { name: 'prestation-pf-saisie-elements', query: { panel: 'reprises' } },
      },
      {
        path: 'liquidationPF/periodeActive',
        redirect: { name: 'prestation-pf-saisie-elements', query: { panel: 'periodeActivite' } },
      },
      {
        path: 'liquidationPF/pieceMaintienDroit',
        redirect: { name: 'prestation-pf-saisie-elements', query: { panel: 'pieceMaintien' } },
      },
      {
        path: 'liquidationPF/statistiques',
        redirect: { name: 'prestation-pf-saisie-elements', query: { panel: 'statistiques' } },
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('src/modules/shared/pages/ErrorNotFound.vue'),
  },
]

export default routes
