/**
 * Noms de champs alignés sur EnergizerDev (lib/*.js, servlets cm.sapelli.*).
 */
import {
  formatLegacyDate,
  toLegacyString,
  toLegacyUppercase,
  buildLegacySearchParams,
} from 'src/modules/energizer/utils/liquidationLegacyUtils.js'

export { buildLegacySearchParams as buildRpSearchApiParams }

/** POST /declaration — lib/declaration.js */
export const RP_DECLARATION_SUBMIT_FIELDS = [
  'numdossier',
  'objet',
  'numassu',
  'nom',
  'emploiassure',
  'datedeces',
  'txipp',
  'numemployeur',
  'nomemployeur',
  'datedeclaration',
  'datedepot',
  'observation',
  'postetravail',
  'codeposte',
  'codetyperisque',
  'coderisque',
  'datesurvenance',
  'heuresurvenance',
  'lieuaccident',
  'arrondissement',
  'quartier',
  'adresse',
  'causes',
  'consequences',
  'codesiegelesion',
  'codesiegel',
  'siegelesion',
  'codenatlesion',
  'codenaturel',
  'naturelesion',
  'ancienneteposte',
  'flagformation',
  'agentmateriel',
  'codeagentmat',
  'temoin1',
  'identite1',
  'temoin2',
  'identite2',
  'temoin3',
  'identite3',
  'flaghospitalisation',
  'lieuhospitalisation',
  'flag',
  'flagarrettravail',
  'flagdecesimmediat',
  'categorie',
  'echelon',
  'secteur',
  'zone',
  'periode1',
  'montant1',
  'periode2',
  'montant2',
  'periode3',
  'montant3',
  'salrecons',
  'flagretarrerage',
  'montantretenue',
  'ippold',
  'rmmold',
  'renteold',
  'allocationold',
  'nomtiers',
  'orgassureur',
  'numpolice',
  'immatriculation',
  'adresseassureur',
  'boitepostale',
  'telephone',
]

/**
 * @param {Record<string, unknown>} form
 * @returns {Record<string, string | number>}
 */
export function buildRpDeclarationApiPayload(form) {
  return {
    numdossier: toLegacyString(form.numdossier),
    objet: toLegacyString(form.objet),
    numassu: toLegacyString(form.numassu),
    nom: toLegacyString(form.nom),
    emploiassure: toLegacyString(form.emploiassure),
    datedeces: formatLegacyDate(form.datedeces),
    txipp: toLegacyString(form.txipp),
    numemployeur: toLegacyString(form.numemployeur),
    nomemployeur: toLegacyString(form.nomemployeur),
    datedeclaration: formatLegacyDate(form.datedeclaration),
    datedepot: formatLegacyDate(form.datedepot),
    observation: toLegacyString(form.observation),
    postetravail: toLegacyString(form.postetravail),
    codeposte: toLegacyString(form.codepostetravail ?? form.codeposte),
    codetyperisque: toLegacyString(form.risquetravail ?? form.codetyperisque),
    coderisque: toLegacyString(form.coderisquetravail ?? form.coderisque),
    datesurvenance: formatLegacyDate(form.dateaccident ?? form.datesurvenance),
    heuresurvenance: toLegacyString(form.heuresurvenance),
    lieuaccident: toLegacyString(form.lieuaccident),
    arrondissement: toLegacyString(form.arrondissement),
    quartier: toLegacyString(form.quartier),
    adresse: toLegacyString(form.adresse),
    causes: toLegacyString(form.causes),
    consequences: toLegacyString(form.consequences),
    codesiegelesion: toLegacyString(form.codesiegelesion),
    codesiegel: toLegacyString(form.codesiegel),
    siegelesion: toLegacyString(form.slesion ?? form.siegelesion),
    codenatlesion: toLegacyString(form.codenatlesion),
    codenaturel: toLegacyString(form.codenaturel),
    naturelesion: toLegacyString(form.nlesion ?? form.naturelesion),
    ancienneteposte: toLegacyString(form.anciennete ?? form.ancienneteposte),
    flagformation: toLegacyString(form.flagformation),
    agentmateriel: toLegacyString(form.agentmateriel),
    codeagentmat: toLegacyString(form.codeagentmat),
    temoin1: toLegacyString(form.temoin1),
    identite1: toLegacyString(form.identite1),
    temoin2: toLegacyString(form.temoin2),
    identite2: toLegacyString(form.identite2),
    temoin3: toLegacyString(form.temoin3),
    identite3: toLegacyString(form.identite3),
    flaghospitalisation: toLegacyString(form.flaghospitalisation),
    lieuhospitalisation: toLegacyString(form.lieuhospitalisation),
    flag: toLegacyString(form.flag),
    flagarrettravail: toLegacyString(form.flagarrettravail),
    flagdecesimmediat: toLegacyString(form.flagdecesimmediat),
    categorie: toLegacyString(form.categorie),
    echelon: toLegacyString(form.echelon),
    secteur: toLegacyString(form.secteur),
    zone: toLegacyString(form.zone),
    periode1: toLegacyString(form.periode1),
    montant1: form.montant1 ?? '',
    periode2: toLegacyString(form.periode2),
    montant2: form.montant2 ?? '',
    periode3: toLegacyString(form.periode3),
    montant3: form.montant3 ?? '',
    salrecons: form.salrecons ?? '',
    flagretarrerage: toLegacyString(form.flagretarrerage),
    montantretenue: form.montantretenue ?? '',
    ippold: form.ippold ?? '',
    rmmold: form.rmmold ?? '',
    renteold: form.renteold ?? '',
    allocationold: form.allocationold ?? '',
    nomtiers: toLegacyString(form.nomtiers),
    orgassureur: toLegacyString(form.orgassureur),
    numpolice: toLegacyString(form.numpolice),
    immatriculation: toLegacyString(form.immatriculation),
    adresseassureur: toLegacyString(form.adresseassureur),
    boitepostale: toLegacyString(form.boitepostale),
    telephone: toLegacyString(form.telephone),
  }
}

/** POST /certificatinit — certificatinit.java */
export const RP_CERTIFICAT_INIT_SUBMIT_FIELDS = [
  'numdossier',
  'datecertificat',
  'dateaccident',
  'numcertificat',
  'type',
  'nommedecin',
  'structure',
  'naturelesion',
  'siegelesion',
  'numordre',
  'nbrejours',
  'txipp',
  'datefinrappel',
]

import { normalizeCertificatTypeValue } from '../utils/liquidationRpCertificatInitLegacy.js'
import { RP_CERTIFICAT_DECES_TYPE } from '../utils/liquidationRpCertificatDecesLegacy.js'

/**
 * @param {Record<string, unknown>} form
 */
export function buildRpCertificatInitApiPayload(form) {
  return {
    numdossier: toLegacyString(form.numdossier),
    datecertificat: toLegacyString(form.datecertificat),
    dateaccident: toLegacyString(form.dateaccident),
    numcertificat: toLegacyString(form.numcertificat),
    type: normalizeCertificatTypeValue(form.type),
    nommedecin: toLegacyUppercase(form.nommedecin),
    structure: toLegacyUppercase(form.structure),
    naturelesion: toLegacyUppercase(form.naturelesion),
    siegelesion: toLegacyUppercase(form.siegelesion),
    numordre: toLegacyString(form.numordre),
    nbrejours: toLegacyString(form.nbrejours),
    txipp: toLegacyString(form.txipp),
    datefinrappel: toLegacyString(form.datefinrappel),
  }
}

/** POST /certificatdeces — certificatdeces.java (Observations avec O majuscule) */
export const RP_CERTIFICAT_DECES_SUBMIT_FIELDS = [
  'numdossier',
  'datecertificat',
  'dateaccident',
  'numcertificat',
  'type',
  'nommedecin',
  'structure',
  'naturelesion',
  'siegelesion',
  'numordre',
  'Observations',
  'datedeces',
]

/**
 * @param {Record<string, unknown>} form
 */
export function buildRpCertificatDecesApiPayload(form) {
  return {
    numdossier: toLegacyString(form.numdossier),
    datecertificat: toLegacyString(form.datecertificat),
    dateaccident: toLegacyString(form.dateaccident),
    numcertificat: toLegacyString(form.numcertificat),
    type: toLegacyString(form.type || RP_CERTIFICAT_DECES_TYPE),
    nommedecin: toLegacyUppercase(form.nommedecin),
    structure: toLegacyUppercase(form.structure),
    naturelesion: toLegacyUppercase(form.naturelesion),
    siegelesion: toLegacyUppercase(form.siegelesion),
    numordre: toLegacyString(form.numordre),
    Observations: toLegacyUppercase(form.observation ?? form.Observations),
    datedeces: toLegacyString(form.datedeces),
  }
}

/** POST /NouvelleNote — NouvelleNote.java */
export const RP_NOTE_FRAIS_SUBMIT_FIELDS = [
  'numdossier',
  'numassu',
  'numnote',
  'telephone',
  'fournisseur',
  'numemployeur',
  'nomemployeur',
  'adresse',
  'objet',
  'tiersbeneficiaire',
  'datedemande',
  'flag',
]

/**
 * @param {Record<string, unknown>} form
 */
export function buildRpNoteFraisApiPayload(form) {
  return {
    numdossier: toLegacyString(form.numdossier),
    numassu: toLegacyString(form.numassu),
    numnote: toLegacyString(form.numnote),
    telephone: toLegacyString(form.telephone),
    fournisseur: toLegacyUppercase(form.fournisseur),
    numemployeur: toLegacyString(form.numemployeur),
    nomemployeur: toLegacyUppercase(form.nomemployeur),
    adresse: toLegacyUppercase(form.adresse),
    objet: toLegacyString(form.objet),
    tiersbeneficiaire: toLegacyString(form.tiersbeneficiaire),
    datedemande: toLegacyString(form.datedemande),
    flag: toLegacyString(form.flag),
  }
}

/** POST /saisietiersbeneficiaire — saisietiersbeneficiaire.java */
export const RP_TIERS_BENEFICIAIRE_SUBMIT_FIELDS = [
  'numdossier',
  'numassure',
  'numbenef',
  'nombenef',
  'prenombenef',
  'naissbenef',
  'adresse',
  'tel',
  'numpiece',
]

/**
 * @param {Record<string, unknown>} form
 */
export function buildRpTiersBeneficiaireApiPayload(form) {
  return {
    numdossier: toLegacyString(form.numdossier),
    numassure: toLegacyString(form.numassure),
    numbenef: toLegacyString(form.numbenef),
    nombenef: toLegacyUppercase(form.nombenef),
    prenombenef: toLegacyUppercase(form.prenombenef),
    naissbenef: toLegacyString(form.naissbenef),
    adresse: toLegacyUppercase(form.adresse),
    tel: toLegacyString(form.tel),
    numpiece: toLegacyUppercase(form.numpiece),
  }
}
