<template>
  <q-page class="assure-auth-page fit column no-wrap">
    <div class="assure-auth-layout">
      <div class="assure-auth-image-side">
        <img :src="bgImage" class="assure-auth-image" alt="CNPS — Espace assuré" />
      </div>

      <aside class="assure-auth-form-side" :class="{ 'assure-auth-form-side--wide': wideForm }">
        <div class="assure-auth-form-top">
          <q-btn
            flat
            dense
            no-caps
            icon="arrow_back"
            :label="backLabel"
            color="primary"
            class="assure-auth-back-btn"
            :to="backTo"
          />
        </div>

        <div class="assure-auth-form-body">
          <slot />
        </div>
      </aside>
    </div>
  </q-page>
</template>

<script setup>
import bgImage from 'assets/images/popularCnps.jpg'

defineProps({
  backTo: {
    type: Object,
    required: true,
  },
  backLabel: {
    type: String,
    default: 'Retour',
  },
  wideForm: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.assure-auth-page {
  overflow: hidden;
  padding: 0 !important;
  min-height: 0 !important;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.assure-auth-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  width: 100%;
  overflow: hidden;
}

.assure-auth-image-side {
  flex: 1 1 72%;
  min-width: 0;
  overflow: hidden;
  background: #8ec8e8;
}

.assure-auth-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left center;
  display: block;
}

.assure-auth-form-side {
  flex: 0 0 28%;
  width: 28%;
  min-width: 280px;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(180deg, #d4ebfa 0%, #eef7fd 100%);
  border-left: 1px solid rgba(57, 73, 171, 0.14);
}

.assure-auth-form-top {
  flex-shrink: 0;
  padding: 0.45rem 0.5rem 0;
  background: linear-gradient(180deg, #c5e3f8 0%, #e8f4fc 100%);
}

.assure-auth-form-side--wide {
  flex: 0 0 32%;
  width: 32%;
  max-width: 480px;
}

.assure-auth-back-btn {
  font-size: 0.72rem;
  font-weight: 600;
  min-height: 32px;
  padding: 0 0.35rem;
}

.assure-auth-form-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
}

.assure-auth-form-body :deep(> *) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 900px) {
  .assure-auth-page {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .assure-auth-layout {
    flex-direction: column;
    min-height: min(100dvh, 100vh);
  }

  .assure-auth-image-side {
    flex: 0 0 min(38vh, 280px);
    width: 100%;
    max-width: none;
    min-height: 160px;
  }

  .assure-auth-form-side {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    max-width: none;
    overflow-y: auto;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .assure-auth-form-body {
    overflow: visible;
    min-height: min-content;
  }
}

@media (max-width: 480px) {
  .assure-auth-image-side {
    flex: 0 0 32vh;
    min-height: 140px;
  }

  .assure-auth-form-top {
    padding: 0.35rem 0.5rem 0;
  }
}
</style>
