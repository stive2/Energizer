/**
 * Chemins API CNPS — module Energizer
 * Alignés sur les anciennes JSP / actions métier.
 */
export const ENERGIZER_API = {
  rp: {
    dossiers: '/energizer/rp/dossiers',
    declaration: '/energizer/rp/declaration',
    employeur: '/energizer/rp/employeur',
    certificatInit: '/energizer/rp/certificats/init',
    certificatDeces: '/energizer/rp/certificats/deces',
    notesFrais: '/energizer/rp/notes-frais',
    notesFraisDossiers: '/energizer/rp/notes-frais/dossiers',
    notesFraisObjets: '/energizer/rp/notes-frais/objets',
    tiersBeneficiaires: '/energizer/rp/tiers-beneficiaires',
  },
  reception: {
    objets: '/energizer/reception/nouveau-dossier/objets',
    naturePrestations: '/energizer/reception/nouveau-dossier/nature-prestations',
    typeCircuits: '/energizer/reception/nouveau-dossier/type-circuits',
    infoAssure: '/energizer/reception/nouveau-dossier/info-assure',
    infoEmployeur: '/energizer/reception/nouveau-dossier/info-employeur',
    teleimportation: '/energizer/reception/nouveau-dossier/teleimportation',
    submit: '/energizer/reception/nouveau-dossier',
    dossiers: '/energizer/reception/nouveau-dossier/dossiers',
  },
  pf: {
    dossiers: '/energizer/pf/dossiers',
    liquidation: '/energizer/pf/liquidation',
    allocationsFamiliales: '/energizer/pf/allocations-familiales',
    reprises: '/energizer/pf/reprises',
    reprise: (id) => `/energizer/pf/reprises/${encodeURIComponent(id)}`,
    periodesActivite: '/energizer/pf/periodes-activite',
    piecesMaintienDroit: '/energizer/pf/pieces-maintien-droit',
    pieceMaintienDroit: (id) => `/energizer/pf/pieces-maintien-droit/${encodeURIComponent(id)}`,
    statistiques: '/energizer/pf/statistiques/situations',
  },
}
