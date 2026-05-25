/** Codes métier des types de dépôt PF (assuré connecté). */
export const DEPOT_PF_TYPE_CODES = {
  EXAMENS_PRENATAUX: 'depot_pf_examens_prenataux',
  ACCOUCHEMENT: 'depot_pf_accouchement',
  CONGES_MATERNITE: 'depot_pf_conges_maternite',
  ALLOCATIONS_FAMILIALES: 'depot_pf_allocations_familiales',
}

/** Anciens identifiants numériques (dossiers.vue) → code métier. */
export const LEGACY_PRESTATION_ID_TO_CODE = {
  11: DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX,
  12: DEPOT_PF_TYPE_CODES.ACCOUCHEMENT,
  13: DEPOT_PF_TYPE_CODES.CONGES_MATERNITE,
  14: DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES,
}

export function listDepotPfTypesForAssure(t, assureSexe) {
  const all = [
    {
      code: DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX,
      legacyId: 11,
      label: t('inputassu.remboursement_examens_prenataux'),
      description: t('inputassu.remboursement_examens_prenataux_desc'),
      icon: 'pregnant_woman',
    },
    {
      code: DEPOT_PF_TYPE_CODES.ACCOUCHEMENT,
      legacyId: 12,
      label: t('inputassu.remboursement_frais_accouchement'),
      description: t('inputassu.remboursement_frais_accouchement_desc'),
      icon: 'child_care',
    },
    {
      code: DEPOT_PF_TYPE_CODES.CONGES_MATERNITE,
      legacyId: 13,
      label: t('inputassu.prise_en_charge_conges_maternite'),
      description: t('inputassu.prise_en_charge_conges_maternite_desc'),
      icon: 'baby_changing_station',
      femaleOnly: true,
    },
    {
      code: DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES,
      legacyId: 14,
      label: t('inputassu.allocations_familiales'),
      description: t('inputassu.allocations_familiales_desc'),
      icon: 'group',
    },
  ]

  if (assureSexe && assureSexe !== 'F') {
    return all.filter((item) => !item.femaleOnly)
  }
  return all
}

/**
 * Lignes du tableau de référence des prestations familiales (affichage assuré).
 * @param {import('vue-i18n').ComposerTranslation} t
 * @param {string} [assureSexe]
 */
export function listDepotPfTypesReferenceRows(t, assureSexe) {
  return listDepotPfTypesForAssure(t, assureSexe).map((item) => ({
    code: item.code,
    legacyId: item.legacyId,
    icon: item.icon,
    label: item.label,
    description: item.description,
    eligibility: item.femaleOnly
      ? t('modules.assure.depotPf.typesTable.eligibilityFemale')
      : t('modules.assure.depotPf.typesTable.eligibilityAll'),
    documents: t(`modules.assure.depotPf.typesTable.documents.${item.code}`),
  }))
}
