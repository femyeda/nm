import Account from 'nylas/lib/models/account';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginScreen from './screens/LoginScreen';
import MessagesScreen from './screens/MessagesScreen';
import Thread from 'nylas/lib/models/thread';
import Message from 'nylas/lib/models/message';

declare global {
  interface Window {
    electron: {
      account: {
        get: () => Account;
      };

      threads: {
        get: () => Thread[];
        getMessages: ({
          threadId,
          messageIds,
        }: {
          threadId?: string;
          messageIds?: string[];
        }) => Message[];
      };

      store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
      };

      ipcRenderer: {
        on: any;
        once: any;
        send: any;
        myPing: any;
      };
    };
  }
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MessagesScreen />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
    </Router>
  );
}
