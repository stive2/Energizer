import { defineStore } from 'pinia'
import {
  fetchRpEmployeur,
  searchRpDossiers,
  searchRpCertificatDossiers,
  saveRpDeclaration,
  fetchRpReferentials,
  saveCertificatInit,
  saveCertificatDeces,
  saveNoteFrais,
  saveTiersBeneficiaire,
  fetchNotesFraisDossiers,
  fetchNotesFraisObjets,
  fetchTiersBeneficiaires,
} from 'src/modules/energizer/api/liquidationRpApi.js'

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

    async loadRpCertificatDossiers() {
      this.loading = true
      try {
        this.dossiers = await searchRpCertificatDossiers()
        return this.dossiers
      } finally {
        this.loading = false
      }
    },

    async loadRpReferentials() {
      return fetchRpReferentials()
    },

    async fetchEmployeur(matricule) {
      return fetchRpEmployeur(matricule)
    },

    async submitDeclaration(form) {
      this.submitting = true
      try {
        return await saveRpDeclaration(form)
      } finally {
        this.submitting = false
      }
    },

    async submitCertificatInit(form) {
      this.submitting = true
      try {
        return await saveCertificatInit(form)
      } finally {
        this.submitting = false
      }
    },

    async submitCertificatDeces(form) {
      this.submitting = true
      try {
        return await saveCertificatDeces(form)
      } finally {
        this.submitting = false
      }
    },

    async submitNoteFrais(form) {
      this.submitting = true
      try {
        return await saveNoteFrais(form)
      } finally {
        this.submitting = false
      }
    },

    async submitTiersBeneficiaire(form) {
      this.submitting = true
      try {
        return await saveTiersBeneficiaire(form)
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
