import { defineStore } from 'pinia'
import {
  fetchRpEmployeur,
  searchRpDossiers,
  saveRpDeclaration,
  saveCertificatInit,
  saveCertificatDeces,
  saveNoteFrais,
  fetchNotesFraisDossiers,
  fetchNotesFraisObjets,
  fetchTiersBeneficiaires,
} from 'src/api/energizer/liquidationRpApi.js'

export const useLiquidationRpStore = defineStore('energizer-liquidation-rp', {
  state: () => ({
    dossiers: [],
    notesFraisDossiers: [],
    notesFraisObjets: [],
    tiersBeneficiaires: [],
    loading: false,
    submitting: false,
  }),

  actions: {
    async loadRpDossiers(params) {
      this.loading = true
      try {
        this.dossiers = await searchRpDossiers(params)
        return this.dossiers
      } finally {
        this.loading = false
      }
    },

    async fetchEmployeur(matricule) {
      return fetchRpEmployeur(matricule)
    },

    async submitDeclaration(payload) {
      this.submitting = true
      try {
        return await saveRpDeclaration(payload)
      } finally {
        this.submitting = false
      }
    },

    async submitCertificatInit(payload) {
      this.submitting = true
      try {
        return await saveCertificatInit(payload)
      } finally {
        this.submitting = false
      }
    },

    async submitCertificatDeces(payload) {
      this.submitting = true
      try {
        return await saveCertificatDeces(payload)
      } finally {
        this.submitting = false
      }
    },

    async submitNoteFrais(payload) {
      this.submitting = true
      try {
        return await saveNoteFrais(payload)
      } finally {
        this.submitting = false
      }
    },

    async loadNotesFraisMeta() {
      const [dossiers, objets] = await Promise.all([
        fetchNotesFraisDossiers(),
        fetchNotesFraisObjets(),
      ])
      this.notesFraisDossiers = dossiers
      this.notesFraisObjets = objets
      return { dossiers, objets }
    },

    async loadTiersBeneficiaires(numassu) {
      this.tiersBeneficiaires = await fetchTiersBeneficiaires(numassu)
      return this.tiersBeneficiaires
    },
  },
})
