<template>
  <div class="q-pa-sm nlle-declaration">

    <!-- ═══════════════════════════════════════════════════════
         EN-TÊTE
    ═══════════════════════════════════════════════════════ -->
    <div class="text-center q-mb-sm">
      <div class="text-h6 text-primary text-weight-bold">
        <q-icon name="assignment" class="q-mr-xs" />
        Mise à jour des Déclarations RP
      </div>
      <div class="text-caption text-grey-6">Accidents du Travail / Maladies Professionnelles</div>
    </div>

    <q-form ref="formRef" @submit.prevent="submitForm">

      <!-- ═══════════════════════════════════════════════════
           SECTION 1 : IDENTIFICATION DOSSIER
      ═══════════════════════════════════════════════════ -->
      <q-card class="q-mb-sm card-elevated">
        <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon name="folder_open" size="xs" class="q-mr-xs" />
              <span class="text-body2 text-weight-bold">Identification du Dossier</span>
            </div>
            <q-btn flat dense round icon="restart_alt" color="white" size="sm" @click="resetForm">
              <q-tooltip>Réinitialiser</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-section class="q-py-sm">
          <div class="row q-col-gutter-xs q-mb-xs">
            <!-- Sélection dossier -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedDossier"
                :options="dossierOptions"
                label="N° Dossier *"
                outlined dense emit-value map-options
                option-label="numdossier"
                option-value="numdossier"
                use-input
                input-debounce="0"
                @filter="filterDossiers"
                @update:model-value="onDossierSelect"
                label-color="primary"
                color="primary"
              >
                <template v-slot:prepend><q-icon name="confirmation_number" color="primary" size="xs" /></template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey">Aucun dossier</q-item-section></q-item>
                </template>
              </q-select>
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model="form.objet" label="Objet" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model="form.datedeclaration" label="Date Déclaration" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model="form.datedepot" label="Date Dépôt Dossier" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
          </div>
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-2">
              <q-input v-model="form.numassu" label="N° Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model="form.nom" label="Nom Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model="form.emploiassure" label="Emploi Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model="form.datedeces" label="Décédé le" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model="form.txipp" label="Taux IPP Précédent" outlined dense readonly bg-color="blue-grey-1" label-color="primary">
                <template v-slot:append><span class="text-caption text-grey-6">%</span></template>
              </q-input>
            </div>
          </div>
          <div class="row q-col-gutter-xs">
            <!-- Employeur avec recherche par ENTRÉE -->
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.numemployeur"
                label="Numéro Employeur *"
                outlined dense
                bg-color="yellow-1"
                hint="Saisissez le matricule puis Entrée, clic sur le champ ou recherche"
                @keydown.enter.prevent="fetchEmployeur"
                @click="onEmployeurFieldActivate"
                @blur="onEmployeurFieldActivate"
                :loading="loadingEmployeur"
              >
                <template v-slot:prepend><q-icon name="business" color="amber-8" size="xs" /></template>
                <template v-slot:append>
                  <q-btn flat round icon="search" size="xs" color="primary" @click="fetchEmployeur">
                    <q-tooltip>Charger l'employeur</q-tooltip>
                  </q-btn>
                </template>
              </q-input>
            </div>
            <div class="col-6 col-md-5">
              <q-input v-model="form.nomemployeur" label="Nom Employeur" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.observation" label="Observation" outlined dense bg-color="yellow-1" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ═══════════════════════════════════════════════════
           SECTION 2 : INFORMATIONS SUR LE RISQUE
      ═══════════════════════════════════════════════════ -->
      <q-expansion-item
        v-model="sections.risque"
        icon="warning_amber"
        label="Informations sur le Risque"
        header-class="section-header text-primary text-weight-bold"
        class="q-mb-sm card-elevated"
        expand-icon-class="text-primary"
      >
        <q-card>
          <q-card-section class="q-py-sm">
            <!-- Poste & Type risque -->
            <div class="row q-col-gutter-xs q-mb-xs">
              <div class="col-12 col-md-4">
                <q-select v-model="form.postetravail" :options="posteTravailOptions" label="Poste de Travail"
                  outlined dense emit-value map-options option-label="libelle" option-value="code"
                  @update:model-value="v => form.codepostetravail = v" color="primary" />
              </div>
              <div class="col-12 col-md-4">
                <q-select v-model="form.risquetravail" :options="typeRisqueOptions" label="Type de Risque"
                  outlined dense emit-value map-options option-label="libelle" option-value="code"
                  @update:model-value="v => form.coderisquetravail = v" color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.anciennete" label="Ancienneté (années)" type="number" min="0" max="40"
                  outlined dense :rules="[v => (v>=0 && v<=40) || 'Entre 0 et 40']" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.heuresurvenance" label="Heure Accident" type="time" outlined dense bg-color="yellow-1" />
              </div>
            </div>

            <!-- Date & lieu accident -->
            <div class="row q-col-gutter-xs q-mb-xs">
              <div class="col-6 col-md-3">
                <q-input v-model="form.dateaccident" label="Date Accident" outlined dense bg-color="yellow-1">
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.dateaccident" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="form.lieuaccident" label="Lieu Accident" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-3">
                <q-select v-model="form.arrondissement" :options="arrondissementOptions" label="Arrondissement"
                  outlined dense emit-value map-options option-label="libelle" option-value="code" color="primary" />
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="form.quartier" label="Quartier" outlined dense bg-color="yellow-1" />
              </div>
            </div>

            <div class="row q-col-gutter-xs q-mb-xs">
              <div class="col-12 col-md-4">
                <q-input v-model="form.adresse" label="Rue / Avenue / Boulevard" type="textarea" rows="2"
                  outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.causes" label="Causes" type="textarea" rows="2"
                  outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.consequences" label="Conséquences" type="textarea" rows="2"
                  outlined dense bg-color="yellow-1" />
              </div>
            </div>

            <!-- Lésions -->
            <div class="sep q-mb-xs q-mt-sm"><q-icon name="healing" size="xs" class="q-mr-xs" />Lésions</div>
            <div class="row q-col-gutter-xs q-mb-xs">
              <div class="col-12 col-md-3">
                <q-select v-model="form.codesiegelesion" :options="siegeLesionOptions" label="Siège Lésion Codifié"
                  outlined dense emit-value map-options option-label="libelle" option-value="code"
                  @update:model-value="v => form.codesiegel = v" color="primary" />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.slesion" label="Précisions siège lésion" type="textarea" rows="2"
                  outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-12 col-md-3">
                <q-select v-model="form.codenatlesion" :options="natureLesionOptions" label="Nature Lésion Codifiée"
                  outlined dense emit-value map-options option-label="libelle" option-value="code"
                  @update:model-value="v => form.codenaturel = v" color="primary" />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.nlesion" label="Précisions nature lésion" type="textarea" rows="2"
                  outlined dense bg-color="yellow-1" />
              </div>
            </div>

            <!-- Situations -->
            <div class="sep q-mb-xs q-mt-sm"><q-icon name="info_outline" size="xs" class="q-mr-xs" />Situation de la Victime</div>
            <div class="row q-col-gutter-xs q-mb-xs">
              <div class="col-6 col-md-2">
                <q-select v-model="form.flagformation" :options="ouiNonOptions" label="Formée à cette activité ?"
                  outlined dense emit-value map-options color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-select v-model="form.flag" :options="ouiNonOptions" label="Prise en charge ?"
                  outlined dense emit-value map-options color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-select v-model="form.flagarrettravail" :options="ouiNonOptions" label="Arrêt de Travail ?"
                  outlined dense emit-value map-options color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-select v-model="form.flagdecesimmediat" :options="ouiNonOptions" label="Décédé Immédiatement ?"
                  outlined dense emit-value map-options color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-select v-model="form.flaghospitalisation" :options="ouiNonOptions" label="Hospitalisé ?"
                  outlined dense emit-value map-options color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.lieuhospitalisation" label="Lieu d'Hospitalisation"
                  outlined dense bg-color="yellow-1" :disable="form.flaghospitalisation !== 'OUI'" />
              </div>
            </div>

            <!-- Agent matériel -->
            <div class="row q-col-gutter-xs q-mb-xs">
              <div class="col-12 col-md-4">
                <q-select v-model="form.agentmateriel" :options="agentMaterielOptions" label="Agent Matériel"
                  outlined dense emit-value map-options option-label="libelle" option-value="code"
                  @update:model-value="v => form.codeagentmat = v" color="primary" />
              </div>
            </div>

            <!-- Témoins -->
            <div class="sep q-mb-xs q-mt-sm"><q-icon name="people" size="xs" class="q-mr-xs" />Témoins</div>
            <div class="row q-col-gutter-xs q-mb-xs">
              <div class="col-6 col-md-3"><q-input v-model="form.temoin1" label="Témoin 1" outlined dense bg-color="yellow-1" /></div>
              <div class="col-6 col-md-3"><q-input v-model="form.identite1" label="Identité T1" outlined dense bg-color="yellow-1" /></div>
              <div class="col-6 col-md-3"><q-input v-model="form.temoin2" label="Témoin 2" outlined dense bg-color="yellow-1" /></div>
              <div class="col-6 col-md-3"><q-input v-model="form.identite2" label="Identité T2" outlined dense bg-color="yellow-1" /></div>
              <div class="col-6 col-md-3"><q-input v-model="form.temoin3" label="Témoin 3" outlined dense bg-color="yellow-1" /></div>
              <div class="col-6 col-md-3"><q-input v-model="form.identite3" label="Identité T3" outlined dense bg-color="yellow-1" /></div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- ═══════════════════════════════════════════════════
           SECTION 3 : INFORMATIONS SALARIALES
      ═══════════════════════════════════════════════════ -->
      <q-expansion-item
        v-model="sections.salaires"
        icon="account_balance_wallet"
        label="Informations Salariales"
        header-class="section-header text-primary text-weight-bold"
        class="q-mb-sm card-elevated"
        expand-icon-class="text-primary"
      >
        <q-card>
          <q-card-section class="q-py-sm">
            <div class="row q-col-gutter-xs q-mb-xs">
              <div class="col-6 col-md-2">
                <q-input v-model="form.categorie" label="Catégorie" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.echelon" label="Échelon" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-4">
                <q-select v-model="form.secteur" :options="secteurOptions" label="Secteur d'activité"
                  outlined dense emit-value map-options color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-select v-model="form.zone" :options="zoneOptions" label="Zone Accident"
                  outlined dense emit-value map-options color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model.number="form.salrecons" label="Salaire Reconstitué" type="number" min="0"
                  outlined dense bg-color="yellow-1">
                  <template v-slot:append><span class="text-caption text-grey-6">FCFA</span></template>
                </q-input>
              </div>
            </div>

            <!-- Les 3 derniers mois de salaire -->
            <div class="sep q-mb-xs q-mt-sm"><q-icon name="calendar_month" size="xs" class="q-mr-xs" />Salaires des 3 derniers mois</div>
            <div class="row q-col-gutter-xs q-mb-xs">
              <div class="col-6 col-md-2">
                <q-input v-model="form.periode1" label="Période (n-1)" outlined dense bg-color="yellow-1" placeholder="MM/AAAA" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model.number="form.montant1" label="Salaire (n-1)" type="number" min="0" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.periode2" label="Période (n-2)" outlined dense bg-color="yellow-1" placeholder="MM/AAAA" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model.number="form.montant2" label="Salaire (n-2)" type="number" min="0" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.periode3" label="Période (n-3)" outlined dense bg-color="yellow-1" placeholder="MM/AAAA" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model.number="form.montant3" label="Salaire (n-3)" type="number" min="0" outlined dense bg-color="yellow-1" />
              </div>
            </div>

            <!-- Arriérages -->
            <div class="row q-col-gutter-xs">
              <div class="col-6 col-md-4">
                <q-select v-model="form.flagretarrerage" :options="ouiNonOptions"
                  label="Retenir les arriérages ?" outlined dense emit-value map-options color="primary"
                  @update:model-value="onFlagRetarreageChange" />
              </div>
              <div class="col-6 col-md-4">
                <q-input v-model.number="form.montantretenue" label="Montant Retenue" type="number" min="0"
                  outlined dense bg-color="yellow-1" :disable="form.flagretarrerage !== 'OUI'">
                  <template v-slot:append><span class="text-caption text-grey-6">FCFA</span></template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- ═══════════════════════════════════════════════════
           SECTION 4 : RISQUE PRÉCÉDENT
      ═══════════════════════════════════════════════════ -->
      <q-expansion-item
        v-model="sections.risquePrecedent"
        icon="history"
        label="Informations sur le Risque Précédent"
        header-class="section-header text-primary text-weight-bold"
        class="q-mb-sm card-elevated"
        expand-icon-class="text-primary"
      >
        <q-card>
          <q-card-section class="q-py-sm">
            <div class="row q-col-gutter-xs">
              <div class="col-6 col-md-3">
                <q-input v-model="form.ippold" label="Taux IPP Précédent (%)" type="number" min="0" max="100"
                  outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="form.rmmold" label="Ancienne RMM" type="number" min="0"
                  outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="form.renteold" label="Rente Mensuelle" type="number" min="0"
                  outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="form.allocationold" label="Allocation d'Incapacité" type="number" min="0"
                  outlined dense bg-color="yellow-1" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- ═══════════════════════════════════════════════════
           SECTION 5 : TIERS RESPONSABLE
      ═══════════════════════════════════════════════════ -->
      <q-expansion-item
        v-model="sections.tiers"
        icon="gavel"
        label="Informations sur le Tiers Responsable"
        header-class="section-header text-primary text-weight-bold"
        class="q-mb-sm card-elevated"
        expand-icon-class="text-primary"
      >
        <q-card>
          <q-card-section class="q-py-sm">
            <div class="row q-col-gutter-xs">
              <div class="col-12 col-md-4">
                <q-input v-model="form.nomtiers" label="Nom / Raison Sociale" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.orgassureur" label="Organisme Assureur" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.numpolice" label="Numéro Police" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.immatriculation" label="Immatriculation" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.adresseassureur" label="Adresse Assureur" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.boitepostale" label="Boîte Postale" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.telephone" label="Téléphone" outlined dense bg-color="yellow-1" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- ═══════════════════════════════════════════════════
           BOUTON VALIDER
      ═══════════════════════════════════════════════════ -->
      <div class="row justify-center q-mt-md q-gutter-sm">
        <q-btn
          type="submit"
          color="primary"
          label="Valider"
          icon="save"
          unelevated
          style="border-radius:10px; min-width:180px"
          :loading="submitting"
        />
        <q-btn
          type="reset"
          color="grey-6"
          label="Annuler"
          icon="refresh"
          unelevated
          style="border-radius:10px; min-width:180px"
          @click="resetForm"
        />
      </div>

    </q-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationRpStore } from 'src/stores/energizer/liquidationRpStore.js'

defineOptions({ name: 'NlleDeclaration' })

const $q = useQuasar()
const rpStore = useLiquidationRpStore()

// ─── État ──────────────────────────────────────────────────────
const formRef         = ref(null)
const submitting      = ref(false)
const loadingEmployeur = ref(false)
const selectedDossier = ref(null)

// ─── Sections ouvertes/fermées ──────────────────────────────────
const sections = reactive({
  risque:         false,
  salaires:       false,
  risquePrecedent: false,
  tiers:          false,
})

// ─── Options des selects ────────────────────────────────────────
const ouiNonOptions = [
  { label: 'OUI', value: 'OUI' },
  { label: 'NON', value: 'NON' },
]

const secteurOptions = [
  { label: '1 — PRIMAIRE',                   value: '1' },
  { label: '2 — SECONDAIRE ET TERTIAIRE I',  value: '2' },
  { label: '3 — TERTIAIRE II',               value: '3' },
  { label: '4 — DOMESTIQUES DE MAISON',      value: '4' },
  { label: '5 — ENSEIGNEMENT PRIVÉ',         value: '5' },
  { label: '6 — PUBLIC',                     value: '6' },
]

const zoneOptions = [
  { label: 'Zone 1', value: '1' },
  { label: 'Zone 2', value: '2' },
  { label: 'Zone 3', value: '3' },
]

const posteTravailOptions = [
  { code: '001', libelle: 'Maçonnerie' },
  { code: '002', libelle: 'Soudure' },
  { code: '003', libelle: 'Conduite engin' },
  { code: '004', libelle: 'Électricité' },
  { code: '005', libelle: 'Menuiserie' },
]

const typeRisqueOptions = [
  { code: 'R01', libelle: 'Travaux en hauteur' },
  { code: 'R02', libelle: 'Manipulation produits chimiques' },
  { code: 'R03', libelle: 'Conduite véhicule' },
  { code: 'R04', libelle: 'Manutention manuelle' },
  { code: 'R05', libelle: 'Électrocution' },
]

const siegeLesionOptions = [
  { code: 'MS', libelle: 'Membre supérieur' },
  { code: 'MI', libelle: 'Membre inférieur' },
  { code: 'TE', libelle: 'Tête' },
  { code: 'TR', libelle: 'Tronc' },
  { code: 'GE', libelle: 'Généralisé' },
]

const natureLesionOptions = [
  { code: 'FR', libelle: 'Fracture' },
  { code: 'PL', libelle: 'Plaie' },
  { code: 'BR', libelle: 'Brûlure' },
  { code: 'CO', libelle: 'Contusion' },
  { code: 'LX', libelle: 'Luxation' },
]

const agentMaterielOptions = [
  { code: 'EC01', libelle: 'Échafaudage' },
  { code: 'MA01', libelle: 'Machine-outil' },
  { code: 'VE01', libelle: 'Véhicule' },
  { code: 'PR01', libelle: 'Produit chimique' },
  { code: 'OU01', libelle: 'Outil à main' },
]

const arrondissementOptions = [
  { code: 'WOURI',     libelle: 'WOURI (Douala)' },
  { code: 'MFOUNDI',   libelle: 'MFOUNDI (Yaoundé)' },
  { code: 'HAUT-NKA',  libelle: 'HAUT-NKA (Yaoundé)' },
  { code: 'BAFOUSSAM', libelle: 'BAFOUSSAM I' },
  { code: 'GAROUA',    libelle: 'GAROUA I' },
]

// ─── Données de test (dossiers) ─────────────────────────────────
const MOCK_DOSSIERS = [
  {
    numdossier: 'R2026-001', objet: 'AT — Accident du Travail',
    numassu: '5-20-97-123456-78', nom: 'KAMGA Jean-Pierre', emploiassure: 'Maçon',
    datedeclaration: '15/03/2026', datedepot: '15/03/2026',
    dateaccident: '10/03/2026', datedeces: '', txipp: '0',
    adresse: 'Rue de la Paix, Akwa', prescription: 'Soins médicaux prescrits',
    lieu: 'Chantier Akwa', causes: 'Chute de hauteur', consequences: 'Fracture bras droit',
    quartier: 'Akwa', flagdecesimmediat: 'NON', flagarrettravail: 'OUI',
    slesion: 'Bras droit', nlesion: 'Fracture', codesiegelesion: 'MS', codenatlesion: 'FR',
    p1: '01/2026', sm1: 350000, p2: '12/2025', sm2: 350000, p3: '11/2025', sm3: 350000,
    t1: 'BIYONG Marcel', id1: '123456789', t2: '', id2: '', t3: '', id3: '',
    cat: 'C', ech: '3', sect: '2', arrond: 'WOURI',
    nom_employeur: 'BATCOM SARL', numemployeur: '1-20-97-001234',
    txipp_val: '0', flag: 'OUI', heure: '09:30',
    rmmold: '0', ippold: '0', allocationold: '0', salrecons: 350000,
    flagretrappel: 'NON', montantretrappel: 0, codezone: '1',
    postetravail: '001', risquetravail: 'R01',
    sl: 'Membre supérieur', nl: 'Fracture', agentmat: 'EC01',
    anciennete: 2, flagformation: 'OUI', flaghospit: 'OUI', lieuhospit: 'Clinique Akwa',
    codepostetravail: '001', coderisquetravail: 'R01', codesl: 'MS', codenl: 'FR', codeagentmat: 'EC01',
  },
  {
    numdossier: 'R2026-002', objet: 'MP — Maladie Professionnelle',
    numassu: '5-20-97-654321-12', nom: 'NKOA Sylvie', emploiassure: 'Soudeur',
    datedeclaration: '20/04/2026', datedepot: '20/04/2026',
    dateaccident: '15/04/2026', datedeces: '', txipp: '10',
    adresse: 'Avenue de la Liberté', prescription: 'Traitement intoxication',
    lieu: 'Usine chimique', causes: 'Exposition produits chimiques', consequences: 'Intoxication pulmonaire',
    quartier: 'Bassa', flagdecesimmediat: 'NON', flagarrettravail: 'OUI',
    slesion: 'Poumons', nlesion: 'Intoxication', codesiegelesion: 'TR', codenatlesion: 'CO',
    p1: '03/2026', sm1: 280000, p2: '02/2026', sm2: 280000, p3: '01/2026', sm3: 280000,
    t1: 'FOKA Pierre', id1: '987654321', t2: '', id2: '', t3: '', id3: '',
    cat: 'B', ech: '2', sect: '2', arrond: 'WOURI',
    nom_employeur: 'CHIMIE BASSA SARL', numemployeur: '1-20-97-005678',
    flag: 'OUI', heure: '14:00',
    rmmold: '0', ippold: '10', allocationold: '0', salrecons: 280000,
    flagretrappel: 'NON', montantretrappel: 0, codezone: '1',
    postetravail: '002', risquetravail: 'R02',
    agentmat: 'PR01', anciennete: 5, flagformation: 'NON', flaghospit: 'OUI', lieuhospit: 'CHU Douala',
    codepostetravail: '002', coderisquetravail: 'R02', codesl: 'TR', codenl: 'CO', codeagentmat: 'PR01',
  },
]

const allDossiers    = ref([...MOCK_DOSSIERS])
const dossierOptions = ref([...MOCK_DOSSIERS])

onMounted(async () => {
  try {
    const list = await rpStore.loadRpDossiers()
    if (list?.length) {
      allDossiers.value = list
      dossierOptions.value = list
    }
  } catch {
    /* conserve les données locales si l’API est indisponible sans fallback */
  }
})

// ─── Formulaire ─────────────────────────────────────────────────
const FORM_INITIAL = {
  numdossier: '', objet: '', numassu: '', nom: '', emploiassure: '',
  datedeclaration: '', datedepot: '', datedeces: '', txipp: '',
  numemployeur: '', nomemployeur: '', observation: '',
  // Risque
  postetravail: '', codepostetravail: '', risquetravail: '', coderisquetravail: '',
  dateaccident: '', heuresurvenance: '',
  lieuaccident: '', arrondissement: '', quartier: '', adresse: '',
  causes: '', consequences: '',
  codesiegelesion: '', codesiegel: '', slesion: '',
  codenatlesion: '', codenaturel: '', nlesion: '',
  anciennete: 0,
  flagformation: '', flag: '', flagarrettravail: '', flagdecesimmediat: '',
  flaghospitalisation: '', lieuhospitalisation: '',
  agentmateriel: '', codeagentmat: '',
  temoin1: '', identite1: '', temoin2: '', identite2: '', temoin3: '', identite3: '',
  // Salaires
  categorie: '', echelon: '', secteur: '', zone: '',
  periode1: '', montant1: 0, periode2: '', montant2: 0, periode3: '', montant3: 0,
  salrecons: 0, flagretarrerage: '', montantretenue: 0,
  // Risque précédent
  ippold: 0, rmmold: 0, renteold: 0, allocationold: 0,
  // Tiers responsable
  nomtiers: '', orgassureur: '', numpolice: '', immatriculation: '',
  adresseassureur: '', boitepostale: '', telephone: '',
}

const form = reactive({ ...FORM_INITIAL })

// ─── Filtre dossiers (autocomplete) ────────────────────────────
function filterDossiers(val, update) {
  update(() => {
    if (!val) {
      dossierOptions.value = allDossiers.value
    } else {
      const needle = val.toLowerCase()
      dossierOptions.value = allDossiers.value.filter(
        d => d.numdossier.toLowerCase().includes(needle) || d.nom.toLowerCase().includes(needle)
      )
    }
  })
}

// ─── Chargement dossier (équivalent select listener ExtJS) ──────
function onDossierSelect(numdossier) {
  const d = allDossiers.value.find(x => x.numdossier === numdossier)
  if (!d) return

  form.numdossier      = d.numdossier
  form.objet           = d.objet
  form.numassu         = d.numassu
  form.nom             = d.nom
  form.emploiassure    = d.emploiassure
  form.datedeclaration = d.datedeclaration
  form.datedepot       = d.datedepot
  form.datedeces       = d.datedeces ?? ''
  form.txipp           = d.txipp ?? ''
  form.numemployeur    = d.numemployeur ?? ''
  form.nomemployeur    = d.nom_employeur ?? ''
  form.observation     = d.prescription ?? ''
  // Risque
  form.dateaccident       = d.dateaccident ?? ''
  form.heuresurvenance    = d.heure ?? ''
  form.lieuaccident       = d.lieu ?? ''
  form.arrondissement     = d.arrond ?? ''
  form.quartier           = d.quartier ?? ''
  form.adresse            = d.adresse ?? ''
  form.causes             = d.causes ?? ''
  form.consequences       = d.consequences ?? ''
  form.codesiegelesion    = d.codesl ?? ''
  form.codesiegel         = d.codesl ?? ''
  form.slesion            = d.sl ?? ''
  form.codenatlesion      = d.codenl ?? ''
  form.codenaturel        = d.codenl ?? ''
  form.nlesion            = d.nl ?? ''
  form.anciennete         = d.anciennete ?? 0
  form.flagformation      = d.flagformation ?? ''
  form.flag               = d.flag ?? ''
  form.flagarrettravail   = d.flagarrettravail ?? ''
  form.flagdecesimmediat  = d.flagdecesimmediat ?? ''
  form.flaghospitalisation = d.flaghospit ?? ''
  form.lieuhospitalisation = d.lieuhospit ?? ''
  form.agentmateriel      = d.codeagentmat ?? ''
  form.codeagentmat       = d.codeagentmat ?? ''
  form.postetravail       = d.codepostetravail ?? ''
  form.codepostetravail   = d.codepostetravail ?? ''
  form.risquetravail      = d.coderisquetravail ?? ''
  form.coderisquetravail  = d.coderisquetravail ?? ''
  form.temoin1 = d.t1 ?? ''; form.identite1 = d.id1 ?? ''
  form.temoin2 = d.t2 ?? ''; form.identite2 = d.id2 ?? ''
  form.temoin3 = d.t3 ?? ''; form.identite3 = d.id3 ?? ''
  // Salaires
  form.categorie      = d.cat ?? ''
  form.echelon        = d.ech ?? ''
  form.secteur        = d.sect ?? ''
  form.zone           = d.codezone ?? ''
  form.periode1  = d.p1  ?? ''; form.montant1 = d.sm1 ?? 0
  form.periode2  = d.p2  ?? ''; form.montant2 = d.sm2 ?? 0
  form.periode3  = d.p3  ?? ''; form.montant3 = d.sm3 ?? 0
  form.salrecons      = d.salrecons ?? 0
  form.flagretarrerage = d.flagretrappel ?? ''
  form.montantretenue  = d.montantretrappel ?? 0
  // Précédent
  form.ippold      = Number(d.ippold)      || 0
  form.rmmold      = Number(d.rmmold)      || 0
  form.allocationold = Number(d.allocationold) || 0

  // Ouvrir la section risque automatiquement
  sections.risque = true

  $q.notify({ type: 'positive', message: `Dossier ${numdossier} chargé`, position: 'top', timeout: 1500 })
}

function onEmployeurFieldActivate() {
  if (form.numemployeur?.trim()) {
    fetchEmployeur()
  }
}

// ─── Chargement employeur (ENTRÉE / clic / recherche) ───────────
async function fetchEmployeur() {
  const mat = (form.numemployeur || '').trim()
  if (!mat) {
    form.nomemployeur = ''
    $q.notify({ type: 'warning', message: 'Saisissez un numéro employeur', position: 'top' })
    return
  }
  form.numemployeur = mat
  loadingEmployeur.value = true
  try {
    const data = await rpStore.fetchEmployeur(mat)
    const rs = data?.nomemployeur ?? data?.raison_sociale
    if (rs) {
      form.nomemployeur = rs
      $q.notify({ type: 'positive', message: `Employeur : ${rs}`, position: 'top', timeout: 1500 })
    } else {
      form.nomemployeur = ''
      $q.notify({
        type: 'negative',
        message: 'Aucun employeur trouvé pour ce matricule. Vérifiez le numéro saisi.',
        position: 'top',
      })
    }
  } catch {
    form.nomemployeur = ''
    $q.notify({
      type: 'negative',
      message: 'Aucun employeur trouvé pour ce matricule. Vérifiez le numéro saisi.',
      position: 'top',
    })
  } finally {
    loadingEmployeur.value = false
  }
}

// ─── Flag arriérages ────────────────────────────────────────────
function onFlagRetarreageChange(val) {
  if (val === 'NON') {
    form.montantretenue = 0
  }
}

// ─── Soumission (action = declaration) ──────────────────────────
async function submitForm() {
  const ok = await formRef.value?.validate()
  if (!ok) return

  if (!form.numdossier) {
    $q.notify({ type: 'negative', message: 'Choisissez un dossier SVP', position: 'top' })
    return
  }

  submitting.value = true
  try {
    await rpStore.submitDeclaration(form)
    $q.notify({
      type: 'positive',
      message: 'Modification du dossier accomplie avec succès !',
      position: 'top', icon: 'check_circle',
    })
    resetForm()
  } catch {
    $q.notify({ type: 'negative', message: 'Modification du dossier non accomplie', position: 'top' })
  } finally {
    submitting.value = false
  }
}

// ─── Réinitialisation ───────────────────────────────────────────
function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  selectedDossier.value = null
  sections.risque = false
  sections.salaires = false
  sections.risquePrecedent = false
  sections.tiers = false
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.nlle-declaration {
  max-width: 1400px;
  margin: 0 auto;
}

.card-elevated {
  border-radius: 12px;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.08);
}

.card-header-rounded {
  border-radius: 12px 12px 0 0;
}

/* En-tête des sections expansion */
.section-header {
  font-size: 0.88rem;
  font-weight: 700;
  border-radius: 12px;
}

/* Séparateurs internes */
.sep {
  font-size: 0.72rem;
  font-weight: 700;
  color: #1976d2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-left: 3px solid #1976d2;
  padding: 2px 0 2px 8px;
  background: linear-gradient(to right, rgba(25, 118, 210, 0.06), transparent);
  border-radius: 0 4px 4px 0;
}
</style>
