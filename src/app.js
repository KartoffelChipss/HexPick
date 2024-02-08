const { app, BrowserWindow, clipboard, Tray, Notification, dialog, nativeImage, Menu, shell, screen, nativeTheme, globalShortcut } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("path");
const fs = require("fs");
const Store = require("electron-store");
const appName = "HexPick";
const { runColorPicker } = require("electron-color-picker/library/linux/index");

const devMode = false;

if (devMode) {
    console.log("====== ======");
    console.log("Started in devmode!");
    console.log("====== ======\n");
}

const store = new Store();

let top = {};

app.whenReady().then(async () => {
    if (process.platform === "win32") {
        app.setAppUserModelId(appName);
    }

    ipcMain.handle("closeMainWindow", (e, data) => {
        app.quit();
    });

    ipcMain.handle("maximizeMainWindow", (e, data) => {
        top.mainWindow.isMaximized() ? top.mainWindow.restore() : top.mainWindow.maximize();
    });

    ipcMain.handle("minimizeMainWindow", (e, data) => {
        top.mainWindow.isMinimized() ? top.mainWindow.restore() : top.mainWindow.minimize();
    });

    ipcMain.handle("startPicking", async (e, data) => {
        const colorObj = await runColorPicker().catch((error) => {
            console.warn("[ERROR] getColor", error);
            return "";
        });
        const color = colorObj.possibleColorString;
        
        top.mainWindow.webContents.send("pickedColor", color);

        updateLastColors();
        store.set("lastColors", [color, ...(store.get("lastColors") || [])].slice(0, 3));
    });

    ipcMain.handle("getLastColors", (e, data) => {
        updateLastColors();
    });

    ipcMain.handle("getVersion", (e, data) => {
        top.mainWindow.webContents.send("sendVersion", app.getVersion());
    });

    const lastPos = store.get("windowPosition");

    top.mainWindow = new BrowserWindow({
        title: appName,
        width: lastPos ? lastPos.width : 500,
        height: lastPos ? lastPos.height : 300,
        minWidth: 500,
        minHeight: 300,
        x: lastPos ? lastPos.x : undefined,
        y: lastPos ? lastPos.y : undefined,
        resizable: true,
        maximizable: false,
        center: true,
        frame: false,
        show: false,
        backgroundColor: "#222",
        autoHideMenuBar: !devMode,
        // icon: __dirname + '/public/img/logo/logo.ico',
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    top.mainWindow.loadFile(path.join(__dirname, "public/main.html")).then(() => {
        top.mainWindow.show();
    });

    top.mainWindow.on("close", () => {
        const bounds = top.mainWindow.getBounds();
        store.set("windowPosition", bounds);
    });
});

function updateLastColors() {
    const lastColors = store.get("lastColors") || [];
    top.mainWindow.webContents.send("updateLastColors", lastColors);
}