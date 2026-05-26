/** Quasar : padding ≈ 16px + insetLevel × 56px — pas léger par niveau */
export const SIDEBAR_NAV_INSET_STEP = 0.3

export function sidebarNavInsetLevel(depth) {
  if (!depth || depth <= 0) return undefined
  return depth * SIDEBAR_NAV_INSET_STEP
}
