const { ipcMain, dialog } = require('electron');
import { set, get }  from './store';

const prepare = (app: any, window: any) => {
  ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = get(val);
    // event.sender.send('electron-store-get', get(val));
  });

  ipcMain.on('electron-store-set', async (event, key, val) => {
    set(key, val);
    event.reply()
  });

  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.sender.send('ipc-example', msgTemplate('pong'));
    // event.reply('ipc-example', msgTemplate('pong'));
  });
};

export default prepare;
