import {
  MemoryRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import './App.css';
import LoginScreen from './screens/LoginScreen';
import MessagesScreen from './screens/MessagesScreen';

declare global {
  interface Window {
    electron: {
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
