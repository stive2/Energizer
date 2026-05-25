import { defineStore } from 'pinia'
import { Dialog } from 'quasar'
import { notify } from 'src/utils/appNotify.js'
import { i18n } from 'src/i18n/instance.js'
import {
  fetchNouveauDossierObjets,
  fetchNaturePrestations,
  fetchTypeCircuits,
  fetchInfoAssure,
  fetchInfoEmployeur,
  fetchTeleimportation,
  submitNouveauDossier,
  buildNouveauDossierPiecesPayload,
  listSavedNouveauDossiers,
} from 'src/api/energizer/nouveauDossierApi.js'
import {
  computeNouveauDossierFieldState,
  clearHiddenFormFields,
  isFieldActive,
} from 'src/utils/energizer/nouveauDossierFieldState.js'
import {
  formatTodayFr,
  isValidMatriculeAssure,
  isValidMatriculeEmployeur,
} from 'src/composables/energizer/useNouveauDossierRules.js'
import { TYPE_IMMAT_OPTIONS } from 'src/data/energizer/nouveauDossierTypes.js'
import {
  CIRCUIT_LIBELLE_ORDINAIRE,
  findCircuitByLibelle,
  isTeleCircuitCode,
  normalizeCircuitsList,
  resolveEffectiveCodeCircuit,
} from 'src/utils/energizer/nouveauDossierCircuits.js'
import { NOUVEAU_DOSSIER_NATURE_PRESTATIONS } from 'src/data/energizer/nouveauDossierTestData.js'
import { normalizeMatriculeEmployeur } from 'src/api/assure/depotPrestationPfUtils.js'
import {
  mockFetchNouveauDossierObjets,
  mockFetchTypeCircuits,
} from 'src/api/energizer/mocks/nouveauDossierMocks.js'
import { NouveauDossierSubmitError } from 'src/api/energizer/mocks/nouveauDossierSubmitMock.js'
import {
  getPieceTypesForObjet,
  getMockExistingPiecesForDossier,
  NBRE_PIECE_OPTIONS,
} from 'src/data/energizer/nouveauDossierPieceTypes.js'
import {
  resolveObjetFromCodePres,
  shouldShowAssureSummary,
  defaultTitulaireForNature,
  formatTodayPieceFr,
  validateInitialPieceRows,
  validateReceptionPieceRows,
} from 'src/utils/energizer/nouveauDossierPieces.js'
import {
  mockJaccueilDossiers,
  mockFinalizeDossier,
  mockPersistPieces,
} from 'src/api/energizer/mocks/nouveauDossierPiecesMock.js'
import { getConnectedAgentContext } from 'src/utils/energizer/nouveauDossierAgentContext.js'

function t(key, params) {
  return i18n.global.t(key, params)
}

function createPieceRow(index, defaults = {}) {
  const today = formatTodayPieceFr()
  return {
    index,
    person: defaults.person ?? '',
    titulaire: defaults.titulaire ?? '',
    dateDep: defaults.dateDep ?? today,
    dateVal: defaults.dateVal ?? today,
    observ: defaults.observ ?? '',
    nbre: defaults.nbre ?? '1',
    _readonly: false,
    _skipValidation: false,
  }
}

function createForm() {
  return {
    objet: null,
    numassu: '',
    nomcompletass: '',
    today: '',
    date_naiss: '',
    centre_ges: '',
    nomcomplet: '',
    nomtiers: '',
    datedemande: '',
    datecessation: '',
    datedeces: '',
    dateconstatinvalid: '',
    dateconstatincapacite: '',
    datedemandeassuredecede: '',
    natureprestation: null,
    tauxinvalide: null,
    dateaccident: '',
    datedeclaration: '',
    email: '',
    adresse: '',
    telephone: '',
    typeimmas: 'O',
    revision: 'NON',
    circuit: CIRCUIT_LIBELLE_ORDINAIRE,
    code_circuit: '1',
    lad: 'NON',
    code_centre: '',
    code_pres: '',
    code_natu_pres: '',
    code_natu_pres_register: '',
    mat_employeur: '',
    RAISON_SOCIALE: '',
    CODE_CENTRE: '',
    BOITE_POSTALE: '',
    REGIME_CNPS: '',
    CODE_GPE_RISQUE: '',
    ADRESSE_EMPLOYEUR: '',
    code_tele_enreg: '',
    code_secret: '',
    tele_nom: '',
    tele_date_naiss: '',
    tele_lieu_naiss: '',
    tele_empl: '',
    tele_date_emb: '',
    tele_raison: '',
    tele_regime: '',
    tele_risque: '',
    date_effet: '',
    tele_date_enreg: '',
  }
}

export const useNouveauDossierStore = defineStore('energizer-nouveau-dossier', {
  state: () => ({
    dialogOpen: false,
    step: 'pick',
    loadingMeta: false,
    loadingSubmit: false,
    loadingTele: false,
    loadingAssure: false,
    loadingEmployeur: false,
    objets: mockFetchNouveauDossierObjets(),
    naturePrestations: [],
    circuits: [],
    selectedType: null,
    fieldState: computeNouveauDossierFieldState(null),
    teleClientFields: [],
    form: createForm(),
    savedDossiers: [],
    lastSubmitResult: null,
    piecesContext: null,
    piecesMode: 'initial',
    pieceTypeOptions: [],
    pieceRows: [],
    existingPieces: [],
    recapPieces: [],
    jaccueilRows: [],
    loadingPieces: false,
    loadingFinalize: false,
  }),

  getters: {
    objetOptions(state) {
      return state.objets.map((o) => ({
        label: o.libelle_type_pres,
        value: o.libelle_type_pres,
        meta: o,
      }))
    },
    typeimmasOptions: () =>
      TYPE_IMMAT_OPTIONS.map((o) => ({ label: o.lib, value: o.code })),
    revisionOptions: () => [
      { label: 'OUI', value: 'OUI' },
      { label: 'NON', value: 'NON' },
    ],
    circuitOptions(state) {
      return state.circuits.map((c) => ({
        label: c.libelle_circuit,
        value: c.libelle_circuit,
        meta: c,
      }))
    },
    natureOptions(state) {
      return state.naturePrestations.map((n) => ({
        label: n.libelle_type_pres,
        value: n.libelle_type_pres,
        meta: n,
      }))
    },
    formTitle(state) {
      return state.selectedType?.libelle_type_pres ?? t('reception.nouveauDossier.formTitle')
    },
    nbrePieceOptions: () => NBRE_PIECE_OPTIONS,
    showAssureOnPieces(state) {
      return shouldShowAssureSummary(state.piecesContext?.objet)
    },
    piecesPsize(state) {
      return state.pieceRows.length
    },
    totalPiecesCount(state) {
      return state.existingPieces.length + state.recapPieces.length
    },
  },

  actions: {
    async openDialog() {
      this.dialogOpen = true
      this.step = 'pick'
      await this.loadMeta()
    },

    closeDialog() {
      this.dialogOpen = false
      this.resetAll()
    },

    resetPiecesFlow() {
      this.piecesContext = null
      this.piecesMode = 'initial'
      this.pieceTypeOptions = []
      this.pieceRows = []
      this.existingPieces = []
      this.recapPieces = []
      this.jaccueilRows = []
    },

    resetAll() {
      this.step = 'pick'
      this.selectedType = null
      this.fieldState = computeNouveauDossierFieldState(null)
      this.teleClientFields = []
      this.form = createForm()
      this.lastSubmitResult = null
      this.resetPiecesFlow()
    },

    backToPick() {
      this.step = 'pick'
      this.selectedType = null
      this.fieldState = computeNouveauDossierFieldState(null)
      this.teleClientFields = []
      this.form = createForm()
      this.lastSubmitResult = null
      this.resetPiecesFlow()
    },

    finishAfterSuccess() {
      this.backToPick()
    },

    async loadMeta() {
      this.loadingMeta = true
      try {
        const [objets, naturePrestations, circuits] = await Promise.all([
          fetchNouveauDossierObjets(),
          fetchNaturePrestations(),
          fetchTypeCircuits(),
        ])
        this.objets = objets?.length ? objets : mockFetchNouveauDossierObjets()
        this.naturePrestations = naturePrestations?.length
          ? naturePrestations
          : NOUVEAU_DOSSIER_NATURE_PRESTATIONS
        this.circuits = normalizeCircuitsList(
          circuits?.length ? circuits : mockFetchTypeCircuits(),
        )
      } catch {
        this.objets = mockFetchNouveauDossierObjets()
        this.naturePrestations = NOUVEAU_DOSSIER_NATURE_PRESTATIONS
        this.circuits = normalizeCircuitsList(mockFetchTypeCircuits())
      } finally {
        this.loadingMeta = false
      }
    },

    async loadSavedDossiers() {
      this.savedDossiers = await listSavedNouveauDossiers()
    },

    selectObjet(libelle) {
      const type = this.objets.find((o) => o.libelle_type_pres === libelle)
      if (!type) return
      this.selectedType = type
      this.form.objet = libelle
      this.form.today = type.today || formatTodayFr()
      this.form.code_centre = type.code_centre_user ?? ''
      this.form.code_pres = type.code_pres ?? ''
      this.form.code_natu_pres = type.code_natu_pres ?? ''
      this.fieldState = computeNouveauDossierFieldState(type)
      clearHiddenFormFields(this.form, this.fieldState)
      if (this.fieldState.revision.forcedValue) {
        this.form.revision = this.fieldState.revision.forcedValue
      }
      if (!this.fieldState.typeimmas.enabled) {
        this.form.typeimmas = 'O'
      }
      this.form.circuit = CIRCUIT_LIBELLE_ORDINAIRE
      this.form.code_circuit = '1'
      this.form.lad = 'NON'
      this.teleClientFields = []
      this.form.code_tele_enreg = ''
      this.form.code_secret = ''
      this.step = 'form'
    },

    onCircuitSelect(libelle) {
      const c = findCircuitByLibelle(libelle, this.circuits)
      if (!c) return
      this.form.circuit = c.libelle_circuit
      const effectiveCode = resolveEffectiveCodeCircuit(c, this.form.code_pres)
      this.form.code_circuit = effectiveCode
      this.form.lad = effectiveCode === '2' ? 'OUI' : 'NON'
      this.teleClientFields = []
      const showTele = isTeleCircuitCode(effectiveCode)
      this.fieldState.group03 = { visible: showTele }
      this.fieldState.btEnreg = { enabled: !showTele }
      if (!showTele) {
        this.form.code_tele_enreg = ''
        this.form.code_secret = ''
      }
    },

    clearAssureFields() {
      this.form.nomcompletass = ''
      this.form.date_naiss = ''
      this.form.centre_ges = ''
    },

    async onNumassuEnter() {
      if (!isFieldActive('numassu', this.fieldState)) return
      const mat = (this.form.numassu || '').trim()
      if (!mat) {
        this.clearAssureFields()
        return
      }
      this.form.numassu = mat
      if (!isValidMatriculeAssure(mat)) {
        this.clearAssureFields()
        notify({
          type: 'negative',
          message: t('reception.nouveauDossier.invalidMatAssu'),
        })
        return
      }
      this.loadingAssure = true
      try {
        const json = await fetchInfoAssure(mat)
        const row = json?.root?.[0]
        if (!row) {
          this.clearAssureFields()
          notify({
            type: 'warning',
            message: t('reception.nouveauDossier.assureNotFound'),
          })
          return
        }
        const libelle = this.selectedType?.libelle_type_pres
        const isSurvivants =
          libelle === 'Pension de Survivants' || libelle === 'Allocation de Survivants'
        if (
          this.form.code_pres === 'P' &&
          row.pre_depot_pvid != null &&
          !isSurvivants
        ) {
          notify({
            type: 'warning',
            message: `Cet assuré a commencé le dépôt en ligne sous enregistrement ${row.pre_depot_pvid}. Consultez « Liste Consultations En Ligne pour PV ».`,
          })
          return
        }
        if (
          this.form.code_pres === 'P' &&
          Number(row.ecart_mois_60) >= -10 &&
          this.form.code_natu_pres === 'PV'
        ) {
          notify({
            type: 'warning',
            message:
              'Veuillez vérifier et compléter au besoin les éléments de calcul de la pension de cet assuré pour une prise en charge automatique.',
          })
        }
        this.form.nomcompletass = row.nom_complet ?? ''
        this.form.date_naiss = row.date_naiss ?? ''
        this.form.centre_ges = row.centre_ges ?? ''
        notify({
          type: 'positive',
          message: t('reception.nouveauDossier.assureFound', {
            name: this.form.nomcompletass,
          }),
        })
      } catch {
        this.clearAssureFields()
        notify({
          type: 'negative',
          message: t('reception.nouveauDossier.assureLookupError'),
        })
      } finally {
        this.loadingAssure = false
      }
    },

    async onMatEmployeurEnter() {
      const mat = normalizeMatriculeEmployeur(this.form.mat_employeur)
      if (!mat) {
        this.clearEmployeurFields()
        return
      }
      this.form.mat_employeur = mat
      if (!isValidMatriculeEmployeur(mat)) {
        this.clearEmployeurFields()
        notify({
          type: 'negative',
          message: t('reception.nouveauDossier.invalidMatEmpl'),
        })
        return
      }
      this.loadingEmployeur = true
      try {
        const list = await fetchInfoEmployeur(mat)
        const row = list?.[0]
        if (!row) {
          this.clearEmployeurFields()
          notify({
            type: 'warning',
            message: t('reception.nouveauDossier.employeurNotFound'),
          })
          return
        }
        this.form.RAISON_SOCIALE = row.RAISON_SOCIALE ?? ''
        this.form.ADRESSE_EMPLOYEUR = row.ADRESSE_EMPLOYEUR ?? ''
        this.form.BOITE_POSTALE = row.BOITE_POSTALE ?? ''
        this.form.REGIME_CNPS = row.REGIME_CNPS ?? ''
        this.form.CODE_GPE_RISQUE = row.CODE_GPE_RISQUE ?? ''
        this.form.CODE_CENTRE = row.CODE_CENTRE ?? ''
        notify({
          type: 'positive',
          message: t('reception.nouveauDossier.employeurFound', {
            name: this.form.RAISON_SOCIALE,
          }),
        })
      } catch {
        this.clearEmployeurFields()
        notify({
          type: 'negative',
          message: t('reception.nouveauDossier.employeurLookupError'),
        })
      } finally {
        this.loadingEmployeur = false
      }
    },

    clearEmployeurFields() {
      this.form.RAISON_SOCIALE = ''
      this.form.ADRESSE_EMPLOYEUR = ''
      this.form.BOITE_POSTALE = ''
      this.form.REGIME_CNPS = ''
      this.form.CODE_GPE_RISQUE = ''
      this.form.CODE_CENTRE = ''
    },

    onNatureSelect(libelle) {
      const n = this.naturePrestations.find((x) => x.libelle_type_pres === libelle)
      if (n) {
        this.form.code_natu_pres_register = n.code_natu_pres_register ?? ''
      }
    },

    async confirmRevisionOui() {
      return new Promise((resolve) => {
        Dialog.create({
          title: t('reception.nouveauDossier.revisionTitle'),
          message: t('reception.nouveauDossier.revisionConfirm'),
          cancel: true,
          persistent: true,
        })
          .onOk(() => resolve(true))
          .onCancel(() => resolve(false))
          .onDismiss(() => resolve(false))
      })
    },

    async onRevisionSelect(val) {
      if (val === 'OUI') {
        const ok = await this.confirmRevisionOui()
        this.form.revision = ok ? 'OUI' : 'NON'
      }
    },

    async runTeleimportation() {
      const codePres = this.form.code_pres
      if (codePres !== 'A' && codePres !== 'E') {
        this.teleClientFields = []
        return
      }
      if (!this.form.code_tele_enreg || !this.form.code_secret) return
      this.loadingTele = true
      try {
        const result = await fetchTeleimportation({
          code_tele: this.form.code_tele_enreg,
          code_secret: this.form.code_secret,
          code_circuit: this.form.code_circuit,
          objet: codePres,
          num_assu: this.form.numassu,
        })
        const row = result?.root?.[0]
        if (row == null) {
          notify({ type: 'negative', message: t('reception.nouveauDossier.teleNotFound') })
          this.form.code_tele_enreg = ''
          this.form.code_secret = ''
          this.teleClientFields = []
          return
        }
        if (row.DONNEES6 != null) {
          notify({
            type: 'warning',
            message: t('reception.nouveauDossier.teleDuplicate', { num: row.DONNEES6 }),
          })
          this.form.code_tele_enreg = ''
          this.form.code_secret = ''
          return
        }
        this.applyTeleData(row, codePres)
        this.form.datedemande = row.DONNEES7 ?? ''
        this.fieldState.btEnreg = { enabled: true }
        if (row.DONNEES8) {
          const code =
            row.DONNEES8 === 'VOLONTAIRE' ? 'V' : row.DONNEES8 === 'OBLIGATOIRE' ? 'O' : 'O'
          this.form.typeimmas = code
          this.fieldState.typeimmas = { enabled: false, visible: true, required: true }
        }
      } finally {
        this.loadingTele = false
      }
    },

    applyTeleData(row, codePres) {
      if (codePres === 'A') {
        this.teleClientFields = [
          { name: 'tele_nom', labelKey: 'reception.nouveauDossier.teleNom', value: row.DONNEES1 },
          {
            name: 'tele_date_naiss',
            labelKey: 'reception.nouveauDossier.teleDateNaiss',
            value: row.DONNEES2,
          },
          {
            name: 'tele_lieu_naiss',
            labelKey: 'reception.nouveauDossier.teleLieuNaiss',
            value: row.DONNEES3,
          },
          { name: 'tele_empl', labelKey: 'reception.nouveauDossier.teleEmpl', value: row.DONNEES4 },
          {
            name: 'tele_date_emb',
            labelKey: 'reception.nouveauDossier.teleDateEmb',
            value: row.DONNEES5,
          },
          {
            name: 'tele_date_enreg',
            labelKey: 'reception.nouveauDossier.teleDateEnreg',
            value: row.DONNEES7,
          },
        ]
        this.form.tele_nom = row.DONNEES1 ?? ''
        this.form.tele_date_naiss = row.DONNEES2 ?? ''
        this.form.tele_lieu_naiss = row.DONNEES3 ?? ''
        this.form.tele_empl = row.DONNEES4 ?? ''
        this.form.tele_date_emb = row.DONNEES5 ?? ''
        this.form.tele_date_enreg = row.DONNEES7 ?? ''
      } else if (codePres === 'E') {
        this.teleClientFields = [
          {
            name: 'tele_raison',
            labelKey: 'reception.nouveauDossier.teleRaison',
            value: row.DONNEES1,
          },
          {
            name: 'tele_nom',
            labelKey: 'reception.nouveauDossier.teleNomCommercial',
            value: row.DONNEES2,
          },
          {
            name: 'tele_regime',
            labelKey: 'reception.nouveauDossier.teleVille',
            value: row.DONNEES3,
          },
          {
            name: 'tele_risque',
            labelKey: 'reception.nouveauDossier.teleQuartier',
            value: row.DONNEES4,
          },
          {
            name: 'date_effet',
            labelKey: 'reception.nouveauDossier.teleDateEffet',
            value: row.DONNEES5,
          },
          {
            name: 'tele_date_enreg',
            labelKey: 'reception.nouveauDossier.teleDateEnreg',
            value: row.DONNEES7,
          },
        ]
        this.form.tele_raison = row.DONNEES1 ?? ''
        this.form.tele_nom = row.DONNEES2 ?? ''
        this.form.tele_regime = row.DONNEES3 ?? ''
        this.form.tele_risque = row.DONNEES4 ?? ''
        this.form.date_effet = row.DONNEES5 ?? ''
        this.form.tele_date_enreg = row.DONNEES7 ?? ''
      }
    },

    validateBeforeSubmit() {
      if (
        isTeleCircuitCode(this.form.code_circuit) &&
        (!this.form.code_tele_enreg || !this.form.code_secret)
      ) {
        notify({
          type: 'negative',
          message: t('reception.nouveauDossier.teleRequired'),
        })
        return false
      }
      return true
    },

    resetFormFields() {
      const objet = this.form.objet
      this.form = createForm()
      if (objet) this.selectObjet(objet)
    },

    async submit(formRef) {
      if (!formRef) return
      const valid = await formRef.validate()
      if (!valid) {
        notify({ type: 'negative', message: t('reception.nouveauDossier.validationError') })
        return
      }
      if (!this.validateBeforeSubmit()) return
      this.loadingSubmit = true
      try {
        const validationContext = {
          fieldState: this.fieldState,
          teleImported:
            Boolean(this.form.tele_nom?.trim()) ||
            Boolean(this.form.tele_raison?.trim()) ||
            Boolean(this.form.tele_empl?.trim()),
        }
        const result = await submitNouveauDossier(this.form, validationContext)
        this.lastSubmitResult = result
        const num = result?.num_dossier ?? result?.code_type_pres ?? ''
        notify({
          type: 'positive',
          message: result?.message ?? t('reception.nouveauDossier.savedWithNum', { num }),
          timeout: 4000,
        })
        await this.loadSavedDossiers()
        this.initPiecesAfterSubmit(result)
      } catch (e) {
        const message =
          e instanceof NouveauDossierSubmitError
            ? e.message
            : t('reception.nouveauDossier.saveError')
        notify({ type: 'negative', message, timeout: 6000 })
      } finally {
        this.loadingSubmit = false
      }
    },

    initPiecesAfterSubmit(result) {
      const numdossier = result?.num_dossier ?? result?.code_type_pres ?? ''
      const objet = resolveObjetFromCodePres(this.form.code_pres)
      const nomComplet = this.form.nomcompletass || this.form.nomcomplet || ''
      this.piecesContext = {
        numdossier,
        objet,
        numassu: this.form.numassu || '',
        nom_complet: nomComplet,
        date_naiss: this.form.date_naiss || '',
        nomcomplet: this.form.nomcomplet || '',
        telephone: this.form.telephone || '',
        adresse: this.form.adresse || '',
        myobjet: this.form.code_natu_pres || '',
        datedemande: this.form.datedemande || formatTodayFr().replace(/\//g, '-'),
        codetele: this.form.code_tele_enreg || '',
        code_centre_user: this.form.code_centre || '',
      }
      this.piecesMode = 'initial'
      this.pieceTypeOptions = getPieceTypesForObjet(objet)
      const defaultTitulaire = defaultTitulaireForNature(
        this.form.code_natu_pres,
        nomComplet,
      )
      const firstType = this.pieceTypeOptions[0]?.value ?? ''
      this.pieceRows = [
        createPieceRow(1, {
          person: firstType,
          titulaire: defaultTitulaire,
        }),
      ]
      this.existingPieces = []
      this.recapPieces = []
      this.step = 'pieces'
    },

    addPieceRow() {
      const next = this.pieceRows.length + 1
      const first = this.pieceRows[0]
      this.pieceRows.push(
        createPieceRow(next, {
          person: first?.person ?? this.pieceTypeOptions[0]?.value ?? '',
          titulaire: first?.titulaire ?? '',
          dateDep: first?.dateDep,
          dateVal: first?.dateVal,
        }),
      )
    },

    removeLastPieceRow() {
      if (this.pieceRows.length <= 1) return
      this.pieceRows.pop()
    },

    removeExistingPiece(pieceId) {
      this.existingPieces = this.existingPieces.filter((p) => p.id !== pieceId)
    },

    async validatePiecesToRecap() {
      const rows =
        this.piecesMode === 'reception'
          ? [
              ...this.existingPieces.map((p) => ({ ...p, _skipValidation: true })),
              ...this.pieceRows,
            ]
          : this.pieceRows

      const validation =
        this.piecesMode === 'reception'
          ? validateReceptionPieceRows(rows, this.piecesContext?.datedemande)
          : validateInitialPieceRows(rows)

      if (!validation.ok) {
        notify({ type: 'negative', message: validation.message, timeout: 5000 })
        return false
      }

      const newPieces = this.pieceRows.map((r) => ({ ...r }))
      const allPieces =
        this.piecesMode === 'reception'
          ? [...this.existingPieces, ...newPieces]
          : newPieces

      if (!allPieces.length) {
        notify({
          type: 'negative',
          message: t('reception.nouveauDossier.piecesRequired'),
        })
        return false
      }

      this.loadingPieces = true
      try {
        const agent = getConnectedAgentContext()
        const piecesPayload = buildNouveauDossierPiecesPayload(
          this.piecesContext,
          allPieces,
          { username: agent.login },
        )
        await mockPersistPieces(piecesPayload)
        this.recapPieces = allPieces.map((p, i) => ({
          ...p,
          displayPerson: p.person,
          index: i + 1,
        }))
        this.step = 'piecesRecap'
        return true
      } finally {
        this.loadingPieces = false
      }
    },

    goToJaccueil() {
      this.jaccueilRows = mockJaccueilDossiers(this.piecesContext?.numdossier)
      this.step = 'jaccueil'
    },

    openReceptionPieces(row) {
      const numdossier = row?.num_dossier ?? this.piecesContext?.numdossier
      const objet =
        row?.myobjet || resolveObjetFromCodePres((numdossier || '').charAt(0))
      this.piecesContext = {
        ...this.piecesContext,
        numdossier,
        objet,
        nomcomplet: row?.nom_requerant ?? this.piecesContext?.nomcomplet ?? '',
        telephone: row?.telephone ?? '',
        adresse: row?.adresse ?? '',
        myobjet: row?.myobjet ?? objet,
        datedemande: row?.datedemande ?? this.piecesContext?.datedemande,
      }
      this.piecesMode = 'reception'
      this.pieceTypeOptions = getPieceTypesForObjet(objet)
      this.existingPieces = getMockExistingPiecesForDossier(numdossier)
      const firstType = this.pieceTypeOptions[0]?.value ?? ''
      this.pieceRows = [
        createPieceRow(1, {
          person: firstType,
          titulaire: row?.nom_requerant ?? '',
        }),
      ]
      this.step = 'piecesReception'
    },

    async terminerDossier() {
      const count =
        this.step === 'piecesRecap'
          ? this.recapPieces.length
          : this.existingPieces.length + this.pieceRows.length

      if (this.piecesMode === 'reception' && this.step === 'piecesReception' && count === 0) {
        notify({
          type: 'negative',
          message: t('reception.nouveauDossier.noPiecesOnFinish'),
        })
        return
      }

      this.loadingFinalize = true
      try {
        const num = this.piecesContext?.numdossier ?? ''
        const result = await mockFinalizeDossier(num)
        notify({
          type: 'positive',
          message: result.message ?? t('reception.nouveauDossier.finalized'),
          timeout: 4000,
        })
        this.backToPick()
      } finally {
        this.loadingFinalize = false
      }
    },
  },
})
