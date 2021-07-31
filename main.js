const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
} = require("electron");
const path = require("path");
const os = require("os");
//selenium
const { Builder, By, Key, until } = require("selenium-webdriver");
//custom-selenium
const { login, tableExtract } = require("./src/selenium");
//
const imagemin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const splash = require("slash");

const log = require("electron-log");

//set env
process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV !== "production" ? true : false;

//set platform
const isMac = process.platform === "darwin" ? true : false;

//
let mainWindow;
let aboutWindow;
//
const APP_PATH = path.join(os.homedir(), "imageshrink");

//set logs-path
log.transports.file.resolvePath = () => path.join(APP_PATH, "logs/main.log");

// Main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageShrink",
    width: isDev ? 800 : 500,
    height: 600,
    icon: "./src/assets/icons/Icon_256x256.png",
    backgroundColor: "white",
    resizable: isDev ? true : false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  //
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  // mainWindow.loadURL(`https://www.pinterest.com/`)
  mainWindow.loadFile("./src/index.html");
}

// About window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About ImageShrink",
    width: 300,
    height: 300,
    icon: "./src/assets/icons/Icon_256x256.png",
    resizable: false,
    backgroundColor: "white",
  });

  // mainWindow.loadURL(`https://www.pinterest.com/`)
  aboutWindow.loadFile("./src/About.html");
}

//
app.whenReady().then(() => {
  createMainWindow();
  //
  const mainMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(mainMenu);
  //
  globalShortcut.register("Command+r", () => mainWindow.reload());
  globalShortcut.register(isMac ? "Command+d" : "Ctrl+d", () =>
    mainWindow.toggleDevTools()
  );
  //
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});
// app.on('ready', createMainWindow)

//set template for menu
const template = [
  //{ role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { label: "About", click: () => createAboutWindow() },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideothers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  //{ role: 'file' }
  {
    label: "File",
    submenu: [
      isMac
        ? { role: "Close", accelerator: "Command+w" }
        : { role: "Quit", accelerator: "Ctrl+w" },
    ],
  },
  // { role: 'editMenu' }
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...(isMac
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
          ]
        : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
    ],
  },
  // { role: 'viewMenu' }
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  //{role: 'help'}
  {
    role: "help",
    submenu: isMac
      ? [
          {
            label: "Learn More",
            click: async () => {
              const { shell } = require("electron");
              await shell.openExternal("https://electronjs.org");
            },
          },
        ]
      : [
          {
            label: "Learn More",
            click: async () => {
              const { shell } = require("electron");
              await shell.openExternal("https://electronjs.org");
            },
          },
          { label: "About", click: () => createAboutWindow() },
        ],
  },
];

//listen event from interface html

//event: image:open
ipcMain.on("browswer:open", async (e, oprion) => {
  // shell.openPath(APP_PATH);
  //selenium
  // const driver = new Builder().forBrowser("chrome").build();
  //
  try {
    const results = await tableExtract();
    console.table(results);
  } catch (err) {
    console.log(err);
  }
});

//---> custom -functions
//

//shrinkImage
async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;

    const files = await imagemin([splash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });
    log.info(files);
    shell.openPath(dest);
    mainWindow.webContents.send("image:done", dest);
  } catch (error) {
    log.error(err);
  }
}

//window-all-closed
app.on("window-all-closed", function () {
  if (!isMac) app.quit();
});

//
app.allowRendererProcessReuse = true;
