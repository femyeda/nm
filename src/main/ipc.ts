const { ipcMain } = require('electron');
import { getStore, set, get } from './store';
import Nylas, {
  transformThreads,
  transformMessages,
  transformMessage,
} from './nylas';
import Thread from 'nylas/lib/models/thread';
import Message from 'nylas/lib/models/message';
import Draft, { DraftProperties } from 'nylas/lib/models/draft';

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

    const threads: Thread[] = await nylas.threads.list({
      limit: 7,
      not_in: ['drafts', 'trash', 'spam', 'archive'],
    });

    event.returnValue = transformThreads(threads);
  });

  ipcMain.on('get-thread-messages', async (event, { threadId, messageIds }) => {
    const access_token = getStore().get('access_token');
    const client_id = getStore().get('client_id');
    const client_secret = getStore().get('client_secret');

    if (!access_token || !client_id || !client_secret) {
      return;
    }

    const nylas = Nylas({ access_token, client_id, client_secret });

    const options = {
      ignoreTables: false,
      ignoreLinks: false,
      ignoreImages: false,
      removeConclusionPhrases: false,
      imagesAsMarkdown: false,
    };

    try {
      const messages: Message[] = messageIds
        ? await nylas.neural.cleanConversation(messageIds, options)
        : await nylas.messages.list({
            thread_id: threadId,
            limit: 10,
          });

      event.returnValue = transformMessages(messages).sort((a, b) => {
        return +new Date(b.date) - +new Date(a.date);
      });
    } catch (error) {
      console.error(error);
      event.returnValue = [];
    }
  });

  ipcMain.on(
    'send-message',
    async (event, { message }: { message: DraftProperties }) => {
      const access_token = getStore().get('access_token');
      const client_id = getStore().get('client_id');
      const client_secret = getStore().get('client_secret');

      if (!access_token || !client_id || !client_secret) {
        return;
      }

      try {
        const nylas = Nylas({ access_token, client_id, client_secret });

        const draft = new Draft(nylas, message);

        const sentMessage = await draft.send();
        event.returnValue = transformMessage(sentMessage);
      } catch (e) {
        event.returnValue = null;
      }
    }
  );

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
