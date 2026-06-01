import { selectSmig } from 'src/modules/immatriculations/utils/selectSmig.js'

/**
 * Applique les données employeur (toutesentreprises.jsp) sur le formulaire régime 0.
 * @param {object} form — objet réactif formulaire
 * @param {Record<string, string>} employer — première ligne ou ligne sélectionnée
 * @param {Record<string, string>[]} [allRows] — lignes SMIG
 * @param {string|null} [hireDate] — DATE_EMB_PRE_SALL pour calcul SMIG
 * @returns {{ warning?: string }}
 */
export function applyEmployerToForm(form, employer, allRows = [], hireDate = null) {
  if (!employer) return {}

  form.NOM_COMMERCIAL = employer.NOM_COMMERCIAL || form.NOM_COMMERCIAL
  form.RAISON_SOCIALE = employer.RAISON_SOCIALE || form.RAISON_SOCIALE
  form.ADRESSE_EMPLOYEUR = employer.ADRESSE_EMPLOYEUR || form.ADRESSE_EMPLOYEUR
  form.DATE_EMB_PREM_TRAV = employer.DATE_EMB_PREM_SAL || form.DATE_EMB_PREM_TRAV

  const rows = allRows.length ? allRows : [employer]
  const smigDate = hireDate || form.DATE_EMB_PRE_SALL
  if (smigDate && rows.length) {
    form.SMIG_VALUE = selectSmig(rows, smigDate)
  } else if (employer.SMIG) {
    form.SMIG_VALUE = Number(employer.SMIG)
  }

  let warning
  if (employer.POSITION && employer.POSITION !== '1') {
    warning = employer.LIB_POSITION
      ? `Cet employeur est ${employer.LIB_POSITION}`
      : "La position de l'employeur n'est pas active."
  }

  return { warning }
}
