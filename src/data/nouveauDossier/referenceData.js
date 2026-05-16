export const typeImmatriculationOptions = [
  { code: 'O', lib: 'OBLIGATOIRE' },
  { code: 'V', lib: 'VOLONTAIRE' },
]

export const ouiNonOptions = [
  { code: '0', lib: 'OUI' },
  { code: '1', lib: 'NON' },
]

export const circuitOptions = [
  { code_circuit: '1', libelle_circuit: 'MANUEL' },
  { code_circuit: '2', libelle_circuit: 'GED-LAD' },
  { code_circuit: '3', libelle_circuit: 'TELE-IMMATRICULATION' },
  { code_circuit: '4', libelle_circuit: 'TELE-IMMATRICULATION EMPLOYEUR' },
]

export const naturePrestationOptions = [
  {
    libelle_type_pres: 'Pension de Survivants',
    code_natu_pres_register: 'PS',
  },
  {
    libelle_type_pres: 'Allocation de Survivants',
    code_natu_pres_register: 'AS',
  },
]
