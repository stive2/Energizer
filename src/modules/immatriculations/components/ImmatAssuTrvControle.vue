<template>
  <q-card class="controle-card column no-wrap">
    <q-card-section class="controle-toolbar q-py-xs q-px-md">
      <div class="row items-center no-wrap">
        <div v-if="!showPreview" class="text-subtitle2 text-weight-medium text-primary">
          {{ controleSubtitle }}
        </div>
        <div v-else class="text-subtitle2 text-weight-medium text-positive">
          {{ $t('immat.controle.validatedTitle') }}
        </div>
        <q-space />
        <q-btn flat dense round icon="close" @click="$emit('close')" />
      </div>
    </q-card-section>

    <q-card-section v-if="error" class="col">
      <q-banner rounded class="bg-negative text-white">
        <template #avatar><q-icon name="error" /></template>
        {{ error }}
      </q-banner>
      <div class="q-mt-md text-center">
        <q-btn color="primary" :label="$t('form.retry')" @click="reloadControle" />
      </div>
    </q-card-section>

    <q-card-section v-else class="col column no-wrap q-pa-none controle-iframe-wrap">
      <div v-if="iframeLoading" class="col flex flex-center">
        <q-spinner-dots color="primary" size="48px" />
        <div class="text-body2 text-grey-7 q-mt-md">{{ $t('immat.controle.loading') }}</div>
      </div>
      <iframe
        v-show="controleUrl && !iframeLoading"
        ref="controleIframe"
        :key="iframeKey"
        :src="controleUrl"
        class="controle-iframe col"
        title="Fiche de pré-immatriculation"
        @load="onIframeLoad"
        @error="onIframeError"
      />
    </q-card-section>

    <q-separator v-if="!error" />
    <q-card-actions v-if="!error" align="right" class="controle-footer q-pa-md">
      <template v-if="!showPreview">
        <q-btn
          flat
          color="primary"
          icon="edit"
          :label="$t('immat.controle.modify')"
          @click="$emit('modify')"
        />
        <q-btn
          unelevated
          color="primary"
          icon="verified"
          :label="$t('immat.controle.validateInfo')"
          :loading="validating"
          @click="$emit('validate')"
        />
      </template>
      <template v-else>
        <q-btn
          unelevated
          color="primary"
          icon="visibility"
          :label="$t('form.preview')"
          :disable="!controleUrl"
          @click="openControlePreview"
        />
      </template>
    </q-card-actions>

    <q-dialog v-model="previewOpen" maximized persistent>
      <q-card class="column no-wrap controle-preview-card">
        <q-card-section class="row items-center q-py-sm">
          <div class="text-h6">{{ $t('immat.controle.previewTitle') }}</div>
          <q-space />
          <q-btn
            flat
            dense
            color="primary"
            icon="print"
            :label="$t('immat.controle.print')"
            class="q-mr-xs"
            @click="printPreviewFrame"
          />
          <q-btn
            flat
            dense
            color="primary"
            icon="picture_as_pdf"
            :label="$t('pdf.download')"
            class="q-mr-xs"
            :loading="pdfLoading"
            @click="downloadControlePdf"
          />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="col q-pa-none">
          <iframe
            ref="previewIframe"
            :src="controleUrl"
            class="controle-preview-iframe"
            title="Aperçu état de contrôle"
            @load="onPreviewIframeLoad"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { onBeforeUnmount, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'
import { buildEtatControleAssureUrl } from 'src/modules/immatriculations/api/teleImmatAssureApi.js'
import { buildEtatControleEmployeurUrl } from 'src/modules/immatriculations/api/teleImmatEmployeurApi.js'
import { useNotify } from 'src/modules/shared/components/useNotify.js'

const props = defineProps({
  /** assure | employeur — JSP et liens legacy associés */
  kind: { type: String, default: 'assure' },
  codeTele: { type: String, required: true },
  codeSecret: { type: String, default: '' },
  /** true = validation définitive : bouton Aperçu uniquement */
  showPreview: { type: Boolean, default: false },
  validating: { type: Boolean, default: false },
  /** Incrémenter pour recharger l’iframe après modification Quasar. */
  reloadToken: { type: Number, default: 0 },
})

const emit = defineEmits(['close', 'edit', 'modify', 'validate', 'validated'])

const { t } = useI18n()
const { notifyError } = useNotify()

const isEmployeur = computed(() => props.kind === 'employeur')
const controleSubtitle = computed(() =>
  isEmployeur.value ? t('immat.controle.subtitleEmployeur') : t('immat.controle.subtitle'),
)
const controleJspLabel = computed(() =>
  isEmployeur.value ? 'etat_controle_employeur.jsp' : 'etat_controle_assure.jsp',
)

/** Styles injectés dans l’iframe (même origine via proxy Vite). */
const LEGACY_HIDE_CSS = computed(() => {
  const formLink = isEmployeur.value ? 'tele_imma_employeur1.jsp' : 'tele_imma_assure.jsp'
  return `
  a[href*="index.jsp"],
  a[href="../index.jsp"],
  a[href*="index.jsp?Page"],
  a[href*="${formLink}"] {
    display: none !important;
  }
`
})

let iframeClickHandler = null

const error = ref(null)
const controleUrl = ref('')
const iframeKey = ref(0)
const iframeLoading = ref(true)
const iframeReady = ref(false)
const controleIframe = ref(null)
const previewOpen = ref(false)
const previewIframe = ref(null)
const previewReady = ref(false)
const pdfLoading = ref(false)

function buildControleUrl(codeTele, codeSecret) {
  return isEmployeur.value
    ? buildEtatControleEmployeurUrl(codeTele, codeSecret)
    : buildEtatControleAssureUrl(codeTele, codeSecret)
}

function parseTeleImmatLink(href, baseUrl) {
  try {
    return new URL(href, baseUrl)
  } catch {
    return null
  }
}

function isTeleImmaFormLink(url) {
  if (isEmployeur.value) {
    return /tele_imma_employeur1\.jsp/i.test(url.pathname)
  }
  return /tele_imma_assure\.jsp/i.test(url.pathname)
}

function isLegacyNavigationToBlock(url) {
  if (/index\.jsp/i.test(url.pathname)) return true
  if (isTeleImmaFormLink(url)) return false
  if (isEmployeur.value && /etat_controle_employeur\.jsp/i.test(url.pathname)) return false
  if (!isEmployeur.value && /etat_controle_assure\.jsp/i.test(url.pathname)) return false
  return false
}

function detectValidatedFromDocument(doc) {
  const html = doc.body?.innerHTML || ''
  const pending = html.includes(
    'CLIQUER SUR LE LIEN CI-DESSOUS POUR PROCEDER A LA CORRECTION',
  )
  const validated = html.includes('VOTRE DOSSIER VALIDE SERA EXPLOITE')
  return validated && !pending
}

function patchIframeDocument(doc) {
  if (!doc?.head || doc.getElementById('energizer-controle-patch')) return

  const style = doc.createElement('style')
  style.id = 'energizer-controle-patch'
  style.textContent = LEGACY_HIDE_CSS.value
  doc.head.appendChild(style)

  if (iframeClickHandler) {
    doc.removeEventListener('click', iframeClickHandler, true)
  }

  iframeClickHandler = (event) => {
    const anchor = event.target.closest?.('a')
    if (!anchor?.href) return

    const url = parseTeleImmatLink(anchor.href, doc.location?.href || window.location.href)
    if (!url) return

    if (isTeleImmaFormLink(url)) {
      event.preventDefault()
      event.stopPropagation()
      emit('edit', {
        codeTele:
          url.searchParams.get('codeTele') ||
          url.searchParams.get('numEmpl') ||
          url.searchParams.get('numAssu') ||
          props.codeTele,
        codeSecret: url.searchParams.get('codeSecret') || props.codeSecret,
      })
      return
    }

    if (isLegacyNavigationToBlock(url)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  doc.addEventListener('click', iframeClickHandler, true)

  if (detectValidatedFromDocument(doc)) {
    emit('validated')
  }
}

function teardownIframeDocument(doc) {
  if (doc && iframeClickHandler) {
    doc.removeEventListener('click', iframeClickHandler, true)
  }
  iframeClickHandler = null
}

function reloadControle() {
  error.value = null
  iframeLoading.value = true
  iframeReady.value = false
  previewReady.value = false
  try {
    controleUrl.value = buildControleUrl(props.codeTele, props.codeSecret)
    iframeKey.value += 1
  } catch (e) {
    error.value = e?.message || String(e)
    controleUrl.value = ''
    iframeLoading.value = false
  }
}

function onIframeLoad() {
  iframeLoading.value = false
  iframeReady.value = true

  try {
    const doc = controleIframe.value?.contentDocument
    if (doc) {
      patchIframeDocument(doc)
    }
  } catch {
    /* Origine croisée : pas d’accès au DOM — fonctionnement iframe brut. */
  }
}

function onPreviewIframeLoad() {
  previewReady.value = true
  try {
    const doc = previewIframe.value?.contentDocument
    if (doc) {
      patchIframeDocument(doc)
    }
  } catch {
    /* ignore */
  }
}

function onIframeError() {
  iframeLoading.value = false
  iframeReady.value = false
  error.value =
    `Impossible d’afficher la fiche de contrôle (${controleJspLabel.value}). Vérifiez la connexion au serveur teleImmat_0.1.`
}

function printControle() {
  const win = controleIframe.value?.contentWindow
  if (win) {
    win.focus()
    win.print()
  } else {
    window.print()
  }
}

function printPreviewFrame() {
  const win = previewIframe.value?.contentWindow
  if (win) {
    win.focus()
    win.print()
  } else {
    printControle()
  }
}

function openControlePreview() {
  if (!controleUrl.value) {
    notifyError(t('immat.controle.submitNoCode'))
    return
  }
  previewReady.value = false
  previewOpen.value = true
}

function resolvePreviewBody() {
  return (
    previewIframe.value?.contentDocument?.body ||
    controleIframe.value?.contentDocument?.body ||
    null
  )
}

async function downloadControlePdf() {
  if (!controleUrl.value) {
    notifyError(t('immat.controle.submitNoCode'))
    return
  }
  pdfLoading.value = true
  try {
    if (!previewReady.value && !previewOpen.value) {
      previewOpen.value = true
      await new Promise((resolve) => setTimeout(resolve, 1200))
    }
    const body = resolvePreviewBody()
    if (!body) {
      throw new Error(t('pdf.generation_error'))
    }
    const opt = {
      margin: 0.4,
      filename: `etat-controle-${props.codeTele || 'assure'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    }
    await html2pdf().from(body).set(opt).save()
  } catch {
    notifyError(t('pdf.generation_error'))
  } finally {
    pdfLoading.value = false
  }
}

watch(
  () => [props.codeTele, props.codeSecret, props.reloadToken],
  () => reloadControle(),
  { immediate: true },
)

onBeforeUnmount(() => {
  try {
    teardownIframeDocument(controleIframe.value?.contentDocument)
    teardownIframeDocument(previewIframe.value?.contentDocument)
  } catch {
    /* ignore */
  }
})
</script>

<style scoped>
.controle-card {
  border-radius: 4px;
  overflow: hidden;
  width: min(960px, 98vw);
  height: min(92vh, 900px);
  max-height: 95vh;
  background: #fff;
}

.controle-toolbar {
  flex-shrink: 0;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.controle-footer {
  flex-shrink: 0;
  background: #fafafa;
}

.controle-iframe-wrap {
  min-height: 200px;
  overflow: hidden;
}

.controle-iframe,
.controle-preview-iframe {
  width: 100%;
  min-height: 400px;
  border: 0;
  background: #fff;
}

.controle-preview-card {
  height: 100%;
}

.controle-preview-iframe {
  height: calc(100vh - 72px);
}
</style>
