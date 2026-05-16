import { computed, ref, watch } from 'vue'
import { todayFr } from 'src/api/energizer/receptionApi.js'
import { useReceptionStore } from 'src/stores/energizer/receptionStore.js'

function isSurvivantLabel(libelle) {
  return (
    libelle === 'Pension de Survivants' || libelle === 'Allocation de Survivants'
  )
}

function isInvalidite(libelle) {
  return libelle === 'Pension Invalidité'
}

function isAtMp(libelle, codePres) {
  return (
    codePres === 'R' &&
    (libelle === "Dossier d Accident du Travail" ||
      libelle === 'Dossier de Maladie Professionnelle')
  )
}

function createEmptyForm() {
  return {
    objetLabel: '',
    code_centre: '',
    code_pres: '',
    code_natu_pres: '',
    code_natu_pres_register: '',
    code_circuit: '1',
    lad: 'NON',
    today: todayFr(),
    numassu: '',
    nomcompletass: '',
    date_naiss: '',
    centre_ges: '',
    nomcomplet: '',
    nomtiers: '',
    date_demande: todayFr(),
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
    typeimmas: { code: 'O', lib: 'OBLIGATOIRE' },
    revision: { code: '1', lib: 'NON' },
    circuit: { code_circuit: '1', libelle_circuit: 'MANUEL' },
    mat_employeur: '',
    RAISON_SOCIALE: '',
    CODE_CENTRE: '',
    BOITE_POSTALE: '',
    REGIME_CNPS: '',
    CODE_GPE_RISQUE: '',
    ADRESSE_EMPLOYEUR: '',
    code_tele_enreg: '',
    code_secret: '',
    teleFields: {},
  }
}

export function useNouveauDossierForm() {
  const receptionStore = useReceptionStore()
  const selectedType = ref(null)
  const form = ref(createEmptyForm())
  const teleVisible = ref(false)
  const saveEnabled = ref(true)
  const loading = ref(false)

  const libelle = computed(() => selectedType.value?.libelle_type_pres || '')
  const codePres = computed(() => selectedType.value?.code_pres || form.value.code_pres)

  function applyPrestationType(type) {
    selectedType.value = type
    const f = createEmptyForm()
    f.objetLabel = type.libelle_type_pres
    f.code_centre = type.code_centre_user
    f.code_pres = type.code_pres
    f.code_natu_pres = type.code_natu_pres
    f.today = todayFr()
    form.value = f
    teleVisible.value = false
    saveEnabled.value = true
    applyObjetRules()
  }

  function applyObjetRules() {
    const t = selectedType.value
    if (!t) return
    const f = form.value
    const cp = t.code_pres

    if (cp === 'P') {
      f.revision = { code: '1', lib: 'NON' }
    }

    if (cp === 'A' || cp === 'E') {
      f.numassu = ''
      f.nomcompletass = ''
      f.date_naiss = ''
    }

    if (cp === 'X' || cp === 'Z') {
      f.numassu = ''
      f.nomcompletass = ''
      f.date_naiss = ''
      f.email = ''
      f.adresse = ''
      f.telephone = ''
      f.nomcomplet = ''
      f.centre_ges = ''
    }
  }

  const ui = computed(() => {
    const t = selectedType.value
    if (!t) {
      return { showEmployeur: false, showImport: false, showTeleClient: false }
    }
    const cp = t.code_pres
    const lb = t.libelle_type_pres
    const circuit = form.value.circuit?.code_circuit || '1'
    const minimal = cp === 'X' || cp === 'Z'

    return {
      showEmployeur: cp === 'X' || cp === 'Z',
      showImport:
        circuit === '3' || (circuit === '4' && cp === 'E'),
      showTeleClient: teleVisible.value,
      enableNumAssu: !minimal && cp !== 'A' && cp !== 'E',
      enableNomAssu: !minimal && cp !== 'A' && cp !== 'E',
      enableDateNaiss: !minimal && cp !== 'A' && cp !== 'E',
      enableCentreGes: !minimal && cp !== 'X' && cp !== 'Z',
      enableNomDeposant: !minimal && cp !== 'X' && cp !== 'Z',
      enableEmail: !minimal && cp !== 'X' && cp !== 'Z',
      enableAdresse: !minimal && cp !== 'X' && cp !== 'Z',
      enableTelephone: !minimal && cp !== 'X' && cp !== 'Z',
      enableDateCessation: cp === 'P' && !minimal,
      enableRevision: cp === 'P' && !minimal,
      enableTypeImmas: cp === 'A' && !minimal,
      enableDatedeces: isSurvivantLabel(lb),
      enableDatedemandeDecede: isSurvivantLabel(lb),
      enableNaturePrestation: isSurvivantLabel(lb),
      enableDateInvalidite: isInvalidite(lb),
      enableTauxInvalidite: isInvalidite(lb),
      enableNomTiers: isInvalidite(lb),
      enableDateConstatIncap: isInvalidite(lb),
      enableDateAccident: isInvalidite(lb) || isAtMp(lb, cp),
      enableDateDeclaration: isAtMp(lb, cp),
      teleIsAssure: cp === 'A',
      teleIsEmployeur: cp === 'E',
    }
  })

  watch(
    () => form.value.circuit,
    (c) => {
      if (!c) return
      form.value.code_circuit = c.code_circuit
      form.value.lad = c.code_circuit === '2' ? 'OUI' : 'NON'
      teleVisible.value = false
      form.value.teleFields = {}
      if (c.code_circuit === '3' || (c.code_circuit === '4' && codePres.value === 'E')) {
        saveEnabled.value = false
      } else {
        saveEnabled.value = true
      }
    },
    { deep: true },
  )

  async function lookupAssure() {
    if (!ui.value.enableNumAssu) return
    loading.value = true
    try {
      const data = await receptionStore.lookupAssure(
        form.value.numassu,
        form.value.code_pres,
        libelle.value,
      )
      form.value.nomcompletass = data.nom_complet
      form.value.date_naiss = data.date_naiss
      form.value.centre_ges = data.centre_ges
    } catch (e) {
      if (e.message === 'INVALID_MAT') throw e
    } finally {
      loading.value = false
    }
  }

  async function lookupEmployeur() {
    loading.value = true
    try {
      const data = await receptionStore.lookupEmployeur(form.value.mat_employeur)
      form.value.RAISON_SOCIALE = data.RAISON_SOCIALE
      form.value.ADRESSE_EMPLOYEUR = data.ADRESSE_EMPLOYEUR
      form.value.BOITE_POSTALE = data.BOITE_POSTALE
      form.value.REGIME_CNPS = data.REGIME_CNPS
      form.value.CODE_GPE_RISQUE = data.CODE_GPE_RISQUE
      form.value.CODE_CENTRE = data.CODE_CENTRE
    } catch (e) {
      if (e.message === 'INVALID_EMP') throw e
    } finally {
      loading.value = false
    }
  }

  async function runTelecompletion() {
    const cp = codePres.value
    if (cp !== 'A' && cp !== 'E') {
      form.value.code_tele_enreg = ''
      form.value.code_secret = ''
      teleVisible.value = false
      form.value.teleFields = {}
      return null
    }
    if (!form.value.code_tele_enreg?.length || !form.value.code_secret?.length) {
      return null
    }
    loading.value = true
    try {
      const result = await receptionStore.runTeleImportation({
        code_tele: form.value.code_tele_enreg,
        code_secret: form.value.code_secret,
        code_circuit: form.value.code_circuit,
        objet: cp,
        num_assu: form.value.numassu,
      })
      if (result.existingDossierNum) {
        form.value.code_tele_enreg = ''
        form.value.code_secret = ''
        teleVisible.value = false
        return { type: 'duplicate', num: result.existingDossierNum }
      }
      if (result.ok) {
        form.value.teleFields = result.fields
        form.value.date_demande = result.date_demande || form.value.date_demande
        if (result.typeimmas) {
          form.value.typeimmas = { code: result.typeimmas, lib: 'OBLIGATOIRE' }
        }
        teleVisible.value = true
        saveEnabled.value = true
        return { type: 'ok' }
      }
    } catch (e) {
      form.value.code_tele_enreg = ''
      form.value.code_secret = ''
      teleVisible.value = false
      if (e.message === 'NOT_FOUND') return { type: 'not_found' }
      throw e
    } finally {
      loading.value = false
    }
    return null
  }

  function reset() {
    selectedType.value = null
    form.value = createEmptyForm()
    teleVisible.value = false
    saveEnabled.value = true
  }

  return {
    selectedType,
    form,
    ui,
    loading,
    saveEnabled,
    libelle,
    codePres,
    applyPrestationType,
    lookupAssure,
    lookupEmployeur,
    runTelecompletion,
    reset,
  }
}
