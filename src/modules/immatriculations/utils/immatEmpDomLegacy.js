/**
 * FormData legacy — tele_imma_employeur0 / POST ../GererEmployeur
 */
import { centres } from 'src/modules/shared/data/Centres.js'
import { impots as rawImpots } from 'src/modules/shared/data/Impots.js'
import { pieces as rawPieces } from 'src/modules/shared/data/Pieces.js'
import { pays as rawPays } from 'src/modules/shared/data/Pays.js'
import { arrondissements as rawArrondissements } from 'src/modules/shared/data/Arrondissements.js'
import { compareDates } from 'src/modules/immatriculations/utils/immatAssuTrvLegacy.js'
import { toLegacySexe } from 'src/modules/immatriculations/utils/immatLegacyCommon.js'
import { createImmatEmpProReferentialContext } from 'src/modules/immatriculations/utils/immatEmpProReferentials.js'
import {
  CAUSE_IMMA_OPTIONS,
  CIRCUIT_DOSSIER_OPTIONS,
  IMMAT_EMP_DOM_CODE_GPE_RISQUE,
  IMMAT_EMP_DOM_CODE_REGIME,
  IMMAT_EMP_DOM_OBJET,
  IMMAT_EMP_DOM_PIECE,
  IMMAT_EMP_DOM_TYPE_EMPLOYEUR,
} from 'src/modules/immatriculations/data/immatEmpDomLegacyFields.js'

function resolveReferentialContext(referentials) {
  if (referentials?.arrondissements?.length) {
    return createImmatEmpProReferentialContext(referentials)
  }
  return createImmatEmpProReferentialContext({
    arrondissements: rawArrondissements,
    impots: rawImpots,
    pays: rawPays,
    pieces: rawPieces,
    centres,
  })
}

function appendScalar(fd, key, value) {
  if (value === null || value === undefined || value === '') return
  fd.append(key, String(value))
}

function normalizeLaction(value) {
  const raw = String(value || '').trim()
  if (!raw || /^cr[eéè]er$/i.test(raw)) return 'Creer'
  if (/^modif/i.test(raw)) return 'Modifier'
  return raw
}

/**
 * @param {Record<string, unknown>} form
 * @param {object} [referentials]
 */
export function syncImmatEmpDomHiddenFields(form, referentials) {
  const ctx = resolveReferentialContext(referentials)

  form.TYPE_EMPLOYEUR = IMMAT_EMP_DOM_TYPE_EMPLOYEUR
  form.CODE_REGIME = IMMAT_EMP_DOM_CODE_REGIME
  form.CODE_GPE_RISQUE = IMMAT_EMP_DOM_CODE_GPE_RISQUE
  form.objet = IMMAT_EMP_DOM_OBJET
  form.laction = normalizeLaction(form.laction)

  const causeOpt = CAUSE_IMMA_OPTIONS.find((o) => o.value === String(form.CAUSE_IMMA))
  form.CAUSEIMMA = form.CAUSE_IMMA ?? causeOpt?.value ?? '0'

  const circuitOpt = CIRCUIT_DOSSIER_OPTIONS.find((o) => o.value === String(form.CIRCUIT_DOSSIER))
  form.CIRCUITDOSSIER = form.CIRCUIT_DOSSIER ?? circuitOpt?.value ?? '3'

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

  const arrRes = ctx.byCode(ctx.arrondissements, 'CODE_ARROND', form.CODE_ARRONDC)
  if (arrRes) {
    form.CODE_ARROND = arrRes.CODE_ARROND
    form.CODE_DEPA = arrRes.CODE_DEPA
    form.CODE_REGION = arrRes.CODE_REGION
    form.CODE_PAYS = arrRes.CODE_PAYS
  }

  const nat = ctx.byCode(ctx.pays, 'code_pays', form.NATIONALITEC)
  if (nat?.code_pays) {
    form.NATIONALITE = nat.code_pays
    form.NATIONALITEC = nat.nationalite
  } else if (typeof form.NATIONALITEC === 'string') {
    const p = ctx.pays.find((x) => x.nationalite === form.NATIONALITEC)
    if (p) form.NATIONALITE = p.code_pays
  }

  const tp = ctx.byCode(ctx.pieces, 'NUM_TYPEPIECE', form.NUM_TYPEPIECE)
  if (tp) {
    form.NUM_TYPEPIECE = tp.NUM_TYPEPIECE
    form.typepiece = tp.LIBELLE
  } else if (typeof form.typepiece === 'object' && form.typepiece?.NUM_TYPEPIECE) {
    form.NUM_TYPEPIECE = form.typepiece.NUM_TYPEPIECE
    form.typepiece = form.typepiece.LIBELLE
  }

  const imp = ctx.byCode(ctx.impots, 'CODE_CENTREIMPOT', form.CODE_CENTREIMPOTC)
  if (imp) {
    form.CODE_CENTREIMPOT = imp.CODE_CENTREIMPOT
    form.CODE_CENTREIMPOTC = imp.ABREVIATION
    if (!form._cnpsManual && imp.CODE_CENTRECNPS) {
      form.CODE_CENTRECNPS = imp.CODE_CENTRECNPS
      form.CODE_CENTRECNPSC = imp.LIB_CENTRECNPS || form.CODE_CENTRECNPSC
    }
  }

  const ctr = ctx.byCode(ctx.centres, 'CODE_CENTRE', form.CODE_CENTRECNPSC)
  if (ctr) {
    form.CODE_CENTRECNPS = ctr.CODE_CENTRE
    form.CODE_CENTRECNPSC = ctr.LIB_CENTRE
  }

  form.SEXE_PERSEMPL = toLegacySexe(form.SEXE_PERSEMPL)
}

/**
 * Validations métier imma_employeur0.js (handler Valider).
 * @returns {string|null} message d'erreur ou null
 */
export function validateImmatEmpDomBusinessRules(form) {
  const today = new Date()

  if (form.DATE_DEB_SERVICE && form.DATE_EFFET && compareDates(form.DATE_DEB_SERVICE, form.DATE_EFFET) > 0) {
    return 'Erreur : La date debut service est superieure a la date recrutement premier salarie'
  }
  if (form.DATE_EFFET && compareDates(today, form.DATE_EFFET) < 0) {
    return 'Erreur : La date recrutement du premier salarie est posterieure a la du jour'
  }
  if (form.DATE_DEB_SERVICE && compareDates(today, form.DATE_DEB_SERVICE) < 0) {
    return 'Erreur : La date debut service est posterieure a la du jour'
  }
  if (form.DATE_NAISS_PERSEMPL && compareDates(today, form.DATE_NAISS_PERSEMPL) < 0) {
    return 'Erreur : La date de naissance promoteur est posterieure a la du jour'
  }
  if (form.DATE_PIECE && compareDates(today, form.DATE_PIECE) < 0) {
    return "Erreur : La date de delivrance de la piece d'identite est posterieure a la du jour"
  }
  return null
}

/**
 * @param {Record<string, unknown>} form
 * @param {Record<string, File|null>} files
 * @param {{ codeTele?: string, codeSecret?: string, dest?: string, referentials?: object }} [options]
 */
export function buildImmatEmpDomLegacyFormData(form, files, options = {}) {
  const ctx = resolveReferentialContext(options.referentials)
  syncImmatEmpDomHiddenFields(form, options.referentials)
  const fd = new FormData()

  appendScalar(fd, 'TYPE_EMPLOYEUR', form.TYPE_EMPLOYEUR)
  appendScalar(fd, 'laction', form.laction)
  appendScalar(fd, 'code_tele', options.codeTele || form.code_tele || '')
  appendScalar(fd, 'code_secret', options.codeSecret || form.code_secret || '')
  appendScalar(fd, 'CODE_REGIME', form.CODE_REGIME)
  appendScalar(fd, 'CODE_GPE_RISQUE', form.CODE_GPE_RISQUE)
  appendScalar(fd, 'CAUSEIMMA', form.CAUSEIMMA)
  appendScalar(fd, 'CAUSE_IMMA', form.CAUSE_IMMA)
  appendScalar(fd, 'CIRCUITDOSSIER', form.CIRCUITDOSSIER)
  appendScalar(fd, 'CIRCUIT_DOSSIER', form.CIRCUIT_DOSSIER)
  appendScalar(fd, 'objet', form.objet)

  appendScalar(fd, 'NOM_PERSEMPL', form.NOM_PERSEMPL)
  appendScalar(fd, 'PRENOM_PERSEMPL', form.PRENOM_PERSEMPL)
  appendScalar(fd, 'DATE_NAISS_PERSEMPL', form.DATE_NAISS_PERSEMPL)
  appendScalar(fd, 'LOCALITE_NAISS_PERSEMPL', form.LOCALITE_NAISS_PERSEMPL)
  appendScalar(fd, 'CODE_PAYS_NAISSEMPL', form.CODE_PAYS_NAISSEMPL)
  appendScalar(fd, 'CODE_REGION_NAISSEMPL', form.CODE_REGION_NAISSEMPL)
  appendScalar(fd, 'CODE_DEPA_NAISSEMPL', form.CODE_DEPA_NAISSEMPL)
  appendScalar(fd, 'LIEU_NAISS_PERSEMPL', form.LIEU_NAISS_PERSEMPL)
  appendScalar(fd, 'LieuNaissPe', ctx.arrondLabel(form.LieuNaissPe))
  appendScalar(fd, 'NATIONALITE', form.NATIONALITE)
  appendScalar(fd, 'NATIONALITEC', ctx.paysNationaliteLabel(form.NATIONALITEC))
  appendScalar(fd, 'PROFESSION', form.PROFESSION)
  appendScalar(fd, 'SEXE_PERSEMPL', form.SEXE_PERSEMPL)
  appendScalar(fd, 'NUM_TYPEPIECE', form.NUM_TYPEPIECE)
  appendScalar(fd, 'typepiece', form.typepiece)
  appendScalar(fd, 'NUM_PIECE', form.NUM_PIECE)
  appendScalar(fd, 'DATE_PIECE', form.DATE_PIECE)
  appendScalar(fd, 'CODE_PAYS_PIECE', form.CODE_PAYS_PIECE)
  appendScalar(fd, 'CODE_REGION_PIECE', form.CODE_REGION_PIECE)
  appendScalar(fd, 'CODE_DEPA_PIECE', form.CODE_DEPA_PIECE)
  appendScalar(fd, 'LIEU_PIECEC', ctx.arrondLabel(form.LIEU_PIECEC))
  appendScalar(fd, 'LIEU_PIECE', form.LIEU_PIECE)

  appendScalar(fd, 'ADRESSE_EMPL', form.ADRESSE_EMPL)
  appendScalar(fd, 'BOITE_POSTALE', form.BOITE_POSTALE)
  appendScalar(fd, 'TEL', form.TEL)
  appendScalar(fd, 'TEL_PERSEMPL', form.TEL_PERSEMPL)
  appendScalar(fd, 'EMAIL', form.EMAIL)
  appendScalar(fd, 'CODE_ARRONDC', ctx.arrondLabel(form.CODE_ARRONDC))
  appendScalar(fd, 'CODE_ARROND', form.CODE_ARROND)
  appendScalar(fd, 'CODE_PAYS', form.CODE_PAYS)
  appendScalar(fd, 'CODE_REGION', form.CODE_REGION)
  appendScalar(fd, 'CODE_DEPA', form.CODE_DEPA)
  appendScalar(fd, 'NOM_QUARTIER', form.NOM_QUARTIER)
  appendScalar(fd, 'LIEUDIT_EMPL', form.LIEUDIT_EMPL)
  appendScalar(fd, 'num_case', form.num_case)
  appendScalar(fd, 'NBRE_EMPL', form.NBRE_EMPL)
  appendScalar(fd, 'DATE_DEB_SERVICE', form.DATE_DEB_SERVICE)
  appendScalar(fd, 'DATE_EFFET', form.DATE_EFFET)
  appendScalar(fd, 'CODE_CENTREIMPOT', form.CODE_CENTREIMPOT)
  appendScalar(fd, 'CODE_CENTREIMPOTC', ctx.impotLabel(form.CODE_CENTREIMPOTC))
  appendScalar(fd, 'CODE_CENTRECNPS', form.CODE_CENTRECNPS)
  appendScalar(fd, 'CODE_CENTRECNPSC', ctx.cnpsLabel(form.CODE_CENTRECNPSC))
  appendScalar(fd, 'Dest', options.dest || form.Dest || '')

  appendScalar(fd, 'valider', form.validation === true || form.validation === '1' ? '1' : '0')
  appendScalar(fd, 'etatValid', form.validation === true || form.validation === '1' ? '1' : '0')

  const pieceIdentite =
    files.fichierIdentiteEmployeur ?? files.pieceIdentite ?? files.fichierIdentiteResponsable
  const planLocalisation = files.IDPLANLOCAL ?? files.planLocalisation
  const listeTravailleurs = files.IDLISTTRAV ?? files.listeTravailleurs

  if (pieceIdentite && form.NUM_TYPEPIECE) {
    fd.append(String(form.NUM_TYPEPIECE), pieceIdentite, pieceIdentite.name)
  }
  if (planLocalisation) {
    fd.append(IMMAT_EMP_DOM_PIECE.PLAN_LOCALISATION, planLocalisation, planLocalisation.name)
  }
  if (listeTravailleurs) {
    fd.append(IMMAT_EMP_DOM_PIECE.LISTE_TRAVAILLEURS, listeTravailleurs, listeTravailleurs.name)
  }

  return fd
}
