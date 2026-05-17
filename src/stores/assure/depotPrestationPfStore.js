import { defineStore } from 'pinia'
import {
  fetchEmployeurDepotPf,
  loadAssureDepotPfContexte,
  submitDepotPrestationPf,
} from 'src/api/assure/depotPrestationPfApi.js'
import { DEPOT_PF_TYPE_CODES } from 'src/constants/assure/depotPrestationPfTypes.js'
import { normalizeMatriculeEmployeur } from 'src/api/assure/depotPrestationPfUtils.js'

function createCommonForm() {
  return {
    mat_employeur: '',
    raisonsociale: '',
    mat_interne: '',
    EMAIL_PERS: '',
    TEL_PERS: '',
    Adresse: '',
    CODE_CENTRECNPSC: null,
    typeSubmission: 'definitive',
  }
}

function createExamensPrenatauxForm() {
  return {
    demandePremierExamen: false,
    demandeDeuxiemeExamen: false,
    datePremierExamen: '',
    dateDeuxiemeExamen: '',
    dateProbableAccouchement: '',
    allocations1: false,
    fraisMedicaux1: false,
    allocations2: false,
    fraisMedicaux2: false,
    certificatPremier: null,
    fraisMedicauxPremier: null,
    certificatDeuxieme: null,
    fraisMedicauxDeuxieme: null,
  }
}

function createAccouchementForm() {
  return {
    dateAccouchement: '',
    nombreEnfantsViables: 1,
    nombreEnfantsSousControle: null,
    fraisAccouchement: false,
    fraisMedicaux: false,
    certificatMedical: null,
    acteNaissanceEnfant1: null,
    acteNaissanceEnfant2: null,
    acteNaissanceEnfant3: null,
    acteNaissanceEnfant4: null,
    acteNaissanceEnfant5: null,
  }
}

function createCongesMaterniteForm() {
  return {
    showIndemnites: true,
    accouchementPremature: false,
    nombreJoursCouches: 0,
    debutConges: '',
    finConges: '',
    dateRepriseActivite: '',
    debutPeriodeNonSalaire: '',
    finPeriodeNonSalaire: '',
    nombreEnfantsViables: 1,
    nombreEnfantsSousControle: 1,
    certificatMedical: null,
    actesNaissance: [null],
    bulletinPaie: null,
    attestationCessation: null,
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
    dateSignatureDossier: '',
    dateEmbauche: '',
    heuresTravaillees: '',
    nombreEnfantsMoins6: 0,
    nombreEnfantsPlus6: 0,
    nombreEnfantsReconnus: 0,
    attestationNonPerceptionAF: null,
    acteMariageCertifie: null,
    originalActeMariage: null,
    actesNaissanceSupplementaires: {},
  }
}

export const useDepotPrestationPfStore = defineStore('assure-depot-prestation-pf', {
  state: () => ({
    contexte: null,
    selectedTypeCode: null,
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

      const email = ctx.EMAIL_PERS || ctx.email || ''
      const tel = ctx.TEL_PERS || ctx.telephone || ctx.tel || ''
      const adresse = ctx.Adresse || ctx.adresse || ''
      const matInterne = ctx.mat_interne || ctx.matriculeInterne || ''

      if (email) this.common.EMAIL_PERS = email
      if (tel) this.common.TEL_PERS = tel
      if (adresse) this.common.Adresse = String(adresse).toUpperCase()
      if (matInterne) this.common.mat_interne = String(matInterne).toUpperCase()
    },

    setSelectedType(code) {
      this.selectedTypeCode = code
    },

    async fetchEmployeur() {
      const matricule = normalizeMatriculeEmployeur(this.common.mat_employeur)
      if (!matricule) {
        throw new Error('matricule_required')
      }
      this.common.mat_employeur = matricule
      this.loadingEmployeur = true
      try {
        const employer = await fetchEmployeurDepotPf(matricule)
        this.common.raisonsociale =
          employer.raisonsociale ||
          employer.NOM_COMMERCIAL ||
          employer.denominationSociale ||
          ''
        this.common.NOM_COMMERCIAL = employer.NOM_COMMERCIAL || this.common.raisonsociale
        this.common.ADRESSE_EMPLOYEUR = employer.ADRESSE_EMPLOYEUR || ''
        this.common.DATE_EMB_PREM_TRAV = employer.DATE_EMB_PREM_TRAV || ''
        this.common.EFFECTIF_APPROX = employer.EFFECTIF_APPROX ?? ''
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
    },

    validateTypeSpecific(typeCode) {
      const errors = []
      if (typeCode === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX) {
        const f = this.examensPrenataux
        const hasDate = (val) => String(val || '').replace(/\D/g, '').length >= 8
        const premierActif =
          hasDate(f.datePremierExamen) || f.allocations1 || f.fraisMedicaux1
        const deuxiemeActif =
          hasDate(f.dateDeuxiemeExamen) ||
          hasDate(f.dateProbableAccouchement) ||
          f.allocations2 ||
          f.fraisMedicaux2
        f.demandePremierExamen = premierActif
        f.demandeDeuxiemeExamen = deuxiemeActif
        if (!premierActif && !deuxiemeActif) {
          errors.push('examens_prenataux_aucune_demande')
        }
        if (premierActif && !f.allocations1 && !f.fraisMedicaux1) {
          errors.push('examens_prenataux_premier_checkbox')
        }
        if (deuxiemeActif && !f.allocations2 && !f.fraisMedicaux2) {
          errors.push('examens_prenataux_deuxieme_checkbox')
        }
      }
      if (typeCode === DEPOT_PF_TYPE_CODES.ACCOUCHEMENT) {
        const f = this.accouchement
        if (!f.fraisAccouchement && !f.fraisMedicaux) {
          errors.push('accouchement_option_requise')
        }
        const raw = f.nombreEnfantsSousControle
        const n = parseInt(raw, 10)
        if (raw === null || raw === undefined || raw === '' || !Number.isFinite(n) || n <= 0) {
          errors.push('accouchement_nombre_enfants_sous_controle_requis')
        } else {
          const count = Math.min(5, n)
          for (let i = 1; i <= count; i += 1) {
            if (!f[`acteNaissanceEnfant${i}`]) {
              errors.push(`accouchement_acte_naissance_${i}`)
            }
          }
        }
      }
      if (typeCode === DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES) {
        const f = this.allocations
        if (
          parseInt(f.nombreEnfantsMoins6 || 0, 10) === 0 &&
          parseInt(f.nombreEnfantsPlus6 || 0, 10) === 0 &&
          parseInt(f.nombreEnfantsReconnus || 0, 10) === 0
        ) {
          errors.push('allocations_enfant_requis')
        }
      }
      return errors
    },

    buildSubmitPayload(typeCode) {
      const fd = new FormData()
      fd.append('numAssu', this.numAssu)
      fd.append('typeDepotPf', typeCode)
      fd.append('typeSubmission', this.common.typeSubmission)
      fd.append('common', JSON.stringify(this.common))

      let specific = {}
      if (typeCode === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX) {
        specific = { ...this.examensPrenataux }
      } else if (typeCode === DEPOT_PF_TYPE_CODES.ACCOUCHEMENT) {
        specific = { ...this.accouchement }
      } else if (typeCode === DEPOT_PF_TYPE_CODES.CONGES_MATERNITE) {
        specific = { ...this.congesMaternite }
      } else if (typeCode === DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES) {
        specific = { ...this.allocations }
      }
      fd.append('specific', JSON.stringify(specific))

      const appendFile = (key, file) => {
        if (file instanceof File) {
          fd.append(key, file)
        }
      }

      if (typeCode === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX) {
        appendFile('certificatPremier', this.examensPrenataux.certificatPremier)
        appendFile('fraisMedicauxPremier', this.examensPrenataux.fraisMedicauxPremier)
        appendFile('certificatDeuxieme', this.examensPrenataux.certificatDeuxieme)
        appendFile('fraisMedicauxDeuxieme', this.examensPrenataux.fraisMedicauxDeuxieme)
      }
      if (typeCode === DEPOT_PF_TYPE_CODES.ACCOUCHEMENT) {
        appendFile('certificatMedical', this.accouchement.certificatMedical)
        for (let i = 1; i <= 5; i += 1) {
          appendFile(`acteNaissanceEnfant${i}`, this.accouchement[`acteNaissanceEnfant${i}`])
        }
      }
      if (typeCode === DEPOT_PF_TYPE_CODES.CONGES_MATERNITE) {
        appendFile('certificatMedical', this.congesMaternite.certificatMedical)
        appendFile('bulletinPaie', this.congesMaternite.bulletinPaie)
        appendFile('attestationCessation', this.congesMaternite.attestationCessation)
        this.congesMaternite.actesNaissance.forEach((file, idx) => {
          appendFile(`acteNaissance_${idx}`, file)
        })
      }
      if (typeCode === DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES) {
        appendFile('attestationNonPerceptionAF', this.allocations.attestationNonPerceptionAF)
        appendFile('acteMariageCertifie', this.allocations.acteMariageCertifie)
        appendFile('originalActeMariage', this.allocations.originalActeMariage)
        Object.entries(this.allocations.actesNaissanceSupplementaires).forEach(([key, file]) => {
          appendFile(key, file)
        })
      }

      return fd
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
