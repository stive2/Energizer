import { defineStore } from 'pinia'
import {
  fetchEmployeurDepotPf,
  loadAssureDepotPfContexte,
  submitDepotPrestationPf,
} from 'src/modules/assure/api/depotPrestationPfApi.js'
import { DEPOT_PF_TYPE_CODES } from 'src/modules/assure/data/depotPrestationPfTypes.js'
import { normalizeMatriculeEmployeur } from 'src/modules/assure/api/depotPrestationPfUtils.js'
import { PF_PIECE } from 'src/modules/assure/data/depotPrestationPfLegacyFields.js'
import {
  acteNaissanceKey,
  parseNombreEnfantsAllocations,
  parseNombreEnfantsSousControleAccouchement,
  syncAllocationsPieces,
} from 'src/modules/assure/utils/depotPrestationPfAccouchement.js'
import { buildDepotPrestationPfLegacyFormData } from 'src/modules/assure/utils/depotPrestationPfLegacyFormData.js'

/** Champs communs (tele_prestation_pf.js / initInfoField). */
function createCommonForm() {
  return {
    matEmployeur: '',
    RAISON_SOCIALE: '',
    matrInteText: '',
    emailAssuText: '',
    telAssuText: '',
    addrAssuText: '',
    CODE_CENTRECNPSC: null,
    CODE_CENTRECNPS: null,
    typeSubmission: 'definitive',
  }
}

function createExamensPrenatauxForm() {
  return {
    dateExam1Date: '',
    dateExam2: '',
    dateAccoProb: '',
    AP1ChBo: false,
    FM1ChBo: false,
    AP2ChBo: false,
    FM2ChBo: false,
    [PF_PIECE.CERT_AP1]: null,
    [PF_PIECE.FRAIS_AP1]: null,
    [PF_PIECE.CERT_AP2]: null,
    [PF_PIECE.FRAIS_AP2]: null,
  }
}

function createAccouchementForm() {
  return {
    dateAccoEffe: '',
    nombEnfaViab: 1,
    nombEnfaContMedi: null,
    FAChBo: false,
    FMAChBo: false,
    [PF_PIECE.CERT_ACCOUCHEMENT]: null,
  }
}

function createCongesMaterniteForm() {
  return {
    ijcmChBo: true,
    accoPremChBo: false,
    nombJourSupp: 0,
    dateDebuCongEffe: '',
    dateFinCongEffe: '',
    dateDebuNonSala: '',
    dateFinNonSala: '',
    dateReprActi: '',
    nombEnfaViab: 1,
    nombEnfaContMedi: null,
    [PF_PIECE.CERT_ACCOUCHEMENT]: null,
    [PF_PIECE.BULLETIN_PAIE]: null,
    [PF_PIECE.ATTESTATION_CESSATION]: null,
  }
}

function readContexteFromLocalStorage() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem('user_info')
    if (!raw) return null
    const user = JSON.parse(raw)
    return {
      numAssu: user.numeroAssure || user.num_assu || '',
      nom: user.nom || '',
      prenom: user.prenom || '',
      sexe: user.sexe || 'F',
      dateNaissance: user.dateNaissance || user.date_naissance || '',
      EMAIL_PERS: user.email || user.EMAIL_PERS || '',
      TEL_PERS: user.telephone || user.TEL_PERS || user.tel || '',
      Adresse: user.adresse || user.Adresse || '',
      mat_interne: user.mat_interne || user.matriculeInterne || '',
    }
  } catch {
    return null
  }
}

function createAllocationsForm() {
  return {
    dateSignEmpl: '',
    dateEmba: '',
    nbreHeurEmba: '',
    nombEnfaMoin6: 0,
    nombEnfaPlus6: 0,
    nombEnfaReco: 0,
    [PF_PIECE.ATTESTATION_AF]: null,
    [PF_PIECE.ACTE_MARIAGE]: null,
    [PF_PIECE.ORIGINAL_ACTE_MARIAGE]: null,
  }
}

export const useDepotPrestationPfStore = defineStore('assure-depot-prestation-pf', {
  state: () => ({
    contexte: null,
    selectedTypeCode: null,
    /** Données communes validées à l’étape « Continuer » (fusionnées à la soumission). */
    dossierTemporaire: null,
    /** Choix examens prénataux : premier | deuxieme | both */
    examensPrenatauxChoice: null,
    common: createCommonForm(),
    examensPrenataux: createExamensPrenatauxForm(),
    accouchement: createAccouchementForm(),
    congesMaternite: createCongesMaterniteForm(),
    allocations: createAllocationsForm(),
    loadingContexte: false,
    refreshingContexte: false,
    loadingEmployeur: false,
    submitting: false,
    lastSubmitResult: null,
  }),

  getters: {
    numAssu: (state) => state.contexte?.numAssu ?? '',
    assureSexe: (state) => state.contexte?.sexe ?? '',
    isFemale: (state) => state.contexte?.sexe === 'F',
  },

  actions: {
    /** Hydratation immédiate (session) puis rafraîchissement API en arrière-plan. */
    async loadContexte() {
      if (this.contexte) {
        this.applyCoordonneesFromContexte()
        this.refreshContexteRemote()
        return
      }

      const local = readContexteFromLocalStorage()
      if (local) {
        this.contexte = local
        this.applyCoordonneesFromContexte()
        this.refreshContexteRemote()
        return
      }

      this.loadingContexte = true
      try {
        const remote = await loadAssureDepotPfContexte()
        this.contexte = { ...(this.contexte || {}), ...remote }
        this.applyCoordonneesFromContexte()
      } finally {
        this.loadingContexte = false
      }
    },

    async refreshContexteRemote() {
      if (this.refreshingContexte) return
      this.refreshingContexte = true
      try {
        const remote = await loadAssureDepotPfContexte()
        this.contexte = { ...(this.contexte || {}), ...remote }
        this.applyCoordonneesFromContexte()
      } catch {
        /* conserve le contexte local */
      } finally {
        this.refreshingContexte = false
      }
    },

    /** Préremplit email, téléphone et adresse depuis le profil assuré (modifiables ensuite). */
    applyCoordonneesFromContexte() {
      const ctx = this.contexte
      if (!ctx) return

      const email = ctx.emailAssuText || ctx.EMAIL_PERS || ctx.email || ''
      const tel = ctx.telAssuText || ctx.TEL_PERS || ctx.telephone || ctx.tel || ''
      const adresse = ctx.addrAssuText || ctx.Adresse || ctx.adresse || ''
      const matInterne = ctx.matrInteText || ctx.mat_interne || ctx.matriculeInterne || ''

      if (email) this.common.emailAssuText = email
      if (tel) this.common.telAssuText = tel
      if (adresse) this.common.addrAssuText = String(adresse).toUpperCase()
      if (matInterne) this.common.matrInteText = String(matInterne).toUpperCase()
    },

    setSelectedType(code) {
      this.selectedTypeCode = code
      if (code !== DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX) {
        this.examensPrenatauxChoice = null
      }
    },

    /**
     * Enregistre les coordonnées / employeur dans la variable temporaire (étape 2).
     */
    saveCoordonneesTemporaires() {
      this.dossierTemporaire = {
        common: { ...this.common },
        savedAt: Date.now(),
      }
    },

    getCommonForSubmit() {
      return this.dossierTemporaire?.common
        ? { ...this.dossierTemporaire.common, ...this.common }
        : { ...this.common }
    },

    resetWizard() {
      this.dossierTemporaire = null
      this.examensPrenatauxChoice = null
    },

    /**
     * Après un dépôt réussi : réinitialise le formulaire métier courant
     * mais conserve les coordonnées validées (`dossierTemporaire`).
     */
    prepareForAnotherDepotType() {
      this.selectedTypeCode = null
      this.examensPrenatauxChoice = null
      this.resetTypeForms()
      if (this.dossierTemporaire?.common) {
        const saved = { ...this.dossierTemporaire.common }
        saved.CODE_CENTRECNPSC = null
        Object.assign(this.common, saved)
      }
    },

    async fetchEmployeur() {
      const matricule = normalizeMatriculeEmployeur(this.common.matEmployeur)
      if (!matricule) {
        throw new Error('matricule_required')
      }
      this.common.matEmployeur = matricule
      this.loadingEmployeur = true
      try {
        const employer = await fetchEmployeurDepotPf(matricule)
        this.common.RAISON_SOCIALE =
          employer.RAISON_SOCIALE ||
          employer.raisonsociale ||
          employer.NOM_COMMERCIAL ||
          employer.denominationSociale ||
          ''
        return employer
      } finally {
        this.loadingEmployeur = false
      }
    },

    resetTypeForms() {
      this.examensPrenataux = createExamensPrenatauxForm()
      this.accouchement = createAccouchementForm()
      this.congesMaternite = createCongesMaterniteForm()
      this.allocations = createAllocationsForm()
    },

    resetAll() {
      this.common = createCommonForm()
      this.resetTypeForms()
      this.selectedTypeCode = null
      this.lastSubmitResult = null
      this.resetWizard()
      if (this.contexte) {
        this.applyCoordonneesFromContexte()
      }
    },

    validateTypeSpecific(typeCode) {
      const errors = []
      if (typeCode === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX) {
        const f = this.examensPrenataux
        const choice = this.examensPrenatauxChoice || 'both'
        const hasDate = (val) => String(val || '').replace(/\D/g, '').length >= 8
        const premierActif =
          choice !== 'deuxieme' &&
          (hasDate(f.dateExam1Date) || f.AP1ChBo || f.FM1ChBo)
        const deuxiemeActif =
          choice !== 'premier' &&
          (hasDate(f.dateExam2) || hasDate(f.dateAccoProb) || f.AP2ChBo || f.FM2ChBo)
        if (!premierActif && !deuxiemeActif) {
          errors.push('examens_prenataux_aucune_demande')
        }
        if (premierActif && !f.AP1ChBo && !f.FM1ChBo) {
          errors.push('examens_prenataux_premier_checkbox')
        }
        if (deuxiemeActif && !f.AP2ChBo && !f.FM2ChBo) {
          errors.push('examens_prenataux_deuxieme_checkbox')
        }
      }
      if (typeCode === DEPOT_PF_TYPE_CODES.ACCOUCHEMENT) {
        const f = this.accouchement
        if (!f.FAChBo && !f.FMAChBo) {
          errors.push('accouchement_option_requise')
        }
        const raw = f.nombEnfaContMedi
        const n = parseInt(raw, 10)
        if (raw === null || raw === undefined || raw === '' || !Number.isFinite(n) || n <= 0) {
          errors.push('accouchement_nombre_enfants_sous_controle_requis')
        } else if (n > 99) {
          errors.push('accouchement_nombre_enfants_max')
        } else {
          const count = parseNombreEnfantsSousControleAccouchement(n)
          for (let i = 1; i <= count; i += 1) {
            if (!f[acteNaissanceKey(i)]) {
              errors.push(`accouchement_acte_naissance_${i}`)
            }
          }
        }
      }
      if (typeCode === DEPOT_PF_TYPE_CODES.CONGES_MATERNITE) {
        if (!this.isFemale) {
          errors.push('maternite_femme_uniquement')
        }
        const f = this.congesMaternite
        const raw = f.nombEnfaContMedi
        const n = parseInt(raw, 10)
        if (raw === null || raw === undefined || raw === '' || !Number.isFinite(n) || n <= 0) {
          errors.push('accouchement_nombre_enfants_sous_controle_requis')
        } else if (n > 99) {
          errors.push('accouchement_nombre_enfants_max')
        } else {
          const count = parseNombreEnfantsSousControleAccouchement(n)
          for (let i = 1; i <= count; i += 1) {
            if (!f[acteNaissanceKey(i)]) {
              errors.push(`accouchement_acte_naissance_${i}`)
            }
          }
        }
      }
      if (typeCode === DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES) {
        const f = this.allocations
        syncAllocationsPieces(f)
        const m6 = parseNombreEnfantsAllocations(f.nombEnfaMoin6)
        const p6 = parseNombreEnfantsAllocations(f.nombEnfaPlus6)
        const reco = parseNombreEnfantsAllocations(f.nombEnfaReco)
        const sumMp = Math.min(99, m6 + p6)
        if (m6 + p6 + reco <= 0) {
          errors.push('allocations_enfant_requis')
        }
        for (let i = 1; i <= m6; i += 1) {
          if (!f[`25_${i}`]) errors.push(`allocations_certificat_vie_${i}`)
        }
        for (let i = 1; i <= sumMp; i += 1) {
          if (!f[`28_${i}`]) errors.push(`allocations_certificat_scolarite_${i}`)
          if (!f[`33_${i}`]) errors.push(`accouchement_acte_naissance_${i}`)
        }
        for (let i = 1; i <= reco; i += 1) {
          if (!f[`23_${i}`]) errors.push(`allocations_declaration_reconnaissance_${i}`)
        }
      }
      return errors
    },

    buildSubmitPayload(typeCode) {
      return buildDepotPrestationPfLegacyFormData(this, typeCode)
    },

    async submitDossier(typeCode) {
      const validationErrors = this.validateTypeSpecific(typeCode)
      if (validationErrors.length > 0) {
        return { success: false, errors: validationErrors }
      }

      this.submitting = true
      try {
        const payload = this.buildSubmitPayload(typeCode)
        const result = await submitDepotPrestationPf(payload)
        this.lastSubmitResult = result
        return { success: true, result }
      } finally {
        this.submitting = false
      }
    },
  },
})
