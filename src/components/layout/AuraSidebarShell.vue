<template>
  <div
    class="aura-sidebar-shell"
    :class="{
      'aura-sidebar-shell--compact': !showBrandBlock && !showUserBlock,
      'aura-sidebar-shell--heading': sidebarTitle && !showBrandBlock,
    }"
  >
    <div class="aura-sidebar-shell__body">
      <q-item v-if="showBrandBlock" class="aura-brand">
        <q-item-section avatar>
          <q-avatar square size="38px" class="aura-brand__avatar">
            <q-icon :name="brandIcon" color="white" size="20px" />
          </q-avatar>
        </q-item-section>
        <q-item-section v-if="!miniMode">
          <q-item-label class="aura-brand__title">{{ brandTitle }}</q-item-label>
          <q-item-label caption class="aura-brand__caption">{{ brandCaption }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item v-if="showUserBlock" class="aura-user">
        <q-item-section avatar>
          <q-avatar size="36px" class="aura-user__avatar">{{ userInitials }}</q-avatar>
        </q-item-section>
        <q-item-section v-if="!miniMode">
          <q-item-label class="aura-user__name">{{ userName }}</q-item-label>
          <q-item-label caption class="aura-user__email">{{ userEmail }}</q-item-label>
        </q-item-section>
        <q-item-section v-if="!miniMode && showUserMenu" side>
          <q-icon name="expand_more" class="aura-user__chevron" size="18px" />
        </q-item-section>
        <q-tooltip v-if="miniMode" anchor="center right" self="center left" :offset="[8, 0]">
          {{ userName }}
        </q-tooltip>
      </q-item>

      <div v-if="sidebarTitle && !showBrandBlock" class="aura-sidebar-shell__heading">
        <span v-if="!miniMode" class="aura-sidebar-shell__heading-text">{{ sidebarTitle }}</span>
        <q-tooltip v-else anchor="center right" self="center left" :offset="[8, 0]">
          {{ sidebarTitle }}
        </q-tooltip>
      </div>

      <q-scroll-area class="aura-sidebar-shell__scroll">
        <slot />
      </q-scroll-area>
    </div>

    <q-btn
      v-if="showCollapseButton"
      round
      dense
      unelevated
      icon="chevron_left"
      size="sm"
      class="aura-sidebar-shell__collapse"
      :class="{ 'aura-sidebar-shell__collapse--mini': miniMode }"
      aria-label="Réduire la sidebar"
      @click="toggleMini"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  miniMode: { type: Boolean, default: false },
  brandTitle: { type: String, default: '' },
  brandCaption: { type: String, default: '' },
  brandIcon: { type: String, default: 'bolt' },
  sidebarTitle: { type: String, default: '' },
  userInitials: { type: String, default: '?' },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  showBrandBlock: { type: Boolean, default: true },
  showUserBlock: { type: Boolean, default: true },
  showUserMenu: { type: Boolean, default: false },
  showCollapseButton: { type: Boolean, default: true },
})

const emit = defineEmits(['update:miniMode'])

function toggleMini() {
  emit('update:miniMode', !props.miniMode)
}
</script>

<style scoped>
.aura-sidebar-shell {
  position: relative;
  height: 100%;
  overflow: visible;
}

.aura-sidebar-shell__body {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.aura-sidebar-shell--compact .aura-sidebar-shell__scroll :deep(.q-scrollarea__content) {
  padding-top: 6px;
}

.aura-sidebar-shell--heading .aura-sidebar-shell__collapse {
  top: 22px;
}

.aura-sidebar-shell__heading {
  flex-shrink: 0;
  padding: 18px 14px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  text-align: center;
}

.aura-sidebar-shell__heading-text {
  display: block;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fff;
  line-height: 1.3;
}

.aura-brand {
  padding: 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.aura-brand__avatar {
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.22);
}

.aura-brand__title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.aura-brand__caption {
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
}

.aura-user {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.aura-user__avatar {
  background: rgba(255, 255, 255, 0.25);
  font-size: 13px;
  font-weight: 500;
  color: #fff;
}

.aura-user__name {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
}

.aura-user__email {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.aura-user__chevron {
  color: rgba(255, 255, 255, 0.6);
}

.aura-sidebar-shell__scroll {
  flex: 1 1 auto;
  min-height: 0;
}

.aura-sidebar-shell__collapse {
  position: absolute;
  top: 18px;
  right: -16px;
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  background: #2196f3 !important;
  color: white !important;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.28);
  z-index: 3000;
  transition: transform 0.3s ease;
}

.aura-sidebar-shell--compact .aura-sidebar-shell__collapse {
  top: 14px;
}

.aura-sidebar-shell__collapse--mini {
  transform: rotate(180deg);
}
</style>
