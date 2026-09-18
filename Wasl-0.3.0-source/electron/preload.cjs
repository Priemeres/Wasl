const { contextBridge, ipcRenderer } = require('electron');
const invoke = async (name, input) => {
  const result = await ipcRenderer.invoke(name, input);
  if (!result.ok) throw new Error(result.error);
  return result.data;
};
contextBridge.exposeInMainWorld('wasl', Object.freeze({
  snapshot: period => invoke('wasl:snapshot', period),
  createDevice: input => invoke('wasl:create', input),
  history: id => invoke('wasl:history', id),
  rotateToken: id => invoke('wasl:rotate', id),
  revokeToken: id => invoke('wasl:revoke', id),
  runtime: () => invoke('wasl:runtime'),
  saveSettings: input => invoke('wasl:settings', input),
  exportDevices: () => invoke('wasl:export'),
  backup: () => invoke('wasl:backup'),
  ready: () => ipcRenderer.send('wasl:ready'),
  preferences: input => invoke('wasl:preferences', input),
  ide: Object.freeze({
    state: () => invoke('ide:state'), draft: files => invoke('ide:draft', files),
    save: files => invoke('ide:save', files), newSketch: () => invoke('ide:new'),
    open: () => invoke('ide:open'), exportSketch: () => invoke('ide:export'),
    refresh: () => invoke('ide:refresh'), compile: input => invoke('ide:compile', input),
    upload: input => invoke('ide:upload', input), installCore: core => invoke('ide:install', core),
    monitorStart: input => invoke('ide:monitor', input), monitorSend: input => invoke('ide:send', input),
    stop: () => invoke('ide:stop'), clearLogs: () => invoke('ide:clear'),
    exportTools: () => invoke('ide:exportTools'), importTools: () => invoke('ide:importTools'),
    addLibrary: () => invoke('ide:library'),
  }),
}));
