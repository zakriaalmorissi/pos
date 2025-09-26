const {contextBridge, ipcRenderer} = require('electron');




// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld('api', {
    getSystemInfo: () => ipcRenderer.invoke('get-sys-info'),
} )