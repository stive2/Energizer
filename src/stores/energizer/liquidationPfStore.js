import { defineStore } from 'pinia'
import {
  searchPfDossiers,
  savePfLiquidation,
  savePfAllocationFamiliale,
  listReprises,
  saveReprise,
  deleteReprise,
  listPeriodesActivite,
  savePeriodeActivite,
  listPiecesMaintienDroit,
  savePieceMaintienDroit,
  deletePieceMaintienDroit,
  searchStatistiquesSituations,
} from 'src/api/energizer/liquidationPfApi.js'

export const useLiquidationPfStore = defineStore('energizer-liquidation-pf', {
  state: () => ({
    dossiers: [],
    reprises: [],
    periodes: [],
    pmdList: [],
    statistiques: [],
    loading: false,
    submitting: false,
  }),

  actions: {
    async searchDossiers(params) {
      this.loading = true
      try {
        this.dossiers = await searchPfDossiers(params)
        return this.dossiers
      } finally {
        this.loading = false
      }
    },

    async submitLiquidation(payload) {
      this.submitting = true
      try {
        return await savePfLiquidation(payload)
      } finally {
        this.submitting = false
      }
    },

    async submitAllocationFamiliale(payload) {
      this.submitting = true
      try {
        return await savePfAllocationFamiliale(payload)
      } finally {
        this.submitting = false
      }
    },

    async loadReprises(params) {
      this.loading = true
      try {
        this.reprises = await listReprises(params)
        return this.reprises
      } finally {
        this.loading = false
      }
    },

    async submitReprise(payload) {
      this.submitting = true
      try {
        return await saveReprise(payload)
      } finally {
        this.submitting = false
      }
    },

    async removeReprise(id) {
      return deleteReprise(id)
    },

    async loadPeriodes(params) {
      this.loading = true
      try {
        this.periodes = await listPeriodesActivite(params)
        return this.periodes
      } finally {
        this.loading = false
      }
    },

    async submitPeriode(payload) {
      this.submitting = true
      try {
        return await savePeriodeActivite(payload)
      } finally {
        this.submitting = false
      }
    },

    async loadPmd(params) {
      this.loading = true
      try {
        this.pmdList = await listPiecesMaintienDroit(params)
        return this.pmdList
      } finally {
        this.loading = false
      }
    },

    async submitPmd(payload) {
      this.submitting = true
      try {
        return await savePieceMaintienDroit(payload)
      } finally {
        this.submitting = false
      }
    },

    async removePmd(id) {
      return deletePieceMaintienDroit(id)
    },

    async searchStatistiques(filters) {
      this.loading = true
      try {
        this.statistiques = await searchStatistiquesSituations(filters)
        return this.statistiques
      } finally {
        this.loading = false
      }
    },
  },
})
