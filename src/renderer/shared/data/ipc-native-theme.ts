import type { ThemeSource } from "@shared/ipc/contract";

/** Makes native UI (menus, title bar, scroll bars) follow the theme choice; a failure only leaves the native UI as it was. */
export async function setNativeTheme(theme: ThemeSource): Promise<void> {
  const result = await window.api.theme.setSource(theme);
  if (!result.ok) console.warn("Native theme not applied:", result.error.message);
}
