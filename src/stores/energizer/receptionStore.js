import { defineStore } from 'pinia'
import {
  fetchInfoAssure,
  fetchInfoEmployeur,
  fetchTeleImportation,
  listDossiers,
  saveDossier,
} from 'src/api/energizer/receptionApi.js'

export const useReceptionStore = defineStore('energizer-reception', {
  state: () => ({
    dossiers: [],
    loading: false,
    saving: false,
  }),

  actions: {
    async loadDossiers() {
      this.loading = true
      try {
        this.dossiers = await listDossiers()
      } finally {
        this.loading = false
      }
    },

    async lookupAssure(matricule, codePres, libelle) {
      return fetchInfoAssure(matricule, codePres, libelle)
    },

    async lookupEmployeur(matEmployeur) {
      return fetchInfoEmployeur(matEmployeur)
    },

    async runTeleImportation(params) {
      return fetchTeleImportation(params)
    },

    async saveDossier(record) {
      this.saving = true
      try {
        const entry = await saveDossier(record)
        await this.loadDossiers()
        return entry
      } finally {
        this.saving = false
      }
    },
  },
})
