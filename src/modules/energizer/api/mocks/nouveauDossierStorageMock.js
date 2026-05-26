import { getConnectedAgentContext } from 'src/modules/energizer/utils/nouveauDossierAgentContext.js'
import { buildNouveauDossierReceptionSeed } from 'src/modules/energizer/data/nouveauDossierReceptionSeed.js'

const STORAGE_PREFIX = 'energizer-reception-dossiers:'

function storageKey(agentMatricule) {
  return `${STORAGE_PREFIX}${agentMatricule || 'unknown'}`
}

function readRaw(matricule) {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey(matricule))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeRaw(matricule, list) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(storageKey(matricule), JSON.stringify(list))
}

export function listAgentReceptionDossiers(agentMatricule) {
  const agent = getConnectedAgentContext()
  const matricule = agentMatricule || agent.matricule
  let list = readRaw(matricule)
  if (!list?.length) {
    list = matricule === agent.matricule ? buildNouveauDossierReceptionSeed(agent) : []
    writeRaw(matricule, list)
  }
  return [...list].sort(
    (a, b) => new Date(b.createdAt || b.date_enreg) - new Date(a.createdAt || a.date_enreg),
  )
}

export function appendAgentReceptionDossier(record) {
  const agent = getConnectedAgentContext()
  const matricule = record.agentMatricule || agent.matricule
  const list = listAgentReceptionDossiers(matricule).filter((d) => d.id !== record.id)
  list.unshift(record)
  writeRaw(matricule, list)
  return record
}
