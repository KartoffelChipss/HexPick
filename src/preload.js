const {
    contextBridge,
    ipcRenderer
} = require("electron");

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
})

contextBridge.exposeInMainWorld(
    "api", {
        invoke: (channel, data) => {
            let validChannels = [
                "minimizeMainWindow",
                "maximizeMainWindow",
                "closeMainWindow",
                "openExternal",
                "startPicking",
                "getLastColors",
                "getVersion"
            ];
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, data);
            }
        }
    }
);

contextBridge.exposeInMainWorld(
    'bridge', {
        // From main to render
        sendSettings: (message) => {
            ipcRenderer.on('sendSettings', message);
        },
        pickedColor: (message) => {
            ipcRenderer.on('pickedColor', message);
        },
        updateLastColors: (message) => {
            ipcRenderer.on('updateLastColors', message);
        },
        sendVersion: (message) => {
            ipcRenderer.on('sendVersion', message);
        },
    }
);