/** Menu de démonstration — valeur par défaut de AppSidebarNav */
export const APP_SIDEBAR_NAV_DEFAULT_ITEMS = [
  {
    type: 'section',
    label: 'Principal',
  },
  {
    type: 'item',
    label: 'Tableau de bord',
    icon: 'dashboard',
    to: '/',
    exact: true,
    badge: null,
  },
  {
    type: 'item',
    label: 'Notifications',
    icon: 'notifications',
    to: '/notifications',
    badge: '5',
  },
  {
    type: 'separator',
  },
  {
    type: 'section',
    label: 'Gestion',
  },
  {
    type: 'group',
    label: 'Assurés',
    icon: 'groups',
    defaultOpened: true,
    children: [
      { type: 'item', label: 'Liste des assurés', icon: 'list_alt', to: '/assures' },
      { type: 'item', label: 'Immatriculation', icon: 'badge', to: '/assures/immatriculation' },
      { type: 'item', label: 'Mise à jour', icon: 'edit', to: '/assures/maj' },
      {
        type: 'group',
        label: 'Ayants droit',
        icon: 'family_restroom',
        children: [
          { type: 'item', label: 'Conjoint(e)', icon: 'favorite', to: '/assures/ayants/conjoint' },
          { type: 'item', label: 'Enfants', icon: 'child_care', to: '/assures/ayants/enfants' },
        ],
      },
    ],
  },
  {
    type: 'group',
    label: 'Cotisations',
    icon: 'account_balance_wallet',
    children: [
      { type: 'item', label: 'Déclarations', icon: 'description', to: '/cotisations/declarations' },
      { type: 'item', label: 'Paiements', icon: 'payments', to: '/cotisations/paiements', badge: '3' },
      { type: 'item', label: 'Arriérés', icon: 'warning', to: '/cotisations/arrieres' },
    ],
  },
  {
    type: 'group',
    label: 'Prestations',
    icon: 'local_hospital',
    children: [
      { type: 'item', label: 'Soins de santé', icon: 'healing', to: '/prestations/sante' },
      { type: 'item', label: 'Retraite', icon: 'elderly', to: '/prestations/retraite' },
      { type: 'item', label: 'Accidents du travail', icon: 'personal_injury', to: '/prestations/accidents' },
      { type: 'item', label: 'Allocations familiales', icon: 'child_friendly', to: '/prestations/allocations' },
    ],
  },
  {
    type: 'separator',
  },
  {
    type: 'section',
    label: 'Administration',
  },
  {
    type: 'group',
    label: 'Rapports & Stats',
    icon: 'bar_chart',
    children: [
      { type: 'item', label: 'Statistiques', icon: 'analytics', to: '/rapports/stats' },
      { type: 'item', label: 'Exports', icon: 'download', to: '/rapports/exports' },
    ],
  },
  {
    type: 'item',
    label: 'Utilisateurs',
    icon: 'manage_accounts',
    to: '/admin/users',
  },
  {
    type: 'item',
    label: 'Paramètres',
    icon: 'tune',
    to: '/admin/settings',
  },
]
