'use strict'
const path = require('path')
const { app, Menu, shell, BrowserWindow, session } = require('electron')
require('./ffmpeg')
require('./rlhome')

const isDevMode = process.env.NODE_ENV === 'development'

let mainWindow

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
})

if (process.platform === 'darwin') {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: app.getName(),
      submenu: [
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function () {
            app.quit()
          }
        }
      ]
    }
  ]))
}

app.on('ready', function () {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // eslint-disable-next-line
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [`default-src 'self' data: 'unsafe-inline'; connect-src https://www.rebaslight.com`]
      }
    })
  })

  mainWindow = new BrowserWindow({
    title: 'Rebaslight' + (isDevMode ? ' DEVELOPMENT' : ''),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
      preload: path.resolve(__dirname, 'preload.js')
    }
  })
  mainWindow.setMenu(null)
  mainWindow.loadURL('file://' + path.resolve(__dirname, 'index.html'))
  mainWindow.maximize()

  if (isDevMode) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.webContents.on('will-navigate', function (e, url) {
    e.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
})

if (isDevMode) {
  const fs = require('fs')
  fs.watchFile(path.resolve(__dirname, './bundle.js'), function (curr, prev) {
    if (mainWindow) {
      mainWindow.reload()
    }
  })
}
