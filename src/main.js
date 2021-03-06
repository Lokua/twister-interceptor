const electron = require('electron')
const path = require('path')
const url = require('url')

const { app } = electron
const BrowserWindow = electron.BrowserWindow

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 512,
    height: 560 + 32,
    minWidth: 512,
    minHeight: 560 + 32,
    x: 48,
    y: 16,
    title: 'Launchpad',
    titleBarStyle: 'hidden',
    show: false
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.resolve(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  mainWindow.webContents.openDevTools({
    mode: 'detach'
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
