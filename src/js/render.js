//
const path = require("path");
const os = require("os");
const { ipcRenderer } = require("electron");

//
const openBrowser = document.getElementById("open-browser");
//event

//open-imgPath
openBrowser.addEventListener("click", (e) => {
  //
  ipcRenderer.send("browswer:open");
});

//
// pathImg.innerText = path.join(os.homedir(), "imageshrink");
