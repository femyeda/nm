const { ipcMain } = require('electron');
import { getStore, set, get } from './store';
import Nylas from './nylas';
import Thread from 'nylas/lib/models/thread';
import Message from 'nylas/lib/models/message';
import { transformThreads, transformMessages } from './nylas';

const prepare = (app: any, window: any) => {
  ipcMain.on('get-account', async (event) => {
    const access_token = getStore().get('access_token');
    const client_id = getStore().get('client_id');
    const client_secret = getStore().get('client_secret');

    if (!access_token || !client_id || !client_secret) {
      return;
    }

    const nylas = Nylas({ access_token, client_id, client_secret });

    const account = await nylas.account.get();

    event.returnValue = {
      id: account.id,
      object: account.object,
      accountId: account.accountId,
      name: account.name,
      emailAddress: account.emailAddress,
      provider: account.provider,
      organizationUnit: account.organizationUnit,
      syncState: account.syncState,
      linkedAt: account.linkedAt,
    };
  });

  ipcMain.on('get-threads', async (event) => {
    const access_token = getStore().get('access_token');
    const client_id = getStore().get('client_id');
    const client_secret = getStore().get('client_secret');

    if (!access_token || !client_id || !client_secret) {
      return;
    }

    const nylas = Nylas({ access_token, client_id, client_secret });

    const threads: Thread[] = await nylas.threads.list({ limit: 10 });

    event.returnValue = transformThreads(threads);
  });

  ipcMain.on('get-thread-messages', async (event, threadId) => {
    const access_token = getStore().get('access_token');
    const client_id = getStore().get('client_id');
    const client_secret = getStore().get('client_secret');

    if (!access_token || !client_id || !client_secret) {
      return;
    }

    const nylas = Nylas({ access_token, client_id, client_secret });

    const messages: Message[] = await nylas.messages.list({
      thread_id: threadId,
      limit: 10,
    });

    event.returnValue = transformMessages(messages).sort((a, b) => {
      return +new Date(a.date) - +new Date(b.date);
    });
  });

  ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = get(val);
  });

  ipcMain.on('electron-store-set', async (event, key, val) => {
    set(key, val);
    event.returnValue = true;
  });

  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.sender.send('ipc-example', msgTemplate('pong'));
  });
};

export default prepare;
