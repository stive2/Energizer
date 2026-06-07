import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function revertDialogForm (filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  const formStart = content.indexOf('<q-form ref="saisieFormRef"')
  if (formStart < 0) {
    console.log('skip (no saisie form):', filePath)
    return
  }
  const formEnd = content.indexOf('</q-form>', formStart) + '</q-form>'.length
  let form = content.slice(formStart, formEnd)

  form = form.replace(
    /<div class="pf-form-section">\s*<div class="pf-form-section__title">[\s\S]*?<\/div>\s*/g,
    '',
  )
  form = form.replace(/\n            <\/div>\n\n            <!-- Récap -->/, '\n            <!-- Récap -->')

  form = form.replace(
    /(<div class="pf-legacy-cell[^"]*">\s*)<q-input([\s\S]*?)\s+label="([^"]*)"([\s\S]*?)(\/>|>)/g,
    (m, cell, before, label, after, end) => {
      const attrs = (before + after)
        .replace(/\s*placeholder="[^"]*"/g, '')
        .replace(/\s*stack-label/g, '')
        .replace(/\s*label-color="primary"/g, '')
        .replace(/\s*color="primary"/g, '')
      return `${cell}<span class="pf-legacy-label">${label}</span>\n                  <q-input${attrs}${end}`
    },
  )

  form = form.replace(
    /(<div class="pf-legacy-cell pf-legacy-cell--check">\s*)<q-checkbox([\s\S]*?)\s+label="([^"]*)"([\s\S]*?)(\/>|>)/g,
    (m, cell, before, label, after, end) => {
      const attrs = (before + after)
        .replace(/\s*label-color="primary"/g, '')
      return `${cell}<span class="pf-legacy-label">${label}</span>\n                  <q-checkbox${attrs} color="primary"${end}`
    },
  )

  form = form.replace(
    /(<div class="pf-base-calcul">\s*)<q-checkbox([\s\S]*?)\s+label="([^"]*)"([\s\S]*?)(\/>|>)/g,
    (m, cell, before, label, after, end) => {
      const attrs = (before + after).replace(/\s*color="primary"/g, '')
      return `${cell}<q-checkbox${attrs} color="primary" label="${label}"${end}`
    },
  )

  form = form.replace(
    /(<div class="pf-six-mois-checks">\s*)<q-checkbox([\s\S]*?)\s+label="([^"]*)"([\s\S]*?)(\/>|>)/g,
    (m, cell, before, label, after, end) => {
      const attrs = (before + after).replace(/\s*color="primary"/g, '')
      return `${cell}<q-checkbox${attrs} color="primary" label="${label}"${end}`
    },
  )

  content = content.slice(0, formStart) + form + content.slice(formEnd)
  fs.writeFileSync(filePath, content, 'utf8')
  console.log('reverted:', path.relative(root, filePath))
}

const targets = [
  'src/modules/energizer/components/prestationPF/elementsLiquidationPF.vue',
  'src/modules/energizer/components/prestationPF/elementsLiquidationAF.vue',
]

for (const rel of targets) {
  revertDialogForm(path.join(root, rel))
}
