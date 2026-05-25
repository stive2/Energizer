import { getConnectedAgentContext } from 'src/utils/energizer/nouveauDossierAgentContext.js'

function daysAgoIso(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

/**
 * Dossiers de démo pour la table « réception » (agent connecté).
 * @param {{ matricule: string, login: string, name: string }} agent
 */
export function buildNouveauDossierReceptionSeed(agent) {
  const agentMatricule = agent.matricule
  const agentLogin = agent.login
  const agentName = agent.name

  return [
    {
      id: 'P00126000000000001',
      num_dossier: 'P00126000000000001',
      objet: 'Pension de Vieillesse',
      libelle_type_pres: 'Pension de Vieillesse',
      numassu: '321-1234567-0',
      nomcomplet: 'NDJENG Paul',
      nomcompletass: 'NDJENG Paul',
      code_situ: 'En Attente',
      localisation: 'Réception',
      circuit: 'Ordinaire',
      agentMatricule,
      agentLogin,
      agentName,
      createdAt: daysAgoIso(2),
      date_enreg: daysAgoIso(2),
    },
    {
      id: 'R00126000000000002',
      num_dossier: 'R00126000000000002',
      objet: 'Rente Accident du Travail',
      libelle_type_pres: 'Rente Accident du Travail',
      numassu: '321-1256447-9',
      nomcomplet: 'KOUAM Marie',
      nomcompletass: 'KOUAM Marie',
      code_situ: 'En cours',
      localisation: 'Réception',
      circuit: 'Ordinaire',
      agentMatricule,
      agentLogin,
      agentName,
      createdAt: daysAgoIso(5),
      date_enreg: daysAgoIso(5),
    },
    {
      id: 'F00126000000000003',
      num_dossier: 'F00126000000000003',
      objet: 'Allocation Familiale',
      libelle_type_pres: 'Allocation Familiale',
      numassu: '321-9876543-2',
      nomcomplet: 'MBOCK Samuel',
      nomcompletass: 'MBOCK Samuel',
      code_situ: 'Validé',
      localisation: 'Réception',
      circuit: 'GED-LAD',
      agentMatricule,
      agentLogin,
      agentName,
      createdAt: daysAgoIso(8),
      date_enreg: daysAgoIso(8),
    },
    {
      id: 'G00126000000000004',
      num_dossier: 'G00126000000000004',
      objet: 'Prestation de Base',
      libelle_type_pres: 'Prestation de Base',
      numassu: '321-5551212-4',
      nomcomplet: 'ESSOMBA Claire',
      nomcompletass: 'ESSOMBA Claire',
      code_situ: 'En Attente',
      localisation: 'Réception',
      circuit: 'Ordinaire',
      agentMatricule,
      agentLogin,
      agentName,
      createdAt: daysAgoIso(12),
      date_enreg: daysAgoIso(12),
    },
  ]
}

export function buildSeedForConnectedAgent() {
  return buildNouveauDossierReceptionSeed(getConnectedAgentContext())
}
