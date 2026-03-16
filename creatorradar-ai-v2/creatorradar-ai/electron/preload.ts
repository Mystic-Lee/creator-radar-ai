import { contextBridge, ipcRenderer } from "electron";

// Type-safe IPC bridge exposed to the renderer process.
// The renderer ONLY gets these methods — no raw Node.js access.
contextBridge.exposeInMainWorld("creatorRadar", {
  // ─── Creators ────────────────────────────────────────────────────
  creators: {
    add: (data: unknown) =>
      ipcRenderer.invoke("creators:add", data),

    list: (filters?: unknown) =>
      ipcRenderer.invoke("creators:list", filters),

    get: (id: number) =>
      ipcRenderer.invoke("creators:get", id),

    update: (id: number, data: unknown) =>
      ipcRenderer.invoke("creators:update", id, data),

    updateStatus: (id: number, status: string) =>
      ipcRenderer.invoke("creators:updateStatus", id, status),

    delete: (id: number) =>
      ipcRenderer.invoke("creators:delete", id),

    addNote: (creatorId: number, text: string) =>
      ipcRenderer.invoke("creators:addNote", creatorId, text),

    getNotes: (creatorId: number) =>
      ipcRenderer.invoke("creators:getNotes", creatorId),

    getStats: () =>
      ipcRenderer.invoke("creators:stats"),
  },

  // ─── AI ──────────────────────────────────────────────────────────
  ai: {
    scoreCreator: (creatorData: unknown) =>
      ipcRenderer.invoke("ai:score", creatorData),

    generateDM: (creatorId: number, tone: string) =>
      ipcRenderer.invoke("ai:generateDM", creatorId, tone),

    saveDraft: (creatorId: number, tone: string, text: string) =>
      ipcRenderer.invoke("ai:saveDraft", creatorId, tone, text),

    getDrafts: (creatorId: number) =>
      ipcRenderer.invoke("ai:getDrafts", creatorId),
  },

  // ─── Export ──────────────────────────────────────────────────────
  export: {
    toExcel: (filters?: unknown) =>
      ipcRenderer.invoke("export:excel", filters),
  },

  // ─── Settings ────────────────────────────────────────────────────
  settings: {
    get: (key: string) =>
      ipcRenderer.invoke("settings:get", key),

    set: (key: string, value: string) =>
      ipcRenderer.invoke("settings:set", key, value),

    getAll: () =>
      ipcRenderer.invoke("settings:getAll"),
  },
});

// Declare the window type for TypeScript in the renderer
export type CreatorRadarAPI = typeof import("./preload");
