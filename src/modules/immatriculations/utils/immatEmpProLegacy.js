import { compareDates } from 'src/modules/immatriculations/utils/immatAssuTrvLegacy.js'
import { toLegacySexe, appendLegacyFormField } from 'src/modules/immatriculations/utils/immatLegacyCommon.js'
import { createImmatEmpProReferentialContext } from 'src/modules/immatriculations/utils/immatEmpProReferentials.js'
import {
  CAUSE_IMMA_OPTIONS,
  CIRCUIT_DOSSIER_OPTIONS,
  IMMAT_EMP_PRO_OBJET,
  IMMAT_EMP_PRO_PIECES,
  IMMAT_EMP_PRO_TYPE_EMPLOYEUR,
} from 'src/modules/immatriculations/data/immatEmpProLegacyFields.js'

function appendScalar(fd, key, value) {
  appendLegacyFormField(fd, key, value)
}

/**
 * Remplit les champs cachés (codes) ; les combos UI gardent des codes en v-model.
 * @param {object} form
 * @param {object} [referentials] — listes JSP (arrondissements, activites, …)
 */
export function syncImmatEmpProHiddenFields(form, referentials) {
  const ctx = createImmatEmpProReferentialContext(referentials)

  form.TYPE_EMPLOYEUR = IMMAT_EMP_PRO_TYPE_EMPLOYEUR
  form.objet = IMMAT_EMP_PRO_OBJET
  form.laction = form.laction || 'Creer'

  form.CAUSEIMMA = form.CAUSE_IMMA || '0'
  form.CIRCUITDOSSIER = form.CIRCUIT_DOSSIER || '3'

  const natJur = ctx.byCode(ctx.formeJuridique, 'CODE_NATUREJUR', form.NATURE_JURC)
  if (natJur) form.CODE_NATUREJUR = natJur.CODE_NATUREJUR

  const act = ctx.byCode(ctx.activites, 'CODE_SECT_ACTIVITE', form.CODE_SECT_ACTIVITEC)
  if (act) {
    form.CODE_SECT_ACTIVITE = act.CODE_SECT_ACTIVITE
    form.CODE_REGIME = act.CODE_REGIME_CNPS
    form.CODE_GPE_RISQUE = act.CODE_GPE_RISQUE
    form.A_VERIFIER = act.A_VERIFIER ?? ''
  }

  const ci = ctx.byCode(ctx.impots, 'CODE_CENTREIMPOT', form.CODE_CENTREIMPOTC)
  if (ci) {
    form.CODE_CENTREIMPOT = ci.CODE_CENTREIMPOT
    if (!form._cnpsManual && ci.CODE_CENTRECNPS) {
      form.CODE_CENTRECNPS = ci.CODE_CENTRECNPS
    }
  }

  const cnps = ctx.byCode(ctx.centres, 'CODE_CENTRE', form.CODE_CENTRECNPSC)
  if (cnps) {
    form.CODE_CENTRECNPS = cnps.CODE_CENTRE
  }

  const arr = ctx.byCode(ctx.arrondissements, 'CODE_ARROND', form.CODE_ARRONDC)
  if (arr) {
    form.CODE_ARROND = arr.CODE_ARROND
    form.CODE_DEPA = arr.CODE_DEPA
    form.CODE_REGION = arr.CODE_REGION
    form.CODE_PAYS = arr.CODE_PAYS
  }

  const arrNaiss = ctx.byCode(ctx.arrondissements, 'CODE_ARROND', form.LieuNaissPe)
  if (arrNaiss) {
    form.LIEU_NAISS_PERSEMPL = arrNaiss.CODE_ARROND
    form.CODE_DEPA_NAISSEMPL = arrNaiss.CODE_DEPA
    form.CODE_REGION_NAISSEMPL = arrNaiss.CODE_REGION
    form.CODE_PAYS_NAISSEMPL = arrNaiss.CODE_PAYS
  }

  const arrPiece = ctx.byCode(ctx.arrondissements, 'CODE_ARROND', form.LIEU_PIECEC)
  if (arrPiece) {
    form.LIEU_PIECE = arrPiece.CODE_ARROND
    form.CODE_DEPA_PIECE = arrPiece.CODE_DEPA
    form.CODE_REGION_PIECE = arrPiece.CODE_REGION
    form.CODE_PAYS_PIECE = arrPiece.CODE_PAYS
  }

  const p = ctx.byCode(ctx.pays, 'code_pays', form.NATIONALITEC)
  if (p) form.NATIONALITE = p.code_pays

  const tp = ctx.byCode(ctx.pieces, 'NUM_TYPEPIECE', form.NUM_TYPEPIECE)
  if (tp) form.typepiece = tp.LIBELLE
}

/** Validations métier legacy (avant POST) — messages alignés imma_employeur1.js */
export function validateImmatEmpProBusinessRules(form) {
  const today = new Date()

  if (form.DATE_EFFET && compareDates(form.DATE_DEB_SERVICE, form.DATE_EFFET) > 0) {
    return 'Erreur : La date debut service est posterieure a la date recrutement premier salarie'
  }
  if (form.DATE_EFFET && compareDates(today, form.DATE_EFFET) < 0) {
    return 'Erreur : La date recrutement du premier salarie est posterieure a la du jour'
  }
  if (form.DATE_DEB_SERVICE && compareDates(today, form.DATE_DEB_SERVICE) < 0) {
    return 'Erreur : La date debut service est posterieure a la du jour'
  }
  if (form.date_creation_empl && compareDates(today, form.date_creation_empl) < 0) {
    return "Erreur : La date de creation entreprise est posterieure a la du jour"
  }
  if (form.DATE_NAISS_PERSEMPL && compareDates(today, form.DATE_NAISS_PERSEMPL) < 0) {
    return 'Erreur : La date de naissance promoteur est posterieure a la du jour'
  }
  if (form.DATE_PIECE && compareDates(today, form.DATE_PIECE) < 0) {
    return "Erreur : La date de delivrance de la piece d'identite est posterieure a la du jour"
  }
  if (String(form.A_VERIFIER ?? '') !== '0' && !form.num_registre) {
    return "Numero registre de commerce non renseigne (exige pour votre activite)"
  }
  if (!form.date_creation_empl && form.num_registre) {
    return 'Date de creation au registre de commerce non renseignee'
  }
  if (String(form.A_VERIFIER ?? '') === '0' && !form.num_contr) {
    return 'Numero contribuable non renseigne'
  }
  return null
}

/**
 * FormData — noms de champs identiques au formulaire ExtJS (name= / id=).
 * @param {object} form
 * @param {object} files
 * @param {{ dest?: string, codeTele?: string, codeSecret?: string, referentials?: object }} [options]
 */
export function buildImmatEmpProLegacyFormData(form, files, options = {}) {
  const ctx = createImmatEmpProReferentialContext(options.referentials)
  syncImmatEmpProHiddenFields(form, options.referentials)
  const fd = new FormData()

  appendScalar(fd, 'TYPE_EMPLOYEUR', form.TYPE_EMPLOYEUR)
  appendScalar(fd, 'laction', form.laction)
  appendScalar(fd, 'code_tele', options.codeTele || form.code_tele || '')
  appendScalar(fd, 'code_secret', options.codeSecret || form.code_secret || '')
  appendScalar(fd, 'objet', form.objet)
  appendScalar(fd, 'Dest', options.dest || form.Dest || '')
  appendScalar(fd, 'CAUSE_IMMA', form.CAUSE_IMMA)
  appendScalar(fd, 'CAUSEIMMA', form.CAUSEIMMA)
  appendScalar(fd, 'CIRCUIT_DOSSIER', form.CIRCUIT_DOSSIER)
  appendScalar(fd, 'CIRCUITDOSSIER', form.CIRCUITDOSSIER)

  appendScalar(fd, 'RAISON_SOCIALE', form.RAISON_SOCIALE)
  appendScalar(fd, 'NOM_COMMERCIAL', form.NOM_COMMERCIAL)
  appendScalar(fd, 'Sigle', form.Sigle)
  appendScalar(fd, 'CODE_ARROND', form.CODE_ARROND)
  appendScalar(fd, 'CODE_ARRONDC', ctx.arrondLabel(form.CODE_ARRONDC))
  appendScalar(fd, 'CODE_DEPA', form.CODE_DEPA)
  appendScalar(fd, 'CODE_REGION', form.CODE_REGION)
  appendScalar(fd, 'CODE_PAYS', form.CODE_PAYS)
  appendScalar(fd, 'BOITE_POSTALE', form.BOITE_POSTALE)
  appendScalar(fd, 'ADRESSE_EMPL', form.ADRESSE_EMPL)
  appendScalar(fd, 'NOM_QUARTIER', form.NOM_QUARTIER)
  appendScalar(fd, 'LIEUDIT_EMPL', form.LIEUDIT_EMPL)
  appendScalar(fd, 'num_case', form.num_case)
  appendScalar(fd, 'EMAIL', form.EMAIL)
  appendScalar(fd, 'TEL', form.TEL)
  appendScalar(fd, 'AUTRE_CONTACT', form.AUTRE_CONTACT)
  appendScalar(fd, 'DATE_DEB_SERVICE', form.DATE_DEB_SERVICE)
  appendScalar(fd, 'date_creation_empl', form.date_creation_empl)
  appendScalar(fd, 'DATE_EFFET', form.DATE_EFFET)
  appendScalar(fd, 'num_registre', form.num_registre)
  appendScalar(fd, 'num_contr', form.num_contr)
  appendScalar(fd, 'NUM_EMPL_SIEGE', form.NUM_EMPL_SIEGE)
  appendScalar(fd, 'RAISON_SOCIALE_SIEGE', form.RAISON_SOCIALE_SIEGE)
  appendScalar(fd, 'NOM_COMMERCIAL_SIEGE', form.NOM_COMMERCIAL_SIEGE)

  appendScalar(fd, 'CODE_NATUREJUR', form.CODE_NATUREJUR)
  appendScalar(fd, 'NATURE_JURC', ctx.natJurLabel(form.NATURE_JURC))
  appendScalar(fd, 'CODE_SECT_ACTIVITE', form.CODE_SECT_ACTIVITE)
  appendScalar(fd, 'CODE_SECT_ACTIVITEC', ctx.activiteLabel(form.CODE_SECT_ACTIVITEC))
  appendScalar(fd, 'CODE_REGIME', form.CODE_REGIME)
  appendScalar(fd, 'CODE_GPE_RISQUE', form.CODE_GPE_RISQUE)
  appendScalar(fd, 'A_VERIFIER', form.A_VERIFIER)
  appendScalar(fd, 'NBRE_EMPL', form.NBRE_EMPL)
  appendScalar(fd, 'CODE_CENTREIMPOT', form.CODE_CENTREIMPOT)
  appendScalar(fd, 'CODE_CENTREIMPOTC', ctx.impotLabel(form.CODE_CENTREIMPOTC))
  appendScalar(fd, 'CODE_CENTRECNPS', form.CODE_CENTRECNPS)
  appendScalar(fd, 'CODE_CENTRECNPSC', ctx.cnpsLabel(form.CODE_CENTRECNPSC))

  appendScalar(fd, 'NOM_PERSEMPL', form.NOM_PERSEMPL)
  appendScalar(fd, 'PRENOM_PERSEMPL', form.PRENOM_PERSEMPL)
  appendScalar(fd, 'DATE_NAISS_PERSEMPL', form.DATE_NAISS_PERSEMPL)
  appendScalar(fd, 'LOCALITE_NAISS_PERSEMPL', form.LOCALITE_NAISS_PERSEMPL)
  appendScalar(fd, 'LIEU_NAISS_PERSEMPL', form.LIEU_NAISS_PERSEMPL)
  appendScalar(fd, 'LieuNaissPe', ctx.arrondLabel(form.LieuNaissPe))
  appendScalar(fd, 'CODE_PAYS_NAISSEMPL', form.CODE_PAYS_NAISSEMPL)
  appendScalar(fd, 'CODE_REGION_NAISSEMPL', form.CODE_REGION_NAISSEMPL)
  appendScalar(fd, 'CODE_DEPA_NAISSEMPL', form.CODE_DEPA_NAISSEMPL)
  appendScalar(fd, 'SEXE_PERSEMPL', toLegacySexe(form.SEXE_PERSEMPL))
  appendScalar(fd, 'TEL_PERSEMPL', form.TEL_PERSEMPL)
  appendScalar(fd, 'BP_PERSEMPL', form.BP_PERSEMPL)
  appendScalar(fd, 'ADR_PERSEMPL', form.ADR_PERSEMPL)
  appendScalar(fd, 'EMAIL_PERSEMPL', form.EMAIL_PERSEMPL)
  appendScalar(fd, 'NATIONALITE', form.NATIONALITE)
  appendScalar(fd, 'NATIONALITEC', ctx.paysNationaliteLabel(form.NATIONALITEC))
  appendScalar(fd, 'NUM_TYPEPIECE', form.NUM_TYPEPIECE)
  appendScalar(fd, 'typepiece', form.typepiece)
  appendScalar(fd, 'NUM_PIECE', form.NUM_PIECE)
  appendScalar(fd, 'DATE_PIECE', form.DATE_PIECE)
  appendScalar(fd, 'LIEU_PIECEC', ctx.arrondLabel(form.LIEU_PIECEC))
  appendScalar(fd, 'LIEU_PIECE', form.LIEU_PIECE)
  appendScalar(fd, 'CODE_PAYS_PIECE', form.CODE_PAYS_PIECE)
  appendScalar(fd, 'CODE_REGION_PIECE', form.CODE_REGION_PIECE)
  appendScalar(fd, 'CODE_DEPA_PIECE', form.CODE_DEPA_PIECE)

  appendScalar(fd, 'valider', form.validation === true || form.validation === '1' ? '1' : '0')
  appendScalar(fd, 'etatValid', form.validation === true || form.validation === '1' ? '1' : '0')

  if (files.IDREGICOMM) {
    fd.append(IMMAT_EMP_PRO_PIECES.REGISTRE_COMMERCE, files.IDREGICOMM, files.IDREGICOMM.name)
  }
  if (files.IDAUTORISATION) {
    fd.append(
      IMMAT_EMP_PRO_PIECES.AUTORISATION_OUVERTURE,
      files.IDAUTORISATION,
      files.IDAUTORISATION.name,
    )
  }
  if (files.IDCONTRIBUABLE) {
    fd.append(
      IMMAT_EMP_PRO_PIECES.CARTE_CONTRIBUABLE,
      files.IDCONTRIBUABLE,
      files.IDCONTRIBUABLE.name,
    )
  }
  if (files.IDSTATUTS) {
    fd.append(IMMAT_EMP_PRO_PIECES.STATUTS, files.IDSTATUTS, files.IDSTATUTS.name)
  }
  if (files.IDPLANLOCAL) {
    fd.append(IMMAT_EMP_PRO_PIECES.PLAN_LOCALISATION, files.IDPLANLOCAL, files.IDPLANLOCAL.name)
  }
  if (files.IDCONTRATBAIL) {
    fd.append(IMMAT_EMP_PRO_PIECES.CONTRAT_BAIL, files.IDCONTRATBAIL, files.IDCONTRATBAIL.name)
  }
  if (files.IDLISTTRAV) {
    fd.append(
      IMMAT_EMP_PRO_PIECES.LISTE_TRAVAILLEURS,
      files.IDLISTTRAV,
      files.IDLISTTRAV.name,
    )
  }
  if (files.IDPATENTE) {
    fd.append(IMMAT_EMP_PRO_PIECES.PATENTE, files.IDPATENTE, files.IDPATENTE.name)
  }
  if (files.IDIMPOT) {
    fd.append(IMMAT_EMP_PRO_PIECES.IMPOT_LIBERATOIRE, files.IDIMPOT, files.IDIMPOT.name)
  }
  if (files.fichierIdentiteResponsable && form.NUM_TYPEPIECE) {
    fd.append(
      String(form.NUM_TYPEPIECE),
      files.fichierIdentiteResponsable,
      files.fichierIdentiteResponsable.name,
    )
  }

  return fd
}

export function getCauseImmaOptions() {
  return CAUSE_IMMA_OPTIONS
}

export function getCircuitDossierOptions() {
  return CIRCUIT_DOSSIER_OPTIONS
}
