/**
 * Circuits dossier — aligné sur typecircuit.jsp / combo ExtJS « CIRCUIT DU DOSSIER ».
 * Libellés : ORDINAIRE, GED-LAD, TELE-IMMATRICULATION (unique), CFCE.
 * Codes télé : 3 (assuré) et 4 (employeur) restent internes selon code_pres.
 */

export const CIRCUIT_LIBELLE_ORDINAIRE = 'ORDINAIRE'
export const CIRCUIT_LIBELLE_GED_LAD = 'GED-LAD'
export const CIRCUIT_LIBELLE_TELE = 'TELE-IMMATRICULATION'
export const CIRCUIT_LIBELLE_CFCE =
  'Centre Formalité Création Entreprise (C.F.C.E)'

/** Référentiel affiché dans la liste déroulante (4 entrées). */
export const DEFAULT_CIRCUITS = [
  { code_circuit: '1', libelle_circuit: CIRCUIT_LIBELLE_ORDINAIRE, kind: 'ordinaire' },
  { code_circuit: '2', libelle_circuit: CIRCUIT_LIBELLE_GED_LAD, kind: 'lad' },
  { code_circuit: '3', libelle_circuit: CIRCUIT_LIBELLE_TELE, kind: 'tele' },
  { code_circuit: '5', libelle_circuit: CIRCUIT_LIBELLE_CFCE, kind: 'cfce' },
]

/** Anciens libellés (rétrocompatibilité mocks / données enregistrées). */
const CIRCUIT_LIBELLE_ALIASES = {
  MANUEL: CIRCUIT_LIBELLE_ORDINAIRE,
  'TELE-IMMATRICULATION ASSURE': CIRCUIT_LIBELLE_TELE,
  'TELE-IMMATRICULATION EMPLOYEUR': CIRCUIT_LIBELLE_TELE,
  'Centre Formalite Creation Entreprise(C.F.C.E)': CIRCUIT_LIBELLE_CFCE,
}

export function normalizeCircuitLibelle(libelle) {
  const key = String(libelle || '').trim()
  return CIRCUIT_LIBELLE_ALIASES[key] ?? key
}

export function isTeleCircuitCode(code) {
  return code === '3' || code === '4'
}

/**
 * Code télé effectif (ExtJS : 3 ou 4 si code_pres === 'E').
 * @param {string} codePres
 */
export function resolveTeleCodeCircuit(codePres) {
  return codePres === 'E' ? '4' : '3'
}

/**
 * @param {{ kind?: string, code_circuit: string }} circuit
 * @param {string} [codePres]
 */
export function resolveEffectiveCodeCircuit(circuit, codePres) {
  if (!circuit) return '1'
  if (circuit.kind === 'tele') {
    return resolveTeleCodeCircuit(codePres)
  }
  return circuit.code_circuit
}

export function findCircuitByLibelle(libelle, circuits = DEFAULT_CIRCUITS) {
  const normalized = normalizeCircuitLibelle(libelle)
  return circuits.find((c) => c.libelle_circuit === normalized) ?? null
}

/**
 * Fusionne la réponse API avec le référentiel (ajout CFCE, télé unique, ORDINAIRE).
 * @param {Array<{ code_circuit: string, libelle_circuit: string }>} apiList
 */
export function normalizeCircuitsList(apiList) {
  const byKind = new Map()

  const ingest = (row) => {
    if (!row?.code_circuit || !row?.libelle_circuit) return
    const libelle = normalizeCircuitLibelle(row.libelle_circuit)
    const ref = DEFAULT_CIRCUITS.find((c) => c.libelle_circuit === libelle)
    if (ref) {
      byKind.set(ref.kind, { ...ref })
      return
    }
    if (libelle.includes('TELE') || libelle.includes('Télé')) {
      byKind.set('tele', { ...DEFAULT_CIRCUITS.find((c) => c.kind === 'tele') })
      return
    }
    if (libelle.includes('C.F.C.E') || libelle.includes('CFCE')) {
      byKind.set('cfce', { ...DEFAULT_CIRCUITS.find((c) => c.kind === 'cfce') })
    }
  }

  ;(apiList ?? []).forEach(ingest)
  DEFAULT_CIRCUITS.forEach((c) => {
    if (!byKind.has(c.kind)) {
      byKind.set(c.kind, { ...c })
    }
  })

  return DEFAULT_CIRCUITS.map((c) => byKind.get(c.kind) ?? c)
}
