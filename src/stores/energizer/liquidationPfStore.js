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

    async submitLiquidation(form) {
      this.submitting = true
      try {
        return await savePfLiquidation(form)
      } finally {
        this.submitting = false
      }
    },

    async submitAllocationFamiliale(form) {
      this.submitting = true
      try {
        return await savePfAllocationFamiliale(form)
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

    async submitReprise(form) {
      this.submitting = true
      try {
        return await saveReprise(form)
      } finally {
        this.submitting = false
      }
    },

    async removeReprise(form) {
      return deleteReprise(form)
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

    async submitPeriode(form) {
      this.submitting = true
      try {
        return await savePeriodeActivite(form)
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

    async submitPmd(form) {
      this.submitting = true
      try {
        return await savePieceMaintienDroit(form)
      } finally {
        this.submitting = false
      }
    },

    async removePmd(form) {
      return deletePieceMaintienDroit(form)
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
