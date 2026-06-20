import { defineStore } from 'pinia'
import { Dialog } from 'quasar'
import { notify } from 'src/modules/shared/utils/appNotify.js'
import { i18n } from 'src/i18n/instance.js'
import {
  fetchNouveauDossierObjets,
  fetchNaturePrestations,
  fetchTypeCircuits,
  fetchInfoAssure,
  fetchInfoEmployeur,
  fetchTeleimportation,
  submitNouveauDossier,
  persistNouveauDossierPieces,
  finalizeNouveauDossier,
  fetchJaccueilDossiers,
  fetchReceptionPiecesContext,
  listSavedNouveauDossiers,
} from 'src/modules/energizer/api/nouveauDossierApi.js'
import {
  computeNouveauDossierFieldState,
  clearHiddenFormFields,
  isFieldActive,
} from 'src/modules/energizer/utils/nouveauDossierFieldState.js'
import {
  formatTodayFr,
  isValidMatriculeAssure,
  isValidMatriculeEmployeur,
} from 'src/modules/energizer/composables/useNouveauDossierRules.js'
import { TYPE_IMMAT_OPTIONS } from 'src/modules/energizer/data/nouveauDossierTypes.js'
import {
  CIRCUIT_LIBELLE_ORDINAIRE,
  findCircuitByLibelle,
  isTeleCircuitCode,
  resolveEffectiveCodeCircuit,
} from 'src/modules/energizer/utils/nouveauDossierCircuits.js'
import { normalizeMatriculeEmployeur } from 'src/modules/assure/api/depotPrestationPfUtils.js'
import { NouveauDossierSubmitError } from 'src/modules/energizer/api/nouveauDossierErrors.js'
import { toUserFacingNouveauDossierError } from 'src/modules/energizer/api/adapters/parseNouveauDossierLegacyHtml.js'
import { NBRE_PIECE_OPTIONS } from 'src/modules/energizer/data/nouveauDossierPieceTypes.js'
import {
  resolveObjetFromCodePres,
  resolveNatuPrestationFromObjCode,
  resolveObjCodeFromNumDossier,
  shouldShowAssureSummary,
  defaultTitulaireForNature,
  formatTodayPieceFr,
  validateInitialPieceRows,
  validateReceptionPieceRows,
  toReceptionPiecesRow,
} from 'src/modules/energizer/utils/nouveauDossierPieces.js'
import { getConnectedAgentContext } from 'src/modules/energizer/utils/nouveauDossierAgentContext.js'
import { isEnergizerSessionExpiredError } from 'src/modules/energizer/utils/energizerSessionExpiry.js'

function t(key, params) {
  return i18n.global.t(key, params)
}

function createPieceRow(index, defaults = {}) {
  const today = formatTodayPieceFr()
  return {
    _uid: `piece-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    index,
    person: defaults.person ?? '',
    titulaire: defaults.titulaire ?? '',
    dateDep: defaults.dateDep ?? today,
    dateVal: defaults.dateVal ?? today,
    observ: defaults.observ ?? '',
    nbre: defaults.nbre ?? '1',
    _readonly: defaults._readonly ?? false,
    _skipValidation: defaults._skipValidation ?? false,
  }
}

function mapRecapPiecesToExisting(pieces) {
  return (pieces ?? []).map((p, i) => ({
    id: p.id ?? `recap-${i + 1}`,
    person: p.person ?? p.displayPerson ?? '',
    titulaire: p.titulaire ?? '',
    dateDep: p.dateDep ?? '',
    dateVal: p.dateVal ?? '',
    observ: p.observ ?? '',
    nbre: p.nbre ?? '1',
    num_typepiece: p.num_typepiece ?? '',
    num_ordre: p.num_ordre ?? String(i + 1),
    verifiee: p.verifiee ?? '',
    _skipValidation: true,
  }))
}

function enrichReceptionRowFromSaved(row, savedDossiers = []) {
  const base = toReceptionPiecesRow(row)
  const num_dossier = String(base.num_dossier ?? '').trim()
  if (!num_dossier) return base

  const saved = savedDossiers.find((d) => d.num_dossier === num_dossier)
  if (!saved) return base

  return toReceptionPiecesRow({
    ...saved,
    ...base,
    num_dossier,
    Obj: base.Obj || saved.Obj,
    num_assu: base.num_assu || saved.numassu,
    nom_requerant: base.nom_requerant || saved.nomcomplet,
    tel: base.tel || saved.telephone,
    adresse: base.adresse || saved.adresse,
    myobjet: base.myobjet || saved.myobjet || saved.objet,
    date_demande: base.date_demande || saved.datedemande,
  })
}

function syncRecapFromExistingPieces(existingPieces) {
  return (existingPieces ?? []).map((p, i) => ({
    ...p,
    displayPerson: p.displayPerson ?? p.person,
    index: i + 1,
  }))
}

function countPiecesForFinish(state) {
  if (state.step === 'piecesRecap') return state.recapPieces.length

  const filledNew = state.pieceRows.filter(
    (r) => String(r.person ?? '').trim() && String(r.titulaire ?? '').trim(),
  ).length

  return Math.max(state.existingPieces.length, filledNew, state.recapPieces.length)
}

function buildSavedDossierRowFromContext(context, overrides = {}) {
  const num_dossier = String(context?.numdossier ?? '').trim()
  if (!num_dossier) return null
  const Obj =
    String(context?.Obj ?? '').trim() || resolveObjCodeFromNumDossier(num_dossier)
  const today = formatTodayFr()
  return {
    id: num_dossier,
    num_dossier,
    Obj,
    numassu: String(context?.numassu ?? '').trim(),
    nomcomplet: String(context?.nom_complet ?? context?.nomcomplet ?? '').trim(),
    objet: String(context?.myobjet ?? '').trim(),
    code_situ: overrides.code_situ ?? 'En Cours d instruction',
    localisation: overrides.localisation ?? 'Accueil',
    telephone: String(context?.telephone ?? '').trim(),
    adresse: String(context?.adresse ?? '').trim(),
    myobjet: String(context?.myobjet ?? '').trim(),
    datedemande: String(context?.datedemande ?? '').trim(),
    date_enreg: overrides.date_enreg ?? today,
    createdAt: overrides.createdAt ?? overrides.date_enreg ?? today,
    ...overrides,
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
    objets: [],
    naturePrestations: [],
    circuits: [],
    selectedType: null,
    fieldState: computeNouveauDossierFieldState(null),
    teleClientFields: [],
    form: createForm(),
    savedDossiers: [],
    savedDossiersLoadCount: 0,
    /** Dossiers finalisés pas encore renvoyés par get_dossier.jsp */
    pendingTableUpserts: [],
    lastSubmitResult: null,
    piecesContext: null,
    piecesMode: 'initial',
    pieceTypeOptions: [],
    pieceOptionsVersion: 0,
    pieceRows: [],
    existingPieces: [],
    recapPieces: [],
    jaccueilRows: [],
    jaccueilLoadCount: 0,
    jaccueilFilters: {
      num_dossier: '',
      num_assu: '',
      nom_requerant: '',
      localisation: '',
      initiateur: '',
    },
    /** null | 'open' | 'pause' | 'validate' | 'corbeille' */
    piecesLoadingAction: null,
    loadingFinalize: false,
    metaError: null,
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
    isOpeningPieces(state) {
      return state.piecesLoadingAction === 'open'
    },
    isPausingPieces(state) {
      return state.piecesLoadingAction === 'pause'
    },
    isTerminerCorbeilleLoading(state) {
      return state.piecesLoadingAction === 'corbeille'
    },
    isJaccueilLoading(state) {
      return (
        state.piecesLoadingAction === 'pause'
        || state.piecesLoadingAction === 'corbeille'
        || state.jaccueilLoadCount > 0
      )
    },
    isValidatingPieces(state) {
      return state.piecesLoadingAction === 'validate'
    },
    isPiecesBusy(state) {
      return state.piecesLoadingAction != null
    },
    isLoadingSavedDossiers(state) {
      return state.savedDossiersLoadCount > 0
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
      this.jaccueilLoadCount = 0
      this.jaccueilFilters = {
        num_dossier: '',
        num_assu: '',
        nom_requerant: '',
        localisation: '',
        initiateur: '',
      }
      this.piecesLoadingAction = null
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
      this.metaError = null
      try {
        const [objets, naturePrestations, circuits] = await Promise.all([
          fetchNouveauDossierObjets(),
          fetchNaturePrestations(),
          fetchTypeCircuits(),
        ])
        this.objets = objets
        this.naturePrestations = naturePrestations
        this.circuits = circuits
      } catch (error) {
        this.objets = []
        this.naturePrestations = []
        this.circuits = []
        this.metaError = error?.message || t('messages.error')
        notify({ type: 'negative', message: this.metaError })
      } finally {
        this.loadingMeta = false
      }
    },

    async loadSavedDossiers(filters = {}) {
      this.savedDossiersLoadCount += 1
      try {
        const agent = getConnectedAgentContext()
        const query = { ...filters }
        if (!String(query.num_dossier ?? '').trim() && agent.login) {
          query.initiateur = query.initiateur ?? agent.login
        }

        const fetched = await listSavedNouveauDossiers(query)
        const fetchedNums = new Set(fetched.map((d) => d.num_dossier))
        const pending = this.pendingTableUpserts.filter(
          (d) => d.num_dossier && !fetchedNums.has(d.num_dossier),
        )
        this.pendingTableUpserts = pending
        this.savedDossiers = [...pending, ...fetched]
      } finally {
        this.savedDossiersLoadCount = Math.max(0, this.savedDossiersLoadCount - 1)
      }
    },

    upsertSavedDossierFromContext(context, overrides = {}) {
      const row = buildSavedDossierRowFromContext(context, overrides)
      if (!row) return

      const idx = this.savedDossiers.findIndex((d) => d.num_dossier === row.num_dossier)
      if (idx >= 0) {
        this.savedDossiers[idx] = { ...this.savedDossiers[idx], ...row }
      } else {
        this.savedDossiers.unshift(row)
      }

      const pendingIdx = this.pendingTableUpserts.findIndex(
        (d) => d.num_dossier === row.num_dossier,
      )
      if (pendingIdx >= 0) {
        this.pendingTableUpserts[pendingIdx] = row
      } else {
        this.pendingTableUpserts.unshift(row)
      }
    },

    /**
     * addpieceRecep.jsp — enregistre les pièces saisies avant Terminer (legacy nambre > 0).
     */
    async persistReceptionNewPiecesBeforeFinish() {
      if (this.piecesMode !== 'reception' || this.step !== 'piecesReception') {
        return true
      }

      const newRows = this.pieceRows.filter(
        (r) => String(r.person ?? '').trim() && String(r.titulaire ?? '').trim(),
      )
      if (!newRows.length) return true

      const rows = [
        ...this.existingPieces.map((p) => ({ ...p, _skipValidation: true })),
        ...newRows,
      ]
      const validation = validateReceptionPieceRows(rows, this.piecesContext?.datedemande)
      if (!validation.ok) {
        notify({ type: 'negative', message: validation.message, timeout: 5000 })
        return false
      }

      const agent = getConnectedAgentContext()
      try {
        await persistNouveauDossierPieces(this.piecesContext, newRows, {
          username: agent.login,
          mode: this.piecesMode,
        })
      } catch (e) {
        if (!isEnergizerSessionExpiredError(e)) {
          notify({
            type: 'negative',
            message: e?.message || t('messages.error'),
            timeout: 6000,
          })
        }
        return false
      }

      const receptionRow = this.buildReceptionRowFromContext()
      if (receptionRow) {
        try {
          const ctx = await fetchReceptionPiecesContext(receptionRow)
          if (ctx.existingPieces?.length) {
            this.existingPieces = ctx.existingPieces
            return true
          }
        } catch {
          /* repli local ci-dessous */
        }
      }

      this.existingPieces = [
        ...this.existingPieces,
        ...newRows.map((r, i) => ({
          ...r,
          id: r.id ?? `new-${Date.now()}-${i + 1}`,
          displayPerson: r.person,
          _skipValidation: true,
        })),
      ]
      return true
    },

    buildReceptionRowFromContext() {
      const ctx = this.piecesContext ?? {}
      const numdossier = String(ctx.numdossier ?? '').trim()
      if (!numdossier) return null
      return toReceptionPiecesRow({
        num_dossier: numdossier,
        Obj: ctx.Obj ?? resolveObjCodeFromNumDossier(numdossier),
        num_assu: ctx.numassu ?? '',
        nom_requerant: ctx.nom_complet || ctx.nomcomplet || '',
        adresse: ctx.adresse ?? '',
        tel: ctx.telephone ?? '',
        myObjet: ctx.myobjet ?? '',
        date_demande: ctx.datedemande ?? '',
      })
    },

    syncPieceRowPersonValues() {
      const options = this.pieceTypeOptions
      if (!options.length) return
      const values = new Set(options.map((o) => o.value))
      const fallback = options[0]?.value ?? ''
      for (const row of this.pieceRows) {
        if (row._readonly) continue
        if (!row.person || !values.has(row.person)) {
          row.person = fallback
        }
      }
    },

    async ensurePieceTypeOptions(forceReload = false, options = {}) {
      const syncExisting = options.syncExisting !== false
      if (!forceReload && this.pieceTypeOptions.length) {
        this.syncPieceRowPersonValues()
        return true
      }

      const row =
        this.buildReceptionRowFromContext() ??
        (this.piecesContext?.numdossier
          ? toReceptionPiecesRow({
              num_dossier: this.piecesContext.numdossier,
              Obj:
                this.piecesContext.Obj ??
                resolveObjCodeFromNumDossier(this.piecesContext.numdossier),
              num_assu: this.piecesContext.numassu,
              nom_requerant: this.piecesContext.nom_complet || this.piecesContext.nomcomplet,
              adresse: this.piecesContext.adresse,
              tel: this.piecesContext.telephone,
              myObjet: this.piecesContext.myobjet,
              date_demande: this.piecesContext.datedemande,
            })
          : null)

      if (!row?.num_dossier) return false

      try {
        const ctx = await fetchReceptionPiecesContext(row)
        if (ctx.pieceTypeOptions?.length) {
          this.pieceTypeOptions = ctx.pieceTypeOptions
          this.pieceOptionsVersion += 1
        }
        if (syncExisting && ctx.existingPieces?.length) {
          this.existingPieces = ctx.existingPieces
        }
        this.syncPieceRowPersonValues()
        return this.pieceTypeOptions.length > 0
      } catch {
        this.syncPieceRowPersonValues()
        return this.pieceTypeOptions.length > 0
      }
    },

    /**
     * Ouvre un dossier de la corbeille (jAccueil ou tableau réception) — addpieceRecep.jsp legacy.
     * @param {Record<string, unknown>} row
     */
    async openDossierFromCorbeille(row) {
      const receptionRow = enrichReceptionRowFromSaved(row, this.savedDossiers)
      if (!receptionRow.num_dossier) {
        notify({ type: 'negative', message: t('messages.error') })
        return
      }

      if (!this.dialogOpen) {
        this.dialogOpen = true
        if (!this.objets.length) {
          await this.loadMeta()
        }
      }

      await this.openReceptionPieces(receptionRow)
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
      if (this.loadingAssure) return
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
      if (this.loadingEmployeur) return
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
        const result = await submitNouveauDossier(this.form)
        this.lastSubmitResult = result
        const num = result?.num_dossier ?? result?.code_type_pres ?? ''
        notify({
          type: 'positive',
          message: result?.message ?? t('reception.nouveauDossier.savedWithNum', { num }),
          timeout: 4000,
        })
        await this.initPiecesAfterSubmit(result)
        await this.loadSavedDossiers()
        this.upsertSavedDossierFromContext(this.piecesContext, {
          code_situ: 'Receptionné',
          localisation: 'Accueil',
        })
      } catch (e) {
        const fallback = t('reception.nouveauDossier.saveError')
        const message = toUserFacingNouveauDossierError(
          e instanceof NouveauDossierSubmitError ? e.message : e?.message,
          fallback,
        )
        notify({ type: 'negative', message, timeout: 8000 })
      } finally {
        this.loadingSubmit = false
      }
    },

    async initPiecesAfterSubmit(result) {
      const numdossier = result?.num_dossier ?? result?.code_type_pres ?? ''
      const objet = resolveObjetFromCodePres(this.form.code_pres)
      const nomComplet = this.form.nomcompletass || this.form.nomcomplet || ''
      this.piecesContext = {
        numdossier,
        objet,
        Obj: this.form.code_pres,
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
      this.pieceTypeOptions = result?.pieceTypeOptions?.length ? result.pieceTypeOptions : []

      if (!this.pieceTypeOptions.length) {
        try {
          const ctx = await fetchReceptionPiecesContext({
            num_dossier: numdossier,
            Obj: this.form.code_pres,
            num_assu: this.form.numassu,
            nom_requerant: nomComplet,
            adresse: this.form.adresse,
            tel: this.form.telephone,
            myObjet: this.form.code_natu_pres,
            date_demande: this.piecesContext.datedemande,
          })
          this.pieceTypeOptions = ctx.pieceTypeOptions ?? []
        } catch {
          /* types de pièces indisponibles */
        }
      }
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
      await this.ensurePieceTypeOptions()
    },

    addPieceRow() {
      const next = this.pieceRows.length + 1
      const first = this.pieceRows[0]
      const fallbackPerson =
        first?.person && this.pieceTypeOptions.some((o) => o.value === first.person)
          ? first.person
          : this.pieceTypeOptions[0]?.value ?? ''
      this.pieceRows.push(
        createPieceRow(next, {
          person: fallbackPerson,
          titulaire: first?.titulaire ?? '',
          dateDep: first?.dateDep,
          dateVal: first?.dateVal,
        }),
      )
    },

    removeLastPieceRow() {
      if (this.pieceRows.length <= 1) return
      this.pieceRows.pop()
      this.pieceRows.forEach((row, i) => {
        row.index = i + 1
      })
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

      this.piecesLoadingAction = 'validate'
      try {
        const agent = getConnectedAgentContext()
        const piecesToPersist =
          this.piecesMode === 'reception' ? newPieces : allPieces
        await persistNouveauDossierPieces(this.piecesContext, piecesToPersist, {
          username: agent.login,
          mode: this.piecesMode,
        })
        this.recapPieces = allPieces.map((p, i) => ({
          ...p,
          displayPerson: p.person,
          index: i + 1,
        }))
        this.step = 'piecesRecap'
        return true
      } catch (e) {
        if (!isEnergizerSessionExpiredError(e)) {
          notify({
            type: 'negative',
            message: e?.message || t('messages.error'),
            timeout: 6000,
          })
        }
        return false
      } finally {
        this.piecesLoadingAction = null
      }
    },

    /**
     * Pause — redirige vers la corbeille (jAccueil.jsp legacy).
     */
    async pauseDossier() {
      await this.goToJaccueil()
    },

    /**
     * Corbeille jAccueil — recherche get_dossier.jsp (filtres legacy).
     * @param {Record<string, string>} [overrides]
     */
    async searchJaccueilDossiers(overrides = {}) {
      this.jaccueilLoadCount += 1
      try {
        const filters = {
          num_dossier: String(this.jaccueilFilters.num_dossier ?? '').trim(),
          num_assu: String(this.jaccueilFilters.num_assu ?? '').trim(),
          nom_requerant: String(this.jaccueilFilters.nom_requerant ?? '').trim(),
          localisation: String(this.jaccueilFilters.localisation ?? '').trim(),
          initiateur: String(this.jaccueilFilters.initiateur ?? '').trim(),
          ...overrides,
        }
        Object.keys(filters).forEach((key) => {
          filters[key] = String(filters[key] ?? '').trim()
        })
        this.jaccueilFilters = { ...this.jaccueilFilters, ...filters }
        this.jaccueilRows = await fetchJaccueilDossiers(this.jaccueilFilters)
      } finally {
        this.jaccueilLoadCount = Math.max(0, this.jaccueilLoadCount - 1)
      }
    },

    async goToJaccueil() {
      this.piecesLoadingAction = 'pause'
      try {
        await this.searchJaccueilDossiers()
        this.step = 'jaccueil'
      } catch (e) {
        notify({
          type: 'negative',
          message: e?.message || t('messages.error'),
        })
      } finally {
        this.piecesLoadingAction = null
      }
    },

    /**
     * Terminer (5 boutons — addpieceRecep) : enregistre les pièces saisies puis ouvre la corbeille.
     * Ne finalise pas le dossier (contrairement au Terminer du récap 2 boutons).
     */
    async terminerVersCorbeille() {
      this.piecesLoadingAction = 'corbeille'
      try {
        if (this.step === 'piecesReception') {
          const persisted = await this.persistReceptionNewPiecesBeforeFinish()
          if (!persisted) return

          const persistedCount = countPiecesForFinish(this)
          if (persistedCount === 0) {
            notify({
              type: 'negative',
              message: t('reception.nouveauDossier.noPiecesOnFinish'),
            })
            return
          }
        }

        await this.searchJaccueilDossiers()
        this.step = 'jaccueil'
      } catch (e) {
        if (!isEnergizerSessionExpiredError(e)) {
          notify({
            type: 'negative',
            message: e?.message || t('messages.error'),
            timeout: 6000,
          })
        }
      } finally {
        this.piecesLoadingAction = null
      }
    },

    /**
     * Reprend la saisie des pièces depuis le récap (retour arrière interne).
     */
    async restorePiecesFromRecap() {
      const saved = [...(this.recapPieces ?? [])]
      if (!saved.length) {
        notify({
          type: 'negative',
          message: t('reception.nouveauDossier.piecesRequired'),
        })
        return
      }

      this.piecesLoadingAction = 'pause'
      try {
        let existingPieces = mapRecapPiecesToExisting(saved)
        const row = this.buildReceptionRowFromContext()
        if (row) {
          try {
            const ctx = await fetchReceptionPiecesContext(row)
            if (ctx.pieceTypeOptions?.length) {
              this.pieceTypeOptions = ctx.pieceTypeOptions
              this.pieceOptionsVersion += 1
            }
            if (ctx.existingPieces?.length) {
              existingPieces = ctx.existingPieces
            }
          } catch {
            /* conserver la restauration depuis recapPieces */
          }
        }
        this.existingPieces = existingPieces

        const firstType =
          this.pieceTypeOptions[0]?.value ??
          this.existingPieces[0]?.person ??
          ''
        const titulaire =
          this.piecesContext?.nomcomplet ||
          this.piecesContext?.nom_complet ||
          this.existingPieces[0]?.titulaire ||
          ''

        this.pieceRows = [
          createPieceRow(1, {
            person: firstType,
            titulaire,
          }),
        ]

        if (this.piecesMode === 'initial') {
          this.piecesMode = 'reception'
        }
        this.step = 'piecesReception'
        await this.ensurePieceTypeOptions()
      } finally {
        this.piecesLoadingAction = null
      }
    },

    async openReceptionPieces(row) {
      const receptionRow = enrichReceptionRowFromSaved(row, this.savedDossiers)
      const numdossier = receptionRow.num_dossier ?? this.piecesContext?.numdossier
      const switchingDossier =
        numdossier && numdossier !== String(this.piecesContext?.numdossier ?? '').trim()

      if (!this.dialogOpen) {
        this.dialogOpen = true
        if (!this.objets.length) {
          await this.loadMeta()
        }
      }

      const objet = resolveNatuPrestationFromObjCode(receptionRow.Obj, numdossier)
      this.piecesContext = {
        ...this.piecesContext,
        numdossier,
        objet,
        Obj: receptionRow.Obj,
        nomcomplet: receptionRow.nom_requerant ?? this.piecesContext?.nomcomplet ?? '',
        nom_complet: receptionRow.nom_requerant ?? this.piecesContext?.nom_complet ?? '',
        telephone: receptionRow.tel ?? this.piecesContext?.telephone ?? '',
        adresse: receptionRow.adresse ?? this.piecesContext?.adresse ?? '',
        myobjet: receptionRow.myobjet ?? this.piecesContext?.myobjet ?? '',
        datedemande:
          receptionRow.datedemande ??
          receptionRow.date_demande ??
          this.piecesContext?.datedemande,
        numassu: receptionRow.num_assu ?? this.piecesContext?.numassu ?? '',
      }
      this.piecesMode = 'reception'
      this.piecesLoadingAction = 'open'
      try {
        const { pieceTypeOptions, existingPieces, serverContext } =
          await fetchReceptionPiecesContext(receptionRow)

        if (serverContext) {
          const agent = getConnectedAgentContext()
          this.piecesContext = {
            ...this.piecesContext,
            username: serverContext.username || agent.login,
            code_centre_user:
              serverContext.code_centre_user ||
              this.piecesContext?.code_centre_user ||
              '',
            objet: serverContext.objet || this.piecesContext?.objet,
            numassu: serverContext.numassu || this.piecesContext?.numassu,
            nom_complet: serverContext.nom_complet || this.piecesContext?.nom_complet,
            nomcomplet: serverContext.nom_complet || this.piecesContext?.nomcomplet,
            date_naiss: serverContext.date_naiss || this.piecesContext?.date_naiss,
            myobjet: serverContext.myobjet || this.piecesContext?.myobjet,
            datedemande: serverContext.datedemande || this.piecesContext?.datedemande,
            telephone: serverContext.telephone || this.piecesContext?.telephone,
            adresse: serverContext.adresse || this.piecesContext?.adresse,
          }
        }

        if (switchingDossier) {
          this.recapPieces = []
          this.existingPieces = []
        }

        if (pieceTypeOptions?.length) {
          this.pieceTypeOptions = pieceTypeOptions
          this.pieceOptionsVersion += 1
        }

        if (existingPieces?.length) {
          this.existingPieces = existingPieces
          this.recapPieces = syncRecapFromExistingPieces(existingPieces)
        } else if (!switchingDossier && this.recapPieces.length) {
          this.existingPieces = mapRecapPiecesToExisting(this.recapPieces)
        } else {
          this.existingPieces = []
        }

        if (!this.pieceTypeOptions.length) {
          await this.ensurePieceTypeOptions(true, { syncExisting: true })
        }

        if (!this.existingPieces.length && this.recapPieces.length) {
          this.existingPieces = mapRecapPiecesToExisting(this.recapPieces)
        }

        const firstType = this.pieceTypeOptions[0]?.value ?? ''
        this.pieceRows = [
          createPieceRow(1, {
            person: firstType,
            titulaire: receptionRow.nom_requerant ?? '',
          }),
        ]
        this.syncPieceRowPersonValues()
        this.step = 'piecesReception'
      } catch (e) {
        if (!isEnergizerSessionExpiredError(e)) {
          notify({
            type: 'negative',
            message: e?.message || t('messages.error'),
          })
        }
      } finally {
        this.piecesLoadingAction = null
      }
    },

    /**
     * Terminer (2 boutons — show.jsp / showAjout.jsp) : finalise via end.jsp.
     */
    async terminerDossier() {
      if (this.step !== 'piecesRecap') {
        await this.terminerVersCorbeille()
        return
      }

      this.loadingFinalize = true
      try {
        if (this.recapPieces.length === 0) {
          notify({
            type: 'negative',
            message: t('reception.nouveauDossier.noPiecesOnFinish'),
          })
          return
        }

        const result = await finalizeNouveauDossier(this.piecesContext)
        const numdossier = String(this.piecesContext?.numdossier ?? '').trim()

        notify({
          type: 'positive',
          message: result.message ?? t('reception.nouveauDossier.finalized'),
          timeout: 4000,
        })

        this.upsertSavedDossierFromContext(this.piecesContext, {
          code_situ: result.code_situ ?? 'En Cours d instruction',
          localisation: result.etape ?? 'Accueil',
        })
        await this.loadSavedDossiers()

        this.lastSubmitResult = { num_dossier: numdossier }
        this.closeDialog()
      } catch (e) {
        if (!isEnergizerSessionExpiredError(e)) {
          notify({
            type: 'negative',
            message: e?.message || t('messages.error'),
            timeout: 6000,
          })
        }
      } finally {
        this.loadingFinalize = false
      }
    },
  },
})
