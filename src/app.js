const { app, BrowserWindow, Menu } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("path");
const Store = require("electron-store");
const appName = "HexPick";
const logger = require("electron-log");
const { runColorPicker } = require("electron-color-picker/library/linux/index");

const appRoot = path.join(`${app.getPath("appData") ?? "."}${path.sep}.hexpick`);
logger.transports.file.resolvePathFn = () => path.join(appRoot, "logs.log");
logger.transports.file.level = "info";

const devMode = process.env.NODE_ENV === 'development';

if (devMode) {
    logger.info("====== ======");
    logger.info("Started in devmode!");
    logger.info("====== ======\n");
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
        logger.info("Starting color picker");
        const colorObj = await runColorPicker().catch((error) => {
            logger.warn("[ERROR] getColor", error);
            return "";
        });
        const color = colorObj.possibleColorString;

        logger.info("Picked color: " + color);
        
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

    if (!devMode) Menu.setApplicationMenu(null);

    top.mainWindow.on("close", () => {
        const bounds = top.mainWindow.getBounds();
        store.set("windowPosition", bounds);
    });
});

function updateLastColors() {
    const lastColors = store.get("lastColors") || [];
    top.mainWindow.webContents.send("updateLastColors", lastColors);
    logger.info("Sending last colors to mainWindow");
}